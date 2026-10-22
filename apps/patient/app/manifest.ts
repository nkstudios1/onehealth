import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OneHealth",
    short_name: "OneHealth",
    description: "Your health record, always ready, always yours.",
    id: "/",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff", // token-check: allow (PWA manifest needs literal colours)
    theme_color: "#ffffff", // token-check: allow
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}