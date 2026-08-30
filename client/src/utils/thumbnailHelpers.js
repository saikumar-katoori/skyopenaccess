// Extract YouTube video ID from various YouTube URL formats
export const getYouTubeId = (url) => {
  if (!url) return null;
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  return match && match[7].length === 11 ? match[7] : null;
};

// Get YouTube thumbnail URL
export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Get PPT cover - using a generic PPT icon/placeholder
export const getPptCoverUrl = (fileUrl) => {
  // If the file_url is a Google Drive link, we could extract the file ID
  // and use Google Drive's preview API, but for now we'll return null
  // and handle it in the component with a fallback
  if (!fileUrl) return null;
  
  // Extract Google Drive file ID if it's a Google Drive URL
  const driveIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (driveIdMatch) {
    const fileId = driveIdMatch[1];
    // Return a Google Drive thumbnail URL
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
  }
  
  return null;
};
