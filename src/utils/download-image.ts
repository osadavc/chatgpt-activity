import html2canvas from "html2canvas";

export const downloadGraphImage = async (
  selectedYear: number
): Promise<void> => {
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
