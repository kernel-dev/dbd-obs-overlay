import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Save,
  FileCog,
  Settings as CogIcon,
} from "lucide-react";
import { useConfig } from "./hooks/useConfig";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import SmallToast from "./components/toasts/SmallToast";
import ToastBackdrop from "./components/toasts/ToastBackdrop";
import NotepadToast from "./components/toasts/NotepadToast";
import "./main.css";
import * as bridge from "./tauri-bridge";
import { generateIniString, parseIniString } from "./utils/iniManager";
import ReactDOM from "react-dom/client";
import React from "react";
import { sendOverlayUpdate } from "./tauri-bridge";
import Settings from "./components/settings/Settings";
import Titlebar from "./components/title/Titlebar";

function Main() {
  const {
    config,
    setConfig,
    currentFilePath,
    setCurrentFilePath,
    loadConfig,
    saveConfig,
  } = useConfig();

  const [smallToastMessage, setSmallToastMessage] = useState<string | null>(
    null
  );
  const [notepadToastMessage, setNotepadToastMessage] = useState<string | null>(
    null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [fetchedSettings, setSettings] = useState<SettingsData>({});

  useEffect(() => {
    (async () => {
      setSettings(JSON.parse(await bridge.loadSettings()));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await bridge.refreshObsBrowserSource();
    })();
  }, [config]);

  const showSmallToast = (msg: string) => {
    setSmallToastMessage(msg);
    setTimeout(() => setSmallToastMessage(null), 3000);
  };

  const handleOpenFile = async () => {
    const result = await bridge.openFile();
    if (result) {
      const { filePath, content } = result;
      await loadConfig(content, filePath);

      showSmallToast("✅ Config loaded");

      const parsedConfig = parseIniString(content);
      setCurrentFilePath(filePath);
      sendOverlayUpdate(
        parsedConfig,
        { tourney: -1, winCon: -1 },
        { tourney: "none", winCon: "none" }
      );
    }
  };

  const handleLoadDefault = async () => {
    const result = await bridge.loadDefaultConfig();
    if (result) {
      const { filePath, content } = result;
      await loadConfig(content, filePath);

      showSmallToast("✅ Default config loaded");

      const parsedConfig = parseIniString(content);
      setCurrentFilePath(filePath);
      sendOverlayUpdate(
        parsedConfig,
        { tourney: -1, winCon: -1 },
        { tourney: "none", winCon: "none" }
      );
    }
  };

  const handleSave = async () => {
    try {
      await saveConfig();
      if (config) {
        setNotepadToastMessage(generateIniString(config));

        sendOverlayUpdate(
          config,
          { tourney: -1, winCon: -1 },
          { tourney: "none", winCon: "none" }
        );
      }
      showSmallToast("✅ Config saved!");
    } catch {
      showSmallToast("❌ Error saving config");
    }
  };

  const handleSaveAs = async () => {
    try {
      const result = await bridge.saveFileAs(generateIniString(config!));
      return result;
    } catch (error) {
      console.error("Error in saveFileAs:", error);
      throw error;
    }
  };

  return (
    <div className="app-main-container">
      <Titlebar filePath={currentFilePath} />

      <div className="main-content-wrapper">
        <div className="app-container">
          <button
            className={`settings-button ${showSettings ? "dimmed" : ""}`}
            onClick={() => setShowSettings(true)}
            title="Open Settings"
          >
            <CogIcon size={20} />
          </button>

          <div className="editor-controls">
            <h2>OBS Overlay Controller</h2>

            {config ? (
              <Editor config={config} setConfig={setConfig} />
            ) : (
              <p>Please load a config.ini file</p>
            )}

            <div className="file-ops">
              <button onClick={handleOpenFile} className="load-btn">
                <Upload size={18} /> Load
              </button>
              <button onClick={handleLoadDefault} className="load-default-btn">
                <FileCog size={18} /> Default
              </button>
              <button
                onClick={handleSave}
                disabled={!config || !currentFilePath}
                className="save-btn"
              >
                <Save size={18} /> Save
              </button>
              <button
                disabled={!config}
                onClick={handleSaveAs}
                className="download-btn"
              >
                <Download size={18} /> Save As…
              </button>
            </div>
          </div>

          <div className="preview-area">
            {config ? <Preview config={config} /> : <h3>No config loaded</h3>}
          </div>

          {smallToastMessage && (
            <SmallToast
              message={smallToastMessage}
              onClose={() => setSmallToastMessage(null)}
            />
          )}

          {notepadToastMessage && (
            <>
              <ToastBackdrop />
              <NotepadToast
                message={notepadToastMessage}
                onClose={() => setNotepadToastMessage(null)}
              />
            </>
          )}

          {showSettings && (
            <Settings
              allSettings={fetchedSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
