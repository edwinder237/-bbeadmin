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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const currencyOptions = ["USD", "EUR", "CAD"];

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

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

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
      <Card>
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

              <div className="grid gap-4">
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
                <Input
                  id="imgLink"
                  name="imgLink"
                  value={prefs.imgLink}
                  onChange={handlePreferenceChange}
                  placeholder="Enter image link"
                />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      onChange={(e) =>
                        setEditedClientData((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            primaryColor: e.target.value,
                          },
                        }))
                      }
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
                      onChange={(e) =>
                        setEditedClientData((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            secondaryColor: e.target.value,
                          },
                        }))
                      }
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
                      onChange={(e) =>
                        setEditedClientData((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            bookingFooterColor: e.target.value,
                          },
                        }))
                      }
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
                      onChange={(e) =>
                        setEditedClientData((prev) => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            buttonFontColorOnHover: e.target.value,
                          },
                        }))
                      }
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
          </form>
        </CardContent>
      </Card>
    );
  }
);