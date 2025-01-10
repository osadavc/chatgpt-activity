import { Storage } from "@plasmohq/storage";

import { keys } from "~config/constants";
import { fetchChats, type ChromeHeaders } from "~lib/fetch_chats";

let isFirstRequest = true;

const storage = new Storage({
  area: "local"
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    (async () => {
      try {
        if (
          details.url.includes("/backend-api/conversations") &&
          isFirstRequest
        ) {
          isFirstRequest = false;
          const chatsByDate = await storage.get(keys.chatsByDate);
          const lastFetchTime = await storage.get(keys.lastFetchTime);

          const shouldFetchChats =
            !chatsByDate ||
            (lastFetchTime &&
              new Date(lastFetchTime).getTime() + 1000 * 60 * 60 * 24 * 30 <
                new Date().getTime());

          if (shouldFetchChats) {
            const baseUrl = details.url.split("?")[0];
            const authHeader = details.requestHeaders?.find(
              (header) => header.name.toLowerCase() === "authorization"
            );

            if (authHeader?.value) {
              await fetchChats({
                baseUrl,
                headers: details.requestHeaders as ChromeHeaders
              });
            }
          }
        }
      } catch (error) {
        isFirstRequest = false;
        console.error("Error in chat fetch listener:", error);
      }
    })();
  },
  { urls: ["https://chatgpt.com/*"] },
  ["requestHeaders"]
);

export {};
