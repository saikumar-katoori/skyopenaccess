import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/admin/submissions", label: "Submissions" },
  { to: "/admin/testimonials", label: "Testimonials" },
  { to: "/admin/journals", label: "Journals" },
  { to: "/admin/videos", label: "Videos" },
  { to: "/admin/ppts", label: "PPTs" },
  { to: "/admin/indexing", label: "Indexing" },
  // { to: "/admin/info-table", label: "Info Table" }
];

export const AdminLayout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
         <img src="/images/sky-logo-final.png" alt="Open Ethics Publisher"  className="admin-logo"/>
        </div>
        <nav className="admin-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="admin-logout" type="button" onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};
