"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  TrendingUp, 
  Activity,
  ChevronRight,
  Building,
  Globe,
  Zap
} from "lucide-react";

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  developmentClients: number;
  inactiveClients: number;
  recentActivity: Array<{
    id: string;
    action: string;
    client: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    pendingClients: 0,
    developmentClients: 0,
    inactiveClients: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && userId) {
      // Mock data for now - in real app, fetch from API
      setStats({
        totalClients: 24,
        activeClients: 8,
        pendingClients: 5,
        developmentClients: 7,
        inactiveClients: 4,
        recentActivity: [
          { id: "1", action: "Client created", client: "Sunset Villa", timestamp: "2 hours ago" },
          { id: "2", action: "Status updated", client: "Beach Resort", timestamp: "4 hours ago" },
          { id: "3", action: "Preferences saved", client: "Mountain Lodge", timestamp: "1 day ago" },
        ]
      });
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your client management system
          </p>
        </div>
        <Link href="/dashboard/clients">
          <Button className="shadow-lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Production</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+5</span> this month
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Development</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Building className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.developmentClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-yellow-600">3</span> ready for testing
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testing Phase</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-orange-600">2</span> pending approval
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/clients">
              <Button variant="outline" className="w-full justify-between hover:bg-blue-50">
                <span className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  View All Clients
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-between hover:bg-green-50">
                <span className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics Dashboard
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-between hover:bg-purple-50">
                <span className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.client} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/clients">
                <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
                  View all activity
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
            Client Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{stats.activeClients}</div>
              <Badge variant="outline" className="mt-2 border-green-200 text-green-700">
                Production
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingClients}</div>
              <Badge variant="outline" className="mt-2 border-orange-200 text-orange-700">
                Testing
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{stats.developmentClients}</div>
              <Badge variant="outline" className="mt-2 border-yellow-200 text-yellow-700">
                Development
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-gray-600">{stats.inactiveClients}</div>
              <Badge variant="outline" className="mt-2 border-gray-200 text-gray-700">
                Inactive
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

