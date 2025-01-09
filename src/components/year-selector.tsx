import type { Dispatch, SetStateAction } from "react";

interface YearSelectorProps {
  selectedYear: number;
  setSelectedYear: Dispatch<SetStateAction<number>>;
  getAvailableYears: () => number[];
  small?: boolean;
}

export const YearSelector = ({
  selectedYear,
  setSelectedYear,
  getAvailableYears,
  small = false
}: YearSelectorProps) => {
  return (
    <div style={{ display: "inline-block", width: "100%" }}>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        style={{
          padding: small ? "2px 4px" : "4px 8px",
          fontSize: small ? "12px" : "14px",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%"
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
