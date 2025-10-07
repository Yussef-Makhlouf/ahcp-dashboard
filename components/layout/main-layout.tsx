"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { AuthDebug } from "@/components/debug/auth-debug";
import { QuickLogin } from "@/components/debug/quick-login";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-card">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onCollapse={toggleCollapse}
      />

      {/* Main content */}
      <div className={cn(
        "content-transition transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:pr-16" : "lg:pr-64"
      )}>
        <Navbar 
          onToggleSidebar={toggleSidebar}
          onToggleCollapse={toggleCollapse}
          isCollapsed={sidebarCollapsed}
        />
        <main className={cn("p-6 bg-light", className)}>
          {children}
        </main>
      </div>
      
      {/* Debug Components - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <AuthDebug />
          <QuickLogin />
        </>
      )}
    </div>
  );
}
