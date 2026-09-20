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

/**
 * Ensures clean, valid HTML document structure for any captive portal template.
 * Guarantees proper ordering: <!DOCTYPE> -> <head> -> </head> -> <body> -> </body> -> </html>
 * Ensures MIKROGESTOR_BG_SCRIPT and MIKROGESTOR_EFFECTS blocks are in body.
 */
export function normalizeHtmlStructure(rawHtml: string, templateName?: string): string {
  let html = rawHtml;

  // 1. If <!DOCTYPE is not at the start, reorder
  const docIndex = html.indexOf('<!DOCTYPE');
  if (docIndex > 0) {
    html = html.substring(docIndex);
  }

  // 2. Ensure basic html and head structure if missing
  if (!/<!DOCTYPE\s+html>/i.test(html)) {
    html = `<!DOCTYPE html><html lang="pt-br"><head><meta charset="utf-8"><title>Hotspot - ${templateName || 'Portal'}</title></head><body>${html}</body></html>`;
  }

  // 3. Ensure </head> and <body> tags exist
  if (!/<\/head>/i.test(html)) {
    const splitPoint = html.search(/(\$\(if chap-id\)|<div[^>]*id=["']mg-app-root["']|<form)/i);
    if (splitPoint !== -1) {
      const headPart = html.substring(0, splitPoint);
      const bodyPart = html.substring(splitPoint);
      html = `${headPart}\n</head>\n<body>\n${bodyPart}`;
    } else {
      html = html.replace(/(<head[^>]*>[\s\S]*?)(<body|$)/i, '$1\n</head>\n<body>\n$2');
    }
  } else if (!/<body[^>]*>/i.test(html)) {
    html = html.replace(/<\/head>/i, '</head>\n<body>');
  }

  // 4. Ensure closing tags at end
  if (!/<\/body>/i.test(html)) html += '\n</body>';
  if (!/<\/html>/i.test(html)) html += '\n</html>';

  // 5. Ensure MIKROGESTOR_BG_SCRIPT block exists in body
  if (!/<!--\s*MIKROGESTOR[_\s]BG[_\s]SCRIPT\s*-->/i.test(html)) {
    html = html.replace(/(<body[^>]*>)/i, '$1\n  <!-- MIKROGESTOR_BG_SCRIPT -->\n  <!-- END_MIKROGESTOR_BG_SCRIPT -->\n');
  }

  // 6. Ensure MIKROGESTOR_EFFECTS block exists in body
  if (!/<!--\s*MIKROGESTOR[_\s]EFFECTS\s*-->/i.test(html)) {
    const bgEnd = /<!--\s*END[_\s]MIKROGESTOR[_\s]BG[_\s]SCRIPT\s*-->/i;
    if (bgEnd.test(html)) {
      html = html.replace(bgEnd, '$&\n  <!-- MIKROGESTOR EFFECTS -->\n  <!-- END MIKROGESTOR EFFECTS -->');
    } else {
      html = html.replace(/(<body[^>]*>)/i, '$1\n  <!-- MIKROGESTOR EFFECTS -->\n  <!-- END MIKROGESTOR EFFECTS -->\n');
    }
  }

  return html;
}

