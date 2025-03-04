import { ClientData } from "@/data/types"

export function ALL_LISTING_WidgetCode(clientData: ClientData): string {
    const { preferences } = clientData;

    return `
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
      let searchQueryUpdated = false;

      const startRange = new Date();
      const endRange = new Date(startRange);
      endRange.setDate(startRange.getDate() + 4);
      const defaultCheckIn = startRange.toISOString().split("T")[0];
      const defaultCheckOut = endRange.toISOString().split("T")[0];

      let SEARCH_QUERY = {
        checkIn: "",
        checkOut: "",
        guestsCount: 2,
        location: "",
      };
      const BUTTON_ICON_COLOR_ON_HOVER = "${preferences.buttonFontColorOnHover}";

      const allowedOrigins = [
        "https://beyondbooking.vercel.app",
        "http://localhost:3000",
        "https://editor.wix.com",
        "https://beyondbooking.wixstudio.com",
        "${preferences.wixCmsUrl}",
      ];

      window.addEventListener("message", (event) => {
        if (!allowedOrigins.includes(event.origin)) {
          console.warn("Received message from unknown origin:", event.origin);
          return;
        }

        const receivedData = event.data;

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
            "--c-primary-500: ${preferences.primaryColor}",
            "--c-primary-600: ${preferences.primaryColor}",
            "--c-primary-700: ${preferences.secondaryColor}",
          ],
          SECONDARY_PALETTE: [
            "--c-secondary-400: ${preferences.bookingFooterColor}",
            "--c-secondary-700: 29, 65, 29",
          ],
          NEUTRAL_PALETTE: [
            "--c-neutral-50: 255,255,255",
            "--c-neutral-900: 0, 0, 0",
          ],
          CURRENCIES,
          REQUEST_TYPE,
          LISTING_ID,
          SEARCH_QUERY,
          MAX_GUESTS,
          LANG,
          WIX_CMS_URL,
        };

        iframe.contentWindow.postMessage(message, "*");
      }

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
  `.trim();
}

export function SINGLE_LISTING_WidgetCode(clientData: ClientData): string {
    const { preferences } = clientData;

    return `
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

document.body.style.fontFamily = spaConfig.bodyFont;
document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
  heading.style.fontFamily = spaConfig.headingFont;
});

const logo = document.getElementById('company-logo');
if (logo) {
  logo.style.display = spaConfig.showLogo ? 'block' : 'none';
  if (spaConfig.showLogo && spaConfig.imgLink) {
    logo.src = spaConfig.imgLink;
  }
}

const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.href = \`https://\${spaConfig.customDomain}\${link.getAttribute('href')}\`;
});
`.trim();
}

export const wixHomePageCode = `
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(async function () {
    console.log("Page is ready.");
});

function formatDate(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "";
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return \`\${year}-\${month < 10 ? "0" + month : month}-\${day < 10 ? "0" + day : day}\`;
}

function handleSearchButtonClick(buttonId, checkinSelector, checkoutSelector, guestsSelector) {
    $w(buttonId).onClick(() => {
        const checkinElement = $w(checkinSelector);
        const checkoutElement = $w(checkoutSelector);
        const guestsElement = $w(guestsSelector);

        if (!checkinElement || !checkoutElement || !guestsElement) {
            console.error("One or more elements are missing:", { checkinElement, checkoutElement, guestsElement });
            return;
        }

        const rawCheckin = checkinElement.value;
        const rawCheckout = checkoutElement.value;
        const guests = guestsElement.value || 1;

        if (!rawCheckin || !rawCheckout) {
            console.error("Check-in and check-out dates are required.");
            return;
        }

        const checkin = formatDate(rawCheckin);
        const checkout = formatDate(rawCheckout);

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        if (checkinDate > checkoutDate) {
            console.error("Check-in date cannot be after the check-out date.");
            return;
        } 

        if (checkin && checkout) {
            wixLocationFrontend.to(\`/nos-chalets?checkIn=\${checkin}&checkOut=\${checkout}&people=\${guests}\`);
        } else {
            console.error("Formatted check-in or check-out is invalid.");
        }
    });
}

handleSearchButtonClick("#searchBtn", "#checkin", "#checkout", "#guests");
handleSearchButtonClick("#button14", "#datePicker2", "#datePicker1", "#dropdown1");
`.trim();

export const wixBooknowPageCode = `
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
  // Retrieve query parameters from the URL
  const query = wixLocationFrontend.query;
  const { checkIn, checkOut, people } = query;

  if (!checkIn || !checkOut) {
    console.error("Missing required query parameters: checkIn or checkOut.");
    return;
  }

  // Parse query parameters to Date objects
  const checkInDate = checkIn;
  const checkOutDate = checkOut;

  // Check if the iframe is rendered
  if ($w("#iframe").rendered) {
    console.log("Iframe is rendered. Sending message...");

    // Post message to the iframe
    $w("#iframe").postMessage({ checkInDate, checkOutDate, people });
  } else {
    console.error("Iframe is not rendered yet. Cannot send message.");
  }

  // Handle messages received from the iframe
  $w("#iframe").onMessage((event) => {
    //console.log("Message received from iframe:", event.data);
  });
});`.trim();

export const wixDynamicPageCode = `
import wixLocation from "wix-location";
import wixData from "wix-data";

$w.onReady(() => {
  const path = wixLocation.path[0]?.toLowerCase() || "";
  console.log("Current path:", path);

  const timeoutDuration = 5000;
  let messageSent = false;

  const sanitizePageName = (name) =>
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const timeout = setTimeout(() => {
    if (!messageSent) {
      console.error("Error: listingId not received within the timeout period.");
    }
  }, timeoutDuration);

  wixData.query("Chalets")
    .find()
    .then((results) => {
      console.log("Chalets:", results.items);

      const propertyItem = results.items.find(
        (item) => sanitizePageName(item.title) === path
      );

      if (propertyItem) {
        const message = { listingId: propertyItem.id };
        const iframe = $w("#html1");

        if (iframe) {
          iframe.postMessage(message, "https://beyondbooking.vercel.app");
          messageSent = true;
          clearTimeout(timeout);
        } else {
          console.error("Iframe element not found.");
        }
      } else {
        console.warn(\`No matching property found for path: \${path}\`);
      }
    })
    .catch((err) => {
      console.error("Error fetching property data:", err);
    });
});
`.trim();