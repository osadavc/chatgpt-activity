import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import { keys } from "~config/constants";

const getColorIntensity = (count: number) => {
  if (count === 0) return "#ebedf0";
  if (count <= 2) return "#9be9a8";
  if (count <= 5) return "#40c463";
  if (count <= 10) return "#30a14e";
  return "#216e39";
};

const ContributionSquare = ({ count = 0, date }) => (
  <div
    style={{
      width: 10,
      height: 10,
      backgroundColor: getColorIntensity(count),
      margin: 1,
      borderRadius: 2
    }}
    title={`${date}: ${count} chats`}
  />
);

const IndexPopup = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [data, setData] = useState("");
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
    ].sort((a, b) => b - a); // Sort descending
  };

  const renderYearSelector = () => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px"
      }}>
      {getAvailableYears().map((year) => (
        <button
          key={year}
          onClick={() => setSelectedYear(year)}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: selectedYear === year ? "#40c463" : "#f0f0f0",
            color: selectedYear === year ? "white" : "#333",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: selectedYear === year ? "600" : "400",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              selectedYear === year ? "#40c463" : "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              selectedYear === year ? "#40c463" : "#f0f0f0";
          }}>
          {year}
        </button>
      ))}
    </div>
  );

  useEffect(() => {
    const messageListener = (message: any) => {
      switch (message.type) {
        case "FETCH_CHATS_START":
          // Handle fetch start (e.g., show loading spinner)
          break;
        case "FETCH_CHATS_COMPLETE":
          // Handle fetch completion (e.g., update UI with message.payload data)
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const renderContributionGraph = () => {
    const today = new Date();
    const startDate = new Date(selectedYear, 0, 1); // January 1st of selected year
    const days = Array.from({ length: 365 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();
      return {
        date: dateStr,
        count: chatsByDate?.[dateStr] || 0
      };
    });

    return (
      <div style={{ padding: "10px 0", width: "650px" }}>
        {renderYearSelector()}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(53, 1fr)"
          }}>
          {days.map(({ date, count }) => (
            <ContributionSquare key={date} date={date} count={count} />
          ))}
        </div>
      </div>
    );
  };

  return <div style={{ padding: 16 }}>{renderContributionGraph()}</div>;
};

export default IndexPopup;
