import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Laptop, Users, Settings, BarChart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Laptop className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">
                BBE Admin 
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/dashboard/clients">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-secondary"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Clients
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-secondary"
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-secondary"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <ThemeToggle />
              <UserButton afterSignOutUrl="/" />
            </nav>
          </div>
        </header>
        <main className="flex-1 container py-8 px-4">{children}</main>
      </div>
    </ThemeProvider>
  );
}
