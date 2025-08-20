use crate::my_types::{Alignment, AppConfig, Positions};
use crate::server::OverlayServer;
use base64::engine::general_purpose;
use base64::Engine;
use dirs::{self, data_local_dir};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Read;
use std::sync::Arc;
use tauri::path::BaseDirectory;
use tauri::{command, State};
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OpenResult {
    pub filePath: String,
    pub content: String,
    pub success: bool,
}

#[command]
pub fn update_overlay(
    server: State<'_, Arc<OverlayServer>>,
    config: AppConfig,
    positions: Positions,
    alignment: Alignment,
) {
    let config_str = serde_json::to_string(&config).expect("Failed to serialize config");
    let positions_str = serde_json::to_string(&positions).expect("Failed to serialize positions");
    let alignment_str = serde_json::to_string(&alignment).expect("Failed to serialize alignment");

    server.broadcast_update(&config_str, &positions_str, &alignment_str);
}

/// Open a file picker and return file path + contents
#[command]
pub async fn open_file(app: AppHandle) -> Result<Option<OpenResult>, String> {
    use std::sync::{Arc, Mutex};
    use tokio::sync::oneshot;

    let (tx, rx) = oneshot::channel();
    let tx = Arc::new(Mutex::new(Some(tx)));

    app.dialog()
        .file()
        .add_filter("INI files", &["ini"])
        .pick_file(move |file_path| {
            let result = if let Some(path) = file_path {
                match fs::read_to_string(path.as_path().unwrap()) {
                    Ok(content) => Some(OpenResult {
                        filePath: path.as_path().unwrap().display().to_string(),
                        content,
                        success: true,
                    }),
                    Err(e) => {
                        eprintln!("Failed to read file: {}", e);
                        None
                    }
                }
            } else {
                None
            };

            if let Ok(mut sender) = tx.lock() {
                if let Some(sender) = sender.take() {
                    let _ = sender.send(result);
                }
            }
        });

    match rx.await {
        Ok(result) => Ok(result),
        Err(_) => Err("Dialog operation failed".to_string()),
    }
}

/// Save to an existing file
#[command]
pub async fn save_file(file_path: String, content: String) -> Result<Option<String>, String> {
    fs::write(&file_path, content).map_err(|e| e.to_string())?;
    Ok(Some(file_path))
}

/// Save file in specific location
#[command]
pub async fn save_file_as(app: AppHandle, content: String) -> Result<Option<OpenResult>, String> {
    use std::sync::{Arc, Mutex};
    use tokio::sync::oneshot;

    let (tx, rx) = oneshot::channel();
    let tx = Arc::new(Mutex::new(Some(tx)));

    // Create file dialog with .ini filter
    app.dialog()
        .file()
        .add_filter("INI files", &["ini"])
        .save_file(move |file_path| {
            let result = if let Some(path) = file_path {
                match fs::write(&path.as_path().unwrap(), &content) {
                    Ok(()) => Some(OpenResult {
                        filePath: path.as_path().unwrap().display().to_string(),
                        content: content.clone(),
                        success: true,
                    }),
                    Err(e) => {
                        eprintln!("Failed to write file: {}", e);
                        None
                    }
                }
            } else {
                None
            };

            if let Ok(mut sender) = tx.lock() {
                if let Some(sender) = sender.take() {
                    let _ = sender.send(result);
                }
            }
        });

    match rx.await {
        Ok(result) => Ok(result),
        Err(_) => Err("Dialog operation failed".to_string()),
    }
}

/// Load the default config from %LOCALAPPDATA%/dbd-overlay-config/config.ini
#[command]
pub async fn load_default_config(handle: AppHandle) -> Result<Option<OpenResult>, String> {
    let base = dirs::data_local_dir().ok_or("Could not resolve %LOCALAPPDATA%")?;
    let path = base.join("dbd-overlay-config").join("config.ini");

    let mut content = String::new();

    if !path.exists() {
        let static_config_path = handle
            .path()
            .resolve("resources/config/static.ini", BaseDirectory::Resource)
            .unwrap();

        println!("Resolved path: {}", static_config_path.display());

        let mut static_config = String::new();

        fs::File::open(&static_config_path)
            .map_err(|e| format!("Error while reading static config: {}", e))
            .unwrap()
            .read_to_string(&mut static_config);

        fs::write(&path, &mut static_config)
            .map_err(|e| format!("Failed to write static config to %LOCALAPPDATA%: {}", e))?;

        content = static_config.clone();
    } else {
        content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    }

    Ok(Some(OpenResult {
        filePath: path.display().to_string(),
        content,
        success: true,
    }))
}

#[command]
pub async fn load_settings() -> Result<String, String> {
    let base = dirs::data_local_dir().ok_or("Could not resolve %LOCALAPPDATA%")?;
    let path = base.join("dbd-overlay-config").join("settings.json");

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;

    Ok(content)
}

#[command]
pub async fn save_settings(settings: String) -> Result<Option<OpenResult>, String> {
    let mut path = match data_local_dir() {
        Some(dir) => dir,
        None => return Err("Could not find local data directory.".into()),
    };

    path.push("dbd-overlay-config");
    path.push("settings.json");

    let new_settings: Value = serde_json::from_str(&settings)
        .map_err(|e| format!("Failed to parse new settings JSON {}", e))?;

    let mut current_settings: Value = Value::Object(serde_json::Map::new());

    if path.exists() {
        let mut file =
            fs::File::open(&path).map_err(|e| format!("Failed to open settings file: {}", e))?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;

        if !contents.is_empty() {
            current_settings = serde_json::from_str(&contents)
                .map_err(|e| format!("Failed to parse existing settings JSON: {}", e))?;
        }
    }

    if let Some(parent_dir) = path.parent() {
        if let Err(e) = fs::create_dir_all(parent_dir) {
            return Err(format!("Failed to create directory: {}", e));
        }
    }

    merge_json(&mut current_settings, &new_settings);

    let updated_json = serde_json::to_string_pretty(&current_settings)
        .map_err(|e| format!("Failed to serialize updated settings: {}", e))?;

    let updated_json_clone = updated_json.clone();

    fs::write(&path, updated_json).map_err(|e| format!("Failed to write to file: {}", e))?;

    Ok(Some(OpenResult {
        filePath: path.display().to_string(),
        content: updated_json_clone,
        success: true,
    }))
}

#[command]
pub async fn refresh_obs_browser_source() -> Result<(), String> {
    let settings_json: Value = serde_json::from_str(&load_settings().await.unwrap())
        .map_err(|e| format!("Failed to parse settings JSON: {}", e))?;
    let obs_settings = settings_json
        .get("obs_websocket")
        .and_then(Value::as_object)
        .ok_or("'obs_websocket' missing or not an object")?;
    let overlay_name = obs_settings
        .get("overlaySource")
        .and_then(Value::as_str)
        .ok_or("'overlaySource' missing or not a string")?;
    let obs_ws_port = obs_settings
        .get("port")
        .and_then(Value::as_str)
        .ok_or("'port' missing or not a string")?;

    let url = format!("ws://localhost:{}", obs_ws_port);
    let (ws_stream, _) = connect_async(&url)
        .await
        .map_err(|e| format!("Failed to connect to OBS WS at {}: {}", url, e))?;

    let (mut write, mut read) = ws_stream.split();

    let hello_msg = read
        .next()
        .await
        .ok_or("OBS connection closed before Hello message")?
        .map_err(|e| format!("Error receiving Hello: {}", e))?;
    let _hello_json: Value = serde_json::from_str(hello_msg.to_text().map_err(|e| e.to_string())?)
        .map_err(|e| format!("Failed to parse Hello message: {}", e))?;

    let identify_payload = serde_json::json!({
        "op": 1,
        "d": {
            "rpcVersion": 1
        }
    });

    write
        .send(Message::Text(identify_payload.to_string().as_str().into()))
        .await
        .map_err(|e| format!("Failed to send Identify: {}", e))?;

    while let Some(msg) = read.next().await {
        let msg = msg.map_err(|e| format!("Error reading message: {}", e))?;
        println!("{}", msg);
        let json: Value = serde_json::from_str(msg.to_text().map_err(|e| e.to_string())?)
            .map_err(|e| format!("Failed to parse message: {}", e))?;
        if json.get("op") == Some(&Value::from(2)) {
            break;
        }
    }

    let refresh_payload = serde_json::json!({
        "op": 6,
        "d": {
            "requestType": "PressInputPropertiesButton",
            "requestId": "refresh_button_request_1",
            "requestData": {
                "inputName": overlay_name,
                "propertyName": "refreshnocache"
            }
        }
    });

    write
        .send(Message::Text(refresh_payload.to_string().as_str().into()))
        .await
        .map_err(|e| format!("Failed to send refresh request: {}", e))?;

    write
        .close()
        .await
        .map_err(|e| format!("Failed to close WS: {}", e))?;

    Ok(())
}

fn merge_json(a: &mut Value, b: &Value) {
    match (a, b) {
        (Value::Object(a), Value::Object(b)) => {
            for (k, v) in b {
                merge_json(a.entry(k).or_insert(Value::Null), v);
            }
        }
        (a, b) => {
            *a = b.clone();
        }
    }
}
