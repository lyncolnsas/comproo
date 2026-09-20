import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function logBypassEvent(type: string, data: any) {
  try {
    const logPath = path.join(process.cwd(), 'hotspot', 'error.log');
    const logMessage = `[${new Date().toISOString()}] [BYPASS_${type}] ${typeof data === 'string' ? data : JSON.stringify(data)}\n`;
    fs.promises.appendFile(logPath, logMessage, 'utf8').catch(err => console.error('Failed to write to error.log', err));
  } catch (err) {
    console.error('Failed to log bypass event', err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url') || 'https://www.google.com';
  const userAgent = request.headers.get('user-agent') || '';

  logBypassEvent('REQUEST', { targetUrl, userAgent });

  // 1. Detect Apple CNA (contains iOS keywords but DOES NOT contain Safari)
  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);
  const hasSafari = /Safari/i.test(userAgent);
  const isAppleCNA = isApple && !hasSafari;

  if (isAppleCNA) {
    logBypassEvent('APPLE_CNA_DETECTED', { targetUrl });
    
    // Apple CNA bypass: Return attachment to force-open Safari
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${targetUrl}">
  <title>Redirecionando...</title>
  <script>
    window.location.href = "${targetUrl}";
  </script>
</head>
<body>
  <p>Redirecionando para o navegador padrão...</p>
</body>
</html>`;

    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="redirect.html"'
      }
    });
  }

  // 2. Detect Android CNA (Android WebView usually contains 'wv' or 'Version/4.0')
  const isAndroid = /Android/i.test(userAgent);
  const isAndroidWebView = isAndroid && (/wv/i.test(userAgent) || /Version\/[0-9.]+/i.test(userAgent));

  if (isAndroidWebView) {
    logBypassEvent('ANDROID_CNA_DETECTED', { targetUrl });

    // Reconstruct URL for Android Intent to force Chrome / Default browser
    const cleanUrl = targetUrl.replace(/^https?:\/\//, '');
    const scheme = targetUrl.startsWith('https') ? 'https' : 'http';
    const intentUrl = `intent://${cleanUrl}#Intent;scheme=${scheme};action=android.intent.action.VIEW;end`;

    logBypassEvent('ANDROID_INTENT_REDIRECT', { intentUrl });
    return NextResponse.redirect(intentUrl, 302);
  }

  // 3. Default browser (Safari, Chrome, Desktop, etc.) -> Normal 302 Redirect
  logBypassEvent('NORMAL_REDIRECT', { targetUrl });
  return NextResponse.redirect(targetUrl, 302);
}
