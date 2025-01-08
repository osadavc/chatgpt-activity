import { DAYS, MONTHS } from "~config/constants";

import { ContributionSquare } from "./contribution-square";

interface ContributionGraphProps {
  selectedYear: number;
  chatsByDate: Record<string, number>;
  onDownload: () => void;
  renderYearSelector: () => JSX.Element;
}

export const ContributionGraph = ({
  selectedYear,
  chatsByDate,
  onDownload,
  renderYearSelector
}: ContributionGraphProps) => {
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
          onClick={onDownload}
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

      <div style={{ display: "flex", marginLeft: "30px", marginBottom: "4px" }}>
        {MONTHS.map((month) => (
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
