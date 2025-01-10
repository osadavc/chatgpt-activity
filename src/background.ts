import { Storage } from "@plasmohq/storage";

import { keys, messages } from "~config/constants";
import {
  fetchAndSaveLatestChat,
  fetchChats,
  type ChromeHeaders
} from "~lib/fetch_chats";
import type { SavedRawData } from "~types/chatgpt_api_response";
import { aggregateChatDates } from "~utils/aggregate-chat-dates";

let isFirstRequest = true;
let shouldSaveNewChat = false;

const storage = new Storage({
  area: "local"
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const baseUrl = details.url.split("?")[0];

    (async () => {
      try {
        if (
          details.url.includes("/backend-api/conversations") &&
          (isFirstRequest || shouldSaveNewChat)
        ) {
          isFirstRequest = false;
          const rawChatData = await storage.get(keys.rawChatData);
          const lastFetchTime = await storage.get(keys.lastFetchTime);

          const shouldFetchChats =
            !rawChatData ||
            (lastFetchTime &&
              new Date(lastFetchTime).getTime() + 1000 * 60 * 60 * 24 * 30 <
                new Date().getTime());

          if (shouldFetchChats) {
            const authHeader = details.requestHeaders?.find(
              (header) => header.name.toLowerCase() === "authorization"
            );

            if (authHeader?.value) {
              await fetchChats({
                baseUrl,
                headers: details.requestHeaders as ChromeHeaders
              });
            }
          } else {
            await fetchAndSaveLatestChat({
              baseUrl,
              headers: details.requestHeaders as ChromeHeaders
            });
            shouldSaveNewChat = false;
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

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (
      details.url.includes("/backend-api/conversation") &&
      !details.url.includes("init") &&
      details.method === "POST"
    ) {
      (async () => {
        const requestBody = details.requestBody;

        if (requestBody?.raw?.[0]) {
          const decoder = new TextDecoder("utf-8");
          const decodedBody = decoder.decode(requestBody.raw[0].bytes);
          const parsedBody = JSON.parse(decodedBody);

          if (!parsedBody.conversation_id) {
            shouldSaveNewChat = true;
          } else {
            const existingChats = await storage.get<SavedRawData>(
              keys.rawChatData
            );

            const updatedChats = existingChats.map((chat) =>
              chat.id === parsedBody.conversation_id
                ? { ...chat, update_time: new Date().toISOString() }
                : chat
            );

            await storage.set(keys.rawChatData, updatedChats);
            const aggregatedDates = aggregateChatDates(updatedChats);
            chrome.runtime.sendMessage({
              type: messages.fetchChatsComplete,
              data: aggregatedDates
            });
          }
        }
      })();
    }
  },
  { urls: ["https://chatgpt.com/*"] },
  ["requestBody"]
);

export {};
