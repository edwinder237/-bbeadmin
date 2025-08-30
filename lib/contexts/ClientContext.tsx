"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ClientData as FullClientData } from '@/data/types';

interface ClientData {
  id: number;
  name: string;
  email: string;
  updatedAt: string;
  status: string;
  cuid?: string;
  integrationId?: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  status: "Active" | "Inactive" | "Pending" | "Development";
  integrationType?: string;
  productionUrl?: string;
  client: ClientData;
  cuid: string;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  developmentClients: number;
  inactiveClients: number;
}

interface ClientContextType {
  clients: Client[];
  stats: ClientStats;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
  refreshClients: () => Promise<void>;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const { isLoaded, userId } = useAuth();

  const transformClientData = useCallback((data: ClientData[]): Client[] => {
    return data.map((client: ClientData) => {
      let mappedStatus: "Active" | "Inactive" | "Pending" | "Development" = "Inactive";
      if (client.status === "Production") mappedStatus = "Active";
      else if (client.status === "Testing") mappedStatus = "Pending";
      else if (client.status === "Development") mappedStatus = "Development";
      else mappedStatus = "Inactive";

      let integrationType = "Unknown";
      if (client.integrationId === 1) integrationType = "Guesty";
      else if (client.integrationId === 2) integrationType = "Lodgify";
      else if (client.integrationId === 3) integrationType = "Hostaway";

      return {
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        lastActive: new Date(client.updatedAt).toISOString().split("T")[0],
        status: mappedStatus,
        integrationType: integrationType,
        productionUrl: (client as any).preferences?.productionUrl || "",
        client: client,
        cuid: client.cuid || client.id.toString(),
      };
    });
  }, []);

  const fetchClients = useCallback(async (force: boolean = false) => {
    try {
      // Check cache validity (but don't depend on clients.length in useCallback)
      if (!force && lastFetch && (Date.now() - lastFetch.getTime()) < CACHE_DURATION) {
        return;
      }

      setIsLoading(true);
      setError(null);
      
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000);

      const response = await fetch(`${SERVER_URL}/api/getAdminData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transformedClients = transformClientData(data || []);
      
      setClients(transformedClients);
      setLastFetch(new Date());
      setError(null);
    } catch (error) {
      console.error("Error fetching clients:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError("Request timed out. Please check your API server connection.");
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setError("Cannot connect to API server. Please check the server is running.");
      } else {
        setError("Failed to load clients. Please try again.");
      }
      // Don't clear existing clients on error unless it's the first fetch
      setClients(prev => prev.length > 0 ? prev : []);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetch, transformClientData]);

  const refreshClients = useCallback(async () => {
    await fetchClients(true);
  }, [fetchClients]);

  const addClient = useCallback((client: Client) => {
    setClients(prev => [...prev, client]);
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  }, []);

  const stats = useMemo<ClientStats>(() => ({
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === "Active").length,
    pendingClients: clients.filter(c => c.status === "Pending").length,
    developmentClients: clients.filter(c => c.status === "Development").length,
    inactiveClients: clients.filter(c => c.status === "Inactive").length,
  }), [clients]);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchClients();
    }
  }, [isLoaded, userId, fetchClients]);

  const value = useMemo(() => ({
    clients,
    stats,
    isLoading,
    error,
    lastFetch,
    refreshClients,
    addClient,
    updateClient,
    deleteClient,
  }), [clients, stats, isLoading, error, lastFetch, refreshClients, addClient, updateClient, deleteClient]);

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}