import { useState } from "react";
import type { AppConfig } from "../types/config";
import { parseIniString, generateIniString } from "../utils/iniManager";

import * as bridge from "../tauri-bridge";

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

  const loadConfig = async (content: string, filePath?: string) => {
    const parsed = parseIniString(content);
    setConfig(parsed);
    if (filePath) setCurrentFilePath(filePath);
  };

  const saveConfig = async () => {
    if (!config || !currentFilePath) return;
    const iniString = generateIniString(config);
    await bridge.saveFile(currentFilePath, iniString);
  };

  return {
    config,
    setConfig,
    currentFilePath,
    setCurrentFilePath,
    loadConfig,
    saveConfig,
  };
}
