import { useEffect, useState } from "react";
import { http } from "../../api/http";

const MAX_TESTIMONIAL_LENGTH = 500; // Maximum character length for testimonials

export const AdminTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState("");

  const loadTestimonials = async () => {
    setError("");
    try {
      const { data } = await http.get("/content/testimonials");
      setTestimonials(data.testimonials || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load testimonials");
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", description: "", image: null });
    setImagePreview("");
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict testimonial description length
    if (name === "description" && value.length > MAX_TESTIMONIAL_LENGTH) {
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    try {
      if (editingId) {
        // Update existing testimonial
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        if (formData.image && typeof formData.image !== "string") {
          data.append("image", formData.image);
        }
        await http.put(`/content/testimonials/${editingId}`, data);
        setInfo("Testimonial updated successfully");
        window.alert("Testimonial updated successfully.");
      } else {
        // Create new testimonial
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        if (formData.image) data.append("image", formData.image);
        await http.post("/content/testimonials", data);
        setInfo("Testimonial created successfully");
        window.alert("Testimonial created successfully.");
      }
      resetForm();
      await loadTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save testimonial");
      window.alert(err.response?.data?.message || "Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial) => {
    setEditingId(testimonial._id);
    setFormData({
      name: testimonial.name || "",
      description: testimonial.description || "",
      image: testimonial.image_url || null
    });
    setImagePreview(testimonial.image_url || "");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this testimonial? This action cannot be undone.");
    if (!confirmed) return;

    setError("");
    setInfo("");

    try {
      await http.delete(`/content/testimonials/${id}`);
      setInfo("Testimonial deleted successfully");
      window.alert("Testimonial deleted successfully.");
      await loadTestimonials();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete testimonial");
      window.alert(err.response?.data?.message || "Failed to delete testimonial");
    }
  };

  const remainingChars = MAX_TESTIMONIAL_LENGTH - formData.description.length;
  const descriptionLength = formData.description.length;
  const percentFilled = (descriptionLength / MAX_TESTIMONIAL_LENGTH) * 100;

  return (
    <main className="container admin-shell">
      <section className="form-card admin-page-hero full-width">
        <h2>Manage Testimonials</h2>
        <p className="muted-line">Create, edit, and manage customer testimonials with character limits.</p>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
      </section>

      <div className="admin-grid admin-testimonial-layout">
        {/* Form Section */}
        <section className="form-card admin-panel testimonial-form-section">
          <h2>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h2>
          <form onSubmit={handleSubmit} className="testimonial-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Testimonial author name"
                maxLength={100}
                required
              />
              <span className="char-count">{formData.name.length}/100</span>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Testimonial (Max {MAX_TESTIMONIAL_LENGTH} characters) *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write a compelling testimonial..."
                rows="6"
                required
              />
              <div className="char-count-info">
                <span className={remainingChars < 50 ? "warning" : ""}>
                  {descriptionLength} / {MAX_TESTIMONIAL_LENGTH} characters
                  {remainingChars < 50 && remainingChars > 0 && (
                    <span className="warning-text"> ({remainingChars} remaining)</span>
                  )}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentFilled}%`,
                    backgroundColor:
                      remainingChars < 0
                        ? "#e74c3c"
                        : remainingChars < 50
                        ? "#f39c12"
                        : "#27ae60"
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Profile Image</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? "Update Testimonial" : "Create Testimonial"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List Section */}
        <section className="form-card admin-panel testimonial-list-section">
          <h2>All Testimonials ({testimonials.length})</h2>
          <div className="testimonial-list">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <div key={testimonial._id} className="testimonial-item">
                  <div className="testimonial-item-header">
                    <div className="testimonial-item-image">
                      {testimonial.image_url ? (
                        <img src={testimonial.image_url} alt={testimonial.name} />
                      ) : (
                        <div className="testimonial-item-placeholder">
                          <i className="fa-solid fa-user" />
                        </div>
                      )}
                    </div>
                    <div className="testimonial-item-info">
                      <h4>{testimonial.name}</h4>
                      <p className="role">Contributor</p>
                    </div>
                  </div>
                  <p className="testimonial-item-text">{testimonial.description}</p>
                  <div className="testimonial-item-meta">
                    <span className="char-info">{testimonial.description.length} chars</span>
                  </div>
                  <div className="testimonial-item-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <i className="fa-solid fa-pen-to-square" /> Edit
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleDelete(testimonial._id)}
                    >
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No testimonials yet. Create your first one above!</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};
