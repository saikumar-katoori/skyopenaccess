import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { toDriveViewerUrl } from "../../utils/driveViewer";

const cleanText = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export const ArticleDetailPage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get(`/content/articles/${articleId}`);
        setArticle(data.article);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [articleId]);

  if (loading) {
    return (
      <main className="container">
        <div className="loading-spinner">
          <p>Loading article...</p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="container">
        <p className="error-message">{error || "Article not found"}</p>
        <button className="primary-btn" onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>
          Go Back
        </button>
      </main>
    );
  }

  return (
    <main className="article-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-chevron-left"></i> Back
      </button>

      <article className="article-detail">
        <div className="article-header">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <p className="article-authors">
              <strong>Authors:</strong> {article.authors}
            </p>
            <p className="article-type-badge">{article.type}</p>
          </div>
        </div>

        <div className="article-content">
          <section className="abstract-section">
            <h2>Abstract</h2>
            <p className="abstract-text">{cleanText(article.abstract)}</p>
          </section>

          <section className="article-actions-section">
            <div className="action-buttons">
              {article.pdf_url && (
                <a
                  href={toDriveViewerUrl(article.pdf_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn primary"
                >
                  <i className="fa-solid fa-file-pdf"></i> View Full PDF
                </a>
              )}
              {article.external_link && (
                <a
                  href={article.external_link}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn secondary"
                >
                  <i className="fa-solid fa-link"></i> View Article
                </a>
              )}
              {article.doi_link && (
                <a
                  href={article.doi_link}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn secondary"
                >
                  <i className="fa-solid fa-book"></i> DOI Link
                </a>
              )}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};
