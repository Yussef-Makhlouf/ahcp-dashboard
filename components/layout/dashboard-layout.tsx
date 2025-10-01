import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { name: 'الرئيسية', href: '/dashboard', icon: <HomeIcon /> },
  { name: 'مكافحة الطفيليات', href: '/parasite-control', icon: <BugIcon /> },
  { name: 'التحصين', href: '/vaccination', icon: <ShieldIcon /> },
  { name: 'العيادات المتنقلة', href: '/mobile-clinics', icon: <TruckIcon /> },
  { name: 'المختبرات', href: '/labs', icon: <FlaskIcon /> },
  { name: 'صحة الخيول', href: '/equine-health', icon: <HeartIcon /> },
  { name: 'العملاء', href: '/clients', icon: <UsersIcon /> },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const toggleItem = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 z-30 w-64 transform overflow-y-auto bg-gradient-to-b from-primary-700 to-primary-800 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">نظام إدارة العيادة</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-2">
          {navItems.map((item) => (
            <div key={item.href} className="space-y-1">
              <Link
                href={item.href}
                onClick={() => item.children && toggleItem(item.name)}
                className={`group flex w-full items-center justify-between rounded-lg p-3 text-sm font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-white/20 text-white shadow-lg border-l-4 border-blue-400 scale-[1.02]'
                    : 'text-white/90 hover:bg-white/10 hover:pl-4 hover:border-l-2 hover:border-white/50 hover:scale-[1.02] hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-primary-100 group-hover:text-white">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.children && (
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedItems[item.name] ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </Link>
              
              {item.children && expandedItems[item.name] && (
                <div className="mr-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        pathname === child.href
                          ? 'bg-white/15 text-white font-medium shadow-md scale-[1.02]'
                          : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-[1.02]'
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Top navbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">
              لوحة التحكم
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <button className="relative rounded-full p-2 text-gray-600 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 hover:scale-105">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-800">المشرف</span>
                  <span className="text-xs text-gray-500">مدير النظام</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Icons
function HomeIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function BugIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>; }
function ShieldIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function TruckIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M19 18h2c.6 0 1-.4 1-1v-3.7c0-.8-.3-1.6-.9-2.1l-6-5.5c-.5-.5-1.2-.7-1.9-.7H14"/><circle cx="7" cy="18" r="2"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/></svg>; }
function FlaskIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6"/><path d="M12 10v4"/><path d="m14 13-8 8"/><path d="m14 18 6-6"/></svg>; }
function HeartIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.5-1.3 2.5-3 3-5 0-3.5-3-6-6.5-6-1.3 0-2.5.5-3.5 1.3-1-.8-2.2-1.3-3.5-1.3C4.5 3 1.5 5.5 1.5 9c0 2 .5 3.7 2 5"/><path d="M12 19c-1.5-1.3-2.5-3-3-5-1-2-1-4 0-6"/><path d="M15.5 18.5c1.5-1.3 2.5-3 3-5 .5-2 .5-4 0-6"/></svg>; }
function UsersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function BellIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>; }
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
