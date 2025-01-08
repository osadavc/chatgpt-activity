import axios from "axios";

import { Storage } from "@plasmohq/storage";

import { keys, messages } from "~config/constants";
import type { ChatItem, ChatResponse } from "~types/chatgpt_api_response";

const storage = new Storage({
  area: "local"
});

export type ChromeHeaders = {
  name: string;
  value: string;
}[];

export const fetchChats = async ({
  baseUrl,
  headers
}: {
  baseUrl: string;
  headers: ChromeHeaders;
}) => {
  try {
    const allChats: Pick<ChatItem, "create_time" | "update_time">[] = [];

    let offset = 0;
    const limit = 100;
    let hasMore = true;

    await storage.set(keys.fetchingChats, true);
    chrome.runtime.sendMessage({ type: messages.fetchChatsStart });

    while (hasMore) {
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
    }

    const allDates = allChats.reduce(
      (acc, chat) => {
        const createDate = new Date(chat.create_time).toDateString();
        const updateDate = new Date(chat.update_time).toDateString();

        acc[createDate] = (acc[createDate] || 0) + 1;
        acc[updateDate] = (acc[updateDate] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>
    );

    await storage.set(keys.chatsByDate, allDates);
    await storage.set(keys.lastFetchTime, new Date().toISOString());
    await storage.set(keys.fetchingChats, false);

    chrome.runtime.sendMessage({
      type: messages.fetchChatsComplete
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
