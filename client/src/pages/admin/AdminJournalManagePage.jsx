import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ImageCropModal } from "../../components/ImageCropModal";
import { RichTextEditor } from "../../components/RichTextEditor";
import { http } from "../../api/http";

const tabs = [
  { key: "details", label: "Details" },
  { key: "info-table", label: "Info Table" },
  { key: "editorial-board", label: "Editorial Board" },
  { key: "articles-in-press", label: "Articles In Press" },
  { key: "current-issue", label: "Current Issue" },
  { key: "archive", label: "Archive" },
  { key: "ppts", label: "PPTs" },
  { key: "videos", label: "Videos" },
  { key: "indexing", label: "Indexing" }
];

const jsonList = (text) =>
  text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export const AdminJournalManagePage = () => {
  const { journalId } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [journal, setJournal] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [archiveYears, setArchiveYears] = useState({});
  const [editJournalForm, setEditJournalForm] = useState({
    title: "",
    about: "",
    aim_scope: "",
    author_guidelines: "",
    cover: null
  });
  const [infoTableForm, setInfoTableForm] = useState({
    abbrevation: "",
    issn: "",
    editor_in_chief: "",
    publishing_frequency: "",
    impact_factor: "",
    publication_type: "",
    publishing_model: "",
    journal_category: "",
    email: "",
    alternate_email: ""
  });
  const [leftLogoFile, setLeftLogoFile] = useState(null);
  const [rightLogoFile, setRightLogoFile] = useState(null);
  const [leftLogoPreview, setLeftLogoPreview] = useState("");
  const [rightLogoPreview, setRightLogoPreview] = useState("");
  const [hasInfoTable, setHasInfoTable] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropType, setCropType] = useState(""); // "journal-cover", "ppt-thumbnail", or "video-thumbnail"
  const [articleForm, setArticleForm] = useState({
    type: "Research",
    title: "",
    authors: "",
    abstract: "",
    external_link: "",
    doi_link: "",
    file: null
  });
  const articleFileRef = useRef(null);

  const [forms, setForms] = useState({
    article: {
      type: "Research",
      title: "",
      authors: "",
      abstract: "",
      external_link: "",
      doi_link: "",
      file: null
    },
    boardMember: { name: "", description: "", image: null },
    currentIssue: { volume_title: "", article_ids: [] },
    archiveVolume: { year: "", volume_title: "", article_ids: [] },
    video: { title: "", youtube_url: "", thumbnail: null },
    ppt: { title: "", file: null, thumbnail: null },
    indexingLogo: { name: "", image: null }
  });
  const [allItems, setAllItems] = useState({
    articles: [],
    articlesInPress: [],
    boardMembers: [],
    currentIssues: [],
    archiveVolumes: [],
    videos: [],
    ppts: [],
    indexingLogos: []
  });

  const setForm = (key, patch) => {
    setForms((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const load = async () => {
    setError("");
    try {
      const [journalRes, articlesRes, inPressRes, boardRes, issuesRes, archiveRes, videosRes, pptsRes, indexingRes] =
        await Promise.all([
          http.get("/journals"),
          http.get("/content/articles", { params: { journal_id: journalId } }),
          http.get("/content/articles-in-press", { params: { journal_id: journalId } }),
          http.get("/content/board-members", { params: { journal_id: journalId } }),
          http.get("/content/current-issues", { params: { journal_id: journalId } }),
          http.get("/content/archive-volumes", { params: { journal_id: journalId, include_unassigned: "true" } }),
          http.get("/content/videos", { params: { journal_id: journalId } }),
          http.get("/content/ppts", { params: { journal_id: journalId } }),
          http.get("/content/indexing-logos", { params: { journal_id: journalId } })
        ]);

      const journals = journalRes.data.journals || [];
      const found = journals.find((item) => item._id === journalId) || null;
      setJournal(found);
      setEditJournalForm({
        title: found?.title || "",
        about: found?.about || "",
        aim_scope: found?.aim_scope || "",
        author_guidelines: found?.author_guidelines || "",
        cover: null
      });
      setAllItems({
        articles: articlesRes.data.articles || [],
        articlesInPress: inPressRes.data.articles || [],
        boardMembers: boardRes.data.members || [],
        currentIssues: issuesRes.data.issues || [],
        archiveVolumes: archiveRes.data.volumes || [],
        videos: videosRes.data.videos || [],
        ppts: pptsRes.data.ppts || [],
        indexingLogos: indexingRes.data.indexingLogos || []
      });
      setArchiveYears(Object.fromEntries((archiveRes.data.volumes || []).map((volume) => [volume._id, volume.year || ""])));

      try {
        const infoRes = await http.get(`/content/info-table/${journalId}`);
        if (infoRes.data?.infoTable) {
          const it = infoRes.data.infoTable;
          setInfoTableForm({
            abbrevation: it.abbrevation || "",
            issn: it.issn || "",
            editor_in_chief: it.editor_in_chief || "",
            publishing_frequency: it.publishing_frequency || "",
            impact_factor: it.impact_factor || "",
            publication_type: it.publication_type || "",
            publishing_model: it.publishing_model || "",
            journal_category: it.journal_category || "",
            email: it.email || "",
            alternate_email: it.alternate_email || ""
          });
          setLeftLogoPreview(it.left_logo_url || "");
          setRightLogoPreview(it.right_logo_url || "");
          setHasInfoTable(true);
        }
      } catch {
        setInfoTableForm({
          abbrevation: "",
          issn: "",
          editor_in_chief: "",
          publishing_frequency: "",
          impact_factor: "",
          publication_type: "",
          publishing_model: "",
          journal_category: "",
          email: "",
          alternate_email: ""
        });
        setLeftLogoFile(null);
        setRightLogoFile(null);
        setLeftLogoPreview("");
        setRightLogoPreview("");
        setHasInfoTable(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load journal data");
      if (err.response?.status === 401 || err.response?.status === 403) {
        setInfo("Admin login is required. Please login again and retry.");
      }
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [journalId]);

  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  const handleCropPick = (event, type) => {
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
    if (cropType === "journal-cover") {
      setEditJournalForm((prev) => ({ ...prev, cover: file }));
    } else if (cropType === "ppt-thumbnail") {
      setForm("ppt", { thumbnail: file });
    } else if (cropType === "video-thumbnail") {
      setForm("video", { thumbnail: file });
    }
    handleCropClose();
  };

  const handleSubmitInfoTable = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const data = new FormData();
      data.append("journal_id", journalId);
      Object.entries(infoTableForm).forEach(([key, val]) => {
        data.append(key, val);
      });
      if (leftLogoFile) {
        data.append("left_logo", leftLogoFile);
      }
      if (rightLogoFile) {
        data.append("right_logo", rightLogoFile);
      }
      await http.post("/content/info-table", data);
      await load();
      setHasInfoTable(true);
      setInfo("Info Table updated successfully.");
      window.alert("Info Table updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save Info Table");
      window.alert(err.response?.data?.message || "Failed to save Info Table");
    }
  };

  const handleDeleteInfoTable = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this Info Table? This action cannot be undone.");
    if (!confirmed) return;
    try {
      setError("");
      setInfo("");
      await http.delete(`/content/info-table/${journalId}`);
      setInfoTableForm({
        abbrevation: "",
        issn: "",
        editor_in_chief: "",
        publishing_frequency: "",
        impact_factor: "",
        publication_type: "",
        publishing_model: "",
        journal_category: "",
        email: "",
        alternate_email: ""
      });
      setLeftLogoFile(null);
      setRightLogoFile(null);
      setLeftLogoPreview("");
      setRightLogoPreview("");
      setHasInfoTable(false);
      setInfo("Info Table deleted successfully.");
      window.alert("Info Table deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete Info Table");
      window.alert(err.response?.data?.message || "Failed to delete Info Table");
    }
  };

  const updateJournal = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const data = new FormData();
    data.append("title", editJournalForm.title);
    data.append("about", editJournalForm.about);
    data.append("aim_scope", editJournalForm.aim_scope);
    data.append("author_guidelines", editJournalForm.author_guidelines);
    if (editJournalForm.cover) data.append("cover", editJournalForm.cover);

    try {
      const { data: response } = await http.put(`/journals/${journalId}`, data);
      setJournal(response.journal);
      setEditJournalForm((prev) => ({ ...prev, cover: null }));
      setInfo("Journal updated successfully.");
      window.alert("Journal updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update journal");
      window.alert(err.response?.data?.message || "Failed to update journal");
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
    data.append("journal_id", journalId);
    if (forms.article.file) data.append("file", forms.article.file);
    try {
      await http.post("/content/articles", data);
      await load();
      setForm("article", {
        type: "Research",
        title: "",
        authors: "",
        abstract: "",
        external_link: "",
        doi_link: "",
        file: null
      });
      articleFileRef.current.value = "";
      setInfo("Article created successfully.");
      window.alert("Article created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create article");
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
      setError(err.response?.data?.message || "Failed to update article");
      window.alert(err.response?.data?.message || "Failed to update article");
    }
  };

  const createBoardMember = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("journal_id", journalId);
    data.append("name", forms.boardMember.name);
    data.append("description", forms.boardMember.description);
    if (forms.boardMember.image) data.append("image", forms.boardMember.image);
    try {
      await http.post("/content/board-members", data);
      await load();
      setInfo("Board member created successfully.");
      window.alert("Board member created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create board member");
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
      setError(err.response?.data?.message || "Failed to update board member");
      window.alert(err.response?.data?.message || "Failed to update board member");
    }
  };

  const createCurrentIssue = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await http.post("/content/current-issues", {
        journal_id: journalId,
        volume_title: forms.currentIssue.volume_title,
        article_ids: forms.currentIssue.article_ids,
        year: new Date().getFullYear()
      });
      await load();
      setForm("currentIssue", { volume_title: "", article_ids: [] });
      setInfo("Current issue created successfully.");
      window.alert("Current issue created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create current issue");
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
      setError(err.response?.data?.message || "Failed to update current issue");
      window.alert(err.response?.data?.message || "Failed to update current issue");
    }
  };

  const createArchiveVolume = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await http.post("/content/archive-volumes", {
        journal_id: journalId,
        year: Number(forms.archiveVolume.year),
        volume_title: forms.archiveVolume.volume_title,
        article_ids: forms.archiveVolume.article_ids
      });
      await load();
      setForm("archiveVolume", { year: "", volume_title: "", article_ids: [] });
      setInfo("Archive volume created successfully.");
      window.alert("Archive volume created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create archive volume");
      window.alert(err.response?.data?.message || "Failed to create archive volume");
    }
  };

  const updateArchiveVolume = async (item) => {
    const year = archiveYears[item._id];
    if (!year) return;
    try {
      setError("");
      setInfo("");
      await http.put(`/content/archive-volumes/${item._id}`, { year: Number(year) });
      await load();
      setInfo("Archive year updated successfully.");
      window.alert("Archive year updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update archive year");
      window.alert(err.response?.data?.message || "Failed to update archive year");
    }
  };

  const createVideo = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("journal_id", journalId);
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
      setError(err.response?.data?.message || "Failed to create video");
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
      setError(err.response?.data?.message || "Failed to update video");
      window.alert(err.response?.data?.message || "Failed to update video");
    }
  };

  const createPpt = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("journal_id", journalId);
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
      setError(err.response?.data?.message || "Failed to create PPT");
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
      setError(err.response?.data?.message || "Failed to update PPT");
      window.alert(err.response?.data?.message || "Failed to update PPT");
    }
  };

  const createIndexingLogo = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("journal_id", journalId);
    data.append("name", forms.indexingLogo.name);
    if (forms.indexingLogo.image) data.append("image", forms.indexingLogo.image);
    try {
      await http.post("/content/indexing-logos", data);
      await load();
      setInfo("Indexing logo created successfully.");
      window.alert("Indexing logo created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create indexing logo");
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
      setError(err.response?.data?.message || "Failed to update indexing logo");
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
      <section className="form-card admin-page-hero">
        <h2>Manage: {journal?.title || "Journal"}</h2>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
        <div className="tab-row admin-tabs journal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-btn ${activeTab === tab.key ? "active-tab" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "details" ? (
        <section className="form-card admin-panel">
          <h3>Journal Details</h3>
          <form onSubmit={updateJournal} className="form-grid">
            <label>
              Title
              <input
                required
                value={editJournalForm.title}
                onChange={(e) => setEditJournalForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </label>
            <label>
              About This Journal
              <RichTextEditor
                value={editJournalForm.about}
                onChange={(value) => setEditJournalForm((prev) => ({ ...prev, about: value }))}
                placeholder="Write journal about section..."
              />
            </label>
            <label>
              Aim and Scope
              <RichTextEditor
                value={editJournalForm.aim_scope}
                onChange={(value) => setEditJournalForm((prev) => ({ ...prev, aim_scope: value }))}
                placeholder="Write aim and scope..."
              />
            </label>
            <label>
              Author Guidelines
              <RichTextEditor
                value={editJournalForm.author_guidelines}
                onChange={(value) =>
                  setEditJournalForm((prev) => ({ ...prev, author_guidelines: value }))
                }
                placeholder="Write author guidelines..."
              />
            </label>
            <label>
              Replace Cover (1024x1536)
              <input type="file" accept="image/*" onChange={(e) => handleCropPick(e, "journal-cover")} />
              {editJournalForm.cover ? (
                <span className="muted-line">Cropped image ready to upload.</span>
              ) : null}
            </label>
            <button className="primary-btn" type="submit">
              Update Journal
            </button>
          </form>
        </section>
      ) : null}

      {activeTab === "info-table" ? (
        <section className="form-card admin-panel">
          <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>Journal Info Table</h3>
              <p className="muted-line">Manage the journal's metadata shown on the public sidebar.</p>
            </div>
            {hasInfoTable && (
              <button className="danger-btn" type="button" onClick={handleDeleteInfoTable}>
                Delete Info Table
              </button>
            )}
          </div>
          <form onSubmit={handleSubmitInfoTable} className="form-grid" style={{ marginTop: "1rem" }}>
            <label>
              Abbreviation *
              <input
                required
                placeholder="e.g. JCNR"
                value={infoTableForm.abbrevation}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, abbrevation: e.target.value }))}
              />
            </label>
            <label>
              ISSN *
              <input
                required
                placeholder="e.g. 3065-3630"
                value={infoTableForm.issn}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, issn: e.target.value }))}
              />
            </label>
            <label>
              Editor-in-Chief *
              <input
                required
                placeholder="e.g. Cesare Formisano"
                value={infoTableForm.editor_in_chief}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, editor_in_chief: e.target.value }))}
              />
            </label>
            <label>
              Publishing Frequency *
              <input
                required
                placeholder="e.g. Bi-Monthly"
                value={infoTableForm.publishing_frequency}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, publishing_frequency: e.target.value }))}
              />
            </label>
            <label>
              Impact Factor *
              <input
                required
                placeholder="e.g. 1.25"
                value={infoTableForm.impact_factor}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, impact_factor: e.target.value }))}
              />
            </label>
            <label>
              Publication Type *
              <input
                required
                placeholder="e.g. Peer Reviewed"
                value={infoTableForm.publication_type}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, publication_type: e.target.value }))}
              />
            </label>
            <label>
              Publishing Model *
              <input
                required
                placeholder="e.g. Open Access"
                value={infoTableForm.publishing_model}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, publishing_model: e.target.value }))}
              />
            </label>
            <label>
              Journal Category *
              <input
                required
                placeholder="e.g. Journal of Clinical Nursing & Reports"
                value={infoTableForm.journal_category}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, journal_category: e.target.value }))}
              />
            </label>
            <label>
              Email *
              <input
                required
                type="email"
                placeholder="e.g. contact.nursing@onlinemarks.info"
                value={infoTableForm.email}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label>
              Alternate Email
              <input
                type="email"
                placeholder="e.g. Nursingreports@onlinescience.net"
                value={infoTableForm.alternate_email}
                onChange={(e) => setInfoTableForm((prev) => ({ ...prev, alternate_email: e.target.value }))}
              />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Left Indexing Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLeftLogoFile(file);
                        setLeftLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {leftLogoPreview && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img src={leftLogoPreview} alt="Left Logo Preview" style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Right Indexing Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRightLogoFile(file);
                        setRightLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {rightLogoPreview && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img src={rightLogoPreview} alt="Right Logo Preview" style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                </div>
              </div>
            </label>
            <button className="primary-btn" type="submit">
              {hasInfoTable ? "Update Info Table" : "Create Info Table"}
            </button>
          </form>
        </section>
      ) : null}

      {activeTab === "editorial-board" ? (
        <section className="form-card admin-panel">
          <h3>Editorial Board</h3>
          <form className="form-grid" onSubmit={createBoardMember}>
            <input placeholder="Name" required value={forms.boardMember.name} onChange={(e) => setForm("boardMember", { name: e.target.value })} />
            <textarea placeholder="Description" value={forms.boardMember.description} onChange={(e) => setForm("boardMember", { description: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setForm("boardMember", { image: e.target.files?.[0] || null })} />
            <button className="primary-btn" type="submit">Create Board Member</button>
          </form>
          {allItems.boardMembers.map((item) => (
            <div className="item-row" key={item._id}>
              <span>{item.name}</span>
              <div className="actions">
                <button type="button" onClick={() => updateBoardMember(item)}>Edit</button>
                <button className="danger-btn" type="button" onClick={() => remove("board-members", item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {activeTab === "articles-in-press" ? (
        <section className="form-card admin-panel">
          <div className="panel-header">
            <div>
              <h3>Articles In Press</h3>
              <p className="muted-line">Create articles or manage articles in press for this journal.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={createArticle}>
            <label>
              Article Type
              <select value={forms.article.type} onChange={(e) => setForm("article", { type: e.target.value })}>
                <option>Research</option>
                <option>Review</option>
                <option>Case Study</option>
                <option>Short Communication</option>
                <option>Editorial</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Title
              <input placeholder="Article title" value={forms.article.title} onChange={(e) => setForm("article", { title: e.target.value })} required />
            </label>
            <label>
              Authors
              <input placeholder="Authors names" value={forms.article.authors} onChange={(e) => setForm("article", { authors: e.target.value })} required />
            </label>
            <label>
              Abstract
              <textarea placeholder="Article abstract" value={forms.article.abstract} onChange={(e) => setForm("article", { abstract: e.target.value })} required />
            </label>
            <label>
              External Link (Optional)
              <input placeholder="https://..." value={forms.article.external_link} onChange={(e) => setForm("article", { external_link: e.target.value })} />
            </label>
            <label>
              DOI Link (Optional)
              <input placeholder="https://doi.org/..." value={forms.article.doi_link} onChange={(e) => setForm("article", { doi_link: e.target.value })} />
            </label>
            <label>
              Upload PDF
              <input
                ref={articleFileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setForm("article", { file: e.target.files?.[0] || null })
                }
              />
            </label>
            <button className="primary-btn" type="submit">Create Article</button>
          </form>
          <div className="panel-header" style={{ marginTop: "2rem" }}>
            <h3>All Articles</h3>
          </div>
          {allItems.articles.length > 0 ? (
            allItems.articles.map((item) => (
              <div className="item-row" key={item._id}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="muted-line" style={{ margin: "0.3rem 0 0" }}>{item.authors}</p>
                </div>
                <div className="actions">
                  <button type="button" onClick={() => updateArticle(item)}>Edit</button>
                  <button className="danger-btn" type="button" onClick={() => remove("articles", item._id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p className="muted-line">No articles created yet.</p>
          )}
        </section>
      ) : null}

      {activeTab === "current-issue" ? (
        <section className="form-card admin-panel">
          <h3>Current Issue</h3>
          {!allItems.currentIssues.length ? (
            <div className="selected-volumes-preview">
              <div className="selected-volume-card">
                <div className="selected-volume-header">
                  <strong>Articles In Press</strong>
                  <span>{allItems.articlesInPress.length} article(s) available</span>
                </div>
                {allItems.articlesInPress.length ? (
                  <ul className="selected-volume-articles">
                    {allItems.articlesInPress.map((article) => (
                      <li key={article._id}>{article.title} ({article.authors})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted-line">No articles in press available.</p>
                )}
              </div>
            </div>
          ) : null}
          {forms.currentIssue.article_ids.length ? (
            <div className="selected-volumes-preview">
              <div className="selected-volume-card">
                <div className="selected-volume-header">
                  <strong>{forms.currentIssue.volume_title || "Selected articles"}</strong>
                  <span>{forms.currentIssue.article_ids.length} article(s)</span>
                </div>
                <ul className="selected-volume-articles">
                  {allItems.articlesInPress
                    .filter((article) => forms.currentIssue.article_ids.includes(article._id))
                    .map((article) => <li key={article._id}>{article.title}</li>)}
                </ul>
              </div>
            </div>
          ) : null}
          <form className="form-grid" onSubmit={createCurrentIssue}>
            <label>
              Volume Title
              <input placeholder="Volume title" required value={forms.currentIssue.volume_title} onChange={(e) => setForm("currentIssue", { volume_title: e.target.value })} />
            </label>
            <label>
              Select Articles In Press (Hold Ctrl/Cmd to select multiple)
              <select
                multiple
                value={forms.currentIssue.article_ids}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setForm("currentIssue", { article_ids: selected });
                }}
                style={{ minHeight: "120px" }}
              >
                {allItems.articlesInPress.map((article) => (
                  <option key={article._id} value={article._id}>
                    {article.title} ({article.authors})
                  </option>
                ))}
              </select>
              <span className="muted-line" style={{ fontSize: "0.85rem", marginTop: "0.3rem", display: "block" }}>
                {forms.currentIssue.article_ids.length} article(s) selected
              </span>
            </label>
            <button className="primary-btn" type="submit">Create Current Issue</button>
          </form>
          {allItems.currentIssues.map((item) => (
            <div className="item-row" key={item._id}>
              <span>{item.volume_title}</span>
              <div className="actions">
                <button type="button" onClick={() => updateCurrentIssue(item)}>Edit</button>
                <button className="danger-btn" type="button" onClick={() => remove("current-issues", item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {activeTab === "archive" ? (
        <section className="form-card admin-panel">
          <h3>Archive</h3>
          {allItems.archiveVolumes.length ? allItems.archiveVolumes.map((volume) => {
            const issue = allItems.currentIssues.find((item) => String(item._id) === String(volume.current_issue_id));
            return (
              <div className="item-row" key={volume._id}>
                <div>
                  <strong>{issue?.volume_title || volume.volume_title}</strong>
                  <p className="muted-line" style={{ margin: "0.3rem 0 0" }}>
                    {volume.article_items?.length || 0} article(s)
                  </p>
                </div>
                <div className="actions">
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    required
                    placeholder="Archive year"
                    value={archiveYears[volume._id] || ""}
                    onChange={(e) => setArchiveYears((prev) => ({ ...prev, [volume._id]: e.target.value }))}
                  />
                  <button type="button" onClick={() => updateArchiveVolume(volume)}>Update Year</button>
                  <button className="danger-btn" type="button" onClick={() => remove("archive-volumes", volume._id)}>Delete</button>
                </div>
              </div>
            );
          }) : <p className="muted-line">No current-issue volumes available.</p>}
        </section>
      ) : null}

      {activeTab === "ppts" ? (
        <section className="form-card admin-panel">
          <h3>PPTs</h3>
          <form className="form-grid" onSubmit={createPpt}>
            <input placeholder="Title" required value={forms.ppt.title} onChange={(e) => setForm("ppt", { title: e.target.value })} />
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              PPT / PDF File
              <input type="file" onChange={(e) => setForm("ppt", { file: e.target.files?.[0] || null })} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              Upload Cover / Thumbnail (16:9 ratio)
              <input type="file" accept="image/*" onChange={(e) => handleCropPick(e, "ppt-thumbnail")} />
              {forms.ppt.thumbnail ? (
                <span className="muted-line" style={{ color: "green", fontSize: "0.85rem" }}>Cropped thumbnail ready to upload.</span>
              ) : null}
            </label>
            <button className="primary-btn" type="submit">Create PPT</button>
          </form>
          {allItems.ppts.map((item) => (
            <div className="item-row" key={item._id}>
              <span>{item.title}</span>
              <div className="actions">
                <button type="button" onClick={() => updatePpt(item)}>Edit</button>
                <button className="danger-btn" type="button" onClick={() => remove("ppts", item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {activeTab === "videos" ? (
        <section className="form-card admin-panel">
          <h3>Videos</h3>
          <form className="form-grid" onSubmit={createVideo}>
            <input placeholder="Title" required value={forms.video.title} onChange={(e) => setForm("video", { title: e.target.value })} />
            <input placeholder="YouTube URL" required value={forms.video.youtube_url} onChange={(e) => setForm("video", { youtube_url: e.target.value })} />
            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              Upload Cover / Thumbnail (16:9 ratio)
              <input type="file" accept="image/*" onChange={(e) => handleCropPick(e, "video-thumbnail")} />
              {forms.video.thumbnail ? (
                <span className="muted-line" style={{ color: "green", fontSize: "0.85rem" }}>Cropped thumbnail ready to upload.</span>
              ) : null}
            </label>
            <button className="primary-btn" type="submit">Create Video</button>
          </form>
          {allItems.videos.map((item) => (
            <div className="item-row" key={item._id}>
              <span>{item.title}</span>
              <div className="actions">
                <button type="button" onClick={() => updateVideo(item)}>Edit</button>
                <button className="danger-btn" type="button" onClick={() => remove("videos", item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {activeTab === "indexing" ? (
        <section className="form-card admin-panel">
          <h3>Indexing</h3>
          <form className="form-grid" onSubmit={createIndexingLogo}>
            <input placeholder="Name" required value={forms.indexingLogo.name} onChange={(e) => setForm("indexingLogo", { name: e.target.value })} />
            <input type="file" accept="image/*" onChange={(e) => setForm("indexingLogo", { image: e.target.files?.[0] || null })} />
            <button className="primary-btn" type="submit">Create Indexing Logo</button>
          </form>
          {allItems.indexingLogos.map((item) => (
            <div className="item-row" key={item._id}>
              <span>{item.name}</span>
              <div className="actions">
                <button type="button" onClick={() => updateIndexingLogo(item)}>Edit</button>
                <button className="danger-btn" type="button" onClick={() => remove("indexing-logos", item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {cropImageSrc ? (
        <ImageCropModal
          imageSrc={cropImageSrc}
          outputWidth={cropType === "journal-cover" ? 1024 : 1600}
          outputHeight={cropType === "journal-cover" ? 1536 : 900}
          title={cropType === "journal-cover" ? "Crop cover (2:3)" : cropType === "ppt-thumbnail" ? "Crop PPT thumbnail (16:9)" : "Crop video thumbnail (16:9)"}
          onClose={handleCropClose}
          onComplete={handleCropComplete}
        />
      ) : null}
      
    </main>
  );
};
