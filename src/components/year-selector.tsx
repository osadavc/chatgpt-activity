import type { Dispatch, SetStateAction } from "react";

interface YearSelectorProps {
  selectedYear: number;
  setSelectedYear: Dispatch<SetStateAction<number>>;
  getAvailableYears: () => number[];
}

export const YearSelector = ({
  selectedYear,
  setSelectedYear,
  getAvailableYears
}: YearSelectorProps) => {
  return (
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
};
