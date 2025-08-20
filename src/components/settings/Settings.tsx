import React, { useState } from "react";
import * as bridge from "../../tauri-bridge";
import "./Settings.css";
import ToastBackdrop from "../toasts/ToastBackdrop";
import { X as CloseIcon } from "lucide-react";
import ObsWebsocketSetting from "./obsWebsocket/ObsWebsocketSetting";

const settingsRegistry: SettingsRegistryItem[] = [
  {
    key: "obs_websocket",
    label: "OBS WebSocket",
    component: ObsWebsocketSetting,
  },
];

const Settings: React.FC<SettingsProps> = ({ allSettings, onClose }) => {
  const [selected, setSelected] = useState(settingsRegistry[0].label);
  const [settings, setSettings] = useState<SettingsData>(allSettings);

  const handleApply = () => {
    (async () => {
      const selectedSetting = settingsRegistry.find(
        (item) => item.label === selected
      );

      if (selectedSetting) {
        const dataToSave = {
          [selectedSetting.key]: settings[selectedSetting.key],
        };

        const settingsJson = JSON.stringify(dataToSave, null, 2);

        await bridge.saveSettings(settingsJson);

        onClose();
      }
    })();
  };

  const handleSettingChange = (key: keyof SettingsData, newData: any) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: newData,
    }));
  };

  const SelectedComponent = settingsRegistry.find(
    (item) => item.label === selected
  );

  return (
    <>
      <ToastBackdrop />
      <div className="settings-container">
        <div className="settings-list">
          {settingsRegistry.map((item) => (
            <div
              key={item.label}
              className={`settings-item ${
                selected === item.label ? "active" : ""
              }`}
              onClick={() => setSelected(item.label)}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="settings-view">
          <button className="close-button" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
          {SelectedComponent && (
            <SelectedComponent.component
              data={settings[SelectedComponent.key as keyof SettingsData]}
              onChange={(newData: any) =>
                handleSettingChange(SelectedComponent.key, newData)
              }
            />
          )}

          <div className="button-group">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="apply-button" onClick={handleApply}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
