"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy } from "lucide-react"
import { ClientData } from "@/data/types"

export function CodeGenerator({ clientData }: { clientData: ClientData }) {
  const [activeTab, setActiveTab] = useState("booknow")
  const [copied, setCopied] = useState(false)

  const { preferences } = clientData

  // --- FULL Book Now code (HTML + script) ---
  const bookNowCode = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <script>
      const CLIENT_NAME = ${clientData.name ? `"${clientData.name}"` : "''"};
      const CURRENCIES = ${JSON.stringify(preferences.currencies)};
      const LOCATION_FILTER = ${preferences.locationFilter};
      const WIX_CMS_URL = "${preferences.wixCmsUrl}";
      const LODGIFY_WS_URL = "${preferences.lodgifyWsUrl}";
      const LODGIFY_WS_ID = "${preferences.lodgifyWsId}";
      const FONT_LINK = "${preferences.fontLink}";
      const HEADING_FONT = '${preferences.headingFont}';
      const BODY_FONT = '${preferences.bodyFont}';
      const HERO_IMG = "${preferences.imgLink}";
      const MAX_GUESTS = ${preferences.maxGuests};
      const LANG = "${preferences.language}";
      let REQUEST_TYPE = "ALL_LISTINGS";
      let LISTING_ID = "";
      let iframeLoaded = false;
      let searchQueryUpdated = false; // Flag to track if SEARCH_QUERY is updated

      // PLACEHOLDER DATES
      const startRange = new Date();
      const endRange = new Date(startRange);
      endRange.setDate(startRange.getDate() + 4);
      const defaultCheckIn = startRange.toISOString().split("T")[0];
      const defaultCheckOut = endRange.toISOString().split("T")[0];

      // Initial placeholder SEARCH_QUERY
      let SEARCH_QUERY = {
        checkIn: "",
        checkOut: "",
        guestsCount: 2,
        location: "",
      };
      const BUTTON_ICON_COLOR_ON_HOVER = "${preferences.buttonFontColorOnHover}";

      // Allowed origins for postMessage
      const allowedOrigins = [
        "https://beyondbooking.vercel.app",
        "http://localhost:3000",
        "https://editor.wix.com",
        "https://beyondbooking.wixstudio.com",
        "${preferences.wixCmsUrl}",
      ];

      // Listen for incoming messages
      window.addEventListener("message", (event) => {
        //console.log("Message event received:", event);

        if (!allowedOrigins.includes(event.origin)) {
          console.warn("Received message from unknown origin:", event.origin);
          return;
        }

        const receivedData = event.data;

        // Validate data
        if (receivedData && receivedData.checkInDate && receivedData.checkOutDate) {
          SEARCH_QUERY = {
            checkIn: receivedData.checkInDate,
            checkOut: receivedData.checkOutDate,
            guestsCount: receivedData.people || 2,
            location: receivedData.location || "",
          };

          REQUEST_TYPE = "SEARCH_LISTINGS";
          searchQueryUpdated = true;

          if (iframeLoaded) sendMessageToIframe();
        } else {
          console.warn("Received data is invalid:", receivedData);
        }
      });

      function sendMessageToIframe() {
        const iframe = document.getElementById("searchWidget");
        if (!iframe || !iframe.contentWindow) {
          console.error("Iframe not found or not ready.");
          return;
        }

        const message = {
          locationFilter: LOCATION_FILTER,
          ACCESS_KEY: "${clientData.accessKey}",
          INTEGRATION_TYPE: "${preferences.integrationLabel}",
          LODGIFY_WS_URL,
          LODGIFY_WS_ID,
          HEADING_FONT,
          BODY_FONT,
          HERO_IMG,
          CLIENT_NAME,
          FONT_LINK,
          BUTTON_ICON_COLOR_ON_HOVER,
          PRIMARY_PALETTE: [
            "--c-primary-50: 248, 250, 252",
            "--c-primary-100: 241, 245, 249",
            "--c-primary-200: 10, 232, 240",
            "--c-primary-300: 15, 213, 225",
            "--c-primary-400: 10, 163, 184",
            "--c-primary-500: ${preferences.primaryColor}" /*CALENDAR DAY SELECTED BG COLOR */,
            "--c-primary-600: ${preferences.primaryColor}" /*BUTTON COLOR */,
            "--c-primary-700: ${preferences.secondaryColor}" /* ONHOVER COLOR */,
            "--c-primary-800: 66, 41, 59",
            "--c-primary-900: 22, 23, 42",
          ],
          SECONDARY_PALETTE: [
            "--c-secondary-50: 248, 250, 252",
            "--c-secondary-100: 241, 245, 249",
            "--c-secondary-200: 226, 232, 240",
            "--c-secondary-300: 203, 213, 225",
            "--c-secondary-400: ${preferences.bookingFooterColor}" /*Booking Footer BG COLOR */,
            "--c-secondary-500: 100, 116, 139",
            "--c-secondary-600: 71, 85, 105",
            "--c-secondary-700: 29, 65, 29" /*BUTTON ONHOVER COLOR */,
            "--c-secondary-800: 30, 41, 59",
            "--c-secondary-900: 15, 23, 42",
          ],
          NEUTRAL_PALETTE: [
            "--c-neutral-50: 255,255,255" /*BUTTON TEXT COLOR & BOOKING FOOTER TEXT COLOR */,
            "--c-neutral-100: 241, 245, 249" /*dividers and light buttons eg; show all photos */,
            "--c-neutral-200: 226, 232, 240" /*BORDERS COLOR */,
            "--c-neutral-300: 203, 213, 225" /*ICONS COLOR */,
            "--c-neutral-400: 148, 163, 184" /* secondary-txt-color-light eg;,cal-invalid dates */,
            "--c-neutral-500: 0, 0, 0" /* secondary-txt-color-main-body-2 */,
            "--c-neutral-600: 0, 0, 0" /* secondary-txt-color-main-body-1 */,
            "--c-neutral-700: 51, 65, 85",
            "--c-neutral-800: 30, 41, 59",
            "--c-neutral-900: 0, 0, 0" /* primary-txt-color */,
          ],
          CURRENCIES,
          REQUEST_TYPE,
          LISTING_ID,
          SEARCH_QUERY,
          MAX_GUESTS,
          LANG,
          WIX_CMS_URL,
          
        };

       // console.log("Sending updated message to iframe:", message);
        iframe.contentWindow.postMessage(message, "*");
      }

      // Once DOM is loaded, set up iframe onload
      document.addEventListener("DOMContentLoaded", () => {
        const iframe = document.getElementById("searchWidget");
        if (!iframe) {
          console.error("Iframe not found.");
          return;
        }

        iframe.onload = () => {
          console.log("Iframe loaded and ready to receive messages.");
          iframeLoaded = true;

          setTimeout(() => {
            if (!searchQueryUpdated) {
              console.log("No updates to SEARCH_QUERY, sending default values.");
              sendMessageToIframe();
            }
          }, 1000);
        };
      });
    </script>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      html,
      body {
        height: 100%;
        overflow: hidden;
        background-color: transparent;
      }
      body {
        display: flex;
        flex-direction: column;
      }
      iframe {
        width: 100%;
        height: 100vh;
        border: none;
        flex: 1;
      }
    </style>
  </head>
  <body>
    <iframe
      id="searchWidget"
      src="https://beyondbooking.vercel.app/listings"
      scrolling="yes"
    ></iframe>
  </body>
</html>
`.trim()

  // --- FULL Single Page code ---
  const singlePageCode = `
// Single Page Application Configuration
const spaConfig = {
  primaryColor: "rgb(${preferences.primaryColor})",
  secondaryColor: "rgb(${preferences.secondaryColor})",
  customDomain: "${preferences.customDomain}",
  headingFont: "${preferences.headingFont}",
  bodyFont: "${preferences.bodyFont}",
  fontLink: "${preferences.fontLink}",
  currencies: ${JSON.stringify(preferences.currencies)},
  imgLink: "${preferences.imgLink}",
  bookingFooterColor: "rgb(${preferences.bookingFooterColor})",
  buttonFontColorOnHover: "rgb(${preferences.buttonFontColorOnHover})",
  lodgifyWsUrl: "${preferences.lodgifyWsUrl}",
  lodgifyWsId: "${preferences.lodgifyWsId}"
};

// Load custom font if provided
if (spaConfig.fontLink) {
  const link = document.createElement('link');
  link.href = spaConfig.fontLink;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// Apply styles to the entire page
document.body.style.setProperty('--primary-color', spaConfig.primaryColor);
document.body.style.setProperty('--secondary-color', spaConfig.secondaryColor);
document.body.style.setProperty('--booking-footer-color', spaConfig.bookingFooterColor);
document.body.style.setProperty('--button-font-color-on-hover', spaConfig.buttonFontColorOnHover);
document.body.style.setProperty('--heading-font', spaConfig.headingFont);
document.body.style.setProperty('--body-font', spaConfig.bodyFont);

// Apply fonts
document.body.style.fontFamily = spaConfig.bodyFont;
document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
  heading.style.fontFamily = spaConfig.headingFont;
});

// Show/hide logo
const logo = document.getElementById('company-logo');
if (logo) {
  logo.style.display = spaConfig.showLogo ? 'block' : 'none';
  if (spaConfig.showLogo && spaConfig.imgLink) {
    logo.src = spaConfig.imgLink;
  }
}

// Update navigation links
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.href = \`https://\${spaConfig.customDomain}\${link.getAttribute('href')}\`;
});

// Add currency selector
const currencySelector = document.createElement('select');
spaConfig.currencies.forEach(currency => {
  const option = document.createElement('option');
  option.value = currency;
  option.textContent = currency;
  currencySelector.appendChild(option);
});
document.body.appendChild(currencySelector);

// Create a simple router
const router = {
  navigate: (path) => {
    history.pushState(null, '', path);
    this.handleRoute();
  },
  handleRoute: () => {
    const path = window.location.pathname;
    console.log(\`Navigated to: \${path}\`);
    // Add your routing logic here
  }
};

// Listen for navigation events
window.addEventListener('popstate', router.handleRoute);

// Initial route handling
router.handleRoute();
`.trim()

  // Determine which code to show
  const getActiveCode = () => (activeTab === "booknow" ? bookNowCode : singlePageCode)

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="booknow">Book Now</TabsTrigger>
            <TabsTrigger value="singlepage">Single Page</TabsTrigger>
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