import { invoke } from "@tauri-apps/api/core";
import type { AppConfig } from "./types/config";

export async function openFile(): Promise<OpenResult> {
  return await invoke<OpenResult>("open_file");
}

export async function saveFile(filePath: string, content: string): Promise<string | null> {
  return await invoke<string | null>("save_file", { filePath, content });
}

export async function saveFileAs(content: string): Promise<OpenResult> {
  return await invoke<OpenResult>("save_file_as", { content });
}

export async function loadDefaultConfig(): Promise<OpenResult> {
  return await invoke<OpenResult>("load_default_config");
}

export async function loadSettings(): Promise<string> {
  return await invoke<string>("load_settings");
}

export async function saveSettings(settings: string): Promise<OpenResult> {
  return await invoke<OpenResult>("save_settings", { settings });
}

export async function refreshObsBrowserSource(): Promise<void> {
  return await invoke<void>("refresh_obs_browser_source");
}

export async function sendOverlayUpdate(
  config: AppConfig,
  positions: Positions,
  alignment: Alignment
) {
  await invoke("update_overlay", { config, positions, alignment });
}
