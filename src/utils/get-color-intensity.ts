export const getColorIntensity = (count: number) => {
  if (count === 0) return "#ebedf0";
  if (count === 1) return "#c2f0ca";
  if (count === 2) return "#9be9a8";
  if (count === 3) return "#40c463";
  if (count === 4) return "#30a14e";
  if (count <= 6) return "#2ea44f";
  if (count <= 8) return "#238636";
  if (count <= 10) return "#196c2e";
  if (count <= 15) return "#0f5323";
  return "#033a16";
};
