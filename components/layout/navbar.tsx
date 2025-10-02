"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, User, LogOut, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}

export function Navbar({ onToggleSidebar, onToggleCollapse, isCollapsed = false }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  return (
    <header className="navbar flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Desktop sidebar toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="navbar-toggle hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}

        {/* Mobile menu trigger */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="navbar-toggle lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Page title */}
        <h2 className="text-lg font-semibold text-white">لوحة التحكم</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
    

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-white hover:bg-white/10"
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="h-5 w-5 hidden dark:block" />
          <span className="sr-only">تبديل الوضع</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full hover:bg-white/10"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-white/20 text-white">
                  {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "المستخدم"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@ahcp.gov.eg"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={logout}
              className="text-danger focus:text-danger"
            >
              <LogOut className="ml-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
