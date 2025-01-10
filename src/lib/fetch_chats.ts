import axios from "axios";

import { Storage } from "@plasmohq/storage";

import { keys, messages } from "~config/constants";
import type {
  ChatItem,
  ChatResponse,
  SavedRawData
} from "~types/chatgpt_api_response";
import { aggregateChatDates } from "~utils/aggregate-chat-dates";
import { sleep } from "~utils/sleep";

const storage = new Storage({
  area: "local"
});

export type ChromeHeaders = {
  name: string;
  value: string;
}[];

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const fetchChats = async ({
  baseUrl,
  headers
}: {
  baseUrl: string;
  headers: ChromeHeaders;
}) => {
  try {
    const allChats: Pick<ChatItem, "create_time" | "update_time" | "id">[] = [];

    let offset = 0;
    const limit = 100;
    let hasMore = true;

    await storage.set(keys.fetchingChats, true);
    chrome.runtime.sendMessage({ type: messages.fetchChatsStart });

    while (hasMore) {
      let retries = 0;
      let success = false;
      let lastError: any;

      while (retries < MAX_RETRIES && !success) {
        try {
          const { data } = await axios.get<ChatResponse>(baseUrl, {
            headers: headers.reduce(
              (acc, header) => {
                acc[header.name] = header.value;
                return acc;
              },
              {} as Record<string, string>
            ),
            params: {
              limit,
              offset
            }
          });

          allChats.push(
            ...data.items.map((item) => ({
              id: item.id,
              create_time: item.create_time,
              update_time: item.update_time
            }))
          );

          hasMore = data.items.length === limit;
          offset += limit;
          success = true;
        } catch (error) {
          lastError = error;
          retries++;
          if (retries < MAX_RETRIES) {
            console.log(`Retry attempt ${retries} after error:`, error);
            await sleep(RETRY_DELAY);
          }
        }
      }

      if (!success) {
        throw lastError;
      }
    }

    await storage.set(keys.rawChatData, allChats);
    await storage.set(keys.lastFetchTime, new Date().toISOString());
    await storage.set(keys.fetchingChats, false);

    const aggregatedDates = aggregateChatDates(allChats);
    chrome.runtime.sendMessage({
      type: messages.fetchChatsComplete,
      data: aggregatedDates
    });
  } catch (error) {
    console.error("Error fetching chats:", error);

    await storage.set(keys.fetchingChats, false);
    chrome.runtime.sendMessage({
      type: messages.fetchChatsComplete,
      error: true
    });
    return;
  }
};

export const fetchAndSaveLatestChat = async ({
  baseUrl,
  headers
}: {
  baseUrl: string;
  headers: ChromeHeaders;
}) => {
  const { data } = await axios.get<ChatResponse>(baseUrl, {
    headers: headers.reduce(
      (acc, header) => {
        acc[header.name] = header.value;
        return acc;
      },
      {} as Record<string, string>
    ),
    params: {
      limit: 1,
      offset: 0
    }
  });

  if (data.items.length > 0) {
    const existingChats =
      (await storage.get<SavedRawData>(keys.rawChatData)) || [];
    const currentTime = new Date().toISOString();

    const newChat = {
      id: data.items[0].id,
      create_time: currentTime,
      update_time: currentTime
    };

    await storage.set(keys.rawChatData, [...existingChats, newChat]);
    const aggregatedDates = aggregateChatDates([...existingChats, newChat]);
    chrome.runtime.sendMessage({
      type: messages.fetchChatsComplete,
      data: aggregatedDates
    });
  }
};
