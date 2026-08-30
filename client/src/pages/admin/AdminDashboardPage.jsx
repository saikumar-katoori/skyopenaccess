import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../api/http";
import { ImageCropModal } from "../../components/ImageCropModal";

const initialJournal = {
  title: "",
  cover: null
};

export const AdminDashboardPage = () => {
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [journalForm, setJournalForm] = useState(initialJournal);
  const [journalSearch, setJournalSearch] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const { data } = await http.get("/journals");
      setJournals(data.journals || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch journals");
      if (err.response?.status === 401 || err.response?.status === 403) {
        setInfo("Admin login is required. Please login again and retry.");
      }
    }
  };

  useEffect(() => {
    loadData().catch(() => undefined);
  }, []);

  const createJournal = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const data = new FormData();
    data.append("title", journalForm.title);
    if (journalForm.cover) data.append("cover", journalForm.cover);

    try {
      await http.post("/journals", data);
      setJournalForm(initialJournal);
      await loadData();
      setInfo("Journal created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create journal");
    }
  };

  const deleteJournal = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this journal? This action cannot be undone.");
    if (!confirmed) return;
    
    try {
      setError("");
      setInfo("");
      await http.delete(`/journals/${id}`);
      await loadData();
      setInfo("Journal deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete journal");
    }
  };

  const filteredJournals = journals.filter((journal) =>
    journal.title?.toLowerCase().includes(journalSearch.trim().toLowerCase())
  );

  return (
    <main className="container admin-shell admin-grid">
      <section className="form-card admin-page-hero full-width">
        <h2>Journals</h2>
        <p className="muted-line">Create new journals and manage existing ones.</p>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
      </section>

      <section className="form-card admin-panel full-width">
        <h2>Add new journal</h2>
        <form onSubmit={createJournal} className="form-grid">
          <label>
            Journal Title:
            <input
              value={journalForm.title}
              onChange={(e) => setJournalForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Cover Image:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setJournalForm((p) => ({ ...p, cover: e.target.files?.[0] || null }))}
            />
          </label>
          <button className="primary-btn" type="submit">
            Add Journal
          </button>
        </form>
      </section>

      <section className="form-card admin-panel full-width">
        <div className="panel-header">
          <div>
            <h2>Existing journals</h2>
          </div>
          <div className="panel-tools">
            <input
              type="search"
              placeholder="Search"
              value={journalSearch}
              onChange={(e) => setJournalSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-shell">
          <div className="table-header">
            <span>Cover</span>
            <span>Title</span>
            <span className="table-actions">Actions</span>
          </div>
          {filteredJournals.map((journal) => (
            <div key={journal._id} className="table-row">
              <div className="table-cell">
                {journal.cover_image_url ? (
                  <img src={journal.cover_image_url} alt={journal.title} className="table-cover" />
                ) : (
                  <div className="table-cover placeholder">No cover</div>
                )}
              </div>
              <div className="table-cell">
                <strong>{journal.title}</strong>
              </div>
              <div className="table-cell table-actions">
                <Link className="secondary-btn" to={`/admin/journals/${journal._id}/manage`}>
                  Manage
                </Link>
                <button onClick={() => deleteJournal(journal._id)} className="danger-btn" type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
