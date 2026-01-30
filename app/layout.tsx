/**
 * PROJECT: Smile Live App Ecosystem
 * MODULE: RootLayout (Global Architecture)
 * -------------------------------------------------------------------------
 * EXECUTIVE BRIEF:
 * Smile Live is engineered as a high-fidelity digital ecosystem designed 
 * for premium user engagement. This Root Layout serves as the master 
 * structural "Shell," ensuring cross-platform aesthetic consistency, 
 * rigorous SEO compliance, and optimized core web vitals.
 * -------------------------------------------------------------------------
 * 
 * GOVERNANCE & ATTRIBUTION:
 * - Vision & Storytelling: S Alexandra
 * - Integration Technology & Lead Writing: BM
 * -------------------------------------------------------------------------
 */
import type { Metadata, Viewport } from "next";
import "./globals.css"; // Asigură-te că importul de CSS e corect

// 1. VIEWPORT - Setări pentru browser și culori de interfață
export const viewport: Viewport = {
  themeColor: "#facc15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. METADATA - SEO Beton & Social Share
export const metadata: Metadata = {
  title: {
    default: "Smile Live App - Redefine Entertainment",
    template: "%s | Smile Live"
  },
  description: "Inspired by Alexandra Storyteller. Experience the next evolution of social media with 4K live streams and real-time interaction.",
  metadataBase: new URL('https://smile-live.app'), // Schimbă cu domeniul tău la final
  
  // SEO de bază
  keywords: ["Smile Live", "Social Media App", "4K Streaming", "Alexandra Storyteller", "Live Connection"],
  authors: [{ name: "Smile Live Team" }],
  
  // Facebook / WhatsApp / LinkedIn Share
  openGraph: {
    title: "Smile Live | The Future of Social Connection",
    description: "Experience 4K live feeds and interactive social moments. The future is active.",
    url: "https://www.smileliveapp.com/,
    siteName: "Smile Live app",
    images: [
      {
        url: "/logosmile.jpeg", // Imaginea din folderul /public
        width: 1200,
        height: 630,
        alt: "Smile Live App Interface",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },

  // Twitter (X) Share
  twitter: {
    card: "summary_large_image",
    title: "Smile Live | Next-Gen Social Media",
    description: "Join the future of 4K live streaming and real-time connection.",
    images: ["/logosmile.jpeg"],
  },

  // Favicons
  icons: {
    icon: "/logosmile.jpeg",
    shortcut: "/logosmile.jpeg",
    apple: "/logosmile.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
