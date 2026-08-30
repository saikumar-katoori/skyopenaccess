import { Link, NavLink, useNavigate } from "react-router-dom";

export const TopNav = () => {
  const navigate = useNavigate();
  const isAdmin = Boolean(localStorage.getItem("admin_token"));

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <header className="topnav">
      <Link to="/" className="brand">
        Sky Open Access
      </Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/submit">Submit Manuscript</NavLink>
        {!isAdmin ? <NavLink to="/admin/login">Admin</NavLink> : null}
        {isAdmin ? (
          <>
            <NavLink to="/admin">Dashboard</NavLink>
            <NavLink to="/admin/content">Content</NavLink>
            <button onClick={logout} className="link-btn" type="button">
              Logout
            </button>
          </>
        ) : null}
      </nav>
    </header>
  );
};
