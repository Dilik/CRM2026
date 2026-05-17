import type { ReactNode } from "react";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  // Plan 04 will replace this stub with the real sidebar + header shell.
  // For Phase 1 Wave 2, we just render children so the dashboard page is reachable post-login.
  return <div className="min-h-screen">{children}</div>;
}
