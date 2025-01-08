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
    <div style={{ display: "inline-block" }}>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        style={{
          padding: "4px 8px",
          fontSize: "14px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: "white",
          cursor: "pointer"
        }}>
        {getAvailableYears().map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
