import { useState } from "react";

import { getColorIntensity } from "~utils/get-color-intensity";

interface ContributionSquareProps {
  count?: number;
  date: string;
  hideTooltip?: boolean;
  size?: number;
  margin?: number;
}

export const ContributionSquare = ({
  count = 0,
  date,
  hideTooltip = false,
  size = 10,
  margin = 1
}: ContributionSquareProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    vertical: "bottom",
    horizontal: "center"
  });

  if (count === -1) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "transparent",
          margin,
          borderRadius: Math.max(1, size / 5)
        }}
      />
    );
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (hideTooltip) return;
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
        width: size,
        height: size,
        backgroundColor: getColorIntensity(count),
        margin,
        borderRadius: Math.max(1, size / 5),
        position: "relative"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}>
      {showTooltip && !hideTooltip && (
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
          {count === 0
            ? `${date}: No chats`
            : `${date}: ${count} chat${count === 1 ? "" : "s"}`}
        </div>
      )}
    </div>
  );
};
