import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minimize, Maximize, X } from "lucide-react";
import "./Titlebar.css";

const TitleBar: React.FC<{ filePath: string | null }> = ({ filePath }) => {
  const appWindow = getCurrentWindow();
  const getFileName = (path: string) => {
    if (!path) return "Untitled";
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  return (
    <div data-tauri-drag-region className="titlebar">
      <div className="titlebar-file-name" data-tauri-drag-region>
        <span>DBD Overlay Editor</span>
        {filePath && (
          <span>
            {" "}
            | <span className="file-name">{getFileName(filePath)}</span>
          </span>
        )}
      </div>

      <div className="titlebar-controls">
        <div className="titlebar-button" onClick={() => appWindow.minimize()}>
          <Minimize size={18} />
        </div>
        <div
          className="titlebar-button"
          onClick={() => appWindow.toggleMaximize()}
        >
          <Maximize size={18} />
        </div>
        <div
          className="titlebar-button titlebar-close"
          onClick={() => appWindow.close()}
        >
          <X size={18} />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
