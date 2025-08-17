"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus,Loader2 } from "lucide-react"

enum IntegrationId {
  Guesty = 1,
  Lodgify = 2,
  Hostaway = 3
}

interface NewClientData {
  name: string
  email: string
  integrationId: IntegrationId
  apikey?: string
  clientID?: string
  clientSecret?: string
}

interface AddClientModalProps {
  onClientAdded: () => void;
}

export function AddClientModal({ onClientAdded }: AddClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<string>()
  const [open, setOpen] = useState(false)

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'

  const getIntegrationId = (integration: string): IntegrationId => {
    if (integration === 'lodgify') return IntegrationId.Lodgify
    if (integration === 'hostaway') return IntegrationId.Hostaway
    return IntegrationId.Guesty
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const integration = formData.get("integration") as string
    const clientData: NewClientData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      integrationId: getIntegrationId(integration),
    }

    // Add integration-specific fields
    if (integration === "lodgify") {
      clientData.apikey = formData.get("apiKey") as string
    } else if (integration === "guesty" || integration === "hostaway") {
      clientData.clientID = formData.get("clientId") as string
      clientData.clientSecret = formData.get("clientSecret") as string
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/getAdminData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        throw new Error('Failed to create client')
      }

      const newClient = await response.json()
      console.log('Client created:', newClient)
      setOpen(false) // Close modal on success
      onClientAdded() // Call the callback to refresh the clients list
      // TODO: Add success toast notification
    } catch (error) {
      console.error('Error creating client:', error)
      // TODO: Add error toast notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Enter the details of the new client here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" placeholder="Enter client name" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                placeholder="Enter client email"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="integration" className="text-right">
                Integration
              </Label>
              <Select name="integration" required onValueChange={(value) => setSelectedIntegration(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lodgify">Lodgify</SelectItem>
                  <SelectItem value="guesty">Guesty</SelectItem>
                  <SelectItem value="hostaway">Hostaway</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedIntegration === "lodgify" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appKey" className="text-right">
                  Api Key
                </Label>
                <Input id="apiKey" name="apiKey" className="col-span-3" placeholder="Enter Lodgify App Key" required />
              </div>
            )}
            {selectedIntegration === "guesty" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientId" className="text-right">
                    Client ID
                  </Label>
                  <Input
                    id="clientId"
                    name="clientId"
                    className="col-span-3"
                    placeholder="Enter Guesty Client ID"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientSecret" className="text-right">
                    Client Secret
                  </Label>
                  <Input
                    id="clientSecret"
                    name="clientSecret"
                    className="col-span-3"
                    placeholder="Enter Guesty Client Secret"
                    required
                  />
                </div>
              </>
            )}
            {selectedIntegration === "hostaway" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientId" className="text-right">
                    Client ID
                  </Label>
                  <Input
                    id="clientId"
                    name="clientId"
                    className="col-span-3"
                    placeholder="Enter Hostaway Client ID"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientSecret" className="text-right">
                    Client Secret
                  </Label>
                  <Input
                    id="clientSecret"
                    name="clientSecret"
                    className="col-span-3"
                    placeholder="Enter Hostaway Client Secret"
                    required
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

