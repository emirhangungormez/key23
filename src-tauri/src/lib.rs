mod hook;
mod tray;

use std::fs::OpenOptions;
use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

static IS_EXPLICIT_EXIT: AtomicBool = AtomicBool::new(false);

pub fn request_exit(app: &AppHandle) {
    log("Explicit application exit requested");
    IS_EXPLICIT_EXIT.store(true, Ordering::SeqCst);
    app.exit(0);
}

fn log(msg: &str) {
    if let Ok(mut f) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("C:\\Users\\emirhan\\Desktop\\WinKeyty\\winkeyty_runtime.log")
    {
        let _ = writeln!(f, "[{:?}] {}", std::time::SystemTime::now(), msg);
        let _ = f.flush();
    }
}

#[tauri::command]
fn drag_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

#[tauri::command]
fn show_hud(app: AppHandle) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        let _ = overlay_win.show();
        let _ = overlay_win.set_always_on_top(true);
        if let Ok(h) = overlay_win.hwnd() {
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::{
                    SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_NOACTIVATE, SWP_SHOWWINDOW,
                };
                let hwnd = windows::Win32::Foundation::HWND(h.0 as *mut _);
                let _ = SetWindowPos(
                    hwnd,
                    HWND_TOPMOST,
                    0, 0, 0, 0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
                );
            }
        }
    }
    Ok(())
}

#[tauri::command]
fn hide_hud(app: AppHandle) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        let _ = overlay_win.hide();
    }
    Ok(())
}

#[tauri::command]
fn show_mouse(app: AppHandle) -> Result<(), String> {
    if let Some(mouse_win) = app.get_webview_window("mouse") {
        let _ = mouse_win.show();
        let _ = mouse_win.set_always_on_top(true);
        if let Ok(h) = mouse_win.hwnd() {
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::{
                    SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_NOACTIVATE, SWP_SHOWWINDOW,
                };
                let hwnd = windows::Win32::Foundation::HWND(h.0 as *mut _);
                let _ = SetWindowPos(
                    hwnd,
                    HWND_TOPMOST,
                    0, 0, 0, 0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
                );
            }
        }
    }
    Ok(())
}

#[tauri::command]
fn hide_mouse(app: AppHandle) -> Result<(), String> {
    if let Some(mouse_win) = app.get_webview_window("mouse") {
        let _ = mouse_win.hide();
    }
    Ok(())
}

#[tauri::command]
fn set_overlay_ignore_cursor(app: AppHandle, ignore: bool) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("overlay") {
        win.set_ignore_cursor_events(ignore).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn set_hud_position(app: AppHandle, position: String) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        if let Ok(Some(monitor)) = overlay_win.primary_monitor() {
            let screen_size = monitor.size();
            let (x, y) = match position.as_str() {
                "top_center" => ((screen_size.width as i32 - 520) / 2, 60),
                "bottom_left" => (60, screen_size.height as i32 - 170),
                "bottom_right" => (screen_size.width as i32 - 580, screen_size.height as i32 - 170),
                _ => ((screen_size.width as i32 - 520) / 2, screen_size.height as i32 - 170),
            };
            let _ = overlay_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
        }
    }
    Ok(())
}

#[tauri::command]
fn open_position_picker(app: AppHandle) -> Result<(), String> {
    if let Some(picker_win) = app.get_webview_window("picker") {
        if let Ok(Some(monitor)) = picker_win.primary_monitor() {
            let screen_size = monitor.size();
            let _ = picker_win.set_size(tauri::Size::Physical(*screen_size));
            let _ = picker_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }));
        }
        let _ = picker_win.show();
        let _ = picker_win.set_always_on_top(true);
        let _ = picker_win.set_focus();
        if let Ok(h) = picker_win.hwnd() {
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::{
                    SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_SHOWWINDOW,
                };
                let hwnd = windows::Win32::Foundation::HWND(h.0 as *mut _);
                let _ = SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
            }
        }
        return Ok(());
    }

    match WebviewWindowBuilder::new(&app, "picker", WebviewUrl::App("picker.html".into()))
        .title("Key23 Position Picker")
        .resizable(false)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .build()
    {
        Ok(picker_win) => {
            if let Ok(Some(monitor)) = picker_win.primary_monitor() {
                let screen_size = monitor.size();
                let _ = picker_win.set_size(tauri::Size::Physical(*screen_size));
                let _ = picker_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }));
            }
            let _ = picker_win.show();
            let _ = picker_win.set_always_on_top(true);
            let _ = picker_win.set_focus();
            if let Ok(h) = picker_win.hwnd() {
                unsafe {
                    use windows::Win32::UI::WindowsAndMessaging::{
                        SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_SHOWWINDOW,
                    };
                    let hwnd = windows::Win32::Foundation::HWND(h.0 as *mut _);
                    let _ = SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
                }
            }
        }
        Err(e) => {
            log(&format!("Failed to create picker window on demand: {:?}", e));
        }
    }
    Ok(())
}

#[tauri::command]
fn close_position_picker(app: AppHandle) -> Result<(), String> {
    if let Some(picker_win) = app.get_webview_window("picker") {
        let _ = picker_win.hide();
    }
    Ok(())
}

#[tauri::command]
fn set_hud_exact_position(
    app: AppHandle,
    x: i32,
    y: i32,
    width: Option<i32>,
    height: Option<i32>,
    scale: Option<f64>,
) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        let _ = overlay_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
        if let (Some(w), Some(h)) = (width, height) {
            let safe_h = std::cmp::max(160, h);
            let _ = overlay_win.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: w as u32,
                height: safe_h as u32,
            }));
        }
    }
    if let Some(picker_win) = app.get_webview_window("picker") {
        let _ = picker_win.hide();
    }
    let _ = app.emit(
        "hud-position-selected",
        serde_json::json!({
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "scale": scale
        }),
    );

    let _ = app.emit("show-position-preview", ());
    let app_clone = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(1500));
        let _ = app_clone.emit("hide-position-preview", ());
    });

    Ok(())
}

#[tauri::command]
fn reset_hud_position(app: AppHandle) -> Result<(), String> {
    if let Some(overlay_win) = app.get_webview_window("overlay") {
        if let Ok(Some(monitor)) = overlay_win.primary_monitor() {
            let screen_size = monitor.size();
            let default_w = 620;
            let default_h = 160;
            let x = (screen_size.width as i32 - default_w) / 2;
            let y = screen_size.height as i32 - 170;
            let _ = overlay_win.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: default_w as u32,
                height: default_h as u32,
            }));
            let _ = overlay_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
            let _ = app.emit(
                "hud-position-reset",
                serde_json::json!({
                    "x": x,
                    "y": y,
                    "width": default_w,
                    "height": default_h
                }),
            );

            let _ = app.emit("show-position-preview", ());
            let app_clone = app.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(1500));
                let _ = app_clone.emit("hide-position-preview", ());
            });
        }
    }
    Ok(())
}

#[tauri::command]
fn app_exit(app: AppHandle) {
    request_exit(&app);
}

#[tauri::command]
fn sync_settings(app: AppHandle, settings: serde_json::Value) -> Result<(), String> {
    app.emit("sync-settings", settings).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    log("STEP 1: Starting WinKeyty engine...");

    log("STEP 2: Generating Tauri context...");
    let context = tauri::generate_context!();
    log("STEP 3: Context generated successfully!");

    log("STEP 4: Configuring builder...");
    let builder = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            drag_window,
            show_hud,
            hide_hud,
            show_mouse,
            hide_mouse,
            set_overlay_ignore_cursor,
            set_hud_position,
            open_position_picker,
            close_position_picker,
            set_hud_exact_position,
            reset_hud_position,
            app_exit,
            sync_settings
        ])
        .setup(|app| {
            log("STEP 5: Inside app setup callback!");

            // Setup system tray
            match tray::setup_tray(app.handle()) {
                Ok(_) => log("Tray setup OK"),
                Err(e) => log(&format!("Tray setup error: {:?}", e)),
            }

            // Create overlay window (Floating HUD) programmatically after main webview is initialized
            log("Creating overlay HUD window programmatically...");
            match WebviewWindowBuilder::new(app, "overlay", WebviewUrl::App("overlay.html".into()))
                .title("WinKeyty HUD")
                .inner_size(680.0, 180.0)
                .resizable(false)
                .decorations(false)
                .transparent(true)
                .always_on_top(true)
                .skip_taskbar(true)
                .visible(false)
                .build()
            {
                Ok(overlay_win) => {
                    log("Configuring overlay HUD window (ignore cursor events = true, hidden on start)");
                    let _ = overlay_win.set_ignore_cursor_events(true);
                    let _ = overlay_win.hide();

                    if let Ok(h) = overlay_win.hwnd() {
                        unsafe {
                            use windows::Win32::UI::WindowsAndMessaging::{
                                GetWindowLongW, SetWindowLongW, GWL_EXSTYLE,
                                WS_EX_TOPMOST, WS_EX_TOOLWINDOW, WS_EX_NOACTIVATE, WS_EX_TRANSPARENT,
                                SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_NOACTIVATE, SWP_FRAMECHANGED
                            };
                            let hwnd = windows::Win32::Foundation::HWND(h.0 as *mut _);
                            let mut ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE);
                            ex_style |= (WS_EX_TOPMOST.0 | WS_EX_TOOLWINDOW.0 | WS_EX_NOACTIVATE.0 | WS_EX_TRANSPARENT.0) as i32;
                            let _ = SetWindowLongW(hwnd, GWL_EXSTYLE, ex_style);
                            let _ = SetWindowPos(
                                hwnd,
                                HWND_TOPMOST,
                                0, 0, 0, 0,
                                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_FRAMECHANGED,
                            );
                        }
                    }

                    if let Ok(Some(monitor)) = overlay_win.primary_monitor() {
                        let screen_size = monitor.size();
                        let x = (screen_size.width as i32 - 620) / 2;
                        let y = screen_size.height as i32 - 170;
                        let _ = overlay_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
                    }
                }
                Err(e) => {
                    log(&format!("Failed to create overlay window: {:?}", e));
                }
            }

            // Create mouse cursor follower window programmatically
            log("Creating mouse follower window programmatically...");
            match WebviewWindowBuilder::new(app, "mouse", WebviewUrl::App("mouse.html".into()))
                .title("Key23 Mouse Follower")
                .inner_size(44.0, 58.0)
                .resizable(false)
                .decorations(false)
                .transparent(true)
                .always_on_top(true)
                .skip_taskbar(true)
                .visible(false)
                .build()
            {
                Ok(mouse_win) => {
                    let _ = mouse_win.set_ignore_cursor_events(true);
                    let _ = mouse_win.hide();

                    if let Ok(h) = mouse_win.hwnd() {
                        unsafe {
                            use windows::Win32::UI::WindowsAndMessaging::{
                                GetWindowLongW, SetWindowLongW, GWL_EXSTYLE,
                                WS_EX_TOPMOST, WS_EX_TOOLWINDOW, WS_EX_NOACTIVATE, WS_EX_TRANSPARENT,
                                SetWindowPos, HWND_TOPMOST, SWP_NOMOVE, SWP_NOSIZE, SWP_NOACTIVATE, SWP_FRAMECHANGED
                            };
                            let hwnd = windows::Win32::Foundation::HWND(h.0 as *mut _);
                            let mut ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE);
                            ex_style |= (WS_EX_TOPMOST.0 | WS_EX_TOOLWINDOW.0 | WS_EX_NOACTIVATE.0 | WS_EX_TRANSPARENT.0) as i32;
                            let _ = SetWindowLongW(hwnd, GWL_EXSTYLE, ex_style);
                            let _ = SetWindowPos(
                                hwnd,
                                HWND_TOPMOST,
                                0, 0, 0, 0,
                                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_FRAMECHANGED,
                            );
                        }
                    }
                }
                Err(e) => {
                    log(&format!("Failed to create mouse window: {:?}", e));
                }
            }

            // Pre-create picker window programmatically (hidden)
            log("Pre-creating picker window programmatically...");
            match WebviewWindowBuilder::new(app, "picker", WebviewUrl::App("picker.html".into()))
                .title("Key23 Position Picker")
                .resizable(false)
                .decorations(false)
                .transparent(true)
                .always_on_top(true)
                .skip_taskbar(true)
                .visible(false)
                .build()
            {
                Ok(picker_win) => {
                    let _ = picker_win.hide();
                }
                Err(e) => {
                    log(&format!("Failed to pre-create picker window: {:?}", e));
                }
            }

            // Ensure main window is shown and focused
            if let Some(main_win) = app.get_webview_window("main") {
                log("Showing main settings window");
                let _ = main_win.show();
                let _ = main_win.unminimize();
                let _ = main_win.set_always_on_top(true);
                let _ = main_win.set_focus();
                let _ = main_win.set_always_on_top(false);
            }

            // Single-instance activator listener: when another Key23 instance starts, restore & focus this window!
            unsafe {
                use windows::core::w;
                use windows::Win32::Foundation::{CloseHandle, WAIT_OBJECT_0};
                use windows::Win32::System::Threading::{CreateEventW, WaitForSingleObject, INFINITE};

                if let Ok(event_handle) = CreateEventW(None, false, false, w!("Local\\Key23_Show_Event_v1")) {
                    let app_handle = app.handle().clone();
                    let raw_handle = event_handle.0 as usize;
                    std::thread::spawn(move || {
                        let event_handle = windows::Win32::Foundation::HANDLE(raw_handle as *mut _);
                        loop {
                            let wait_res = WaitForSingleObject(event_handle, INFINITE);
                            if wait_res == WAIT_OBJECT_0 {
                                log("Single-instance wake event received! Restoring main window...");
                                if let Some(main_win) = app_handle.get_webview_window("main") {
                                    let _ = main_win.show();
                                    let _ = main_win.unminimize();
                                    let _ = main_win.set_always_on_top(true);
                                    let _ = main_win.set_focus();
                                    let _ = main_win.set_always_on_top(false);
                                }
                            } else {
                                break;
                            }
                        }
                        let _ = CloseHandle(event_handle);
                    });
                }
            }

            // Start low-level Windows keyboard and mouse hooks
            log("Starting low-level input hooks");
            hook::start_input_hook(app.handle().clone());
            log("Input hooks active");

            Ok(())
        })
        .on_window_event(|window, event| {
            log(&format!("Window [{}] event: {:?}", window.label(), event));
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    log("Main window close requested, hiding to tray instead");
                    let _ = window.hide();
                    let _ = window.emit("hide-position-preview", ());
                    api.prevent_close();
                }
            }
        });

    log("STEP 6: Building app...");
    let app = builder.build(context).expect("error while building tauri application");

    log("STEP 7: Running app with ExitRequested protection...");
    app.run(|_app_handle, event| {
        match event {
            tauri::RunEvent::MainEventsCleared => {}
            tauri::RunEvent::ExitRequested { api, .. } => {
                if !IS_EXPLICIT_EXIT.load(Ordering::SeqCst) {
                    log("RunEvent::ExitRequested intercepted - keeping app alive in background/tray");
                    api.prevent_exit();
                } else {
                    log("Explicit exit confirmed. Exiting.");
                }
            }
            _ => log(&format!("Event loop event: {:?}", event)),
        }
    });
    log("STEP 8: app.run finished/returned!");
}
