import type { MetadataRoute } from "next";

// Lets the dashboard be added to the iPad home screen as a full-screen app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The New Me — Dashboard",
    short_name: "New Me",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0a0e",
    theme_color: "#0d0a0e",
    icons: [{ src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
