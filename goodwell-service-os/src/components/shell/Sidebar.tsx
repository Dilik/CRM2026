import { SidebarNav } from "./SidebarNav";
import type { NavItem } from "./nav-items";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-700">
        <span className="font-bold text-base tracking-tight">Goodwell</span>
        <span className="ml-1 text-xs text-zinc-400">OS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav items={items} />
      </div>
    </aside>
  );
}
