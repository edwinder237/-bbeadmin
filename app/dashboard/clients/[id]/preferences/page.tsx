"use client";

import { useEffect, useRef } from "react";
import { ClientPreferencesForm } from "@/components/client-preferences-form";
import { CodeGenerator } from "@/components/code-generator";
import { IframePreview } from "@/components/iframe-preview";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClientPreferences } from "@/lib/contexts/ClientPreferencesContext";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

interface FormRefType {
  handleUpdateClientData: () => Promise<void>;
}

export default function ClientPreferencesPage({ params }: PageProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const {
    clientData,
    hasUnsavedChanges,
    isLoading,
    error,
    fetchClientPreferences,
    updateClientData,
    handleSaveComplete,
    refreshPreferences,
  } = useClientPreferences();

  const formRef = useRef<FormRefType>(null);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && userId) {
      fetchClientPreferences(params.id);
    }
  }, [isLoaded, userId, router, params.id, fetchClientPreferences]);

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

  // Update document title with client name
  useEffect(() => {
    if (clientData?.name) {
      document.title = `${clientData.name} - Site Preferences - BBE Admin`;
    } else {
      document.title = "Site Preferences - BBE Admin";
    }
    
    // Cleanup: reset title when component unmounts
    return () => {
      document.title = "BBE Admin Tool";
    };
  }, [clientData?.name]);

  const handleRefresh = async () => {
    try {
      await refreshPreferences(params.id);
      toast.success('Preferences refreshed successfully');
    } catch {
      toast.error('Failed to refresh preferences');
    }
  };

  if (!isLoaded || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!userId) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error Loading Preferences</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => router.back()} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No Client Data Found</h2>
          <p className="text-muted-foreground mt-2">
            The client preferences could not be loaded.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
          <Button onClick={() => router.back()} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2"
                asChild
              >
                <Link href="/dashboard/clients">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Clients</span>
                </Link>
              </Button>
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
                      updateClientData(updatedData);
                    }
                  }}
                />
              </div>

              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                title="Refresh preferences"
              >
                Refresh
              </Button>

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
                  try {
                    await formRef.current?.handleUpdateClientData();
                    handleSaveComplete();
                    toast.success('Preferences saved successfully');
                  } catch {
                    toast.error('Failed to save preferences');
                  }
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
                handleClientDataChange={updateClientData}
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