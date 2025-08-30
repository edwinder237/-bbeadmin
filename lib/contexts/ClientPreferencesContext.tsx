"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ClientData, Todo } from "@/data/types";

const defaultTodos: Todo[] = [
  {
    id: "default-1",
    text: "Client Colors and Font set",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-2", 
    text: "Max guests set",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-3",
    text: "Image uploaded to blob server",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-4",
    text: "All listings wix page completed",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-5",
    text: "Dynamic pages completed",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-6",
    text: "Search bar connected",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-7",
    text: "Target domain set to iframe code",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-8",
    text: "Page size set for all listing and single page",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-9",
    text: "Headers size checked",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-10",
    text: "Mobile size check",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

interface ClientPreferencesContextType {
  clientData: ClientData | null;
  originalClientData: ClientData | null;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
  fetchClientPreferences: (clientId: string, force?: boolean) => Promise<void>;
  updateClientData: (updatedData: ClientData) => void;
  handleSaveComplete: () => void;
  refreshPreferences: (clientId: string) => Promise<void>;
}

const ClientPreferencesContext = createContext<ClientPreferencesContextType | undefined>(undefined);

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache (shorter for preferences)

function getIntegrationLabel(integrationId?: string): string {
  const idString = integrationId == null ? "" : integrationId.toString();
  switch (idString) {
    case "1":
      return "guesty";
    case "2":
      return "lodgify";
    case "3":
      return "hostaway";
    default:
      return "";
  }
}

export function ClientPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [originalClientData, setOriginalClientData] = useState<ClientData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [cachedClientId, setCachedClientId] = useState<string | null>(null);
  const { isLoaded, userId } = useAuth();

  const transformClientPreferencesData = useCallback((data: any): ClientData => {
    const { preferences } = data;

    return {
      status: data.status,
      accessKey: data.cuid,
      name: data.name,
      email: data.email || "",
      ApiKey: data.ApiKey || "",
      integrationId: data.integrationId,
      clientSecret: data.clientSecret || "",
      clientID: data.clientID || "",
      preferences: {
        integrationLabel: getIntegrationLabel(data.integrationId) || "",
        locationFilter: Boolean(preferences.locationFilter),
        lodgifyWsUrl: preferences.lodgifyWsUrl || "",
        lodgifyWsId: preferences.lodgifyWsId || "",
        primaryColor: preferences.primaryColor || "",
        secondaryColor: preferences.secondaryColor || "",
        bookingFooterColor: preferences.bookingFooterColor || "",
        buttonFontColorOnHover: preferences.buttonFontColorOnHover || "",
        customDomain: preferences.customDomain || "",
        productionUrl: preferences.productionUrl || "",
        channelManagerSiteUrl: preferences.channelManagerSiteUrl || "",
        headingFont: preferences.headingFont || "",
        bodyFont: preferences.bodyFont || "",
        fontLink: preferences.fontLink || "",
        currencies: Array.isArray(preferences.currencies)
          ? preferences.currencies
          : [],
        imgLink: preferences.imgLink || "",
        wixCmsUrl: preferences.wixCmsUrl || "",
        maxGuests: preferences.maxGuests || 0,
        language: preferences.language || "",
        devMode: Boolean(preferences.devMode),
        todos: Array.isArray(preferences.todos) && preferences.todos.length > 0 
          ? preferences.todos 
          : defaultTodos,
      },
    };
  }, []);

  const fetchClientPreferences = useCallback(async (clientId: string, force: boolean = false) => {
    try {
      // Check cache validity
      if (!force && 
          lastFetch && 
          cachedClientId === clientId &&
          (Date.now() - lastFetch.getTime()) < CACHE_DURATION && 
          clientData) {
        return;
      }

      setIsLoading(true);
      setError(null);
      
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 8000); // 8 second timeout

      const response = await fetch(
        `${SERVER_URL}/api/getAdminData?clientCuid=${clientId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transformedData = transformClientPreferencesData(data);
      
      setClientData(transformedData);
      setOriginalClientData(JSON.parse(JSON.stringify(transformedData))); // Deep clone
      setLastFetch(new Date());
      setCachedClientId(clientId);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching client preferences:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        setError("Request timed out. Please check your API server connection.");
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setError("Cannot connect to API server. Please check the server is running.");
      } else {
        setError("Failed to load client preferences. Please try again.");
      }
      // Don't clear existing data on error
      if (!clientData) {
        setClientData(null);
        setOriginalClientData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lastFetch, cachedClientId, clientData, transformClientPreferencesData]);

  const refreshPreferences = useCallback(async (clientId: string) => {
    await fetchClientPreferences(clientId, true);
  }, [fetchClientPreferences]);

  const updateClientData = useCallback((updatedData: ClientData) => {
    setClientData(updatedData);
    
    // Check if there are unsaved changes by comparing with original
    if (originalClientData) {
      const hasChanges = JSON.stringify(updatedData) !== JSON.stringify(originalClientData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [originalClientData]);

  const handleSaveComplete = useCallback(() => {
    if (clientData) {
      setOriginalClientData(JSON.parse(JSON.stringify(clientData)));
      setHasUnsavedChanges(false);
    }
  }, [clientData]);

  const value = useMemo(() => ({
    clientData,
    originalClientData,
    hasUnsavedChanges,
    isLoading,
    error,
    lastFetch,
    fetchClientPreferences,
    updateClientData,
    handleSaveComplete,
    refreshPreferences,
  }), [
    clientData,
    originalClientData,
    hasUnsavedChanges,
    isLoading,
    error,
    lastFetch,
    fetchClientPreferences,
    updateClientData,
    handleSaveComplete,
    refreshPreferences,
  ]);

  return (
    <ClientPreferencesContext.Provider value={value}>
      {children}
    </ClientPreferencesContext.Provider>
  );
}

export function useClientPreferences() {
  const context = useContext(ClientPreferencesContext);
  if (context === undefined) {
    throw new Error('useClientPreferences must be used within a ClientPreferencesProvider');
  }
  return context;
}