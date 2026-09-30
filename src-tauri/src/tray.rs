use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let status_item = MenuItem::with_id(app, "status", "⌨ Key23: Aktif", false, None::<&str>)?;
    let toggle_window_item = MenuItem::with_id(app, "toggle_win", "Ayarlar Penceresini Göster/Gizle", true, None::<&str>)?;
    let position_item = MenuItem::with_id(app, "position", "🎯 Ekranda Konum Belirle", true, None::<&str>)?;
    let exit_item = MenuItem::with_id(app, "exit", "✕ Çıkış (Kapat)", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &status_item,
            &toggle_window_item,
            &position_item,
            &exit_item,
        ],
    )?;

    let icon = match tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png")) {
        Ok(img) => img,
        Err(_) => app.default_window_icon().cloned().expect("Fallback window icon missing"),
    };

    let _tray = TrayIconBuilder::with_id("key23-tray")
        .tooltip("Key23")
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle_win" => {
                if let Some(win) = app.get_webview_window("main") {
                    if let Ok(is_visible) = win.is_visible() {
                        if is_visible {
                            let _ = win.hide();
                        } else {
                            let _ = win.show();
                            let _ = win.unminimize();
                            let _ = win.set_always_on_top(true);
                            let _ = win.set_focus();
                            let _ = win.set_always_on_top(false);
                        }
                    }
                }
            }
            "position" => {
                if let Some(win) = app.get_webview_window("overlay") {
                    let _ = win.set_ignore_cursor_events(false);
                    let _ = win.emit("start-position-editor", ());
                }
            }
            "exit" => {
                crate::request_exit(app);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    if let Ok(is_visible) = win.is_visible() {
                        if is_visible {
                            let _ = win.hide();
                        } else {
                            let _ = win.show();
                            let _ = win.unminimize();
                            let _ = win.set_always_on_top(true);
                            let _ = win.set_focus();
                            let _ = win.set_always_on_top(false);
                        }
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
