import OBSWebSocket from "obs-websocket-js";
import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

declare global {
  interface SettingsProps {
    allSettings: SettingsData;
    onClose: () => void;
  }

  interface SettingsData {
    obs_websocket?: {
      overlaySource: string;
      port: string;
      password?: string;
    };
  }

  interface SettingsRegistryItem {
    key: keyof SettingsData;
    label: string;
    component: React.FC<any>;
  }

  interface Positions {
    tourney: number;
    winCon: number;
  }

  interface Alignment {
    tourney: string;
    winCon: string;
  }

  export type OpenResult = {
    filePath: string;
    content: string;
    success: boolean;
  } | null;
}
