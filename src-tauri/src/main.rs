// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(windows)]
fn ensure_single_instance_or_activate() -> bool {
    use windows::core::w;
    use windows::Win32::Foundation::{CloseHandle, GetLastError, ERROR_ALREADY_EXISTS};
    use windows::Win32::System::Threading::{CreateMutexW, OpenEventW, SetEvent, EVENT_MODIFY_STATE};

    unsafe {
        let mutex_res = CreateMutexW(None, true, w!("Local\\Key23_Single_Instance_Mutex_v1"));
        if GetLastError() == ERROR_ALREADY_EXISTS {
            if let Ok(event) = OpenEventW(EVENT_MODIFY_STATE, false, w!("Local\\Key23_Show_Event_v1")) {
                let _ = SetEvent(event);
                let _ = CloseHandle(event);
            }
            if let Ok(m) = mutex_res {
                let _ = CloseHandle(m);
            }
            return false;
        }
    }
    true
}

fn main() {
    let log_msg = |msg: &str| {
        key23_lib::log(&format!("MAIN: {}", msg));
    };
    log_msg("Entering main()");

    #[cfg(windows)]
    {
        if !ensure_single_instance_or_activate() {
            log_msg("Another instance is already running. Signal sent to bring window to front. Exiting this process.");
            return;
        }
    }

    log_msg("Single instance confirmed, setting panic hook");
    std::panic::set_hook(Box::new(|info| {
        let payload = if let Some(s) = info.payload().downcast_ref::<&str>() {
            (*s).to_string()
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic payload".to_string()
        };
        let msg = format!("FATAL PANIC:\nMessage: {}\nLocation: {:?}\n", payload, info.location());
        let full_info = format!("Full Panic Info: {:?}\n", info);
        if let Ok(mut p) = std::env::current_exe() {
            p.pop();
            let _ = std::fs::write(p.join("panic_error.log"), format!("{}\n{}", msg, full_info));
        }
    }));

    key23_lib::run();
}

