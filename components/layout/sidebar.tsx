"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
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
    title: " المراقبه و العلاج",
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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ isOpen, onToggle, isCollapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 sidebar-backdrop transition-opacity duration-300 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "sidebar fixed right-0 top-0 z-50 h-screen text-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16 collapsed" : "w-64",
        isOpen ? "translate-x-0 open" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="sidebar-header">
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className=" font-bold text-white">
                  AHCP Dashboard
                </h1>
              </div>
            )}
            
 
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        // Close mobile sidebar when navigating
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={cn(
                        "nav-link",
                        isActive && "active",
                        isCollapsed && "justify-center"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "ml-3")} />
                      {!isCollapsed && (
                        <span className="nav-text truncate">{item.title}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="border-t border-white/10 p-4">
              <p className="text-center text-xs text-white/60">
                © 2025 AHCP - مشروع صحة الحيوان
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}