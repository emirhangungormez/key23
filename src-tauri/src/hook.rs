use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{sync_channel, SyncSender};
use std::sync::OnceLock;
use std::thread;
use tauri::{AppHandle, Emitter, Manager};
use windows::Win32::Foundation::{HINSTANCE, HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    GetAsyncKeyState, GetKeyState, GetKeyboardLayout, MapVirtualKeyExW, ToUnicodeEx,
    MAP_VIRTUAL_KEY_TYPE, VK_CAPITAL,
};
use windows::Win32::UI::WindowsAndMessaging::*;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct KeyEventPayload {
    pub vk: u32,
    pub is_down: bool,
    pub key: String,
    pub label: String,
    pub symbol: Option<String>,
    pub is_modifier: bool,
    pub is_caps_on: bool,
    pub result_char: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct MouseEventPayload {
    pub x: i32,
    pub y: i32,
    pub button: String,
    pub is_down: bool,
}

enum InputEvent {
    Key(u32, bool),
    Mouse(i32, i32, &'static str, bool),
    MouseMove(i32, i32),
}

static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
static EVENT_TX: OnceLock<SyncSender<InputEvent>> = OnceLock::new();
static HOOK_RUNNING: AtomicBool = AtomicBool::new(false);

pub fn start_input_hook(app: AppHandle) {
    let _ = APP_HANDLE.set(app);

    if HOOK_RUNNING.load(Ordering::SeqCst) {
        return;
    }
    HOOK_RUNNING.store(true, Ordering::SeqCst);

    let (tx, rx) = sync_channel::<InputEvent>(512);
    let _ = EVENT_TX.set(tx);

    // Asynchronous worker thread that dispatches events to Tauri without delaying the OS hook
    thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            if let Some(app) = APP_HANDLE.get() {
                match event {
                    InputEvent::Key(vk, is_down) => {
                        let (key, label, symbol, is_modifier) = map_vk_to_key(vk);
                        let is_caps_on = unsafe { (GetKeyState(VK_CAPITAL.0 as i32) & 0x0001) != 0 };
                        let is_shift = unsafe { (GetAsyncKeyState(0x10) as u16 & 0x8000) != 0 };
                        let is_altgr = unsafe {
                            (GetAsyncKeyState(0xA5) as u16 & 0x8000) != 0
                                || ((GetAsyncKeyState(0x11) as u16 & 0x8000) != 0 && (GetAsyncKeyState(0x12) as u16 & 0x8000) != 0)
                        };
                        let result_char = if !is_modifier {
                            get_combination_char(vk, is_shift, is_altgr)
                        } else {
                            None
                        };
                        let payload = KeyEventPayload {
                            vk,
                            is_down,
                            key,
                            label,
                            symbol,
                            is_modifier,
                            is_caps_on,
                            result_char,
                        };
                        let _ = app.emit("key-event", payload);
                    }
                    InputEvent::MouseMove(x, y) => {
                        if let Some(mouse_win) = app.get_webview_window("mouse") {
                            let _ = mouse_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                                x: x + 12,
                                y: y + 12,
                            }));
                        }
                    }
                    InputEvent::Mouse(x, y, button, is_down) => {
                        if let Some(mouse_win) = app.get_webview_window("mouse") {
                            let _ = mouse_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                                x: x + 12,
                                y: y + 12,
                            }));
                        }

                        let payload = MouseEventPayload {
                            x,
                            y,
                            button: button.to_string(),
                            is_down,
                        };
                        let _ = app.emit("mouse-event", payload);
                    }
                }
            }
        }
    });

    thread::spawn(|| unsafe {
        let h_instance = HINSTANCE(std::ptr::null_mut());

        let kbd_hook = SetWindowsHookExW(
            WH_KEYBOARD_LL,
            Some(keyboard_proc),
            h_instance,
            0,
        );

        let mouse_hook = SetWindowsHookExW(
            WH_MOUSE_LL,
            Some(mouse_proc),
            h_instance,
            0,
        );

        let mut msg = MSG::default();
        while GetMessageW(&mut msg, HWND(std::ptr::null_mut()), 0, 0).as_bool() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        if let Ok(hook) = kbd_hook {
            let _ = UnhookWindowsHookEx(hook);
        }
        if let Ok(hook) = mouse_hook {
            let _ = UnhookWindowsHookEx(hook);
        }
    });
}

unsafe extern "system" fn keyboard_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code >= 0 {
        let msg = wparam.0 as u32;
        let is_down = msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN;
        let is_up = msg == WM_KEYUP || msg == WM_SYSKEYUP;

        if (is_down || is_up) && lparam.0 != 0 {
            let kb_struct = *(lparam.0 as *const KBDLLHOOKSTRUCT);
            if let Some(tx) = EVENT_TX.get() {
                // Windows sends PrintScreen (VK_SNAPSHOT = 0x2C) often only as WM_KEYUP
                if kb_struct.vkCode == 0x2C {
                    let _ = tx.try_send(InputEvent::Key(0x2C, true));
                    let tx_clone = tx.clone();
                    std::thread::spawn(move || {
                        std::thread::sleep(std::time::Duration::from_millis(350));
                        let _ = tx_clone.try_send(InputEvent::Key(0x2C, false));
                    });
                } else {
                    let _ = tx.try_send(InputEvent::Key(kb_struct.vkCode, is_down));
                }
            }
        }
    }
    CallNextHookEx(None, code, wparam, lparam)
}

static MOUSE_DRAGGING: AtomicBool = AtomicBool::new(false);

unsafe extern "system" fn mouse_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    if code >= 0 {
        let msg = wparam.0 as u32;
        if lparam.0 != 0 {
            let ms_struct = *(lparam.0 as *const MSLLHOOKSTRUCT);
            let mut event_to_send = None;

            match msg {
                WM_LBUTTONDOWN => {
                    MOUSE_DRAGGING.store(true, Ordering::Relaxed);
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, "mouse_left", true));
                }
                WM_LBUTTONUP => {
                    MOUSE_DRAGGING.store(false, Ordering::Relaxed);
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, "mouse_left", false));
                }
                WM_RBUTTONDOWN => {
                    MOUSE_DRAGGING.store(true, Ordering::Relaxed);
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, "mouse_right", true));
                }
                WM_RBUTTONUP => {
                    MOUSE_DRAGGING.store(false, Ordering::Relaxed);
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, "mouse_right", false));
                }
                WM_MBUTTONDOWN => {
                    MOUSE_DRAGGING.store(true, Ordering::Relaxed);
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, "mouse_middle", true));
                }
                WM_MBUTTONUP => {
                    MOUSE_DRAGGING.store(false, Ordering::Relaxed);
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, "mouse_middle", false));
                }
                WM_MOUSEWHEEL => {
                    let delta = (ms_struct.mouseData >> 16) as i16;
                    let btn = if delta > 0 { "wheel_up" } else { "wheel_down" };
                    event_to_send = Some(InputEvent::Mouse(ms_struct.pt.x, ms_struct.pt.y, btn, true));
                }
                WM_MOUSEMOVE => {
                    if MOUSE_DRAGGING.load(Ordering::Relaxed) {
                        event_to_send = Some(InputEvent::MouseMove(ms_struct.pt.x, ms_struct.pt.y));
                    }
                }
                _ => {}
            }

            if let Some(ev) = event_to_send {
                if let Some(tx) = EVENT_TX.get() {
                    let _ = tx.try_send(ev);
                }
            }
        }
    }
    CallNextHookEx(None, code, wparam, lparam)
}

fn get_combination_char(vk: u32, is_shift: bool, is_altgr: bool) -> Option<String> {
    if !is_shift && !is_altgr {
        return None;
    }

    // 1. Try Windows Win32 ToUnicodeEx
    unsafe {
        let fg = GetForegroundWindow();
        let hkl = if !fg.0.is_null() {
            let thread_id = GetWindowThreadProcessId(fg, None);
            let layout = GetKeyboardLayout(thread_id);
            if !layout.0.is_null() { layout } else { GetKeyboardLayout(0) }
        } else {
            GetKeyboardLayout(0)
        };

        let mut key_state = [0u8; 256];
        if is_shift {
            key_state[0x10] = 0x80;
        }
        if is_altgr {
            key_state[0x11] = 0x80;
            key_state[0x12] = 0x80;
            key_state[0xA2] = 0x80;
            key_state[0xA5] = 0x80;
        }

        let scan_code = MapVirtualKeyExW(vk, MAP_VIRTUAL_KEY_TYPE(0), hkl);
        let mut buff = [0u16; 8];
        let len = ToUnicodeEx(vk, scan_code, &key_state, &mut buff, 0, hkl);
        if len > 0 {
            if let Some(ch) = char::decode_utf16(buff[..len as usize].iter().copied()).next().and_then(|r| r.ok()) {
                if !ch.is_control() && ch != '\0' {
                    return Some(ch.to_string());
                }
            }
        }
    }

    // 2. High-precision Turkish Q layout fallback for all user specified keys
    // (>£##$½{[]}\| and !'^+%&/()=?_)
    if is_altgr {
        match vk {
            0x31 => Some(">".into()),
            0x32 => Some("£".into()),
            0x33 => Some("#".into()),
            0x34 => Some("$".into()),
            0x35 => Some("½".into()),
            0x37 => Some("{".into()),
            0x38 => Some("[".into()),
            0x39 => Some("]".into()),
            0x30 => Some("}".into()),
            0xBB => Some("\\".into()),
            0xBD => Some("|".into()),
            0xE2 => Some("|".into()),
            0x51 => Some("@".into()),
            0x45 => Some("€".into()),
            0x54 => Some("₺".into()),
            0x53 => Some("ß".into()),
            0x41 => Some("æ".into()),
            _ => None,
        }
    } else if is_shift {
        match vk {
            0x30 => Some("=".into()),
            0x31 => Some("!".into()),
            0x32 => Some("'".into()),
            0x33 => Some("^".into()),
            0x34 => Some("+".into()),
            0x35 => Some("%".into()),
            0x36 => Some("&".into()),
            0x37 => Some("/".into()),
            0x38 => Some("(".into()),
            0x39 => Some(")".into()),
            0xBB => Some("?".into()),
            0xBD => Some("_".into()),
            0xE2 => Some(">".into()),
            0xBE => Some(":".into()),
            0xBC => Some(";".into()),
            0xC0 => Some("é".into()),
            _ => None,
        }
    } else {
        None
    }
}

fn map_vk_to_key(vk: u32) -> (String, String, Option<String>, bool) {
    // 1. Modifiers & Core Special Keys
    match vk {
        0x10 | 0xA0 | 0xA1 => return ("shift".into(), "shift".into(), Some("⇧".into()), true),
        0x11 | 0xA2 | 0xA3 => return ("ctrl".into(), "ctrl".into(), Some("⌃".into()), true),
        0xA5 => return ("altgr".into(), "altgr".into(), Some("⎇".into()), true),
        0x12 | 0xA4 => return ("alt".into(), "alt".into(), Some("⌥".into()), true),
        0x5B | 0x5C => return ("win".into(), "win".into(), Some("⌘".into()), true),
        0x5D => return ("menu".into(), "menu".into(), Some("▤".into()), false),
        0x14 => return ("caps".into(), "caps lock".into(), Some("⇪".into()), true),
        0x20 => return ("space".into(), "space".into(), Some("␣".into()), false),
        0x0D => return ("enter".into(), "enter".into(), Some("↵".into()), false),
        0x08 => return ("backspace".into(), "backspace".into(), Some("⌫".into()), false),
        0x09 => return ("tab".into(), "tab".into(), Some("⇥".into()), false),
        0x1B => return ("esc".into(), "esc".into(), Some("⎋".into()), false),
        0x25 => return ("left".into(), "left".into(), Some("←".into()), false),
        0x26 => return ("up".into(), "up".into(), Some("↑".into()), false),
        0x27 => return ("right".into(), "right".into(), Some("→".into()), false),
        0x28 => return ("down".into(), "down".into(), Some("↓".into()), false),
        // Navigation keys
        0x21 => return ("pageup".into(), "page up".into(), Some("⇞".into()), false),
        0x22 => return ("pagedown".into(), "page down".into(), Some("⇟".into()), false),
        0x23 => return ("end".into(), "end".into(), Some("↘".into()), false),
        0x24 => return ("home".into(), "home".into(), Some("↖".into()), false),
        0x2D => return ("insert".into(), "insert".into(), None, false),
        0x2E => return ("del".into(), "delete".into(), Some("⌦".into()), false),
        0x2C => return ("prtsc".into(), "prt sc".into(), Some("📷".into()), false),
        0x90 => return ("numlock".into(), "num lock".into(), None, false),
        0x91 => return ("scrolllock".into(), "scroll lock".into(), None, false),
        0x13 => return ("pause".into(), "pause".into(), None, false),
        // Media keys
        0xAD => return ("mute".into(), "mute".into(), Some("🔇".into()), false),
        0xAE => return ("volumedown".into(), "vol -".into(), Some("🔉".into()), false),
        0xAF => return ("volumeup".into(), "vol +".into(), Some("🔊".into()), false),
        0xB0 => return ("next".into(), "next".into(), Some("⏭".into()), false),
        0xB1 => return ("prev".into(), "prev".into(), Some("⏮".into()), false),
        0xB2 => return ("stop".into(), "stop".into(), Some("⏹".into()), false),
        0xB3 => return ("playpause".into(), "play".into(), Some("⏯".into()), false),
        // F1 - F24
        0x70..=0x7B => {
            let f = format!("F{}", vk - 0x70 + 1);
            return (f.to_lowercase(), f, None, false);
        }
        0x7C..=0x87 => {
            let f = format!("F{}", vk - 0x7C + 13);
            return (f.to_lowercase(), f, None, false);
        }
        // Numpad keys
        0x60..=0x69 => {
            let ch = (b'0' + (vk - 0x60) as u8) as char;
            return (ch.to_string(), ch.to_string(), None, false);
        }
        0x6A => return ("*".into(), "*".into(), None, false),
        0x6B => return ("+".into(), "+".into(), None, false),
        0x6D => return ("-".into(), "-".into(), None, false),
        0x6E => return (".".into(), ".".into(), None, false),
        0x6F => return ("/".into(), "/".into(), None, false),
        _ => {}
    }

    // 2. Windows Dynamic Keyboard Layout Mapping with ToUnicodeEx & MapVirtualKeyExW
    let hkl = unsafe {
        let fg = GetForegroundWindow();
        if !fg.0.is_null() {
            let thread_id = GetWindowThreadProcessId(fg, None);
            let layout = GetKeyboardLayout(thread_id);
            if !layout.0.is_null() { layout } else { GetKeyboardLayout(0) }
        } else {
            GetKeyboardLayout(0)
        }
    };

    // Try unshifted ToUnicodeEx first to get true active keyboard layout char
    unsafe {
        let key_state = [0u8; 256];
        let scan_code = MapVirtualKeyExW(vk, MAP_VIRTUAL_KEY_TYPE(0), hkl);
        let mut buff = [0u16; 8];
        let len = ToUnicodeEx(vk, scan_code, &key_state, &mut buff, 0, hkl);
        if len > 0 {
            if let Some(ch) = char::decode_utf16(buff[..len as usize].iter().copied()).next().and_then(|r| r.ok()) {
                if !ch.is_control() && ch != '\0' {
                    let s = ch.to_string();
                    let upper = s.to_uppercase();
                    let lower = s.to_lowercase();
                    return (lower, upper, None, false);
                }
            }
        }
    }

    // Secondary MapVirtualKeyExW attempt
    let mapped_char = unsafe { MapVirtualKeyExW(vk, MAP_VIRTUAL_KEY_TYPE(2), hkl) };
    let char_code = (mapped_char & 0xFFFF) as u16;
    if char_code != 0 {
        if let Some(ch) = char::decode_utf16([char_code]).next().and_then(|r| r.ok()) {
            if !ch.is_control() && ch != '\0' {
                let s = ch.to_string();
                return (s.to_lowercase(), s.to_uppercase(), None, false);
            }
        }
    }

    // 3. Turkish Layout Specific Fallback (Turkish Q / F) & Standard US OEM
    match vk {
        0xDB => ("ğ".into(), "Ğ".into(), None, false), // VK_OEM_4
        0xDD => ("ü".into(), "Ü".into(), None, false), // VK_OEM_6
        0xBA => ("ş".into(), "Ş".into(), None, false), // VK_OEM_1
        0xDE => ("i".into(), "İ".into(), None, false), // VK_OEM_7
        0xBC => ("ö".into(), "Ö".into(), None, false), // VK_OEM_COMMA
        0xBE => ("ç".into(), "Ç".into(), None, false), // VK_OEM_PERIOD
        0xBF => (".".into(), ".".into(), None, false), // VK_OEM_2
        0xBB => ("+".into(), "+".into(), None, false), // VK_OEM_PLUS
        0xBD => ("-".into(), "-".into(), None, false), // VK_OEM_MINUS
        0xC0 => ("\"".into(), "\"".into(), None, false), // VK_OEM_3
        0xDC => (",".into(), ",".into(), None, false), // VK_OEM_5
        0xE2 => ("<".into(), "<".into(), None, false), // VK_OEM_102 (< > |)
        // 0-9
        0x30..=0x39 => {
            let ch = (b'0' + (vk - 0x30) as u8) as char;
            (ch.to_string(), ch.to_string(), None, false)
        }
        // A-Z standard
        0x41..=0x5A => {
            let ch = (b'A' + (vk - 0x41) as u8) as char;
            (ch.to_lowercase().to_string(), ch.to_string(), None, false)
        }
        _ => (format!("vk_{}", vk), format!("VK {}", vk), None, false),
    }
}
