"use client";

import { useState, useEffect, useRef } from "react";
import { ClientPreferencesForm } from "@/components/client-preferences-form";
import { CodeGenerator } from "@/components/code-generator";
import { IframePreview } from "@/components/iframe-preview";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [originalClientData, setOriginalClientData] = useState<ClientData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
              productionUrl: preferences.productionUrl || "",
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
              todos: Array.isArray(preferences.todos) && preferences.todos.length > 0 ? preferences.todos : defaultTodos,
            },
          };
          
          setClientData(newClientData);
          setOriginalClientData(JSON.parse(JSON.stringify(newClientData))); // Deep clone for comparison
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

  // 4) Update local state from child and track changes
  const handleClientDataChange = (updatedClientData: ClientData) => {
    setClientData(updatedClientData);
    
    // Check if there are unsaved changes by comparing with original
    if (originalClientData) {
      const hasChanges = JSON.stringify(updatedClientData) !== JSON.stringify(originalClientData);
      setHasUnsavedChanges(hasChanges);
    }
  };
  
  // Handle save completion
  const handleSaveComplete = () => {
    if (clientData) {
      setOriginalClientData(JSON.parse(JSON.stringify(clientData)));
      setHasUnsavedChanges(false);
    }
  };
  
  // Warn when navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  

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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Site Preferences
              </h1>
              {hasUnsavedChanges && (
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" title="Unsaved changes" />
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* DEV Mode Switch */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="dev-mode" className="text-sm font-medium">
                  DEV
                </Label>
                <Switch
                  id="dev-mode"
                  checked={clientData?.preferences?.devMode || false}
                  onCheckedChange={(checked) => {
                    if (clientData) {
                      const updatedData = {
                        ...clientData,
                        preferences: {
                          ...clientData.preferences,
                          devMode: checked,
                        },
                      };
                      handleClientDataChange(updatedData);
                    }
                  }}
                />
              </div>

              {hasUnsavedChanges && (
                <span className="text-sm text-amber-500 font-medium">
                  ● Unsaved changes
                </span>
              )}
              <Button
                size="sm"
                className="ml-auto"
                variant={hasUnsavedChanges ? "default" : "outline"}
                onClick={async () => {
                  // ⭐ 5) Call child's handleUpdateClientData() via ref
                  await formRef.current?.handleUpdateClientData();
                  handleSaveComplete();
                }}
              >
                {hasUnsavedChanges ? "Save Changes" : "No Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">Edit Preferences</TabsTrigger>
            <TabsTrigger value="code">Generated Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-6">
            <div className="space-y-6">
              <ClientPreferencesForm
                ref={formRef}
                clientId={params.id}
                clientData={clientData}
                handleClientDataChange={handleClientDataChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-6">
            <CodeGenerator clientData={clientData} />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <IframePreview clientData={clientData} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}