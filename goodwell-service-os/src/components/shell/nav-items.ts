import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BookOpen,
  Warehouse,
  Banknote,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@prisma/client";

export type NavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "RECEPTIONIST", "MASTER", "WAREHOUSE", "EXECUTIVE"],
  },
  {
    key: "orders",
    href: "/orders",
    icon: ClipboardList,
    roles: ["ADMIN", "RECEPTIONIST", "MASTER"],
  },
  {
    key: "customers",
    href: "/customers",
    icon: Users,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    key: "catalog",
    href: "/catalog",
    icon: BookOpen,
    roles: ["ADMIN", "MASTER", "WAREHOUSE"],
  },
  {
    key: "warehouse",
    href: "/warehouse",
    icon: Warehouse,
    roles: ["ADMIN", "WAREHOUSE"],
  },
  {
    key: "finance",
    href: "/finance",
    icon: Banknote,
    roles: ["ADMIN", "RECEPTIONIST", "EXECUTIVE"],
  },
  {
    key: "reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "EXECUTIVE"],
  },
  {
    key: "settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
