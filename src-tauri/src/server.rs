use std::collections::HashMap;
use include_dir::{include_dir, Dir};
use std::sync::{Arc, Mutex};
use std::thread;

use futures_util::{SinkExt, StreamExt};
use serde_json::json;
use tiny_http::{Response, Server as TinyHttpServer};
use tokio::net::TcpListener;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

static DIST_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../dist");

pub struct Client {
    pub id: String,
    pub topics: Vec<String>,
    pub sender: mpsc::UnboundedSender<Message>,
}

pub struct OverlayServer {
    clients: Arc<Mutex<HashMap<String, Client>>>,
    last_known_payload: Arc<Mutex<Option<Message>>>,
}

impl OverlayServer {
    pub fn new() -> Self {
        Self {
            clients: Arc::new(Mutex::new(HashMap::new())),
            last_known_payload: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start_http_server(&self) {
        let addr = "127.0.0.1:4000";
        let server = TinyHttpServer::http(addr).expect("Failed to start HTTP server");

        println!("HTTP overlay server running at http://{}", addr);

        thread::spawn(move || {
            for request in server.incoming_requests() {
                let url_path = request.url().trim_start_matches('/');

                let file = if url_path == "overlay" || url_path.is_empty() {
                    DIST_DIR.get_file("src/overlay.html")
                } else {
                    DIST_DIR.get_file(url_path)
                };

                let response = if let Some(file) = file {
                    let content = file.contents();
                    let mime = match file.path().extension().and_then(|s| s.to_str()) {
                        Some("css") => "text/css",
                        Some("js") => "application/javascript",
                        Some("html") => "text/html",
                        _ => "application/octet-stream",
                    };
                    Response::from_data(content).with_header(
                        tiny_http::Header::from_bytes(&b"Content-Type"[..], mime.as_bytes())
                            .unwrap(),
                    )
                } else {
                    Response::from_string("404 Not Found").with_status_code(404)
                };

                let _ = request.respond(response);
            }
        });
    }

    pub async fn start_ws_server(
        &self,
        ws_addr: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        println!("WebSocket server running on ws://{}", ws_addr);

        let listener = TcpListener::bind(ws_addr).await?;
        println!("WebSocket server listening on {}", ws_addr);

        let clients_arc = self.clients.clone();

        loop {
            let (stream, peer_addr) = listener.accept().await?;
            println!("New TCP connection for WS from: {}", peer_addr);

            let clients_clone_for_handler = clients_arc.clone();
            let last_known_payload_clone_for_handler = self.last_known_payload.clone();

            tokio::spawn(async move {
                match tokio_tungstenite::accept_async(stream).await {
                    Ok(ws_stream) => {
                        println!("WebSocket connection established with: {}", peer_addr);

                        let client_id = Uuid::new_v4().to_string();
                        let (tx, mut rx) = mpsc::unbounded_channel();

                        let new_client = Client {
                            id: client_id.clone(),
                            topics: Vec::new(),
                            sender: tx,
                        };

                        let client_sender_for_initial_send: mpsc::UnboundedSender<Message>;
                        {
                            let mut clients_guard = clients_clone_for_handler
                                .lock()
                                .expect("Failed to lock clients mutex for insertion");
                            clients_guard.insert(client_id.clone(), new_client);

                            client_sender_for_initial_send = clients_guard
                                .get(&client_id)
                                .expect("Client not found after insertion")
                                .sender
                                .clone();
                        }

                        println!("New WebSocket client added: {}", client_id);

                        if let Some(payload_to_send) = last_known_payload_clone_for_handler
                            .lock()
                            .expect("Failed to lock last_known_payload mutex")
                            .as_ref()
                        {
                            if let Err(e) =
                                client_sender_for_initial_send.send(payload_to_send.clone())
                            {
                                println!(
                                    "Failed to send initial payload to new client {}: {}",
                                    client_id, e
                                );
                            } else {
                                println!("Sent initial payload to new client {}.", client_id);
                            }
                        }

                        let (mut write, mut read) = ws_stream.split();

                        loop {
                            tokio::select! {
                                ws_msg = read.next() => {
                                    match ws_msg {
                                        Some(Ok(Message::Text(text))) => {
                                            println!("Received WS message from {}: {}", client_id, text);
                                        },
                                        Some(Ok(Message::Binary(bin))) => {
                                            println!("Received WS binary message from {}: {:?}", client_id, bin);
                                        },
                                        Some(Ok(Message::Ping(data))) => {
                                            let _ = write.send(Message::Pong(data)).await;
                                        },
                                        Some(Ok(Message::Pong(_))) => {
                                        },
                                        Some(Ok(Message::Close(_))) => {
                                            println!("WebSocket client {} disconnected gracefully.", client_id);
                                            break;
                                        },
                                        Some(Err(e)) => {
                                            eprintln!("WebSocket read error for client {}: {}", client_id, e);
                                            break;
                                        },
                                        None => {
                                            println!("WebSocket client {} disconnected (stream ended).", client_id);
                                            break;
                                        },
                                        Some(Ok(_)) => {
                                        },
                                    }
                                },

                                channel_msg = rx.recv() => {
                                    if let Some(msg) = channel_msg {
                                        if let Err(e) = write.send(msg).await {
                                            println!("Failed to send message to client {}: {}", client_id, e);
                                            break;
                                        }
                                    } else {
                                        println!("Channel to client {} closed externally.", client_id);
                                        break;
                                    }
                                },
                            }
                        }

                        clients_clone_for_handler
                            .lock()
                            .expect("Failed to lock clients mutex during client removal.")
                            .remove(&client_id);
                        println!("Client {} removed.", client_id);
                    }
                    Err(e) => {
                        eprintln!(
                            "Failed to accept WebSocket connection from {}: {}",
                            peer_addr, e
                        );
                    }
                }
            });
        }
    }

    pub fn broadcast_update(&self, config_str: &str, positions_str: &str, alignment_str: &str) {
        println!("Config string to broadcast: {}", config_str);

        let clients = self.clients.lock().unwrap();

        // Parse the incoming strings as JSON values
        let config_json: serde_json::Value = serde_json::from_str(config_str).unwrap_or(json!({}));
        let positions_json: serde_json::Value =
            serde_json::from_str(positions_str).unwrap_or(json!({}));
        let alignment_json: serde_json::Value =
            serde_json::from_str(alignment_str).unwrap_or(json!({}));

        let combined = json!({
            "config": config_json,
            "positions": positions_json,
            "alignment": alignment_json,
        });

        let message = Message::Text(combined.to_string().into());

        *self.last_known_payload.lock().unwrap() = Some(message.clone());

        for (_id, client) in clients.iter() {
            if let Err(e) = client.sender.send(message.clone()) {
                eprintln!("Failed to send message to client {}: {}", client.id, e);
            }
        }
    }
}
