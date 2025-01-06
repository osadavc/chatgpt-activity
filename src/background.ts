import { Storage } from "@plasmohq/storage";

import { keys } from "~config/constants";
import { fetchChats } from "~lib/fetch_chats";

let isFirstRequest = true;

const storage = new Storage({
  area: "local"
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    (async () => {
      if (
        details.url.includes("/backend-api/conversations") &&
        isFirstRequest
      ) {
        const chatsByDate = await storage.get(keys.chatsByDate);
        const lastFetchTime = await storage.get(keys.lastFetchTime);

        console.log("Chats by Date:", chatsByDate);

        const shouldFetchChats =
          !chatsByDate ||
          (lastFetchTime &&
            new Date(lastFetchTime).getTime() + 1000 * 60 * 60 * 24 * 30 <
              new Date().getTime());

        if (true) {
          const baseUrl = details.url.split("?")[0];
          const authHeader = details.requestHeaders?.find(
            (header) => header.name.toLowerCase() === "authorization"
          );

          if (authHeader?.value) {
            await fetchChats({
              baseUrl,
              authHeader: authHeader.value
            });
          }
        }

        isFirstRequest = false;
      }
    })();
  },
  { urls: ["https://chatgpt.com/*"] },
  ["requestHeaders"]
);

export {};
