import { useEffect, useState } from "react";
import { http } from "../../api/http";
import { ImageCropModal } from "../../components/ImageCropModal";

const tabs = [
  "articles",
  "board-members",
  "current-issues",
  "archive-volumes",
  "videos",
  "ppts",
  "testimonials",
  "indexing-logos",
  "info-table"
];

const jsonList = (text) =>
  text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export const AdminContentPage = ({
  initialTab = "articles",
  showTabs = true,
  contentScope = "journal",
  title = "Manage content with precision",
  description = "Everything you need to run journals, articles, issues, archives, and media."
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [articleQuery, setArticleQuery] = useState("");
  const [articleJournalFilter, setArticleJournalFilter] = useState("");
  const [articleSort, setArticleSort] = useState("newest");
  const [selectedArticles, setSelectedArticles] = useState(() => new Set());
  const [allItems, setAllItems] = useState({
    articles: [],
    "board-members": [],
    "current-issues": [],
    "archive-volumes": [],
    videos: [],
    ppts: [],
    testimonials: [],
    "indexing-logos": []
  });

  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropType, setCropType] = useState(""); // "ppt-thumbnail" or "video-thumbnail"

  const [forms, setForms] = useState({
    article: {
      journal_id: "",
      type: "Research",
      title: "",
      authors: "",
      abstract: "",
      external_link: "",
      doi_link: "",
      file: null
    },
    boardMember: { journal_id: "", name: "", description: "", image: null },
    currentIssue: { journal_id: "", volume_title: "", article_ids: "" },
    archiveVolume: { journal_id: "", year: "", volume_title: "", article_ids: "" },
    video: { journal_id: "", title: "", youtube_url: "", thumbnail: null },
    ppt: { journal_id: "", title: "", file: null, thumbnail: null },
    testimonial: { name: "", description: "", image: null },
    indexingLogo: { journal_id: "", name: "", image: null }
  });

  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  const handleThumbnailPick = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    const nextSrc = URL.createObjectURL(file);
    setCropImageSrc(nextSrc);
    setCropType(type);
    event.target.value = "";
  };

  const handleCropClose = () => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc("");
  };

  const handleCropComplete = (file) => {
    if (cropType === "ppt-thumbnail") {
      setForm("ppt", { thumbnail: file });
    } else if (cropType === "video-thumbnail") {
      setForm("video", { thumbnail: file });
    }
    handleCropClose();
  };

  const isGlobalScope = contentScope === "global";

  const load = async () => {
    setError("");
    try {
      const [j, a, b, c, ar, v, p, t, i] = await Promise.all([
        http.get("/journals"),
        http.get("/content/articles"),
        http.get("/content/board-members"),
        http.get("/content/current-issues"),
        http.get("/content/archive-volumes"),
        http.get("/content/videos"),
        http.get("/content/ppts"),
        http.get("/content/testimonials"),
        http.get("/content/indexing-logos")
      ]);

      setJournals(j.data.journals || []);
      setAllItems({
        articles: a.data.articles || [],
        "board-members": b.data.members || [],
        "current-issues": c.data.issues || [],
        "archive-volumes": ar.data.volumes || [],
        videos: v.data.videos || [],
        ppts: p.data.ppts || [],
        testimonials: t.data.testimonials || [],
        "indexing-logos": i.data.indexingLogos || []
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load content");
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setSelectedArticles(new Set());
  }, [allItems.articles]);

  const handleActionError = (err, fallbackMessage) => {
    setError(err.response?.data?.message || fallbackMessage);
    if (err.response?.status === 401 || err.response?.status === 403) {
      setInfo("Admin login is required to create or update content.");
    }
  };

  const setForm = (key, patch) => {
    setForms((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const filteredArticles = allItems.articles
    .filter((item) => (articleJournalFilter ? item.journal_id === articleJournalFilter : true))
    .filter((item) => {
      const query = articleQuery.trim().toLowerCase();
      if (!query) return true;
      const haystack = `${item.title || ""} ${item.authors || ""} ${item.abstract || ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      if (articleSort === "title-asc") return (a.title || "").localeCompare(b.title || "");
      if (articleSort === "title-desc") return (b.title || "").localeCompare(a.title || "");
      const aDate = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const bDate = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return articleSort === "oldest" ? aDate - bDate : bDate - aDate;
    });

  const toggleArticleSelection = (id) => {
    setSelectedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllFilteredArticles = () => {
    if (selectedArticles.size === filteredArticles.length) {
      setSelectedArticles(new Set());
      return;
    }
    setSelectedArticles(new Set(filteredArticles.map((item) => item._id)));
  };

  const bulkDeleteArticles = async () => {
    if (!selectedArticles.size) return;
    const shouldDelete = window.confirm(`Delete ${selectedArticles.size} selected articles?`);
    if (!shouldDelete) return;
    try {
      setError("");
      setInfo("");
      await Promise.all(
        Array.from(selectedArticles).map((id) => http.delete(`/content/articles/${id}`))
      );
      await load();
      setSelectedArticles(new Set());
      setInfo("Articles deleted successfully.");
      window.alert("Articles deleted successfully.");
    } catch (err) {
      handleActionError(err, "Failed to delete selected articles");
      window.alert(err.response?.data?.message || "Failed to delete selected articles");
    }
  };

  const createArticle = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    Object.entries(forms.article).forEach(([k, v]) => {
      if (k === "file") return;
      data.append(k, v);
    });
    if (forms.article.file) data.append("file", forms.article.file);
    try {
      await http.post("/content/articles", data);
      await load();
      setInfo("Article created successfully.");
      window.alert("Article created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create article");
      window.alert(err.response?.data?.message || "Failed to create article");
    }
  };

  const updateArticle = async (item) => {
    const title = window.prompt("Update title", item.title);
    if (!title) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/articles/${item._id}`, { title });
      await load();
      setInfo("Article updated successfully.");
      window.alert("Article updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update article");
      window.alert(err.response?.data?.message || "Failed to update article");
    }
  };

  const createBoardMember = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("journal_id", forms.boardMember.journal_id);
    data.append("name", forms.boardMember.name);
    data.append("description", forms.boardMember.description);
    if (forms.boardMember.image) data.append("image", forms.boardMember.image);
    try {
      await http.post("/content/board-members", data);
      await load();
      setInfo("Board member created successfully.");
      window.alert("Board member created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create board member");
      window.alert(err.response?.data?.message || "Failed to create board member");
    }
  };

  const updateBoardMember = async (item) => {
    const name = window.prompt("Update name", item.name);
    if (!name) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/board-members/${item._id}`, { name });
      await load();
      setInfo("Board member updated successfully.");
      window.alert("Board member updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update board member");
      window.alert(err.response?.data?.message || "Failed to update board member");
    }
  };

  const createCurrentIssue = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await http.post("/content/current-issues", {
        journal_id: forms.currentIssue.journal_id,
        volume_title: forms.currentIssue.volume_title,
        article_ids: jsonList(forms.currentIssue.article_ids)
      });
      await load();
      setInfo("Current issue created successfully.");
      window.alert("Current issue created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create current issue");
      window.alert(err.response?.data?.message || "Failed to create current issue");
    }
  };

  const updateCurrentIssue = async (item) => {
    const volume_title = window.prompt("Update volume title", item.volume_title);
    if (!volume_title) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/current-issues/${item._id}`, { volume_title });
      await load();
      setInfo("Current issue updated successfully.");
      window.alert("Current issue updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update current issue");
      window.alert(err.response?.data?.message || "Failed to update current issue");
    }
  };

  const createArchiveVolume = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await http.post("/content/archive-volumes", {
        journal_id: forms.archiveVolume.journal_id,
        year: Number(forms.archiveVolume.year),
        volume_title: forms.archiveVolume.volume_title,
        article_ids: jsonList(forms.archiveVolume.article_ids)
      });
      await load();
      setInfo("Archive volume created successfully.");
      window.alert("Archive volume created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create archive volume");
      window.alert(err.response?.data?.message || "Failed to create archive volume");
    }
  };

  const updateArchiveVolume = async (item) => {
    const volume_title = window.prompt("Update volume title", item.volume_title);
    if (!volume_title) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/archive-volumes/${item._id}`, { volume_title });
      await load();
      setInfo("Archive volume updated successfully.");
      window.alert("Archive volume updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update archive volume");
      window.alert(err.response?.data?.message || "Failed to update archive volume");
    }
  };

  const createVideo = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    if (!isGlobalScope && forms.video.journal_id) {
      data.append("journal_id", forms.video.journal_id);
    }
    data.append("title", forms.video.title);
    data.append("youtube_url", forms.video.youtube_url);
    if (forms.video.thumbnail) {
      data.append("thumbnail", forms.video.thumbnail);
    }
    try {
      await http.post("/content/videos", data);
      await load();
      setForm("video", { title: "", youtube_url: "", thumbnail: null });
      setInfo("Video created successfully.");
      window.alert("Video created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create video");
      window.alert(err.response?.data?.message || "Failed to create video");
    }
  };

  const updateVideo = async (item) => {
    const title = window.prompt("Update title", item.title);
    if (!title) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/videos/${item._id}`, { title });
      await load();
      setInfo("Video updated successfully.");
      window.alert("Video updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update video");
      window.alert(err.response?.data?.message || "Failed to update video");
    }
  };

  const createPpt = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    if (!isGlobalScope && forms.ppt.journal_id) {
      data.append("journal_id", forms.ppt.journal_id);
    }
    data.append("title", forms.ppt.title);
    if (forms.ppt.file) data.append("file", forms.ppt.file);
    if (forms.ppt.thumbnail) data.append("thumbnail", forms.ppt.thumbnail);
    try {
      await http.post("/content/ppts", data);
      await load();
      setForm("ppt", { title: "", file: null, thumbnail: null });
      setInfo("PPT created successfully.");
      window.alert("PPT created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create PPT");
      window.alert(err.response?.data?.message || "Failed to create PPT");
    }
  };

  const updatePpt = async (item) => {
    const title = window.prompt("Update title", item.title);
    if (!title) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/ppts/${item._id}`, { title });
      await load();
      setInfo("PPT updated successfully.");
      window.alert("PPT updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update PPT");
      window.alert(err.response?.data?.message || "Failed to update PPT");
    }
  };

  const createTestimonial = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("name", forms.testimonial.name);
    data.append("description", forms.testimonial.description);
    if (forms.testimonial.image) data.append("image", forms.testimonial.image);
    try {
      await http.post("/content/testimonials", data);
      await load();
      setInfo("Testimonial created successfully.");
      window.alert("Testimonial created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create testimonial");
      window.alert(err.response?.data?.message || "Failed to create testimonial");
    }
  };

  const updateTestimonial = async (item) => {
    const name = window.prompt("Update name", item.name || "");
    if (name === null) return;
    const description = window.prompt("Update description", item.description || "");
    if (description === null) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/testimonials/${item._id}`, { name, description });
      await load();
      setInfo("Testimonial updated successfully.");
      window.alert("Testimonial updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update testimonial");
      window.alert(err.response?.data?.message || "Failed to update testimonial");
    }
  };

  const createIndexingLogo = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    if (!isGlobalScope && forms.indexingLogo.journal_id) {
      data.append("journal_id", forms.indexingLogo.journal_id);
    }
    if (forms.indexingLogo.image) data.append("image", forms.indexingLogo.image);
    try {
      await http.post("/content/indexing-logos", data);
      await load();
      setInfo("Indexing logo created successfully.");
      window.alert("Indexing logo created successfully.");
    } catch (err) {
      handleActionError(err, "Failed to create indexing logo");
      window.alert(err.response?.data?.message || "Failed to create indexing logo");
    }
  };

  const updateIndexingLogo = async (item) => {
    const name = window.prompt("Update name", item.name);
    if (!name) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/indexing-logos/${item._id}`, { name });
      await load();
      setInfo("Indexing logo updated successfully.");
      window.alert("Indexing logo updated successfully.");
    } catch (err) {
      handleActionError(err, "Failed to update indexing logo");
      window.alert(err.response?.data?.message || "Failed to update indexing logo");
    }
  };

  const remove = async (path, id) => {
    const itemName = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    const confirmed = window.confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      setError("");
      setInfo("");
      await http.delete(`/content/${path}/${id}`);
      await load();
      setInfo(`${itemName} deleted successfully.`);
      window.alert(`${itemName} deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete ${itemName}`);
      window.alert(err.response?.data?.message || `Failed to delete ${itemName}`);
    }
  };

  return (
    <main className="container admin-shell">
        <section className="form-card admin-hero">
        <div>
          <p className="admin-eyebrow">Content studio</p>
          <h1>{title}</h1>
          <p className="muted-line">{description}</p>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
        {showTabs ? (
          <div className="tab-row admin-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn ${activeTab === tab ? "active-tab" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {activeTab === "articles" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Articles</h2>
              <p className="muted-line">Search, filter, and update journal articles.</p>
            </div>
            <div className="panel-tools">
              <input
                type="search"
                placeholder="Search by title, author, abstract"
                value={articleQuery}
                onChange={(e) => setArticleQuery(e.target.value)}
              />
              <select value={articleJournalFilter} onChange={(e) => setArticleJournalFilter(e.target.value)}>
                <option value="">All journals</option>
                {journals.map((j) => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>
              <select value={articleSort} onChange={(e) => setArticleSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          </div>
          <div className="admin-split">
            <form className="form-grid" onSubmit={createArticle}>
            <select required value={forms.article.journal_id} onChange={(e) => setForm("article", { journal_id: e.target.value })}>
              <option value="">Select Journal</option>
              {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <input placeholder="Type" value={forms.article.type} onChange={(e) => setForm("article", { type: e.target.value })} />
            <input placeholder="Title" value={forms.article.title} onChange={(e) => setForm("article", { title: e.target.value })} required />
            <input placeholder="Authors" value={forms.article.authors} onChange={(e) => setForm("article", { authors: e.target.value })} required />
            <textarea placeholder="Abstract" value={forms.article.abstract} onChange={(e) => setForm("article", { abstract: e.target.value })} required />
            <input placeholder="External link" value={forms.article.external_link} onChange={(e) => setForm("article", { external_link: e.target.value })} />
            <input placeholder="DOI link" value={forms.article.doi_link} onChange={(e) => setForm("article", { doi_link: e.target.value })} />
            <input type="file" onChange={(e) => setForm("article", { file: e.target.files?.[0] || null })} />
            <button className="primary-btn" type="submit">Create Article</button>
          </form>
            <div className="table-shell compact">
              <div className="table-header">
                <label className="table-check">
                  <input
                    type="checkbox"
                    checked={filteredArticles.length > 0 && selectedArticles.size === filteredArticles.length}
                    onChange={toggleAllFilteredArticles}
                  />
                  Select all
                </label>
                <span>Title</span>
                <span>Actions</span>
              </div>
              {filteredArticles.map((item) => (
                <div className="table-row" key={item._id}>
                  <label className="table-check">
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(item._id)}
                      onChange={() => toggleArticleSelection(item._id)}
                    />
                  </label>
                  <div className="table-cell">
                    <strong>{item.title}</strong>
                    <p className="muted-line">{item.authors}</p>
                  </div>
                  <div className="table-cell table-actions">
                    <button type="button" onClick={() => updateArticle(item)}>Edit</button>
                    <button className="danger-btn" type="button" onClick={() => remove("articles", item._id)}>Delete</button>
                  </div>
                </div>
              ))}
              <div className="bulk-bar">
                <span>{selectedArticles.size} selected</span>
                <button type="button" className="danger-btn" onClick={bulkDeleteArticles} disabled={!selectedArticles.size}>
                  Delete selected
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "board-members" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Board Members</h2>
              <p className="muted-line">Maintain editorial board profiles across journals.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createBoardMember}>
            <select required value={forms.boardMember.journal_id} onChange={(e) => setForm("boardMember", { journal_id: e.target.value })}>
              <option value="">Select Journal</option>
              {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <input placeholder="Name" required value={forms.boardMember.name} onChange={(e) => setForm("boardMember", { name: e.target.value })} />
            <textarea placeholder="Description" value={forms.boardMember.description} onChange={(e) => setForm("boardMember", { description: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setForm("boardMember", { image: e.target.files?.[0] || null })} />
            <button className="primary-btn" type="submit">Create Board Member</button>
          </form>
          {allItems["board-members"].map((item) => (
            <div className="item-row" key={item._id}><span>{item.name}</span><div className="actions"><button type="button" onClick={() => updateBoardMember(item)}>Edit</button><button className="danger-btn" type="button" onClick={() => remove("board-members", item._id)}>Delete</button></div></div>
          ))}
        </section>
      ) : null}

      {activeTab === "current-issues" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Current Issues</h2>
              <p className="muted-line">Publish active issues with article bundles.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createCurrentIssue}>
            <select required value={forms.currentIssue.journal_id} onChange={(e) => setForm("currentIssue", { journal_id: e.target.value })}>
              <option value="">Select Journal</option>
              {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <input placeholder="Volume title" required value={forms.currentIssue.volume_title} onChange={(e) => setForm("currentIssue", { volume_title: e.target.value })} />
            <input placeholder="Article IDs (comma-separated)" value={forms.currentIssue.article_ids} onChange={(e) => setForm("currentIssue", { article_ids: e.target.value })} />
            <button className="primary-btn" type="submit">Create Current Issue</button>
          </form>
          {allItems["current-issues"].map((item) => (
            <div className="item-row" key={item._id}><span>{item.volume_title}</span><div className="actions"><button type="button" onClick={() => updateCurrentIssue(item)}>Edit</button><button className="danger-btn" type="button" onClick={() => remove("current-issues", item._id)}>Delete</button></div></div>
          ))}
        </section>
      ) : null}

      {activeTab === "archive-volumes" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Archive Volumes</h2>
              <p className="muted-line">Organize historical issues by year and volume.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createArchiveVolume}>
            <select required value={forms.archiveVolume.journal_id} onChange={(e) => setForm("archiveVolume", { journal_id: e.target.value })}>
              <option value="">Select Journal</option>
              {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <input placeholder="Year" type="number" required value={forms.archiveVolume.year} onChange={(e) => setForm("archiveVolume", { year: e.target.value })} />
            <input placeholder="Volume title" required value={forms.archiveVolume.volume_title} onChange={(e) => setForm("archiveVolume", { volume_title: e.target.value })} />
            <input placeholder="Article IDs (comma-separated)" value={forms.archiveVolume.article_ids} onChange={(e) => setForm("archiveVolume", { article_ids: e.target.value })} />
            <button className="primary-btn" type="submit">Create Archive Volume</button>
          </form>
          {allItems["archive-volumes"].map((item) => (
            <div className="item-row" key={item._id}><span>{item.year} - {item.volume_title}</span><div className="actions"><button type="button" onClick={() => updateArchiveVolume(item)}>Edit</button><button className="danger-btn" type="button" onClick={() => remove("archive-volumes", item._id)}>Delete</button></div></div>
          ))}
        </section>
      ) : null}

      {activeTab === "videos" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Videos</h2>
              <p className="muted-line">
                {isGlobalScope
                  ? "Manage global videos available from the public navigation."
                  : "Share recorded talks and interviews."}
              </p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createVideo}>
            {!isGlobalScope ? (
              <select required value={forms.video.journal_id} onChange={(e) => setForm("video", { journal_id: e.target.value })}>
                <option value="">Select Journal</option>
                {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            ) : null}
            <input placeholder="Title" required value={forms.video.title} onChange={(e) => setForm("video", { title: e.target.value })} />
            <input placeholder="YouTube URL" required value={forms.video.youtube_url} onChange={(e) => setForm("video", { youtube_url: e.target.value })} />
            <button className="primary-btn" type="submit">Create Video</button>
          </form>
          {(isGlobalScope ? allItems.videos.filter((item) => !item.journal_id) : allItems.videos).map((item) => (
            <div className="item-row" key={item._id}><span>{item.title}</span><div className="actions"><button type="button" onClick={() => updateVideo(item)}>Edit</button><button className="danger-btn" type="button" onClick={() => remove("videos", item._id)}>Delete</button></div></div>
          ))}
        </section>
      ) : null}

      {activeTab === "ppts" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>PPT / Slide Decks</h2>
              <p className="muted-line">
                {isGlobalScope
                  ? "Manage global slide decks available from the public navigation."
                  : "Manage decks linked to each journal."}
              </p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createPpt}>
            {!isGlobalScope ? (
              <select required value={forms.ppt.journal_id} onChange={(e) => setForm("ppt", { journal_id: e.target.value })}>
                <option value="">Select Journal</option>
                {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            ) : null}
            <input placeholder="Title" required value={forms.ppt.title} onChange={(e) => setForm("ppt", { title: e.target.value })} />
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              PPT / PDF File
              <input type="file" onChange={(e) => setForm("ppt", { file: e.target.files?.[0] || null })} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              Upload Cover / Thumbnail (16:9 ratio)
              <input type="file" accept="image/*" onChange={(e) => handleThumbnailPick(e, "ppt-thumbnail")} />
              {forms.ppt.thumbnail ? (
                <span className="muted-line" style={{ color: "green", fontSize: "0.85rem" }}>Cropped thumbnail ready to upload.</span>
              ) : null}
            </label>
            <button className="primary-btn" type="submit">Create PPT</button>
          </form>
          {(isGlobalScope ? allItems.ppts.filter((item) => !item.journal_id) : allItems.ppts).map((item) => (
            <div className="item-row" key={item._id}><span>{item.title}</span><div className="actions"><button type="button" onClick={() => updatePpt(item)}>Edit</button><button className="danger-btn" type="button" onClick={() => remove("ppts", item._id)}>Delete</button></div></div>
          ))}
        </section>
      ) : null}

      {activeTab === "testimonials" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Testimonials</h2>
              <p className="muted-line">Highlight partner and author feedback.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createTestimonial}>
            <input
              placeholder="Name"
              value={forms.testimonial.name}
              onChange={(e) => setForm("testimonial", { name: e.target.value })}
            />
            <textarea placeholder="Description" required value={forms.testimonial.description} onChange={(e) => setForm("testimonial", { description: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setForm("testimonial", { image: e.target.files?.[0] || null })} />
            <button className="primary-btn" type="submit">Create Testimonial</button>
          </form>
          {allItems.testimonials.map((item) => (
            <div className="item-row" key={item._id}>
              <span>{item.name ? `${item.name}: ` : ""}{item.description.slice(0, 70)}</span>
              <div className="actions">
                <button type="button" onClick={() => updateTestimonial(item)}>Edit</button>
                <button className="danger-btn" type="button" onClick={() => remove("testimonials", item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {activeTab === "indexing-logos" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h2>Indexing Logos</h2>
              <p className="muted-line">
                {isGlobalScope
                  ? "Manage global indexing logos available from the public navigation."
                  : "Track journal indexing partners."}
              </p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createIndexingLogo}>
            {!isGlobalScope ? (
              <select required value={forms.indexingLogo.journal_id} onChange={(e) => setForm("indexingLogo", { journal_id: e.target.value })}>
                <option value="">Select Journal</option>
                {journals.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            ) : null}
            <input placeholder="Name" value={forms.indexingLogo.name} onChange={(e) => setForm("indexingLogo", { name: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setForm("indexingLogo", { image: e.target.files?.[0] || null })} />
            <button className="primary-btn" type="submit">Create Indexing Logo</button>
          </form>
          {(isGlobalScope ? allItems["indexing-logos"].filter((item) => !item.journal_id) : allItems["indexing-logos"]).map((item) => (
            <div className="item-row" key={item._id}><span>{item.name}</span><div className="actions"><button type="button" onClick={() => updateIndexingLogo(item)}>Edit</button><button className="danger-btn" type="button" onClick={() => remove("indexing-logos", item._id)}>Delete</button></div></div>
          ))}
        </section>
      ) : null}

      {cropImageSrc ? (
        <ImageCropModal
          imageSrc={cropImageSrc}
          outputWidth={1600}
          outputHeight={900}
          title="Crop thumbnail (16:9)"
          onClose={handleCropClose}
          onComplete={handleCropComplete}
        />
      ) : null}
    </main>
  );
};
