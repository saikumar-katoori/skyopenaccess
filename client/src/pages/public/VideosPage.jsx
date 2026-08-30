import { useEffect, useState } from "react";
import { http } from "../../api/http";
import { getYouTubeThumbnail } from "../../utils/thumbnailHelpers";

export const VideosPage = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    http
      .get("/content/videos")
      .then((res) => setVideos(res.data.videos || []))
      .catch(() => setVideos([]));
  }, []);

  const publicVideos = videos.filter((video) => video.journal_id == null);

  if (!publicVideos.length) {
    return (
      <main className="videos-section fade-up">
        <div className="videos-container">
          <div className="videos-image">
            <img src="/images/videos1.png" alt="No Videos Available" />
          </div>
          <h2>No Videos Have Been Added Yet</h2>
          <p>
            We are currently preparing video content. Please check back again soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="video-container">
      <section className="card-section">
        <h2>Videos</h2>

        <div className="video-grid">
          {publicVideos.map((video) => (
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="video-card fade-up"
              key={video._id}
            >
              <div className="video-thumbnail">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="thumbnail-img"
                  />
                ) : getYouTubeThumbnail(video.youtube_url) ? (
                  <img
                    src={getYouTubeThumbnail(video.youtube_url)}
                    alt={video.title}
                    className="thumbnail-img"
                  />
                ) : (
                  <div className="video-placeholder">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23 7l-7 5 7 5V7zM5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2z"></path>
                    </svg>
                  </div>
                )}
              </div>

              <h3>{video.title}</h3>
              <span className="inline-link">Watch</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
};
