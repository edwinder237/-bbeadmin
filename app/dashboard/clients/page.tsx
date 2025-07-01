"use client";

import { ClientsList } from "@/components/clients-list";
import { ClientStats } from "@/components/client-stats";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ClientData {
  id: number;
  name: string;
  email: string;
  updatedAt: string;
  status: string;
  cuid?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  status: "Active" | "Inactive" | "Pending";
  client: ClientData;
  cuid: string;
}

async function getClients(): Promise<Client[]> {
  try {
    // Enhanced debugging
    console.log("🔍 === ENHANCED DEBUG INFO ===");
    console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔗 NEXT_PUBLIC_SERVER_URL from env:", process.env.NEXT_PUBLIC_SERVER_URL);
    
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
    console.log("📍 SERVER_URL final value:", SERVER_URL);
    console.log("🚀 Full URL being used:", `${SERVER_URL}/api/getAdminData`);
    console.log("⚡ Environment variables available:", Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
    console.log("===============================");
    
    console.log("📡 Attempting to fetch from:", `${SERVER_URL}/api/getAdminData`);
    
    const response = await fetch(`${SERVER_URL}/api/getAdminData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove cache: 'no-store' to allow better caching
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("🚨 Error response body:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Successfully fetched data:", data);
    
    // Transform ClientData[] to Client[]
    const clients: Client[] = (data || []).map((client: ClientData) => {
      // Map API status to Client interface status
      let mappedStatus: "Active" | "Inactive" | "Pending" = "Inactive";
      if (client.status === "Production") mappedStatus = "Active";
      else if (client.status === "Testing") mappedStatus = "Pending";
      else mappedStatus = "Inactive";

      return {
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        lastActive: new Date(client.updatedAt).toISOString().split("T")[0],
        status: mappedStatus,
        client: client,
        cuid: client.cuid || client.id.toString(),
      };
    });
    
    return clients;
  } catch (error) {
    console.error("💥 Error in getClients:", error);
    console.log("🔍 Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    console.log("🚨 Falling back to empty client list due to API error");
    return [];
  }
}

export default function ClientsPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !userId) {
      console.log("🔐 User not authenticated, redirecting to sign-in");
      router.push('/sign-in');
      return;
    }

    if (isLoaded && userId) {
      console.log("🔐 User authenticated, loading clients");
      getClients().then(data => {
        setClients(data);
        setIsLoading(false);
      });
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  const clientStats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "Active").length,
    pendingClients: clients.filter((c) => c.status === "Pending").length,
    inactiveClients: clients.filter((c) => c.status === "Inactive").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage your clients and their information.
        </p>
      </div>
      
      <ClientStats stats={clientStats} />
      <ClientsList initialClients={clients} />
      
      {/* Debug info for production */}
      {process.env.NODE_ENV === 'production' && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <p><strong>Debug Info (Production):</strong></p>
            <p>API URL: {process.env.NEXT_PUBLIC_SERVER_URL}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Check the browser console for detailed logs.</p>
          </div>
        </div>
      )}
    </div>
  );
}
