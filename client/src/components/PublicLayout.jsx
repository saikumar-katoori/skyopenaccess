import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import { usePublicInteractions } from "../hooks/usePublicInteractions";

const ensureLink = (id, href) => {
  if (document.getElementById(id)) return null;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  return link;
};

export const PublicLayout = () => {
  usePublicInteractions();

  useEffect(() => {
    const created = [];

    const publicCss = ensureLink("public-css", "/public.css");
    if (publicCss) created.push(publicCss);

    const fontAwesome = ensureLink(
      "public-fontawesome",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    );
    if (fontAwesome) created.push(fontAwesome);

    const fonts = ensureLink(
      "public-fonts",
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Rowdies:wght@300;700&family=Outfit:wght@400;500;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:wght@400;700;900&family=Source+Serif+4:wght@300;400;600&family=DM+Sans:wght@300;400;500&family=Lemon&display=swap"
    );
    if (fonts) created.push(fonts);

    document.body.classList.add("public-mode");

    return () => {
      created.forEach((link) => link.remove());
      document.body.classList.remove("public-mode");
    };
  }, []);

  return (
    <div className="public-shell">
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </div>
  );
};
