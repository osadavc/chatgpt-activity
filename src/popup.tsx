import html2canvas from "html2canvas";
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

const ContributionSquare = ({ count = 0, date }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    vertical: "bottom",
    horizontal: "center"
  });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vertical = rect.top < 40 ? "top" : "bottom";
    const horizontal =
      rect.left < 70
        ? "right"
        : rect.right > window.innerWidth - 70
          ? "left"
          : "center";
    setTooltipPosition({ vertical, horizontal });
    setShowTooltip(true);
  };

  const getHorizontalTransform = () => {
    switch (tooltipPosition.horizontal) {
      case "left":
        return "translateX(-90%)";
      case "right":
        return "translateX(-10%)";
      default:
        return "translateX(-50%)";
    }
  };

  return (
    <div
      style={{
        width: 10,
        height: 10,
        backgroundColor: getColorIntensity(count),
        margin: 1,
        borderRadius: 2,
        position: "relative"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}>
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            ...(tooltipPosition.vertical === "bottom"
              ? { bottom: "100%", top: "auto" }
              : { top: "100%", bottom: "auto" }),
            left: "50%",
            transform: getHorizontalTransform(),
            backgroundColor: "#333",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 1000,
            marginTop: tooltipPosition.vertical === "top" ? "4px" : "auto",
            marginBottom: tooltipPosition.vertical === "bottom" ? "4px" : "auto"
          }}>
          {`${date}: ${count} chats`}
        </div>
      )}
    </div>
  );
};

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
    ].sort((a, b) => b - a); // Sort descending
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

    // Calculate grid dimensions
    const ROWS = 7; // 7 days per column
    const COLS = Math.ceil(365 / ROWS); // ~53 columns

    // Reorganize days into columns
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
          style={{
            display: "flex"
          }}>
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
    );
  };

  return (
    <div style={{ padding: 16, paddingTop: 5 }}>
      {renderContributionGraph()}
    </div>
  );
};

export default IndexPopup;
