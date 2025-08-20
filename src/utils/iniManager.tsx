import { Fragment } from "react/jsx-runtime";
import type { AppConfig } from "../types/config";

export function parseIniString(iniString: string): any {
  const config: { [key: string]: { [key: string]: string } } = {};
  let currentSection: string | null = null;

  const lines = iniString.split(/[\r\n]+/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine.length === 0 ||
      trimmedLine.startsWith(";") ||
      trimmedLine.startsWith("#")
    ) {
      continue;
    }

    if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
      currentSection = trimmedLine.substring(1, trimmedLine.length - 1);
      config[currentSection] = {};
    } else if (trimmedLine.includes("=")) {
      const parts = trimmedLine.split("=", 2);
      const key = parts[0].trim();
      let value = parts[1];

      // Hex code detected, ignore first letter, but continue
      if (/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value)) {
        value = value.replace(/#/, "").split("#")[0].trim().replace(/^/, "#");
      } else value = value.split("#")[0].trim();

      if (currentSection) {
        config[currentSection][key] = value;
      }
    }
  }
  return config;
}

// The function to generate the .ini string from the config object
export function generateIniString(config: AppConfig): string {
  let iniString = "";

  for (const section in config) {
    if (Object.prototype.hasOwnProperty.call(config, section)) {
      iniString += `[${section}]\n`;

      const sectionObject = config[section as keyof typeof config];

      for (const key in sectionObject) {
        if (Object.prototype.hasOwnProperty.call(sectionObject, key)) {
          iniString += `${key}=${sectionObject[key as keyof typeof sectionObject]}\n`;
        }
      }

      iniString += "\n";
    }
  }

  return iniString;
}

// Helper function to format INI string with spans for basic syntax highlighting
export const formatIniForHighlighting = (iniString: string) => {
  const lines = iniString.split("\n");
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    let content;

    // Match [SECTION]
    const sectionMatch = trimmedLine.match(/^\[(.*?)\]$/);
    if (sectionMatch) {
      content = (
        <span className="ini-section-highlight">[{sectionMatch[1]}]</span>
      );
    }
    // Match Key=Value (and optionally comments after # or ;)
    else if (trimmedLine.includes("=")) {
      const parts = trimmedLine.split("=", 2);
      const key = parts[0].trim();

      let value = parts[1];

      // Hex code detected, ignore first letter, but continue
      if (/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value)) {
        value = value.replace(/#/, "").split("#")[0].trim().replace(/^/, "#");
      } else value = value.split("#")[0].trim();

      content = (
        <>
          <span className="ini-key-highlight">{key}</span>=
          <span className="ini-value-highlight">{value}</span>
        </>
      );
    }
    // Handle comments (lines starting with ; or #, even with leading spaces)
    else if (trimmedLine.startsWith(";") || trimmedLine.startsWith("#")) {
      content = <span className="ini-comment-highlight">{line}</span>; // Keep original line for comments
    }
    // Handle empty lines or unparsable lines
    else {
      content = <span>{line}</span>;
    }

    return (
      <Fragment key={index}>
        {content}
        {index < lines.length - 1 && "\n"}
      </Fragment>
    );
  });
};
