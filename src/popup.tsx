import html2canvas from "html2canvas";
import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import { ContributionSquare } from "~components/contribution-square";
import { DAYS, keys, MONTHS } from "~config/constants";

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

  const handleDownload = async () => {
    const graphElement = document.getElementById("contribution-graph");
    if (!graphElement) return;

    try {
      const canvas = await html2canvas(graphElement);
      const link = document.createElement("a");
      link.download = `chatgpt-activity-${selectedYear}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
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
          break;
        case "FETCH_CHATS_COMPLETE":
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const renderContributionGraph = () => {
    const startDate = new Date(selectedYear, 0, 1);
    const days = Array.from({ length: 365 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();
      return {
        date: dateStr,
        count: chatsByDate?.[dateStr] || 0
      };
    });

    const ROWS = 7;
    const COLS = Math.ceil(365 / ROWS);

    const columns = Array.from({ length: COLS }, (_, colIndex) =>
      days.slice(colIndex * ROWS, (colIndex + 1) * ROWS)
    );

    return (
      <div style={{ width: "650px" }} id="contribution-graph">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <h2>ChatGPT Activity</h2>
          <button
            onClick={handleDownload}
            style={{
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#40c463",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#30a14e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#40c463";
            }}>
            Download Image
          </button>
        </div>

        {renderYearSelector()}

        <div
          style={{ display: "flex", marginLeft: "30px", marginBottom: "4px" }}>
          {MONTHS.map((month, i) => (
            <div
              key={month}
              style={{
                color: "#666",
                fontSize: "12px",
                width: `${(650 - 30) / 12}px`,
                textAlign: "left"
              }}>
              {month}
            </div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginRight: "4px",
              width: "30px"
            }}>
            {DAYS.map((day, i) => (
              <div
                key={i}
                style={{
                  color: "#666",
                  fontSize: "12px",
                  height: "12px",
                  marginBottom: "1px",
                  textAlign: "left"
                }}>
                {day}
              </div>
            ))}
          </div>
          <div style={{ display: "flex" }}>
            {columns.map((column, colIndex) => (
              <div
                key={colIndex}
                style={{
                  display: "flex",
                  flexDirection: "column"
                }}>
                {column.map(({ date, count }) => (
                  <ContributionSquare key={date} date={date} count={count} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 16, paddingTop: 5 }}>
      {renderContributionGraph()}
    </div>
  );
};

export default IndexPopup;
