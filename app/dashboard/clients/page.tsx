import { ClientsList } from "@/components/clients-list";
import { ClientStats } from "@/components/client-stats";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ClientData {
  id: number;
  name: string;
  email: string;
  updatedAt: string;
  status: string;
  cuid?: string;
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';

async function getClients() {
  // Production API URL: https://nodejs-serverless-function-express-omega-rouge.vercel.app
  console.log('=== DEBUG INFO ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_SERVER_URL from env:', process.env.NEXT_PUBLIC_SERVER_URL);
  console.log('SERVER_URL final value:', SERVER_URL);
  console.log('Full URL being used:', `${SERVER_URL}/api/getAdminData`);
  console.log('==================');
  
  if (!SERVER_URL) {
    throw new Error("SERVER_URL is not configured. Please set NEXT_PUBLIC_SERVER_URL environment variable.");
  }
  
  try {
    console.log('Attempting to fetch from:', `${SERVER_URL}/api/getAdminData`);
    
    const res = await fetch(`${SERVER_URL}/api/getAdminData`, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Response error:', errorText);
      
      // Return empty array if API is unavailable instead of crashing
      if (res.status >= 500 || res.status === 0) {
        console.warn('API server unavailable, returning empty client list');
        return [];
      }
      
      throw new Error(`Failed to fetch clients: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    console.log('Data received:', data);
    
    // Handle empty or invalid response
    if (!Array.isArray(data)) {
      console.warn('API returned non-array data:', data);
      return [];
    }
    
    return data.map((client: ClientData) => {
      // Map API status to Client interface status
      let mappedStatus: "Active" | "Inactive" | "Pending" = "Inactive";
      if (client.status === "Production") mappedStatus = "Active";
      else if (client.status === "Testing") mappedStatus = "Pending";
      else mappedStatus = "Inactive";
      
      return {
        ...client,
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        lastActive: new Date(client.updatedAt).toISOString().split("T")[0],
        status: mappedStatus,
        client: client,
        cuid: client.cuid || client.id.toString(), // Add missing cuid property
      };
    });
  } catch (error) {
    console.error('Error in getClients:', error);
    
    // In production, don't crash the entire page - return empty array
    if (process.env.NODE_ENV === 'production') {
      console.warn('Falling back to empty client list due to API error');
      return [];
    }
    
    throw error;
  }
}

export default async function ClientsPage() {
  // Check authentication with Clerk
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const clients = await getClients();
  const clientStats = {
    totalClients: clients.length,
    activeClients: clients.filter(
      (c: { status: string }) => c.status === "Active"
    ).length,
    pendingClients: clients.filter(
      (c: { status: string }) => c.status === "Pending"
    ).length,
    inactiveClients: clients.filter(
      (c: { status: string }) => c.status === "Inactive"
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No clients available. Please check your API server connection.
          </p>
        </div>
      ) : (
        <>
          <ClientStats stats={clientStats} />
          <ClientsList initialClients={clients} />
        </>
      )}
    </div>
  );
}
