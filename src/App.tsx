import { useEffect, useState } from "react";
import Film from "./Film";
import Landing from "./Landing";
import Product from "./Product";

function hashPath(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.split("?")[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export default function App() {
  const [path, setPath] = useState(hashPath);

  useEffect(() => {
    const onHash = () => setPath(hashPath());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (path === "/app" || path.startsWith("/app/")) return <Product />;
  if (path === "/film" || path.startsWith("/film/")) return <Film />;
  return <Landing />;
}
