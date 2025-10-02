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
import { useTranslation } from "@/lib/use-translation";
import { useLanguage } from "@/lib/language-context";

const getMenuItems = (t: (key: string) => string) => [
  {
    title: t('navigation.dashboard'),
    href: "/",
    icon: Home,
  },
  {
    title: t('navigation.parasiteControl'),
    href: "/parasite-control",
    icon: Bug,
  },
  {
    title: t('navigation.vaccination'),
    href: "/vaccination",
    icon: Syringe,
  },
  {
    title: t('navigation.mobileClinics'),
    href: "/mobile-clinics",
    icon: Truck,
  },
  {
    title: t('navigation.equineHealth'),
    href: "/equine-health",
    icon: HomeIcon,
  },
  {
    title: t('navigation.laboratories'),
    href: "/laboratories",
    icon: FlaskConical,
  },
  {
    title: t('navigation.clients'),
    href: "/clients",
    icon: Users,
  },
  {
    title: t('navigation.reports'),
    href: "/reports",
    icon: FileText,
  },
  {
    title: t('navigation.profile'),
    href: "/profile",
    icon: User,
  },
  {
    title: t('navigation.settings'),
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
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const menuItems = getMenuItems(t);

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
        "sidebar fixed top-0 z-50 h-screen text-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16 collapsed" : "w-64",
        isOpen ? "translate-x-0 open" : "translate-x-full lg:translate-x-0",
        isRTL ? "right-0" : "left-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="sidebar-header">
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className=" font-bold text-white">
                  {t('sidebar.title')}
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
                      <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && (isRTL ? "ml-3" : "mr-3"))} />
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
                {t('sidebar.copyright')}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}