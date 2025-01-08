import { useState } from "react";

import { getColorIntensity } from "~utils/get-color-intensity";

export const ContributionSquare = ({ count = 0, date }) => {
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
