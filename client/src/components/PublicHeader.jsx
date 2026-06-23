import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { http } from "../api/http";

export const PublicHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allJournals, setAllJournals] = useState([]);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  // Fetch all journals on component mount
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await http.get("/journals");
        setAllJournals(response.data.journals || []);
      } catch (error) {
        console.error("Error fetching journals:", error);
      }
    };
    fetchJournals();
  }, []);

  // Handle search input and generate suggestions
  const handleSearchInput = (value) => {
    setSearchTerm(value);
    
    if (value.trim().length > 0) {
      const filtered = allJournals.filter((journal) => {
        const title = journal.title || "";
        const about = journal.about || "";
        return `${title} ${about}`.toLowerCase().includes(value.toLowerCase());
      }).slice(0, 8); // Limit to 8 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        searchInputRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    setShowSuggestions(false);
    const nextParams = query ? { q: query } : {};

    if (location.pathname === "/journals") {
      setSearchParams(nextParams);
      return;
    }

    navigate({ pathname: "/", search: query ? `?q=${encodeURIComponent(query)}` : "" });
  };

  const handleSuggestionClick = (journal) => {
    navigate(`/journals/${journal.slug}`);
    setShowSuggestions(false);
    setSearchTerm("");
  };

  return (
    <div className="header-wrapper">

        <div className="top-bar-content">
          <div className="contact">
            <span>
              <i className="fa-solid fa-phone" />
              +1 212-555-0173
            </span>
            <span>
              <i className="fa-solid fa-envelope" />
              contact@skyopenaccesspublishers.com
            </span>
          </div>

          <div className="search-box-wrapper">
            <form className="search-box" onSubmit={submitSearch}>
              <i className="fa-solid fa-magnifying-glass" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for Journals..."
                value={searchTerm}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
              />
              <button className="search-submit" type="submit" aria-label="Search">
                <i className="fa-solid fa-arrow-right" />
              </button>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions" ref={suggestionsRef}>
                {suggestions.map((journal) => (
                  <div
                    key={journal._id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(journal)}
                  >
                    {journal.cover_image_url && (
                      <img src={journal.cover_image_url} alt={journal.title} className="suggestion-cover" />
                    )}
                    <div className="suggestion-content">
                      <div className="suggestion-title">{journal.title}</div>
                      <div className="suggestion-desc">{journal.about?.replace(/<[^>]+>/g, "").slice(0, 60)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="right-section">
            <NavLink to="/submit" className="btn-primary">
              <i className="fa-solid fa-upload" />
              Online Submission
            </NavLink>
          </div>
        </div>


        <div className="nav-content">
          <NavLink to="/" className="logo-link">
            <img src="/images/sky-logo-final.png" className="logo" alt="Logo" />
          </NavLink>

          <button
            className={`nav-toggle${menuOpen ? " active" : ""}`}
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <ul className={`nav-links${menuOpen ? " is-open" : ""}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/open-access"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setMenuOpen(false)}
              >
                Open Access
              </NavLink>
            </li>
            <li>
              <NavLink to="/journals" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                Journals
              </NavLink>
            </li>
            <li>
              <NavLink to="/peer-review" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                Peer Review
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/author-guidelines"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setMenuOpen(false)}
              >
                Author Guidelines
              </NavLink>
            </li>
            <li>
              <NavLink to="/videos" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                Videos
              </NavLink>
            </li>
            <li>
              <NavLink to="/ppts" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                PPT
              </NavLink>
            </li>
            <li>
              <NavLink to="/membership" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                Membership
              </NavLink>
            </li>
            <li className="mobile-only-submission">
              <NavLink to="/submit" className="mobile-submit-btn" onClick={() => setMenuOpen(false)}>
                <i className="fa-solid fa-upload" />
                Online Submission
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
  );
};
