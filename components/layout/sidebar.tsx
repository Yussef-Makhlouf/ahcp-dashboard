"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
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
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Trash2,
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
    title: "سجل المحذوفات",
    href: "/trash",
    icon: Trash2,
  },
  // {
  //   title: "التقارير",
  //   href: "/reports",
  //   icon: FileText,
  // },
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
  const router = useRouter();
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
        "sidebar-enhanced fixed right-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out shadow-2xl border-l border-white/20 rounded-2xl ",
        "bg-[#d97a1a]/90 backdrop-blur-xl",
        isCollapsed ? "w-16 collapsed" : "w-64",
        isOpen ? "translate-x-0 open" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header - ARTAT Branding with Logo */}
          <div className="sidebar-header p-1 border-b border-white/20">
            {!isCollapsed && (
              <div className="flex flex-col items-center space-y-3 py-1">
                {/* Logo - Full Width */}
                <div className="w-full ">
                  <div className="sidebar-logo w-full  rounded-2xl overflow-hidden ">
                    <Image
                      src="/logo.jpg"
                      alt="ARTAT Logo"
                      width={300}
                      height={100}
                      className="w-full h-full object-cover "
                    />
                  </div>
                </div>
                {/* Brand Text */}
                <div className="flex flex-col items-center space-y-2 text-center">
                  <h1 className="text-xl font-bold text-white drop-shadow-sm">
                    أرطات لصحة الحيوان
                  </h1>
                
                </div>
              </div>
            )}
         
            
            {/* Collapse Button */}
            <div className="mt-4 flex justify-center ">
              <button
                onClick={onCollapse}
                className="sidebar-collapse-btn p-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/30 shadow-lg backdrop-blur-sm"
                title={isCollapsed ? "توسيع الشريط الجانبي" : "طي الشريط الجانبي"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-white" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav flex-1 px-3 py-4">
            <ul className="space-y-2 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // Prevent hydration mismatch by checking if mounted
                const isActive = mounted && (pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href)));
                
                return (
                  <li key={item.href} className="nav-item py-1">
                    <Link
                      href={item.href}
                      onClick={() => {
                        // Close mobile sidebar when navigating
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={cn(
                        "nav-link group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/20 hover:shadow-lg hover:scale-105 backdrop-blur-sm",
                        isActive && "bg-white/30 shadow-lg scale-105 border-r-4 border-white",
                        isCollapsed && "justify-center px-2 gap-4"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon className={cn(
                        "nav-icon h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                        isActive && "text-white",
                        !isActive && "text-white/80 group-hover:text-white",
                        !isCollapsed && "ml-3"
                      )} />
                      {!isCollapsed && (
                        <span className={cn(
                          "nav-text truncate font-medium transition-all duration-200",
                          isActive && "text-white font-semibold",
                          !isActive && "text-white/80 group-hover:text-white"
                        )}>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="sidebar-footer px-3 py-4 border-t border-white/20">
            <button
              onClick={handleLogout}
              className={cn(
                "logout-btn w-full group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/20 hover:shadow-lg hover:scale-105 backdrop-blur-sm border border-red-400/30",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? "تسجيل الخروج" : undefined}
            >
              <LogOut className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 text-red-300 group-hover:text-red-200",
                !isCollapsed && "ml-3"
              )} />
              {!isCollapsed && (
                <span className="truncate font-medium transition-all duration-200 text-white group-hover:text-white">
                  تسجيل الخروج
                </span>
              )}
            </button>
          </div>

      
          
 
        </div>
      </aside>
    </>
  );
}