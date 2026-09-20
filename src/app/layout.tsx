import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MikroGestor",
  description: "Painel de gerenciamento MikroTik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Global Error Handler — apenas loga no console, sem alert() */}
        <script
          id="global-error-handler"
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(message, source, lineno, colno, error) {
                console.error('[MikroGestor] JS Error:', message, 'at', source, lineno + ':' + colno);
                return false;
              };
              window.onunhandledrejection = function(event) {
                console.error('[MikroGestor] Unhandled Promise Rejection:', event.reason);
              };
              window.addEventListener('error', function(event) {
                if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
                  var url = event.target.src || event.target.href;
                  console.error('[MikroGestor] Failed to load resource:', url);
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {children}
      </body>
    </html>
  );
}

