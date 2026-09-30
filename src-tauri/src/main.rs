// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]



use windows::core::w;
use windows::Win32::Foundation::{CloseHandle, ERROR_ALREADY_EXISTS, HANDLE, WIN32_ERROR};
use windows::Win32::System::Threading::{
    CreateMutexW, OpenEventW, SetEvent, EVENT_MODIFY_STATE,
};

fn main() {
    let log_msg = |_msg: &str| {
        #[cfg(debug_assertions)]
        println!("[{:?}] MAIN: {}", std::time::SystemTime::now(), _msg);
    };
    log_msg("Entering main()");

    // Prevent multiple instances: only a single instance can run at a time.
    // If an instance is already running, wake it up and show its window!
    static mut MUTEX_HOLDER: Option<HANDLE> = None;
    unsafe {
        windows::Win32::Foundation::SetLastError(WIN32_ERROR(0));
        match CreateMutexW(None, true, w!("Local\\Key23_App_Mutex_v1")) {
            Ok(handle) => {
                let err = windows::Win32::Foundation::GetLastError();
                log_msg(&format!("CreateMutexW succeeded, GetLastError = {:?}", err));
                if err == ERROR_ALREADY_EXISTS {
                    log_msg("Mutex already exists! Signaling existing Key23 window to restore and focus.");
                    if let Ok(event) = OpenEventW(EVENT_MODIFY_STATE, false, w!("Local\\Key23_Show_Event_v1")) {
                        let _ = SetEvent(event);
                        let _ = CloseHandle(event);
                        log_msg("Existing Key23 signaled, exiting new process.");
                        std::process::exit(0);
                    } else {
                        log_msg("Mutex reported existing but no wake event listener found. Taking over mutex.");
                        MUTEX_HOLDER = Some(handle);
                    }
                } else {
                    MUTEX_HOLDER = Some(handle);
                }
            }
            Err(e) => {
                log_msg(&format!("CreateMutexW failed: {:?}", e));
            }
        }
    }
    log_msg("Mutex check passed, setting panic hook");
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
