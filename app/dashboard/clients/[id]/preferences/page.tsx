"use client";

import { useState, useEffect, useRef } from "react";
import { ClientPreferencesForm } from "@/components/client-preferences-form";
import { CodeGenerator } from "@/components/code-generator";
import { Button } from "@/components/ui/button";
import { ClientData } from "@/data/types";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

interface FormRefType {
  handleUpdateClientData: () => Promise<void>;
}

// Helper to get integration label
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

export default function ClientPreferencesPage({ params }: PageProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ 1) Create a ref to access child's handleUpdateClientData
  const formRef = useRef<FormRefType>(null);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && userId) {
      // 3) Fetch client data
      const fetchClientPreferences = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const response = await fetch(
            `${SERVER_URL}/api/getAdminData?clientCuid=${params.id}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const { preferences } = data;

          // Build initial clientData
          const newClientData: ClientData = {
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
            },
          };
          
          setClientData(newClientData);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err instanceof Error ? err.message : "An error occurred");
          setClientData(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchClientPreferences();
    }
  }, [isLoaded, userId, router, params.id, SERVER_URL]);

  // 4) Update local state from child
  const handleClientDataChange = (updatedClientData: ClientData) => {
    setClientData(updatedClientData);
  };

  if (!isLoaded || isLoading) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!clientData) {
    return <div>No client data found</div>;
  }

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Site Preferences
            </h1>

            <Button
              size="sm"
              className="ml-auto"
              onClick={() => {
                // ⭐ 5) Call child's handleUpdateClientData() via ref
                formRef.current?.handleUpdateClientData();
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ClientPreferencesForm
            ref={formRef}
            clientId={params.id}
            clientData={clientData}
            handleClientDataChange={handleClientDataChange}
          />
          <CodeGenerator clientData={clientData} />
        </div>
      </div>
    </>
  );
}