"use client";

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientData } from "@/data/types";

// UI imports
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Todo } from "@/data/types";

// ====== 1) Shared Helpers ======
function getIntegrationLabel(integrationId?: string): string {
  const idString = integrationId == null ? "" : integrationId.toString();
  switch (idString) {
    case "1":
      return "guesty";
    case "2":
      return "lodgify";
    default:
      return "";
  }
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "0, 0, 0";
}

function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(",").map((x) => parseInt(x.trim(), 10));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ====== 2) Types ======
export type FormRefType = {
  handleUpdateClientData: () => Promise<void>;
};

type ClientPreferencesFormProps = {
  clientId: string;
  clientData: ClientData;
  handleClientDataChange: (preferences: ClientData) => void;
};

const currencyOptions = ["USD", "EUR", "CAD", "MXN", "GBP", "AUD"];

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

// ====== 3) Component ======
export const ClientPreferencesForm = forwardRef<FormRefType, ClientPreferencesFormProps>(
  function ClientPreferencesForm(
    { clientId, clientData, handleClientDataChange },
    ref
  ) {
    const router = useRouter();
    //eslint-disable-next-line
    const [isLoading, setIsLoading] = useState(false);
    //eslint-disable-next-line
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deletingImage, setDeletingImage] = useState(false);

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080';

    // 3.1) Local State
    const [editedClientData, setEditedClientData] = useState<ClientData>({
      status: clientData?.status || "Development",
      accessKey: clientData?.accessKey || "",
      name: clientData?.name || "",
      email: clientData?.email || "",
      ApiKey: clientData?.ApiKey || "",
      integrationId: clientData?.integrationId || "",
      clientID: clientData?.clientID || "",
      clientSecret: clientData?.clientSecret || "",
      preferences: {
        integrationLabel: getIntegrationLabel(clientData?.integrationId),
        locationFilter: clientData?.preferences?.locationFilter || false,
        primaryColor: clientData?.preferences?.primaryColor || "0,0,0",
        secondaryColor: clientData?.preferences?.secondaryColor || "0,0,0",
        bookingFooterColor:
          clientData?.preferences?.bookingFooterColor || "0,0,0",
        buttonFontColorOnHover:
          clientData?.preferences?.buttonFontColorOnHover || "0,0,0",
        customDomain: clientData?.preferences?.customDomain || "",
        productionUrl: clientData?.preferences?.productionUrl || "",
        channelManagerSiteUrl: clientData?.preferences?.channelManagerSiteUrl || "",
        headingFont: clientData?.preferences?.headingFont || "",
        bodyFont: clientData?.preferences?.bodyFont || "",
        fontLink: clientData?.preferences?.fontLink || "",
        currencies: clientData?.preferences?.currencies || [],
        imgLink: clientData?.preferences?.imgLink || "",
        lodgifyWsUrl: clientData?.preferences?.lodgifyWsUrl || "",
        lodgifyWsId: clientData?.preferences?.lodgifyWsId || "",
        wixCmsUrl: clientData?.preferences?.wixCmsUrl || "",
        maxGuests: clientData?.preferences?.maxGuests || 0,
        language: clientData?.preferences?.language || "",
        devMode: clientData?.preferences?.devMode || false,
        todos: clientData?.preferences?.todos?.length > 0 ? clientData.preferences.todos : defaultTodos,
      },
    });

    const prefs = editedClientData.preferences;
    const integrationLabel = getIntegrationLabel(editedClientData.integrationId);

    // 3.2) Handlers
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
      const { name, value } = e.target;
      const updatedData = { ...editedClientData, [name]: value };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    function handlePreferenceChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { name, value, type, checked } = e.target;
      const updatedData = {
        ...editedClientData,
        preferences: {
          ...editedClientData.preferences,
          [name]: type === "checkbox" ? checked : value,
        },
      };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = e.target;
      const updatedData = {
        ...editedClientData,
        preferences: {
          ...editedClientData.preferences,
          [name]: hexToRgb(value),
        },
      };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    function handleCurrencyChange(currency: string, isChecked: boolean) {
      const updatedData = {
        ...editedClientData,
        preferences: {
          ...editedClientData.preferences,
          currencies: isChecked
            ? [...editedClientData.preferences.currencies, currency]
            : editedClientData.preferences.currencies.filter(
                (c) => c !== currency
              ),
        },
      };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    // Todo handlers
    function addTodo(text: string) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      const updatedData = {
        ...editedClientData,
        preferences: {
          ...editedClientData.preferences,
          todos: [...editedClientData.preferences.todos, newTodo],
        },
      };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    function toggleTodo(todoId: string) {
      const updatedData = {
        ...editedClientData,
        preferences: {
          ...editedClientData.preferences,
          todos: editedClientData.preferences.todos.map(todo =>
            todo.id === todoId
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed ? new Date().toISOString() : undefined,
                }
              : todo
          ),
        },
      };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    function removeTodo(todoId: string) {
      const updatedData = {
        ...editedClientData,
        preferences: {
          ...editedClientData.preferences,
          todos: editedClientData.preferences.todos.filter(todo => todo.id !== todoId),
        },
      };
      setEditedClientData(updatedData);
      handleClientDataChange(updatedData);
    }

    // Image upload handler
    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (3MB max)
      const maxSize = 3 * 1024 * 1024; // 3MB in bytes
      if (file.size > maxSize) {
        toast("File size exceeds 3MB limit");
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast("Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)");
        return;
      }

      setUploadingImage(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Pass the current image URL so the old one can be deleted
        if (prefs.imgLink) {
          formData.append('oldImageUrl', prefs.imgLink);
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        
        // Update the imgLink field with the uploaded image URL
        const updatedData = {
          ...editedClientData,
          preferences: {
            ...editedClientData.preferences,
            imgLink: result.url,
          },
        };
        setEditedClientData(updatedData);
        handleClientDataChange(updatedData);
        
        toast("Image uploaded successfully!");
      } catch (error) {
        console.error('Upload error:', error);
        toast(error instanceof Error ? error.message : "Failed to upload image");
      } finally {
        setUploadingImage(false);
        // Reset the input
        event.target.value = '';
      }
    }

    // Image delete handler
    async function handleImageDelete() {
      if (!prefs.imgLink) return;

      setDeletingImage(true);
      
      try {
        // Only attempt to delete from Vercel Blob if it's a blob URL
        if (prefs.imgLink.includes('vercel-storage.com')) {
          const response = await fetch(`/api/upload?url=${encodeURIComponent(prefs.imgLink)}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Delete failed');
          }
        }
        
        // Clear the imgLink field regardless of whether it was a blob URL
        const updatedData = {
          ...editedClientData,
          preferences: {
            ...editedClientData.preferences,
            imgLink: '',
          },
        };
        setEditedClientData(updatedData);
        handleClientDataChange(updatedData);
        
        toast("Image deleted successfully!");
      } catch (error) {
        console.error('Delete error:', error);
        toast(error instanceof Error ? error.message : "Failed to delete image");
      } finally {
        setDeletingImage(false);
      }
    }

    // 3.3) PUT request logic
    const handleUpdateClientData = async () => {
      setIsUpdating(true);
      try {
        const response = await fetch(`${SERVER_URL}/api/getAdminData`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientCuid: clientId,
            data: editedClientData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update client data");
        }

        const updatedData = await response.json();
        const mergedData = {
          ...editedClientData,
          ...updatedData,
          preferences: {
            ...editedClientData.preferences,
            ...updatedData.preferences,
          },
        };

        setEditedClientData(mergedData);
        handleClientDataChange(mergedData);

        toast("Changes saved successfully");
        router.refresh();
      } catch (error) {
        console.error("Error updating client data:", error);
        toast("Failed to save changes");
      } finally {
        setIsUpdating(false);
      }
    };

    // 3.4) Expose to parent
    useImperativeHandle(ref, () => ({
      handleUpdateClientData,
    }));

    // 3.5) Optional form submit
    const onSubmit = (event: SyntheticEvent) => {
      event.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push("/dashboard/clients");
      }, 2000);
    };

    // ====== Return JSX ======
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Preferences</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            ref={ref as React.RefObject<HTMLFormElement>}
            onSubmit={onSubmit}
            className="space-y-6"
          >
            {/* ---------- Client Settings ---------- */}
            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedClientData.status}
                  onValueChange={(
                    value: "Production" | "Inactive" | "Development" | "Testing"
                  ) => {
                    const updatedData = {
                      ...editedClientData,
                      status: value,
                    };
                    setEditedClientData(updatedData);
                    handleClientDataChange(updatedData);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">
                      <Badge className="ml-2 bg-yellow-200 text-yellow-800">
                        Development
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Testing">
                      <Badge className="ml-2 bg-blue-200 text-blue-800">
                        Testing
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Production">
                      <Badge className="ml-2 bg-green-200 text-green-800">
                        Production
                      </Badge>
                    </SelectItem>
                    <SelectItem value="Inactive">
                      <Badge className="ml-2 bg-gray-200 text-gray-800">
                        Inactive
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editedClientData.name}
                    onChange={handleInputChange}
                    placeholder="Enter client name"
                  />
                </div>

                {/* Access Key */}
                <div className="space-y-2">
                  <Label htmlFor="accessKey">Access Key</Label>
                  <Input
                    id="accessKey"
                    name="accessKey"
                    value={editedClientData.accessKey}
                    readOnly
                    disabled
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editedClientData.email}
                    onChange={handleInputChange}
                    placeholder="Enter client email"
                  />
                </div>

                {/* Integration ID */}
                <div className="space-y-2">
                  <Label htmlFor="integrationId">Integration ID</Label>
                  <Input
                    id="integrationId"
                    name="integrationId"
                    value={integrationLabel}
                    onChange={handleInputChange}
                    placeholder="Enter integration ID"
                  />
                </div>

                {/* Conditionally show fields if guesty or not */}
                {integrationLabel === "guesty" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clientID">Client ID</Label>
                      <Input
                        id="clientID"
                        name="clientID"
                        value={editedClientData.clientID}
                        onChange={handleInputChange}
                        placeholder="Enter client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientSecret">Client Secret</Label>
                      <Input
                        id="clientSecret"
                        name="clientSecret"
                        value={editedClientData.clientSecret}
                        onChange={handleInputChange}
                        placeholder="Enter client secret"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="ApiKey">API Key</Label>
                    <Input
                      id="ApiKey"
                      name="ApiKey"
                      value={editedClientData.ApiKey}
                      onChange={handleInputChange}
                      className="font-mono text-sm"
                      placeholder="Enter API key"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ---------- Site Settings ---------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Site Settings</h3>

              {/* locationFilter */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="locationFilter"
                    checked={prefs.locationFilter}
                    onCheckedChange={(checked: boolean) => {
                      const updatedData = {
                        ...editedClientData,
                        preferences: {
                          ...editedClientData.preferences,
                          locationFilter: checked,
                        },
                      };
                      setEditedClientData(updatedData);
                      handleClientDataChange(updatedData);
                    }}
                  />
                  <Label htmlFor="locationFilter">Show Location Filter</Label>
                </div>
              </div>

              {/* IMG Link */}
              <div className="space-y-2">
                <Label htmlFor="imgLink">Image Link</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="imgLink"
                    name="imgLink"
                    value={prefs.imgLink}
                    onChange={handlePreferenceChange}
                    placeholder="Enter image link or upload a file"
                    className="flex-grow"
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                      id="image-upload-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      onClick={() => {
                        const input = document.getElementById('image-upload-input') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
                {prefs.imgLink && (
                  <div className="mt-2 relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={prefs.imgLink} 
                      alt="Preview" 
                      className="max-w-32 max-h-32 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleImageDelete}
                      disabled={deletingImage}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      title="Delete image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Max Guests */}
              <div className="space-y-2">
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  value={prefs.maxGuests}
                  onChange={handlePreferenceChange}
                  placeholder="Enter max guests"
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  name="language"
                  value={prefs.language}
                  onChange={(e) =>
                    handlePreferenceChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Language</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {currencyOptions.map((currency) => (
                    <div key={currency} className="flex items-center space-x-2">
                      <Checkbox
                        id={`currency-${currency}`}
                        checked={prefs.currencies.includes(currency)}
                        onCheckedChange={(checked) =>
                          handleCurrencyChange(currency, checked as boolean)
                        }
                      />
                      <Label htmlFor={`currency-${currency}`}>{currency}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Production URL */}
              <div className="space-y-2">
                <Label htmlFor="productionUrl">Production URL</Label>
                <Input
                  id="productionUrl"
                  name="productionUrl"
                  value={prefs.productionUrl}
                  onChange={handlePreferenceChange}
                  placeholder="https://yourdomain.com"
                />
              </div>

              {/* Channel Manager Site URL */}
              <div className="space-y-2">
                <Label htmlFor="channelManagerSiteUrl">Channel Manager Site Url</Label>
                <Input
                  id="channelManagerSiteUrl"
                  name="channelManagerSiteUrl"
                  value={prefs.channelManagerSiteUrl}
                  onChange={handlePreferenceChange}
                  placeholder="https://yourchannelmanager.com"
                />
              </div>

              {/* Wix CMS URL */}
              <div className="space-y-2">
                <Label htmlFor="wixCmsUrl">Wix CMS URL</Label>
                <Input
                  id="wixCmsUrl"
                  name="wixCmsUrl"
                  value={prefs.wixCmsUrl}
                  onChange={handlePreferenceChange}
                  placeholder="Enter Wix CMS URL"
                />
              </div>

              {/* Lodgify fields if integrationLabel === "lodgify" */}
              {integrationLabel === "lodgify" && (
                <div className="space-y-4 mt-4">
                  <h4 className="text-md font-semibold">Lodgify Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lodgifyWsUrl">Lodgify WS URL</Label>
                      <Input
                        id="lodgifyWsUrl"
                        name="lodgifyWsUrl"
                        value={prefs.lodgifyWsUrl}
                        onChange={handlePreferenceChange}
                        placeholder="Enter Lodgify WS URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lodgifyWsId">Lodgify WS ID</Label>
                      <Input
                        id="lodgifyWsId"
                        name="lodgifyWsId"
                        value={prefs.lodgifyWsId}
                        onChange={handlePreferenceChange}
                        placeholder="Enter Lodgify WS ID"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ---------- Color Settings ---------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color (RGB)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      value={rgbToHex(prefs.primaryColor)}
                      onChange={handleColorChange}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      name="primaryColor"
                      value={prefs.primaryColor}
                      onChange={(e) => {
                        const updatedData = {
                          ...editedClientData,
                          preferences: {
                            ...editedClientData.preferences,
                            primaryColor: e.target.value,
                          },
                        };
                        setEditedClientData(updatedData);
                        handleClientDataChange(updatedData);
                      }}
                      className="flex-grow"
                      placeholder="R, G, B"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color (RGB)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      value={rgbToHex(prefs.secondaryColor)}
                      onChange={handleColorChange}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      name="secondaryColor"
                      value={prefs.secondaryColor}
                      onChange={(e) => {
                        const updatedData = {
                          ...editedClientData,
                          preferences: {
                            ...editedClientData.preferences,
                            secondaryColor: e.target.value,
                          },
                        };
                        setEditedClientData(updatedData);
                        handleClientDataChange(updatedData);
                      }}
                      className="flex-grow"
                      placeholder="R, G, B"
                    />
                  </div>
                </div>

                {/* Booking Footer Color */}
                <div className="space-y-2">
                  <Label htmlFor="bookingFooterColor">
                    Booking Footer Color (RGB)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="bookingFooterColor"
                      name="bookingFooterColor"
                      type="color"
                      value={rgbToHex(prefs.bookingFooterColor)}
                      onChange={handleColorChange}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      name="bookingFooterColor"
                      value={prefs.bookingFooterColor}
                      onChange={(e) => {
                        const updatedData = {
                          ...editedClientData,
                          preferences: {
                            ...editedClientData.preferences,
                            bookingFooterColor: e.target.value,
                          },
                        };
                        setEditedClientData(updatedData);
                        handleClientDataChange(updatedData);
                      }}
                      className="flex-grow"
                      placeholder="R, G, B"
                    />
                  </div>
                </div>

                {/* Button Font Color on Hover */}
                <div className="space-y-2">
                  <Label htmlFor="buttonFontColorOnHover">
                    Button Font Color on Hover (RGB)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="buttonFontColorOnHover"
                      name="buttonFontColorOnHover"
                      type="color"
                      value={rgbToHex(prefs.buttonFontColorOnHover)}
                      onChange={handleColorChange}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      type="text"
                      name="buttonFontColorOnHover"
                      value={prefs.buttonFontColorOnHover}
                      onChange={(e) => {
                        const updatedData = {
                          ...editedClientData,
                          preferences: {
                            ...editedClientData.preferences,
                            buttonFontColorOnHover: e.target.value,
                          },
                        };
                        setEditedClientData(updatedData);
                        handleClientDataChange(updatedData);
                      }}
                      className="flex-grow"
                      placeholder="R, G, B"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- Font Settings ---------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Font Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <Input
                    id="headingFont"
                    name="headingFont"
                    value={prefs.headingFont}
                    onChange={handlePreferenceChange}
                    placeholder="Enter heading font"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <Input
                    id="bodyFont"
                    name="bodyFont"
                    value={prefs.bodyFont}
                    onChange={handlePreferenceChange}
                    placeholder="Enter body font"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontLink">Font Link</Label>
                <Input
                  id="fontLink"
                  name="fontLink"
                  value={prefs.fontLink}
                  onChange={handlePreferenceChange}
                  placeholder="https://fonts.googleapis.com/css2?family=..."
                />
              </div>
            </div>

            {/* ---------- Todo List ---------- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Todo List</h3>
              
              {/* Add new todo */}
              <div className="flex items-center space-x-2">
                <Input
                  id="newTodo"
                  placeholder="Add a new todo..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        addTodo(input.value);
                        input.value = '';
                      }
                    }
                  }}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById('newTodo') as HTMLInputElement;
                    if (input.value.trim()) {
                      addTodo(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Todo list */}
              <div className="space-y-2">
                {prefs.todos.map((todo) => (
                  <div key={todo.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                    <div className="flex-grow">
                      <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.text}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                        {todo.completed && todo.completedAt && (
                          <span>• Completed: {new Date(todo.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {prefs.todos.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No todos yet. Add one above to get started!
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
);