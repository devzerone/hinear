import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/organisms/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hinear.local"),
  title: {
    default: "Hinear",
    template: "%s | Hinear",
  },
  description: "Project-first issue tracking for personal and team workflows.",
  applicationName: "Hinear",
  openGraph: {
    title: "Hinear",
    description:
      "Project-first issue tracking for personal and team workflows.",
    images: [
      {
        url: "/og-image.png",
        alt: "Hinear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hinear",
    description:
      "Project-first issue tracking for personal and team workflows.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/icon.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hinear",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3efe7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
