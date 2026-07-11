import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { removeToken } from "@/lib/auth";
import { Wallet, LayoutDashboard, List, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isError } = useGetCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isError) {
      removeToken();
      setLocation("/login");
    }
  }, [isError, setLocation]);

  const handleLogout = () => {
    removeToken();
    setLocation("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: List },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Wallet className="w-6 h-6" />
          <span className="font-serif font-bold text-lg text-foreground">Ledger</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-card border-r-border/40 p-6 flex flex-col">
            <div className="flex items-center gap-2 text-primary mb-12">
              <Wallet className="w-6 h-6" />
              <span className="font-serif font-bold text-xl text-foreground">Ledger</span>
            </div>
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              Log out
            </Button>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30 p-6">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 text-primary mb-12 cursor-pointer group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-2xl text-foreground tracking-tight">Ledger</span>
          </div>
        </Link>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive ? 'text-primary font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                  {isActive && <div className="absolute inset-0 bg-primary/10 rounded-xl animate-in fade-in zoom-in duration-300" />}
                  <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'animate-bounce' : ''}`} style={{ animationIterationCount: 1 }} />
                  <span className="relative z-10">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate w-32">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate w-32">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Log out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
