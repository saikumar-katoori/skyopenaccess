import { NavLink } from "react-router-dom";

export const EbooksPage = () => (
  <main>
    <div className="ticker-wrap">
      <div className="ticker">
        <span className="ticker-item">Academic Texts</span>
        <span className="ticker-item">Popular Literature</span>
        <span className="ticker-item">Science &amp; Nature</span>
        <span className="ticker-item">History &amp; Culture</span>
        <span className="ticker-item">Technology</span>
        <span className="ticker-item">Arts &amp; Humanities</span>
        <span className="ticker-item">Self Development</span>

        <span className="ticker-item">Academic Texts</span>
        <span className="ticker-item">Popular Literature</span>
        <span className="ticker-item">Science &amp; Nature</span>
        <span className="ticker-item">History &amp; Culture</span>
        <span className="ticker-item">Technology</span>
        <span className="ticker-item">Arts &amp; Humanities</span>
        <span className="ticker-item">Self Development</span>
      </div>
    </div>

    <section className="ebooks-banner-section fade-up">
      <div className="ebooks-banner">

        <div className="ebooks-text">
          <div className="hero-eyebrow">Digital Library</div>
          <h1>EBOOKS</h1>
          <p className="tagline">Knowledge That Lives Beyond Print</p>
          <NavLink to="/journals" className="hero-cta">
            Explore Collection
          </NavLink>
        </div>

        <div className="ebooks-images">
            <img src="/images/journal1.png" className="book book1" alt="Book" />
            <img src="/images/journal2.png" className="book book2" alt="Book" />
            <img src="/images/journal3.png" className="book book3" alt="Book" />
        </div>
      </div>

      <div className="ebooks-content">
        <div className="divider" />

        <p>
          Dive into our vast library of ebooks, covering a <strong>wide range of subjects and
          disciplines</strong>. Whether you&apos;re a student, researcher, or avid reader, our
          collection offers something for everyone.
        </p>

        <p>
          Our ebooks are <strong>meticulously curated</strong> to ensure they meet the highest
          standards of quality and relevance.
        </p>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-number" data-target="12">0</span>
            <span className="stat-label">Thousand Titles</span>
          </div>

          <div className="stat-item">
            <span className="stat-number" data-target="50">0</span>
            <span className="stat-label">Subject Areas</span>
          </div>

          <div className="stat-item">
            <span className="stat-number" data-target="98">0</span>
            <span className="stat-label">% Satisfaction</span>
          </div>

          <div className="stat-item">
            <span className="stat-number" data-target="24">0</span>
            <span className="stat-label">/ 7 Access</span>
          </div>
        </div>
      </div>
    </section>
  </main>
);
