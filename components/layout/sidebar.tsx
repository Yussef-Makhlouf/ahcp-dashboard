"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Bug,
  Syringe,
  Truck,
  FlaskConical,
  Users,
  FileText,
  Settings,
  User,
  HomeIcon,
} from "lucide-react";

const menuItems = [
  {
    title: "الرئيسية",
    href: "/",
    icon: Home,
  },
  {
    title: "مكافحة الطفيليات",
    href: "/parasite-control",
    icon: Bug,
  },
  {
    title: "التحصين",
    href: "/vaccination",
    icon: Syringe,
  },
  {
    title: "العيادات المتنقلة",
    href: "/mobile-clinics",
    icon: Truck,
  },
  {
    title: "صحة الخيول",
    href: "/equine-health",
    icon: HomeIcon,
  },
  {
    title: "المختبرات",
    href: "/laboratories",
    icon: FlaskConical,
  },
  {
    title: "المربيين",
    href: "/clients",
    icon: Users,
  },
  {
    title: "التقارير",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "الملف الشخصي",
    href: "/profile",
    icon: User,
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-64 border-l border-border bg-card sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="sidebar-header">
          <h1 className="text-xl font-bold text-white">
            AHCP Dashboard
          </h1>
          <p className="text-sm text-white/80 mt-1">مشروع صحة الحيوان</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-nav">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-link flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-300",
                      "hover:bg-blue-100 hover:text-blue-800 hover:shadow-sm hover:scale-[1.02]",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      isActive && "bg-blue-600 text-white shadow-lg scale-[1.02] hover:bg-blue-700 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-center text-xs text-muted-foreground">
            © 2025 AHCP - مشروع صحة الحيوان
          </p>
        </div>
      </div>
    </aside>
  );
}
