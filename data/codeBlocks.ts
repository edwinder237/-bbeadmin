import { ClientData } from "@/data/types";
import exp from "constants";

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
      const BUTTON_ICON_COLOR_ON_HOVER = "${preferences.buttonFontColorOnHover
    }";

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
          locationFilter: LOCATION_FILTER ,
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
            "--c-primary-500: ${preferences.primaryColor}", 
            "--c-primary-600: ${preferences.primaryColor}",
            "--c-primary-700: ${preferences.secondaryColor}",
            "--c-primary-800: 66, 41, 59",
            "--c-primary-900: 22, 23, 42",
          ],
          SECONDARY_PALETTE: [
                      "--c-secondary-50: 248, 250, 252",
            "--c-secondary-100: 241, 245, 249",
            "--c-secondary-200: 226, 232, 240",
            "--c-secondary-300: 203, 213, 225",
            "--c-secondary-400: ${preferences.bookingFooterColor}",
            "--c-secondary-500: 100, 116, 139",
            "--c-secondary-600: 71, 85, 105",
            "--c-secondary-700: 29, 65, 29",
            "--c-secondary-800: 30, 41, 59",
            "--c-secondary-900: 15, 23, 42",
          ],
          NEUTRAL_PALETTE: [
            "--c-neutral-50: 255,255,255",
            "--c-neutral-100: 241, 245, 249" /*dividers and light buttons eg; show all photos */,
            "--c-neutral-200: 226, 232, 240" /*BORDERS COLOR */,
            "--c-neutral-300: 203, 213, 225" /*ICONS COLOR */,
            "--c-neutral-400: 148, 163, 184" /* secondary-txt-color-light eg;,cal-invalid dates */,
            "--c-neutral-500: 0, 0, 0" /* secondary-txt-color-main-body-2 */,
            "--c-neutral-600: 0, 0, 0" /* secondary-txt-color-main-body-1 */,
            "--c-neutral-700: 51, 65, 85",
            "--c-neutral-800: 30, 41, 59",
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
  // const { primaryColor, secondaryColor, customDomain } = clientData.preferences;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Search Widget</title>

    <script>
      const allowedOrigins = [
        "https://editor.wix.com",
        "https://beyondbooking.wixstudio.com",
        "https://beyondbooking.vercel.app",
        "${preferences.wixCmsUrl}",
      ];

      let LISTING_ID = ""; // Global variable for listing ID
      let iframeLoaded = false;

      // Event listener to receive messages from allowed origins
      window.addEventListener("message", (event) => {
        //console.log("Message received:", event);

        // Validate the origin of the message
        if (!allowedOrigins.includes(event.origin)) {
          console.warn("Received message from unknown origin:", event.origin);
          return;
        }

        // Handle the incoming data
        if (event.data?.listingId) {
          LISTING_ID = event.data.listingId;
          //console.log("Received LISTING_ID:", LISTING_ID);
        } else {
          console.warn("Listing ID not found in event data:", event.data);
        }

        // If iframe is loaded, send message to iframe
        if (iframeLoaded) {
          sendIframeMessage();
        }
      });

      // Configurations and data
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
      const REQUEST_TYPE = "SINGLE_LISTING"; // choices: "ALL_LISTINGS"|"SINGLE_LISTING"|"PAYMENT_PAGE"|"SEARCH_LISTINGS"
      const SEARCH_QUERY = {
        checkIn: "",
        checkOut: "",
        guestsCount: 2,
        location: "",
      };
       const BUTTON_ICON_COLOR_ON_HOVER = "${preferences.buttonFontColorOnHover}";
       const PRIMARY_PALETTE: [
            "--c-primary-50: 248, 250, 252",
            "--c-primary-100: 241, 245, 249",
            "--c-primary-200: 10, 232, 240",
            "--c-primary-300: 15, 213, 225",
            "--c-primary-400: 10, 163, 184",
            "--c-primary-500: ${preferences.primaryColor}", 
            "--c-primary-600: ${preferences.primaryColor}",
            "--c-primary-700: ${preferences.secondaryColor}",
            "--c-primary-800: 66, 41, 59",
            "--c-primary-900: 22, 23, 42",
          ];
        const SECONDARY_PALETTE: [
                      "--c-secondary-50: 248, 250, 252",
            "--c-secondary-100: 241, 245, 249",
            "--c-secondary-200: 226, 232, 240",
            "--c-secondary-300: 203, 213, 225",
            "--c-secondary-400: ${preferences.bookingFooterColor}",
            "--c-secondary-500: 100, 116, 139",
            "--c-secondary-600: 71, 85, 105",
            "--c-secondary-700: 29, 65, 29",
            "--c-secondary-800: 30, 41, 59",
            "--c-secondary-900: 15, 23, 42",
          ];
        const NEUTRAL_PALETTE: [
            "--c-neutral-50: 255,255,255",
            "--c-neutral-100: 241, 245, 249" /*dividers and light buttons eg; show all photos */,
            "--c-neutral-200: 226, 232, 240" /*BORDERS COLOR */,
            "--c-neutral-300: 203, 213, 225" /*ICONS COLOR */,
            "--c-neutral-400: 148, 163, 184" /* secondary-txt-color-light eg;,cal-invalid dates */,
            "--c-neutral-500: 0, 0, 0" /* secondary-txt-color-main-body-2 */,
            "--c-neutral-600: 0, 0, 0" /* secondary-txt-color-main-body-1 */,
            "--c-neutral-700: 51, 65, 85",
            "--c-neutral-800: 30, 41, 59",
            "--c-neutral-900: 0, 0, 0",
          ];

      // Function to send configuration data to iframe
      const sendIframeMessage = () => {
        const iframe = document.getElementById("searchWidget");
        const message = {
          locationFilter: LOCATION_FILTER,
          ACCESS_KEY: "60ec32ed-8a2c-4a9b-aae4-799793a2e237",
          INTEGRATION_TYPE: "lodgify",
          HEADING_FONT,
          BODY_FONT,
          HERO_IMG,
          CLIENT_NAME,
          FONT_LINK,
          PRIMARY_PALETTE,
          SECONDARY_PALETTE,
          NEUTRAL_PALETTE,
          CURRENCIES,
          REQUEST_TYPE,
          LISTING_ID,
          SEARCH_QUERY,
          BUTTON_ICON_COLOR_ON_HOVER,
          MAX_GUESTS,
          LANG,
          WIX_CMS_URL
        };

        iframe?.contentWindow?.postMessage(message, "*");
      };

      // Iframe onload event to mark iframe as loaded
      document.addEventListener("DOMContentLoaded", () => {
        const iframe = document.getElementById("searchWidget");
        iframe.onload = () => {
          iframeLoaded = true;
          sendIframeMessage();
        };
      });
    </script>

    <style>
      html,
      body {
        height: 100%;
        background-color: transparent;
        margin: 0;
      }
      iframe {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border: none;
        display: block;
      }
    </style>
  </head>
  <body>
    <iframe id="searchWidget" src="https://beyondbooking.vercel.app/listings"></iframe>
  </body>
</html>`.trim();
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
            wixLocationFrontend.to(\`/booknow?checkIn=\${checkin}&checkOut=\${checkout}&people=\${guests}\`);
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
    //console.log("Iframe is rendered. Sending message...");

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

export const wixHttps_functionCode = `
/*******************
 http-functions.js
********************

'http-functions.js' is a reserved backend file that lets you expose APIs that respond to fetch 
requests from external services.

Use this file to create functions that expose the functionality of your site as a service. 
This functionality can be accessed by writing code that calls this site's APIs as defined by the 
functions you create here.

To learn more about using HTTP functions, including the endpoints for accessing the APIs, see:
https://wix.to/0lZ9qs8

***/

import { ok, badRequest } from "wix-http-functions";
import wixData from "wix-data";

function getDirectImageUrl(wixImageSrc) {
  // Remove the "wix:image://v1/" prefix
  const withoutPrefix = wixImageSrc.replace("wix:image://v1/", "");
  // Split on either / or #
  const fileId = withoutPrefix.split(/[\/#]/)[0];
  // Construct and return the static media URL
  return \`https://static.wixstatic.com/media/\${fileId}\`;
}

// GET all items from the Chalets collection
export async function get_wixCms(request) {
  const response = {
    headers: { "Content-Type": "application/json" },
  };

  try {
    // 1) Query data from the "Chalets" collection
    const results = await wixData.query("Chalets").find();

    // 2) For each item, iterate over its media gallery array
    results.items.forEach((item) => {
      if (Array.isArray(item.mediagallery)) {
        item.mediagallery.forEach((media) => {
          // Overwrite .src with the direct, browser-friendly URL
          media.src = getDirectImageUrl(media.src);
        });
      }
    });

    // 3) Build and return the response
    response.body = {
      items: results.items, // Items now have replaced .src
      totalCount: results.totalCount,
    };

    return ok(response);
  } catch (err) {
    response.body = { error: err.message };
    return badRequest(response);
  }
}

// GET a single item by ID from the Chalets collection
export async function get_wixCmsById(request) {
  const response = {
    headers: { "Content-Type": "application/json" },
  };

  // Helper function to wrap a promise with a timeout
  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(\`Operation timed out after \${ms}ms\`));
      }, ms);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  try {
    // Extract the 'id' (and optionally 'clientId') from the query parameters
    const { clientId, id } = request.query;

    if (!id) {
      throw new Error(\`Missing id parameter: \${id}\`);
    }

    // Convert the id to a number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid id parameter: not a number");
    }

    // Retrieve the record from the "Chalets" collection using a timeout
    const result = await withTimeout(
      wixData.query("Chalets").eq("id", numericId).find(),
      10000 // Timeout after 10 seconds
    );

    // Check if an item was found
    if (!result || result.items.length === 0) {
      throw new Error(\`No item found for the given id: \${id}\`);
    }

    // Respond with the item and the clientId (if provided)
    response.body = {
      item: result.items[0],
      client: clientId,
    };
    return ok(response);
  } catch (err) {
    console.error("Error in get_wixCmsById:", err);
    response.body = { error: err.message };
    return badRequest(response);
  }
}
`.trim();

export const addListingsToCMS = `
// Backend/addListingsToCMS.jsw

import wixData from "wix-data";
import { fetchAllListings } from "backend/fetchAllListings.jsw";

/**
 * Converts a listing object's keys to the desired data types.
 * - Converts "id" to a number.
 * - Converts "latitude" to a string.
 *
 * @param {Object} listing - The original listing object.
 * @returns {Object} The listing object with converted data types.
 */
function convertListingData(listing) {
  const formattedListing = { ...listing };

  // Convert 'id' to a number if it exists
  if (formattedListing.id !== undefined) {
    formattedListing.id = Number(formattedListing.id);
  }

  // Convert 'latitude' to a string if it exists
  if (formattedListing.latitude !== undefined) {
    formattedListing.latitude = String(formattedListing.latitude);
  }

  return formattedListing;
}

/**
 * Fetches all listings from an external API, converts their data,
 * and inserts them into the "lodgify" collection via bulkInsert.
 * Listings that already exist in the collection (based on the 'id' field)
 * are skipped and logged.
 *
 * @returns {Promise<void>}
 */
export async function addListingsToCMS() {
  console.log("Starting addListingsToCMS.");

  try {
    // Fetch listings from the external API
    const listingsData = await fetchAllListings();
    if (!listingsData || !listingsData.items || !Array.isArray(listingsData.items)) {
      console.error("Invalid listings data: 'items' array is missing.", listingsData);
      return;
    }

    // Convert each listing to ensure proper data types
    const formattedListings = listingsData.items.map(convertListingData);
    console.log(\`Total listings fetched: \${formattedListings.length}\`);

    // Extract the list of IDs from the converted listings
    const listingIds = formattedListings.map((listing) => listing.id);

    // Query the "lodgify" collection to find existing listings with these IDs
    const existingQuery = await wixData.query("lodgify")
      .hasSome("id", listingIds)
      .find();

    // Extract existing IDs from the returned items
    const existingIds = existingQuery.items.map((item) => item.id);
    if (existingIds.length > 0) {
      console.log(\`Found \${existingIds.length} existing listing(s):\`, existingIds);
    } else {
      console.log("No existing listings found in the database.");
    }

    // Filter out listings that already exist
    const listingsToInsert = formattedListings.filter((listing) => !existingIds.includes(listing.id));
    const skippedListings = formattedListings.filter((listing) => existingIds.includes(listing.id));

    if (skippedListings.length > 0) {
      console.log(\`Skipping \${skippedListings.length} listings (already in DB):\`);
      skippedListings.forEach((item) => console.log(\`  Skipped listing with id: \${item.id}\`));
    }

    // Insert new listings in bulk if any remain
    if (listingsToInsert.length > 0) {
      console.log(\`Inserting \${listingsToInsert.length} new listings...\`);
      const options = {}; // Example: { suppressHooks: true }
      const bulkResult = await wixData.bulkInsert("lodgify", listingsToInsert, options);
      console.log("Bulk insert completed. Result:", bulkResult);
    } else {
      console.log("No new listings to insert.");
    }
  } catch (error) {
    console.error("Error in addListingsToCMS:", error);
    throw error;
  }
}
`.trim();

export const fetchAllListings = `// backend/fetchAllListings.js

import { fetch } from 'wix-fetch'; // Use a named import

/**
 * Fetches Lodgify listings by calling an external API.
 *
 * @returns {Promise<Object>} The JSON response from the API.
 */
export async function fetchAllListings() {
  const url = "https://nodejs-serverless-function-express-omega-rouge.vercel.app/api/controller";  // Replace with your API endpoint

  // Prepare the JSON data
  const bodyData = {
    action: "fetchLodgifyListings",
    internal_ID: "2603e982-28ac-4ea8-8262-55795a355bd8"
  };

  try {
    // Make the fetch call with method POST and a JSON body
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(\`Fetch failed: \${response.status} \${response.statusText}\`);
    }

    // Parse the JSON response once and store it
    const data = await response.json();
    console.log("Fetched Data:", data);

    // Return the JSON data from the response
    return data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}`.trim();
