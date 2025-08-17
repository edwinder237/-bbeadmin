"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart, 
  Building2,
  Bell,
  Search
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="w-full px-6 lg:px-8 flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">BBE Admin</h1>
                  <p className="text-xs text-muted-foreground">Client Management</p>
                </div>
              </div>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-9 px-4 font-medium",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients, settings..."
                  className="pl-10 bg-muted/50 border-0 focus-visible:bg-background"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <ThemeToggle />
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </div>
          </div>
        </header>

        {/* Mobile Navigation (bottom on mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
          <div className="grid grid-cols-4 gap-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-12 flex-col gap-1 text-xs",
                      isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
