import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../../api/http";
import { toDriveViewerUrl } from "../../utils/driveViewer";

const safeList = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

export const ArchiveVolumePage = () => {
  const { slug, volumeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [journal, setJournal] = useState(null);
  const [volume, setVolume] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [{ data: journalData }, { data: volumeData }] = await Promise.all([
          http.get(`/journals/${slug}`),
          http.get(`/content/archive-volumes/${volumeId}`)
        ]);

        setJournal(journalData.journal || null);
        setVolume(volumeData.volume || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load archive volume");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, volumeId]);

  if (loading) {
    return (
      <main className="container">
        <div className="loading-spinner">
          <p>Loading volume...</p>
        </div>
      </main>
    );
  }

  if (!journal || !volume) {
    return (
      <main className="container">
        <p className="error-message">{error || "Archive volume not found"}</p>
      </main>
    );
  }

  return (
    <main className="volume-detail-page container">
      <div className="volume-detail-card">
        <div className="volume-detail-header">
          <div>
            <p className="volume-detail-journal">{journal.title}</p>
            <h1>{volume.volume_title}</h1>
            <p className="volume-detail-meta">{volume.year}</p>
          </div>
          <Link to={`/journals/${slug}/archive`} className="back-btn">
            <i className="fa-solid fa-arrow-left"></i> Back to Archive
          </Link>
        </div>

        {volume.article_items?.length ? (
          <div className="volume-article-list">
            {safeList(volume.article_items).map((article) => (
              <article key={article._id} className="volume-article-row">
                <div className="volume-article-info">
                  <p className="article-row-type">{article.type}</p>
                  <h2>{article.title}</h2>
                  <p className="volume-article-authors">{article.authors}</p>
                </div>
                <div className="volume-article-actions">
                  <Link to={`/article/${article._id}`} className="read-btn">
                    Read More
                  </Link>
                  {article.pdf_url && (
                    <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="read-btn secondary">
                      PDF
                    </a>
                  )}
                  {article.doi_link && (
                    <a href={article.doi_link} target="_blank" rel="noreferrer" className="read-btn secondary">
                      DOI
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="no-content-msg">No articles available in this volume.</p>
        )}
      </div>
    </main>
  );
};
