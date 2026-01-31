/**
 * PROJECT: Smile Live App Ecosystem- SOCIAL MEDIA PLATFORM
 * MODULE: RootLayout (Global Architecture)
 * domain: smileliveapp.com/app/
 * -------------------------------------------------------------------------
 * EXECUTIVE BRIEF:
 * Smile Live is engineered as a high-fidelity digital ecosystem designed 
 * for premium user engagement. This Root Layout serves as the master 
 * structural "Shell," ensuring cross-platform aesthetic consistency, 
 * rigorous SEO compliance, and optimized core web vitals.
 * -------------------------------------------------------------------------
 * 
 *  HISTORY VERSION (WEB app SUPPORT )
 * 
 * - v 0.13.270126 | 27-01-2026 | Initial creation of RootLayout with metadata and viewport settings.
 * - v 0.13.270126 | 28-01-2026 | Updated metadata for SEO and social sharing optimization.
 * -------------------------------------------------------------------------
 * 
 * GOVERNANCE & ATTRIBUTION:
 * - Vision & Storytelling: S Alexandra
 * - Integration Technology & Lead Writing: BM
 * * © 2026 Smile Live App. All rights reserved.
 * -------------------------------------------------------------------------
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";


export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export const metadata: Metadata = {

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
    url: "https://www.smileliveapp.com", // 
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
    icon: [
      { url: "./logosmile.jpeg", href: "/logosmile.jpeg" }, 
    ],
    shortcut: "./logosmile.jpeg",
    apple: "./logosmile.jpeg",
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

//*************************************************  END OF STORY **************************************/