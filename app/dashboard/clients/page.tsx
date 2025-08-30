"use client";

import { ClientsList } from "@/components/clients-list";
import { ClientStats } from "@/components/client-stats";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useClients } from "@/lib/contexts/ClientContext";
import { TableSkeleton } from "@/components/loading-skeleton";

export default function ClientsPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const { clients, stats, isLoading, error, refreshClients } = useClients();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);


  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information.
          </p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information.
          </p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage your clients and their information.
        </p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">⚠️ {error}</p>
          <button 
            onClick={refreshClients}
            className="text-sm text-red-600 hover:text-red-800 underline mt-2"
          >
            Try again
          </button>
        </div>
      )}
      
      <ClientStats stats={stats} />
      <ClientsList initialClients={clients} />
    </div>
  );
}