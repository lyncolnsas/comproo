import fs from 'fs';
import path from 'path';

/**
 * Safely resolves the absolute path to a hotspot template directory,
 * preserving spaces, hyphens, underscores and dots while preventing path traversal.
 */
export function resolveTemplateDir(templateName?: string | null): string {
  const base = path.join(process.cwd(), 'hotspot');
  if (!templateName || templateName === 'default') {
    return path.join(base, 'default');
  }

  // Prevent directory traversal attacks
  const cleaned = templateName.replace(/(\.\.[\/\\]|\.\.)/g, '').trim();
  
  // 1. Direct match (e.g., "Wifi El Barrio", "fifa-26.otf")
  const directPath = path.join(base, cleaned);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // 2. Normalized match without special chars
  const normalized = cleaned.replace(/[^a-zA-Z0-9_.-]/g, '');
  const normPath = path.join(base, normalized);
  if (fs.existsSync(normPath)) {
    return normPath;
  }

  // 3. Case-insensitive lookup in hotspot directory
  try {
    if (fs.existsSync(base)) {
      const list = fs.readdirSync(base);
      const match = list.find(
        f => f.toLowerCase() === cleaned.toLowerCase() ||
             f.toLowerCase() === normalized.toLowerCase() ||
             f.replace(/\s+/g, '').toLowerCase() === cleaned.replace(/\s+/g, '').toLowerCase()
      );
      if (match) {
        return path.join(base, match);
      }
    }
  } catch (e) {}

  return directPath;
}

export function getTemplatePaths(templateName?: string | null) {
  const HOTSPOT_DIR = resolveTemplateDir(templateName);
  const CONFIG_PATH = path.join(HOTSPOT_DIR, 'config.json');
  const LOGIN_HTML_PATH = path.join(HOTSPOT_DIR, 'login.html');
  return { HOTSPOT_DIR, CONFIG_PATH, LOGIN_HTML_PATH };
}
