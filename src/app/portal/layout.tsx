/**
 * Isolated layout for /portal/* pages (register, verify).
 * These pages render their own full-screen styled UI and must NOT
 * inherit the dashboard globals.css retro-styles or the root body
 * flex layout that breaks fixed-positioned backgrounds.
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
