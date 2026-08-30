import { useEffect, useState } from "react";
import { http } from "../../api/http";
import { toDriveViewerUrl } from "../../utils/driveViewer";

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

export const AdminSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const { data } = await http.get("/submissions");
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch submissions");
      if (err.response?.status === 401 || err.response?.status === 403) {
        setInfo("Admin login is required. Please login again and retry.");
      }
    }
  };

  useEffect(() => {
    loadData().catch(() => undefined);
  }, []);

  const deleteSubmission = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this submission? This action cannot be undone.");
    if (!confirmed) return;
    try {
      setError("");
      setInfo("");
      await http.delete(`/submissions/${id}`);
      await loadData();
      window.alert("Submission deleted successfully.");
      setInfo("Submission deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete submission");
      window.alert(err.response?.data?.message || "Failed to delete submission");
    }
  };

  return (
    <main className="container admin-shell">
      <section className="form-card admin-page-hero">
        <h2>Manuscript Submissions</h2>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
      </section>

      <section className="form-card admin-panel">
        <div className="table-shell submissions-table">
          <div className="table-header">
            <span>Date</span>
            <span>Author Name</span>
            <span>Title</span>
            <span>Journal</span>
            <span>File</span>
            <span className="table-actions">Action</span>
          </div>
          {submissions.map((sub) => (
            <div className="table-row" key={sub._id}>
              <div className="table-cell">{formatDate(sub.createdAt)}</div>
              <div className="table-cell">
                <strong>{sub.full_name}</strong>
              </div>
              <div className="table-cell">
                <span>{sub.manuscript_title}</span>
              </div>
              <div className="table-cell">
                <span>
                  {Array.isArray(sub.journal_ids) && sub.journal_ids.length
                    ? sub.journal_ids.map((journal) => journal.title).join(", ")
                    : "-"}
                </span>
              </div>
              <div className="table-cell">
                {sub.manuscript_url ? (
                  <a
                    className="secondary-btn"
                    href={toDriveViewerUrl(sub.manuscript_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View PDF
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="table-cell table-actions">
                <button className="danger-btn" type="button" onClick={() => deleteSubmission(sub._id)}>
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
