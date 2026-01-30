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
import "./globals.css";

// 1. VIEWPORT - Optimizat pentru Mobile (previne zoom-ul nedorit pe input-uri)
export const viewport: Viewport = {
  themeColor: "#facc15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. METADATA - SEO Beton & Social Share Architecture
export const metadata: Metadata = {
  // IMPORTANT: URL-ul de bază trebuie să fie cel real unde e urcat site-ul (ex: Vercel sau domeniu propriu)
  metadataBase: new URL('https://www.smileliveapp.com'), 
  
  title: {
    default: "Smile Live App - Redefine Entertainment",
    template: "%s | Smile Live"
  },
  description: "Inspired by Alexandra Storyteller. Experience the next evolution of social media with 4K live streams and real-time interaction.",
  
  keywords: ["Smile Live", "Social Media App", "4K Streaming", "Alexandra Storyteller", "Live Connection"],
  authors: [{ name: "Smile Live Team" }],
  
  openGraph: {
    title: "Smile Live | The Future of Social Connection",
    description: "Experience 4K live feeds and interactive social moments. Inspired by Alexandra Storyteller.",
    url: "https://www.smileliveapp.com", // FIX: Am închis ghilimelele aici
    siteName: "Smile Live App",
    images: [
      {
        url: "/logosmile.jpeg", 
        width: 1200,
        height: 630,
        alt: "Smile Live App Interface Preview",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Smile Live | Next-Gen Social Media",
    description: "Join the future of 4K live streaming and real-time connection.",
    images: ["/logosmile.jpeg"],
  },

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
    <html lang="ro" className="scroll-smooth">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}