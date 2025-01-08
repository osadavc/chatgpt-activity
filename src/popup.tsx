import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import { ContributionGraph } from "~components/contribution-graph";
import { YearSelector } from "~components/year-selector";
import { keys } from "~config/constants";
import { downloadGraphImage } from "~utils/download-image";

const IndexPopup = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chatsByDate] = useStorage<Record<string, number>>({
    key: keys.chatsByDate,
    instance: new Storage({
      area: "local"
    })
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
    const messageListener = (message: any) => {
      switch (message.type) {
        case "FETCH_CHATS_START":
          break;
        case "FETCH_CHATS_COMPLETE":
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  return (
    <div style={{ padding: 16, paddingTop: 5 }}>
      <ContributionGraph
        selectedYear={selectedYear}
        chatsByDate={chatsByDate || {}}
        onDownload={() => downloadGraphImage(selectedYear)}
        renderYearSelector={() => (
          <YearSelector
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            getAvailableYears={getAvailableYears}
          />
        )}
      />
    </div>
  );
};

export default IndexPopup;
