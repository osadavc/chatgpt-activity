import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import { ContributionGraph } from "~components/contribution-graph";
import { ContributionModal } from "~components/contribution-modal";
import { keys, messages } from "~config/constants";
import type { ChatItem } from "~types/chatgpt_api_response";
import { aggregateChatDates } from "~utils/aggregate-chat-dates";

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://www.chatgpt.com/*"]
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector(".bg-token-sidebar-surface-primary.pt-0"),
  insertPosition: "beforebegin"
});

export const getShadowHostId = () => "chatgpt-usage-chart-inline";

const localStorage = new Storage({ area: "local" });

const ChatGPTActivityChart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rawChatData] = useStorage<
    Pick<ChatItem, "create_time" | "update_time" | "id">[]
  >({
    key: keys.rawChatData,
    instance: localStorage
  });

  const chatsByDate = rawChatData ? aggregateChatDates(rawChatData) : {};

  const getAvailableYears = () => {
    if (!chatsByDate) return [new Date().getFullYear()];
    return [
      ...new Set(
        Object.keys(chatsByDate).map((date) => new Date(date).getFullYear())
      )
    ].sort((a, b) => b - a);
  };

  useEffect(() => {
    const messageListener = (message) => {
      switch (message.type) {
        case messages.fetchChatsStart:
          setIsLoading(true);
          break;
        case messages.fetchChatsComplete:
          console.log("Fetching chats complete");
          setIsLoading(false);
          break;
        default:
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div
      style={{
        marginBottom: "10px",
        marginLeft: "10px"
      }}>
      <div
        style={{
          width: "200px",
          cursor: "pointer"
        }}
        title={`Your ${new Date().getFullYear()} ChatGPT Usage`}
        onClick={() => {
          if (isLoading || (rawChatData ?? [])?.length === 0) return;
          setIsModalOpen(true);
        }}>
        {isLoading || (rawChatData ?? [])?.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#666666",
              fontSize: "12px"
            }}>
            Loading chats...
          </div>
        ) : (
          <ContributionGraph
            selectedYear={new Date().getFullYear()}
            chatsByDate={chatsByDate}
            hideMarkers={true}
          />
        )}
      </div>

      <ContributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chatsByDate={chatsByDate}
        availableYears={getAvailableYears()}
      />
    </div>
  );
};

export default ChatGPTActivityChart;
