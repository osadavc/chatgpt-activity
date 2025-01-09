import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import { ContributionGraph } from "~components/contribution-graph";
import { YearSelector } from "~components/year-selector";
import { keys, messages } from "~config/constants";

import "../styles/popup.css";

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  const [chatsByDate, setChatsByDate] = useStorage<Record<string, number>>({
    key: keys.chatsByDate,
    instance: localStorage
  });

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
          if (!message.error) {
            setChatsByDate(message.data);
          }
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
    <div style={{ padding: 16, paddingTop: 5 }}>
      <div style={{ width: "675px" }}>
        {isLoading || !chatsByDate ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200
            }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <ContributionGraph
            selectedYear={selectedYear}
            chatsByDate={chatsByDate || {}}
            renderYearSelector={() => (
              <YearSelector
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                getAvailableYears={getAvailableYears}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

export default ChatGPTActivityChart;
