import { DAYS, MONTHS } from "~config/constants";

import { ContributionSquare } from "./contribution-square";

interface ContributionGraphProps {
  selectedYear: number;
  chatsByDate: Record<string, number>;
  renderYearSelector: () => JSX.Element;
  hideMarkers?: boolean;
}

export const ContributionGraph = ({
  selectedYear,
  chatsByDate,
  renderYearSelector,
  hideMarkers = false
}: ContributionGraphProps) => {
  const startDate = new Date(selectedYear, 0, 1);
  const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Convert to Monday-based week system (Monday = 0, Sunday = 6)
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Create a full year of days
  const days = Array.from({ length: 365 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toDateString();
    return {
      date: dateStr,
      count: chatsByDate?.[dateStr] || 0
    };
  });

  // Create week-based columns
  const ROWS = 7;
  const COLS = 53; // Maximum number of weeks in a year + 1 for partial weeks

  const columns = Array.from({ length: COLS }, (_, weekIndex) => {
    return Array.from({ length: ROWS }, (_, dayIndex) => {
      const dayOffset = weekIndex * ROWS + dayIndex - adjustedStartDay;
      if (dayOffset < 0 || dayOffset >= days.length) {
        return { date: "", count: -1 };
      }
      return days[dayOffset];
    });
  });

  return (
    <div style={{ width: "675px" }} id="contribution-graph">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "8px"
        }}>
        {renderYearSelector()}
      </div>

      {!hideMarkers && (
        <div
          style={{ display: "flex", marginLeft: "30px", marginBottom: "4px" }}>
          {MONTHS.map((month) => (
            <div
              key={month}
              style={{
                color: "#fafafa",
                fontSize: "10px",
                width: `${(675 - 30) / 12}px`,
                textAlign: "left"
              }}>
              {month}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex" }}>
        {!hideMarkers && (
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
                  color: "#fafafa",
                  fontSize: "10px",
                  height: "10px",
                  marginBottom: "2px",
                  textAlign: "left"
                }}>
                {day}
              </div>
            ))}
          </div>
        )}
        <div
          style={{ display: "flex", marginLeft: hideMarkers ? 0 : undefined }}>
          {columns.map((column, colIndex) => (
            <div
              key={colIndex}
              style={{
                display: "flex",
                flexDirection: "column"
              }}>
              {column.map(({ date, count }, rowIndex) => (
                <ContributionSquare
                  key={`${colIndex}-${rowIndex}`}
                  date={date}
                  count={count}
                  hideTooltip={hideMarkers}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
