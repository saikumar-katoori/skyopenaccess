import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { http } from "../api/http";


export const PublicFooter = () => {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    http
      .get("/logos")
      .then((res) => setLogos(res.data.logos || []))
      .catch(() => setLogos([]));
  }, []);

  // Google Maps Embed: put your API key in client/.env or .env.local as VITE_GOOGLE_MAPS_API_KEY
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapAddress = 'H.NO: 9-223 /H/ 4 MAISAMMA GUTTA GHATKESAR MEDCHAL DISTRICT 501301';
  const mapSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(
        mapAddress
      )}`
    : null;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="logo-section">
       <h2>Associated Indexing Partners</h2>
        <div className="logo-slider">
          <div className="logo-track">
            {logos.map((logo) => (
              <img key={logo._id} src={logo.image_url} alt="Indexing logo" />
            ))}
            {logos.map((logo) => (
              <img key={`${logo._id}-dup`} src={logo.image_url} alt="Indexing logo" />
            ))}
          </div>
        </div>
      </section>

      <footer className="publisher-footer">
        <div className="footer-main">
          
          {/* ABOUT SECTION */}
          <div className="footer-about">
            <div className="footer-logo">
              <div className="logo-icon">
                <NavLink to="/"><img src="/images/sky-logo-final-white.png" alt="SKY Open Access Publisher" className="footer-logo-img" /></NavLink>
              </div>
            </div>

            <p>
              We are an independent global publisher of peer-reviewed open-access journals covering Medical, Pharmaceutical, Engineering, Biomedical, and Environmental Sciences.
            </p>

            <div className="footer-socials">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* MAIN LINKS */}
          <div className="footer-column">
            <h3>Main Links</h3>
            <ul>
              <li><NavLink to="/">Home <span>›</span></NavLink></li>
              <li><NavLink to="/about">About <span>›</span></NavLink></li>
              <li><NavLink to="/open-access">Open Access <span>›</span></NavLink></li>
              <li><NavLink to="/journals">Journals <span>›</span></NavLink></li>
              <li><NavLink to="/peer-review">Peer Review <span>›</span></NavLink></li>
              <li><NavLink to="/author-guidelines">Author Guidelines <span>›</span></NavLink></li>
              <li><NavLink to="/membership">Membership <span>›</span></NavLink></li>
              <li><NavLink to="/videos">Videos <span>›</span></NavLink></li>
              <li><NavLink to="/ppts">PPT <span>›</span></NavLink></li>
            </ul>
          </div>

          {/* ADDRESS & CONTACT */}
          <div className="footer-column">
            <h3>Address</h3>
            <div className="contact-item">
              <i className="fa-solid fa-location-dot"></i>
              <p>
                55 Sunset Boulevard,<br />
                 Miami, FL 33101, USA<br />
                
              </p>
            </div>
            <div className="contact-item">
              <i className="fa-solid fa-phone"></i>
              <p>+1 212-555-0173</p>
            </div>
            <div className="contact-item">
              <i className="fa-regular fa-envelope"></i>
              <p>contact@skyopenaccesspublishers.com</p>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="footer-column">
            <div className="footer-map">
              <h3>Reach Us</h3>
              {/* {mapSrc ? (
                <iframe
                  title="SKY Open Access location"
                  src={mapSrc}
                  style={{ 
                    border: 0,
                    width: '250px',
                    height: '250px',
                    borderRadius: '12px'
                  }}
                  allowFullScreen=""
                  loading="lazy"
                />
              ) : (
              )} */}
                <img src="/images/map.png" alt="Location Map" />
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          <p>© 2025 SKY Open Access Publisher. All Rights Reserved.</p>
          
          <div className="bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>

          <button 
            className="top-btn"
            onClick={handleScrollToTop}
            aria-label="Back to top"
          >
            ↑
          </button>
        </div>
      </footer>

      <div className="whatsapp-float" id="whatsapp-float">
        <span className="whatsapp-tooltip">Chat with us on WhatsApp</span>
        <a
          href="https://wa.me/+12125550173"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float-btn"
          aria-label="Chat on WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </a>
      </div>
    </>
  );
};
