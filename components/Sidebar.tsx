"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Package,
  Download,
  Settings,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Schemes", href: "/schemes", icon: FileText },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Export", href: "/export", icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-navy-900 border-r border-navy-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-navy-700/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-silver-500 to-silver-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-silver-100">Silver</h1>
            <p className="text-xs text-silver-500">Savings Scheme</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-700/50">
        <Link
          href="/settings"
          className={`nav-item ${pathname === "/settings" ? "nav-item-active" : ""}`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* Version */}
      <div className="p-4 text-center">
        <p className="text-xs text-silver-600">v1.0.0</p>
      </div>
    </aside>
  );
}