"use client";

import { useState, useEffect } from "react";
import { ClientPreferencesForm } from "@/components/client-preferences-form";
import { CodeGenerator } from "@/components/code-generator";
import { ClientData } from "@/data/types";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  // Returns a label string for your integrationId
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
  //Fetching client data from the server then setting the client data to the state
  useEffect(() => {
    const fetchClientPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state before new request
        const response = await fetch(
          `${SERVER_URL}/api/getAdminData?clientCuid=${params.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const { preferences } = data;
        // Set client data

        setClientData({
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
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setClientData(null); // Reset client data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientPreferences();
  }, [params.id, SERVER_URL]);

  const handleClientDataChange = (updatedClientData: ClientData) => {
    setClientData(updatedClientData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Client Site Preferences
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        {clientData && (
          <>
            <ClientPreferencesForm
              clientId={params.id}
              clientData={clientData}
              handleClientDataChange={handleClientDataChange}
            />
            <CodeGenerator clientData={clientData} />
          </>
        )}
      </div>
    </div>
  );
}
