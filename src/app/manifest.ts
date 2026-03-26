import type { MetadataRoute } from "next";
import { PWA_PRIMARY_COLOR } from "@/app/pwa-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hinear",
    short_name: "Hinear",
    description:
      "Project-first issue tracking for personal and team workflows.",
    start_url: "/",
    display: "standalone",
    background_color: PWA_PRIMARY_COLOR,
    theme_color: PWA_PRIMARY_COLOR,
    orientation: "portrait",
    icons: [
      {
        src: "/api/pwa/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/api/pwa/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/pwa/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/api/pwa/icon?size=180",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
