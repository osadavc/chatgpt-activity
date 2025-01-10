import { ContributionGraph } from "./contribution-graph";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: number;
  chatsByDate: Record<string, number>;
  renderYearSelector: () => JSX.Element;
}

export const ContributionModal = ({
  isOpen,
  onClose,
  selectedYear,
  chatsByDate,
  renderYearSelector
}: ContributionModalProps) => {
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
          overflow: "auto"
        }}>
        <ContributionGraph
          selectedYear={selectedYear}
          chatsByDate={chatsByDate}
          renderYearSelector={renderYearSelector}
          hideMarkers={false}
        />
      </div>
    </>
  );
};
