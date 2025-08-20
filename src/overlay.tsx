import React, { useEffect, useRef, useState } from "react";
import Preview from "./components/Preview";
import type { AppConfig } from "./types/config";
import "./components/Preview.css";
import ReactDOM from "react-dom/client";

export default function OverlayApp() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [positions, setPositions] = useState<Positions>({
    tourney: 0,
    winCon: 0,
  });
  const [alignment, setAlignment] = useState<Alignment>({
    tourney: "left",
    winCon: "left",
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const RECONNECT_DELAY_MS = 1000;

  const connectWebSocket = () => {
    const ws = new WebSocket("ws://127.0.0.1:4001");

    ws.onopen = () => {
      console.log("Overlay: Connected to WebSocket server.");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log("Overlay: Raw WS message received:", event.data);
      try {
        const data = JSON.parse(event.data as string) as {
          config: AppConfig;
          positions: Positions;
          alignment: Alignment;
        };

        if (data.config) {
          setConfig(data.config);
        }

        if (data.positions) {
          const validatedPositions = positions;

          if (data.positions.tourney != -1)
            validatedPositions.tourney = data.positions.tourney;
          if (data.positions.winCon != -1)
            validatedPositions.winCon = data.positions.winCon;

          setPositions(validatedPositions);
        }

        if (data.alignment) {
          const validatedAlignment = alignment;

          if (data.alignment.tourney != "none")
            validatedAlignment.tourney = data.alignment.tourney;
          if (data.alignment.winCon != "none")
            validatedAlignment.winCon = data.alignment.winCon;

          setAlignment(validatedAlignment);
        }
        console.log("Overlay: State updated from WS data.");
      } catch (e) {
        console.error(
          "Overlay: Failed to parse WS message or update state:",
          e
        );
      }
    };

    ws.onclose = (event) => {
      console.log(
        `Overlay: Disconnected from WebSocket server. Clean close: ${event}.`
      );
      setIsConnected(false);

      setTimeout(() => connectWebSocket(), RECONNECT_DELAY_MS);
    };

    ws.onerror = (error) => {
      console.error("Overlay: WebSocket error:", error);
      setIsConnected(false);
    };
  };

  useEffect(() => {
    connectWebSocket();
  }, [isConnected]);

  if (!config) {
    return (
      <div
        style={{
          background: "transparent",
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: "1.2em",
        }}
      ></div>
    );
  }

  return (
    <Preview
      config={config}
      enableMovingObjects={false}
      positionsToUse={positions}
      alignmentsToUse={alignment}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<OverlayApp />);
