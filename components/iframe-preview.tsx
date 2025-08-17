"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientData } from "@/data/types"
import { ALL_LISTING_WidgetCode, SINGLE_LISTING_WidgetCode } from "@/data/codeBlocks"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function IframePreview({ clientData }: { clientData: ClientData }) {
  const [activeTab, setActiveTab] = useState("all-listings")
  const [refreshKey, setRefreshKey] = useState(0)

  // Get the full HTML code for preview
  const allListingsCode = ALL_LISTING_WidgetCode(clientData)
  const singleListingCode = SINGLE_LISTING_WidgetCode(clientData)

  const getActiveCode = () => {
    switch (activeTab) {
      case "all-listings":
        return allListingsCode
      case "single-listing":
        return singleListingCode
      default:
        return allListingsCode
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Widget Preview</CardTitle>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all-listings">All Listings</TabsTrigger>
            <TabsTrigger value="single-listing">Single Listing</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This preview shows how your booking widget will appear when embedded on your website. 
                The widget uses your configured colors, fonts, and settings.
              </p>
            </div>

            <TabsContent value="all-listings" className="mt-0">
              <div className="bg-white rounded-lg shadow-lg border" style={{ minHeight: '700px' }}>
                <iframe
                  key={`all-${refreshKey}`}
                  srcDoc={getActiveCode()}
                  className="w-full"
                  style={{ height: '700px', border: 'none' }}
                  title="All Listings Widget Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </TabsContent>

            <TabsContent value="single-listing" className="mt-0">
              <div className="bg-white rounded-lg shadow-lg border" style={{ minHeight: '700px' }}>
                <iframe
                  key={`single-${refreshKey}`}
                  srcDoc={getActiveCode()}
                  className="w-full"
                  style={{ height: '700px', border: 'none' }}
                  title="Single Listing Widget Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}