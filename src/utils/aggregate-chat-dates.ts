import type { ChatItem } from "~types/chatgpt_api_response";

export const aggregateChatDates = (
  chats: Pick<ChatItem, "create_time" | "update_time" | "id">[]
) => {
  const uniqueChats = [
    ...new Map(chats.map((chat) => [chat.id, chat])).values()
  ];

  return uniqueChats.reduce(
    (acc, chat) => {
      const createDate = new Date(chat.create_time).toDateString();
      const updateDate = new Date(chat.update_time).toDateString();

      if (createDate === updateDate) {
        acc[createDate] = (acc[createDate] || 0) + 1;
      } else {
        acc[createDate] = (acc[createDate] || 0) + 1;
        acc[updateDate] = (acc[updateDate] || 0) + 1;
      }

      return acc;
    },
    {} as Record<string, number>
  );
};
