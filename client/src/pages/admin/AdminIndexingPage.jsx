import { useEffect, useState } from "react";
import { http } from "../../api/http";

export const AdminIndexingPage = () => {
  const [logos, setLogos] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const { data } = await http.get("/logos");
      setLogos(data.logos || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch logos");
      if (err.response?.status === 401 || err.response?.status === 403) {
        setInfo("Admin login is required. Please login again and retry.");
      }
    }
  };

  useEffect(() => {
    loadData().catch(() => undefined);
  }, []);

  const uploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    const data = new FormData();
    data.append("logo", logoFile);
    try {
      setError("");
      setInfo("");
      await http.post("/logos", data);
      setLogoFile(null);
      await loadData();
      window.alert("Logo uploaded successfully.");
      setInfo("Logo uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload logo");
      window.alert(err.response?.data?.message || "Failed to upload logo");
    }
  };

  const deleteLogo = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this indexing logo? This action cannot be undone.");
    if (!confirmed) return;
    try {
      setError("");
      setInfo("");
      await http.delete(`/logos/${id}`);
      await loadData();
      window.alert("Logo deleted successfully.");
      setInfo("Logo deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete logo");
      window.alert(err.response?.data?.message || "Failed to delete logo");
    }
  };

  return (
    <main className="container admin-shell">
      <section className="form-card admin-page-hero">
        <h2>Indexing</h2>
        <p className="muted-line">Manage global indexing and partner logos shown on the public site.</p>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
      </section>

      <section className="form-card admin-panel">
        <h3>Upload Logo</h3>
        <form onSubmit={uploadLogo} className="form-grid">
          <label>
            Logo Image
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </label>
          <button className="primary-btn" type="submit">
            Upload
          </button>
        </form>
      </section>

      <section className="form-card admin-panel">
        <h3>Existing Logos</h3>
        {logos.map((logo) => (
          <div key={logo._id} className="item-row">
            <img src={logo.image_url} alt="logo" className="mini-logo" />
            <button onClick={() => deleteLogo(logo._id)} className="danger-btn" type="button">
              Delete
            </button>
          </div>
        ))}
      </section>
    </main>
  );
};
