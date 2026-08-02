import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { http } from "../../api/http";
import { toDriveViewerUrl } from "../../utils/driveViewer";
import { getPptCoverUrl, getYouTubeThumbnail } from "../../utils/thumbnailHelpers";
// import { InfoTable } from "../../../../server/src/models/InfoTable";

const cleanText = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const safeList = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const tabs = [
  { id: "about", path: "about", label: "About", icon: "fa-solid fa-info-circle" },
  { id: "aim", path: "aim-scope", label: "Aim & Scope", icon: "fa-solid fa-bullseye" },
  { id: "guidelines", path: "author-guidelines", label: "Author Guidelines", icon: "fa-solid fa-pen-fancy" },
  { id: "editorial", path: "editorial-board", label: "Editorial Board", icon: "fa-solid fa-users" },
  { id: "press", path: "article-in-press", label: "Articles In Press", icon: "fa-solid fa-file-lines" },
  { id: "current", path: "current-issue", label: "Current Issue", icon: "fa-solid fa-newspaper" },
  { id: "archive", path: "archive", label: "Archive", icon: "fa-solid fa-archive" },
  { id: "ppts", path: "ppts", label: "PPTs", icon: "fa-solid fa-file-powerpoint" },
  { id: "videos", path: "videos", label: "Videos", icon: "fa-solid fa-video" },
  { id: "indexing", path: "indexing", label: "Indexing", icon: "fa-solid fa-award" }

];

const sectionToTab = {
  about: "about",
  "aim-scope": "aim",
  "author-guidelines": "guidelines",
  "editorial-board": "editorial",
  "article-in-press": "press",
  "arcticle-in-press": "press",
  "current-issue": "current",
  archive: "archive",
  ppts: "ppts",
  videos: "videos",
  indexing: "indexing"
};

export const JournalDetailPage = () => {
  const { slug, section } = useParams();
  const activeTab = sectionToTab[section] || "about";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [journal, setJournal] = useState(null);
  const [infoTable, setInfoTable] = useState(null);
  const [content, setContent] = useState({
    articles: [],
    members: [],
    issues: [],
    volumes: [],
    videos: [],
    ppts: [],
    indexingLogos: []
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: journalData } = await http.get(`/journals/${slug}`);
        const selectedJournal = journalData.journal;
        const query = { params: { journal_id: selectedJournal._id } };

        const [articlesRes, membersRes, issuesRes, volumesRes, videosRes, pptsRes, logosRes, infoTableRes] =
          await Promise.all([
            http.get("/content/articles", query),
            http.get("/content/board-members", query),
            http.get("/content/current-issues", query),
            http.get("/content/archive-volumes", query),
            http.get("/content/videos", query),
            http.get("/content/ppts", query),
            http.get("/content/indexing-logos", query),
            http.get(`/content/info-table/${selectedJournal._id}`).catch(() => ({ data: { infoTable: null } }))
          ]);

        setJournal(selectedJournal);
        setInfoTable(infoTableRes.data?.infoTable || null);
        setContent({
          articles: articlesRes.data.articles || [],
          members: membersRes.data.members || [],
          issues: issuesRes.data.issues || [],
          volumes: volumesRes.data.volumes || [],
          videos: videosRes.data.videos || [],
          ppts: pptsRes.data.ppts || [],
          indexingLogos: logosRes.data.indexingLogos || []
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load journal content");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const articleCount = useMemo(() => content.articles.length, [content.articles.length]);
  const journalBasePath = `/journals/${slug}`;

  if (loading) {
    return (
      <main className="container">
        <div className="loading-spinner">
          <p>Loading journal content...</p>
        </div>
      </main>
    );
  }

  if (!journal) {
    return (
      <main className="container">
        <p className="error-message">{error || "Journal not found"}</p>
      </main>
    );
  }
  if (!infoTable) {
    return (
      <main className="journal-detail-page">
        <div className="content-header">
          <div className="header-top">
            <h1 className="journal-title">{journal.title}</h1>
          </div>
        </div>
        <aside className="journal-sidebar">
          {/* SIDEBAR */}
          <nav className="tab-navigation">
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={`${journalBasePath}/${tab.path}`}
                className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
                <i className="fa-solid fa-chevron-right"></i>
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="journal-layout">


          {/* MAIN CONTENT */}

          <div className="journal-tab-pane">
            {/* ABOUT TAB */}
            <div className={`tab-content ${activeTab === "about" ? "active" : ""}`} id="about">

              <div className="content-body">
                {/* Main About Section */}
                <section className="about-section">
                  <h1>About This Journal</h1>
                  <div className="about-text" dangerouslySetInnerHTML={{ __html: journal.about || "<p>Not available yet.</p>" }} />
                </section>

              </div>
            </div>

            {/* AIM & SCOPE TAB */}
            <div className={`tab-content ${activeTab === "aim" ? "active" : ""}`} id="aim">
              <div className="content-header">
                <h1>Aim & Scope</h1>
              </div>
              <div className="content-body">
                <div className="about-text" dangerouslySetInnerHTML={{ __html: journal.aim_scope || "<p>Not available yet.</p>" }} />
              </div>
            </div>

            {/* AUTHOR GUIDELNES TAB */}
            <div className={`tab-content ${activeTab === "guidelines" ? "active" : ""}`} id="guidelines">
              <div className="content-header">
                <h1>Author Guidelines</h1>
              </div>
              <div className="content-body">
                <div className="about-text" dangerouslySetInnerHTML={{ __html: journal.author_guidelines || "<p>Not available yet.</p>" }} />
              </div>
            </div>

            {/* EDITORIAL BOARD TAB */}
            <div className={`tab-content ${activeTab === "editorial" ? "active" : ""}`} id="editorial">
              <div className="content-header">
                <h1>Editorial Board</h1>
              </div>
              <div className="content-body">
                {content.members.length ? (
                  <div className="editorial-grid">
                    {safeList(content.members).map((member) => (
                      <div key={member._id} className="editor-card">
                        <div className="editor-image">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} />
                          ) : (
                            <div className="editor-placeholder">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                        <h3>{member.name}</h3>
                        <p>{member.description || "Profile coming soon."}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-content-msg">No editorial board members yet.</p>
                )}
              </div>
            </div>

            {/* ARTICLES IN PRESS TAB */}
            <div className={`tab-content ${activeTab === "press" ? "active" : ""}`} id="press">
              <div className="content-header">
                <h1>Articles In Press</h1>
              </div>
              <div className="content-body">
                {content.articles.length ? (
                  <div className="articles-list">
                    {safeList(content.articles).map((article) => (
                      <article key={article._id} className="article-item">
                        <p className="article-type">{article.type}</p>
                        <h3>{article.title}</h3>
                        <p className="article-authors">Authors: {article.authors}</p>

                        <div className="article-actions">
                          <Link to={`/article/${article._id}`} className="read-btn">
                            <i className="fa-solid fa-arrow-right"></i> Read More
                          </Link>
                          {article.pdf_url && (
                            <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="read-btn secondary">
                              <i className="fa-solid fa-file-pdf"></i> PDF
                            </a>
                          )}
                          {/* {article.doi_link && (
                            // <a href={article.doi_link} target="_blank" rel="noreferrer" className="read-btn secondary">
                            //   <i className="fa-solid fa-book"></i> DOI
                            // </a>
                            <p className="article-doi">DOI: <a href={article.doi_link} target="_blank" rel="noreferrer">{article.doi_link}</a></p>
                          )} */}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="no-content-msg">No articles in press yet.</p>
                )}
              </div>
            </div>

            {/* CURRENT ISSUE TAB */}
            <div className={`tab-content ${activeTab === "current" ? "active" : ""}`} id="current">
              <div className="content-header">
                <h1>Current Issue</h1>
              </div>
              <div className="content-body">
                {content.issues.length ? (
                  <div className="current-issues-container">
                    {safeList(content.issues).map((issue) => (
                      <div key={issue._id} className="current-issue-block">
                        {issue.volume_items?.length ? (
                          <div className="issue-volumes">
                            {safeList(issue.volume_items).map((volume) => (
                              <div key={volume._id} className="issue-volume-block">
                                <div className="issue-volume-heading">
                                  <span>{volume.year}</span>
                                  <h3>{volume.volume_title}</h3>
                                </div>
                                {volume.article_items?.length ? (
                                  <div className="issue-articles">
                                    {safeList(volume.article_items).map((article) => (
                                      <div key={article._id} className="issue-article-row">
                                        <Link to={`/article/${article._id}`}>
                                          <div className="article-info">
                                            <p className="article-row-type">{article.type}</p>
                                            <p className="article-row-title">{article.title}</p>
                                            <p className="article-row-authors">{article.authors}</p>

                                            {article.pdf_url && (
                                              <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="action-link" title="View PDF">
                                                <i className="fa-solid fa-file-pdf"></i> PDF
                                              </a>
                                            )}
                                          </div>
                                        </Link>
                                        <div className="article-row-actions">

                                          {article.doi_link && <p className="article-row-doi">DOI: <a href={article.doi_link} target="_blank" rel="noreferrer">{article.doi_link}</a></p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="no-articles-msg">No articles in this volume.</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : issue.article_items?.length ? (
                          <div className="issue-articles">
                            {safeList(issue.article_items).map((article) => (
                              <div key={article._id} className="issue-article-row">
                                <div className="article-info">
                                  <p className="article-row-type">{article.type}</p>
                                  <p className="article-row-title">{article.title}</p>
                                  <p className="article-row-authors">{article.authors}</p>
                                  {article.doi_link && <p className="article-row-doi">DOI: {article.doi_link}</p>}
                                </div>
                                <div className="article-row-actions">
                                  {article.pdf_url && (
                                    <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="action-link" title="View PDF">
                                      <i className="fa-solid fa-file-pdf"></i> PDF
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-articles-msg">No articles in this issue.</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-content-msg">No current issues published yet.</p>
                )}
              </div>
            </div>

            {/* ARCHIVE TAB */}
            <div className={`tab-content ${activeTab === "archive" ? "active" : ""}`} id="archive">
              <div className="content-header">
                <h1>Archive</h1>
              </div>
              <div className="content-body">
                {content.volumes.length ? (
                  <div className="archive-container">
                    {Object.entries(
                      content.volumes.reduce((acc, volume) => {
                        if (!acc[volume.year]) acc[volume.year] = [];
                        acc[volume.year].push(volume);
                        return acc;
                      }, {})
                    )
                      .sort(([yearA], [yearB]) => yearB - yearA)
                      .map(([year, volumes]) => (
                        <div key={year} className="archive-year-section">
                          <div className="year-header">{year}</div>
                          <div className="volumes-list">
                            {safeList(volumes).map((volume) => (
                              <Link
                                key={volume._id}
                                to={`/journals/${slug}/archive/${volume._id}`}
                                className="volume-item volume-link"
                              >
                                <h4>{volume.volume_title}</h4>
                                <p className="volume-articles">{volume.article_items?.length || 0} articles</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="no-content-msg">No archive volume yet.</p>
                )}
              </div>
            </div>

            {/* PPTS TAB */}
            <div className={`tab-content ${activeTab === "ppts" ? "active" : ""}`} id="ppts">
              <div className="content-header">
                <h1>Presentations</h1>
              </div>
              <div className="content-body">
                {content.ppts.length ? (
                  <div className="ppt-grid">
                    {safeList(content.ppts).map((ppt) => (
                      <a
                        key={ppt._id}
                        href={toDriveViewerUrl(ppt.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="ppt-card"

                      >
                        <div className="ppt-cover">
                          {ppt.thumbnail_url ? (
                            <img
                              src={ppt.thumbnail_url}
                              alt={ppt.title}
                              className="cover-img"
                            />
                          ) : getPptCoverUrl(ppt.file_url) ? (
                            <img
                              src={getPptCoverUrl(ppt.file_url)}
                              alt={ppt.title}
                              className="cover-img"
                            />
                          ) : (
                            <div className="ppt-placeholder">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                        <h3>{ppt.title}</h3>
                        <span className="inline-link">Open</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="no-content-msg">No PPTs available yet.</p>
                )}
              </div>
            </div>

            {/* VIDEOS TAB */}
            <div className={`tab-content ${activeTab === "videos" ? "active" : ""}`} id="videos">
              <div className="content-header">
                <h1>Videos</h1>
              </div>
              <div className="content-body">
                {content.videos.length ? (
                  <div className="video-grid">
                    {safeList(content.videos).map((video) => (
                      <a
                        key={video._id}
                        href={video.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="video-card"

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
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
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
                ) : (
                  <p className="no-content-msg">No videos available yet.</p>
                )}
              </div>
            </div>

            {/* INDEXING TAB */}
            <div className={`tab-content ${activeTab === "indexing" ? "active" : ""}`} id="indexing">
              <div className="content-header">
                <h1>Indexing</h1>
              </div>
              <div className="content-body">
                {content.indexingLogos.length ? (
                  <div className="indexing-grid">
                    {safeList(content.indexingLogos).map((logo) => (
                      <div key={logo._id} className="indexing-item">
                        <img src={logo.image_url} alt={logo.name} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-content-msg">No indexing logos yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR WITH INFO TABLE */}


        </div>

      </main>
    );
  }


  return (

    <main className="journal-detail-page">
      <div className="content-header">
        <div className="header-top">
          <h1 className="journal-title">{journal.title}</h1>
        </div>
      </div>
      <aside className="journal-sidebar">
        {/* SIDEBAR */}
        <nav className="tab-navigation">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={`${journalBasePath}/${tab.path}`}
              className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="journal-layout">


        {/* MAIN CONTENT */}

        <div className="journal-tab-pane">
          {/* ABOUT TAB */}
          <div className={`tab-content ${activeTab === "about" ? "active" : ""}`} id="about">

            <div className="content-body">
              {/* Main About Section */}
              <section className="about-section">
                <h1>About This Journal</h1>
                <div className="about-text" dangerouslySetInnerHTML={{ __html: journal.about || "<p>Not available yet.</p>" }} />
              </section>

            </div>
          </div>

          {/* AIM & SCOPE TAB */}
          <div className={`tab-content ${activeTab === "aim" ? "active" : ""}`} id="aim">
            <div className="content-header">
              <h1>Aim & Scope</h1>
            </div>
            <div className="content-body">
              <div className="about-text" dangerouslySetInnerHTML={{ __html: journal.aim_scope || "<p>Not available yet.</p>" }} />
            </div>
          </div>

          {/* AUTHOR GUIDELNES TAB */}
          <div className={`tab-content ${activeTab === "guidelines" ? "active" : ""}`} id="guidelines">
            <div className="content-header">
              <h1>Author Guidelines</h1>
            </div>
            <div className="content-body">
              <div className="about-text" dangerouslySetInnerHTML={{ __html: journal.author_guidelines || "<p>Not available yet.</p>" }} />
            </div>
          </div>

          {/* EDITORIAL BOARD TAB */}
          <div className={`tab-content ${activeTab === "editorial" ? "active" : ""}`} id="editorial">
            <div className="content-header">
              <h1>Editorial Board</h1>
            </div>
            <div className="content-body">
              {content.members.length ? (
                <div className="editorial-grid">
                  {safeList(content.members).map((member) => (
                    <div key={member._id} className="editor-card">
                      <div className="editor-image">
                        {member.image_url ? (
                          <img src={member.image_url} alt={member.name} />
                        ) : (
                          <div className="editor-placeholder">
                            <i className="fa-solid fa-user"></i>
                          </div>
                        )}
                      </div>
                      <h3>{member.name}</h3>
                      <p>{member.description || "Profile coming soon."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content-msg">No editorial board members yet.</p>
              )}
            </div>
          </div>

          {/* ARTICLES IN PRESS TAB */}
          <div className={`tab-content ${activeTab === "press" ? "active" : ""}`} id="press">
            <div className="content-header">
              <h1>Articles In Press</h1>
            </div>
            <div className="content-body">
              {content.articles.length ? (
                <div className="articles-list">
                  {safeList(content.articles).map((article) => (
                    <article key={article._id} className="article-item">
                      <p className="article-type">{article.type}</p>
                      <h3>{article.title}</h3>
                      <p className="article-authors">Authors: {article.authors}</p>

                      <div className="article-actions">
                        <Link to={`/article/${article._id}`} className="read-btn">
                          <i className="fa-solid fa-arrow-right"></i> Read More
                        </Link>
                        {article.pdf_url && (
                          <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="read-btn secondary">
                            <i className="fa-solid fa-file-pdf"></i> PDF
                          </a>
                        )}
                        {/* {article.doi_link && (
                            // <a href={article.doi_link} target="_blank" rel="noreferrer" className="read-btn secondary">
                            //   <i className="fa-solid fa-book"></i> DOI
                            // </a>
                            <p className="article-doi">DOI: <a href={article.doi_link} target="_blank" rel="noreferrer">{article.doi_link}</a></p>
                          )} */}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="no-content-msg">No articles in press yet.</p>
              )}
            </div>
          </div>

          {/* CURRENT ISSUE TAB */}
          <div className={`tab-content ${activeTab === "current" ? "active" : ""}`} id="current">
            <div className="content-header">
              <h1>Current Issue</h1>
            </div>
            <div className="content-body">
              {content.issues.length ? (
                <div className="current-issues-container">
                  {safeList(content.issues).map((issue) => (
                    <div key={issue._id} className="current-issue-block">
                      {issue.volume_items?.length ? (
                        <div className="issue-volumes">
                          {safeList(issue.volume_items).map((volume) => (
                            <div key={volume._id} className="issue-volume-block">
                              <div className="issue-volume-heading">
                                <span>{volume.year}</span>
                                <h3>{volume.volume_title}</h3>
                              </div>
                              {volume.article_items?.length ? (
                                <div className="issue-articles">
                                  {safeList(volume.article_items).map((article) => (
                                    <div key={article._id} className="issue-article-row">
                                      <Link to={`/article/${article._id}`}>
                                        <div className="article-info">
                                          <p className="article-row-type">{article.type}</p>
                                          <p className="article-row-title">{article.title}</p>
                                          <p className="article-row-authors">{article.authors}</p>

                                          {article.pdf_url && (
                                            <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="action-link" title="View PDF">
                                              <i className="fa-solid fa-file-pdf"></i> PDF
                                            </a>
                                          )}
                                        </div>
                                      </Link>
                                      <div className="article-row-actions">

                                        {article.doi_link && <p className="article-row-doi">DOI: <a href={article.doi_link} target="_blank" rel="noreferrer">{article.doi_link}</a></p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="no-articles-msg">No articles in this volume.</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : issue.article_items?.length ? (
                        <div className="issue-articles">
                          {safeList(issue.article_items).map((article) => (
                            <div key={article._id} className="issue-article-row">
                              <div className="article-info">
                                <p className="article-row-type">{article.type}</p>
                                <p className="article-row-title">{article.title}</p>
                                <p className="article-row-authors">{article.authors}</p>
                                {article.doi_link && <p className="article-row-doi">DOI: {article.doi_link}</p>}
                              </div>
                              <div className="article-row-actions">
                                {article.pdf_url && (
                                  <a href={toDriveViewerUrl(article.pdf_url)} target="_blank" rel="noreferrer" className="action-link" title="View PDF">
                                    <i className="fa-solid fa-file-pdf"></i> PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-articles-msg">No articles in this issue.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content-msg">No current issues published yet.</p>
              )}
            </div>
          </div>

          {/* ARCHIVE TAB */}
          <div className={`tab-content ${activeTab === "archive" ? "active" : ""}`} id="archive">
            <div className="content-header">
              <h1>Archive</h1>
            </div>
            <div className="content-body">
              {content.volumes.length ? (
                <div className="archive-container">
                  {Object.entries(
                    content.volumes.reduce((acc, volume) => {
                      if (!acc[volume.year]) acc[volume.year] = [];
                      acc[volume.year].push(volume);
                      return acc;
                    }, {})
                  )
                    .sort(([yearA], [yearB]) => yearB - yearA)
                    .map(([year, volumes]) => (
                      <div key={year} className="archive-year-section">
                        <div className="year-header">{year}</div>
                        <div className="volumes-list">
                          {safeList(volumes).map((volume) => (
                            <Link
                              key={volume._id}
                              to={`/journals/${slug}/archive/${volume._id}`}
                              className="volume-item volume-link"
                            >
                              <h4>{volume.volume_title}</h4>
                              <p className="volume-articles">{volume.article_items?.length || 0} articles</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-content-msg">No archive volume yet.</p>
              )}
            </div>
          </div>

          {/* PPTS TAB */}
          <div className={`tab-content ${activeTab === "ppts" ? "active" : ""}`} id="ppts">
            <div className="content-header">
              <h1>Presentations</h1>
            </div>
            <div className="content-body">
              {content.ppts.length ? (
                <div className="ppt-grid">
                  {safeList(content.ppts).map((ppt) => (
                    <a
                      key={ppt._id}
                      href={toDriveViewerUrl(ppt.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="ppt-card"

                    >
                      <div className="ppt-cover">
                        {ppt.thumbnail_url ? (
                          <img
                            src={ppt.thumbnail_url}
                            alt={ppt.title}
                            className="cover-img"
                          />
                        ) : getPptCoverUrl(ppt.file_url) ? (
                          <img
                            src={getPptCoverUrl(ppt.file_url)}
                            alt={ppt.title}
                            className="cover-img"
                          />
                        ) : (
                          <div className="ppt-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3>{ppt.title}</h3>
                      <span className="inline-link">Open</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="no-content-msg">No PPTs available yet.</p>
              )}
            </div>
          </div>

          {/* VIDEOS TAB */}
          <div className={`tab-content ${activeTab === "videos" ? "active" : ""}`} id="videos">
            <div className="content-header">
              <h1>Videos</h1>
            </div>
            <div className="content-body">
              {content.videos.length ? (
                <div className="video-grid">
                  {safeList(content.videos).map((video) => (
                    <a
                      key={video._id}
                      href={video.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="video-card"

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
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
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
              ) : (
                <p className="no-content-msg">No videos available yet.</p>
              )}
            </div>
          </div>

          {/* INDEXING TAB */}
          <div className={`tab-content ${activeTab === "indexing" ? "active" : ""}`} id="indexing">
            <div className="content-header">
              <h1>Indexing</h1>
            </div>
            <div className="content-body">
              {content.indexingLogos.length ? (
                <div className="indexing-grid">
                  {safeList(content.indexingLogos).map((logo) => (
                    <div key={logo._id} className="indexing-item">
                      <img src={logo.image_url} alt={logo.name} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content-msg">No indexing logos yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR WITH INFO TABLE */}
        <aside className="journal-info-sidebar">
          <div className="branding-logos">
            <img src={infoTable.left_logo_url || "https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Scholar_logo.svg"} alt="Left Indexing Logo" className="scholar-logo" style={{ maxHeight: "50px", objectFit: "contain" }} />
            <img src={infoTable.right_logo_url || "https://upload.wikimedia.org/wikipedia/commons/b/bc/ResearchGate_logo.svg"} alt="Right Indexing Logo" className="researchgate-logo" style={{ maxHeight: "50px", objectFit: "contain" }} />
          </div>
          <table className="info-table-element">
            <tbody>
              <tr>
                <td>Journal Name</td>
                <td>{journal.title}</td>
              </tr>
              {infoTable.abbrevation && (
                <tr>
                  <td>Abbreviation</td>
                  <td>{infoTable.abbrevation}</td>
                </tr>
              )}
              {infoTable.issn && (
                <tr>
                  <td>ISSN</td>
                  <td>{infoTable.issn}</td>
                </tr>
              )}
              {infoTable.editor_in_chief && (
                <tr>
                  <td>Editor-in-Chief</td>
                  <td>{infoTable.editor_in_chief}</td>
                </tr>
              )}
              {infoTable.publishing_frequency && (
                <tr>
                  <td>Publishing Frequency</td>
                  <td>{infoTable.publishing_frequency}</td>
                </tr>
              )}
              {infoTable.impact_factor && (
                <tr>
                  <td>Impact Factor</td>
                  <td>{infoTable.impact_factor}</td>
                </tr>
              )}
              {infoTable.publication_type && (
                <tr>
                  <td>Publication Type</td>
                  <td>{infoTable.publication_type}</td>
                </tr>
              )}
              {infoTable.publishing_model && (
                <tr>
                  <td>Publishing Model</td>
                  <td>{infoTable.publishing_model}</td>
                </tr>
              )}
              {infoTable.journal_category && (
                <tr>
                  <td>Journal Category</td>
                  <td>{infoTable.journal_category}</td>
                </tr>
              )}
              {infoTable.email && (
                <tr>
                  <td>Email</td>
                  <td style={{ wordBreak: "break-all" }}>
                    <a href={`mailto:${infoTable.email}`} className="email-link">{infoTable.email}</a>
                  </td>
                </tr>
              )}
              {infoTable.alternate_email && (
                <tr>
                  <td>Alternate Email</td>
                  <td style={{ wordBreak: "break-all" }}>
                    <a href={`mailto:${infoTable.alternate_email}`} className="email-link">{infoTable.alternate_email}</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </aside>


      </div>

    </main>

  );


};
