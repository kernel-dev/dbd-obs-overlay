use std::sync::Arc;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::Builder;

mod my_types;
pub use my_types::{Alignment, AppConfig, Positions};

mod server;
pub use server::OverlayServer;

mod commands;
pub use commands::{
    load_default_config, load_settings, open_file, save_file, save_file_as,
    save_settings, update_overlay, refresh_obs_browser_source
};

#[tokio::main]
pub async fn run() {
    let overlay_server = Arc::new(OverlayServer::new());

    let http_server_clone = overlay_server.clone();
    std::thread::spawn(move || {
        http_server_clone.start_http_server();
    });

    let ws_server_clone = overlay_server.clone();
    tokio::spawn(async move {
        let ws_addr = "127.0.0.1:4001";
        if let Err(e) = ws_server_clone.start_ws_server(ws_addr).await {
            eprintln!("WebSocket server startup error: {}", e);
        }
    });

    Builder::default()
        .manage(overlay_server as Arc<OverlayServer>)
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_file,
            save_file,
            save_file_as,
            load_default_config,
            update_overlay,
            save_settings,
            load_settings,
            refresh_obs_browser_source
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
