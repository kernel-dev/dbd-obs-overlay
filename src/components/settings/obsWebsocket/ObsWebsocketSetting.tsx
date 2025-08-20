import React from "react";
import "./ObsWebsocketSetting.css";

interface ObsWebsocketData {
  overlaySource: string;
  port: string;
  password?: string;
}

interface ObsWebsocketSettingProps {
  data: ObsWebsocketData;
  onChange: (newData: ObsWebsocketData) => void;
}

const ObsWebsocketSetting: React.FC<ObsWebsocketSettingProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="obs-settings">
      <h2>OBS WebSocket Settings</h2>

      <div className="form-group">
        <label>Overlay Source Name (In OBS)</label>
        <input
          type="text"
          name="overlaySource"
          value={data?.overlaySource ?? ""}
          onChange={handleChange}
          placeholder="Enter OBS source name"
        />
      </div>

      <div className="form-group">
        <label>OBS WebSocket Port</label>
        <input
          type="text"
          name="port"
          value={data?.port ?? ""}
          onChange={handleChange}
          placeholder="4455"
        />
      </div>

      <div className="form-group">
        <label>OBS WebSocket Password</label>
        <input
          type="password"
          name="password"
          value={data?.password ?? ""}
          onChange={handleChange}
          placeholder="Enter password"
        />
      </div>
    </div>
  );
};

export default ObsWebsocketSetting;
