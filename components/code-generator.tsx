"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy } from "lucide-react"
import { ClientData } from "@/data/types"
import { wixBooknowPageCode,wixDynamicPageCode,wixHomePageCode,ALL_LISTING_WidgetCode,SINGLE_LISTING_WidgetCode } from "@/data/codeBlocks"

export function CodeGenerator({ clientData }: { clientData: ClientData }) {
  const [activeTab, setActiveTab] = useState("booknow")
  const [copied, setCopied] = useState(false)

  const { preferences } = clientData

  // --- FULL Book Now code (HTML + script) ---
  const bookNowCode = ALL_LISTING_WidgetCode(clientData);

  // --- FULL Single Page code ---
  const singlePageCode = SINGLE_LISTING_WidgetCode(clientData);

  const homePageCode = wixHomePageCode;
  const bookNowPageCode = wixBooknowPageCode;
  const dynamicPageCode = wixDynamicPageCode;

  // Determine which code to show
  const getActiveCode = () => {
    switch (activeTab) {
      case "booknow":
        return bookNowCode;
      case "singlepage":
        return singlePageCode;
      case "homepage":
        return homePageCode;
      case "booknowpage":
        return bookNowPageCode;
      case "dynamicpage":
        return dynamicPageCode;
      default:
        return bookNowCode;
    }
  }

  // Copy to clipboard logic
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getActiveCode())
    setCopied(true)
  }

  // Reset "Copied!" after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="booknow">All_listings</TabsTrigger>
            <TabsTrigger value="singlepage">Single_listing</TabsTrigger>
            <TabsTrigger value="homepage">HomePage</TabsTrigger>
            <TabsTrigger value="booknowpage">BookNow</TabsTrigger>
            <TabsTrigger value="dynamicpage">Dynamic</TabsTrigger>
          </TabsList>

          {/* Dark Mode Code Block for Book Now */}
          <TabsContent value="booknow">
            <pre className="p-4 rounded-md overflow-x-auto max-h-[900px] bg-gray-900 text-gray-100 text-sm">
              <code>{bookNowCode}</code>
            </pre>
          </TabsContent>

          {/* Dark Mode Code Block for Single Page */}
          <TabsContent value="singlepage">
            <pre className="p-4 rounded-md overflow-x-auto max-h-[900px] bg-gray-900 text-gray-100 text-sm">
              <code>{singlePageCode}</code>
            </pre>
          </TabsContent>

          {/* Dark Mode Code Block for Home Page */}
          <TabsContent value="homepage">
            <pre className="p-4 rounded-md overflow-x-auto max-h-[900px] bg-gray-900 text-gray-100 text-sm">
              <code>{homePageCode}</code>
            </pre>
          </TabsContent>

          {/* Dark Mode Code Block for BookNow Page */}
          <TabsContent value="booknowpage">
            <pre className="p-4 rounded-md overflow-x-auto max-h-[900px] bg-gray-900 text-gray-100 text-sm">
              <code>{bookNowPageCode}</code>
            </pre>
          </TabsContent>

          {/* Dark Mode Code Block for Dynamic Page */}
          <TabsContent value="dynamicpage">
            <pre className="p-4 rounded-md overflow-x-auto max-h-[900px] bg-gray-900 text-gray-100 text-sm">
              <code>{dynamicPageCode}</code>
            </pre>
          </TabsContent>
        </Tabs>

        <Button className="mt-4" onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}