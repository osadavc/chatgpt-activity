import { useState } from "react";

import { getColorIntensity } from "../utils/get-color-intensity";
import { ContributionGraph } from "./contribution-graph";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatsByDate: Record<string, number>;
  availableYears: number[];
}

export const ContributionModal = ({
  isOpen,
  onClose,
  chatsByDate,
  availableYears
}: ContributionModalProps) => {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 9998,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#1a1a1a",
          padding: "24px",
          borderRadius: "8px",
          zIndex: 9999,
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          display: "flex",
          gap: "32px",
          alignItems: "flex-start"
        }}>
        <ContributionGraph
          selectedYear={selectedYear}
          chatsByDate={chatsByDate}
          hideMarkers={false}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginTop: "10px"
          }}>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              onMouseEnter={() => setHoveredYear(year)}
              onMouseLeave={() => setHoveredYear(null)}
              style={{
                background:
                  year === selectedYear
                    ? getColorIntensity(4)
                    : hoveredYear === year
                      ? "rgba(255, 255, 255, 0.05)"
                      : "none",
                border: "none",
                color: year === selectedYear ? "#fff" : getColorIntensity(0),
                fontSize: "14px",
                cursor: "pointer",
                padding: "5px 14px",
                borderRadius: "4px",
                transition: "all 0.2s ease",
                textAlign: "left",
                fontWeight: year === selectedYear ? 500 : 400,
                opacity:
                  year === selectedYear || hoveredYear === year ? 1 : 0.8,
                minWidth: "70px"
              }}>
              {year}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
