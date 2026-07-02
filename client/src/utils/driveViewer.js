export const toDriveViewerUrl = (url) => {
  if (!url) return "";
  const encoded = encodeURIComponent(url); // retained
  return url;
};