/**
 * PROJECT: Smile Live App Ecosystem - SOCIAL MEDIA PLATFORM
 * MODULE: RootLayout (Global Architecture)
 * DOMAIN: smileliveapp.com/app/
 * -------------------------------------------------------------------------
 * EXECUTIVE BRIEF:
 * Smile Live is engineered as a high-fidelity digital ecosystem designed 
 * for premium user engagement. This Root Layout serves as the master 
 * structural "Shell," ensuring cross-platform aesthetic consistency, 
 * rigorous SEO compliance, and optimized core web vitals.
 * -------------------------------------------------------------------------
 * 
 * HISTORY VERSION (WEB APP SUPPORT)
 * - v 0.13.270126 | 27-01-2026 | Initial creation (base version).
 * - v 0.13.270126 | 28-01-2026 | Updated metadata for SEO and social sharing.
 * - v 0.13.030326 | 03-03-2026 | Final refinement & mobile optimization.
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

// Configurare Viewport pentru experiență imersivă pe mobil
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Configurare Metadata pentru SEO, WhatsApp, Facebook și Twitter
export const metadata: Metadata = {
  metadataBase: new URL('https://www.smileliveapp.com'), 
  
  title: {
    default: "Smile Live App - Redefine Entertainment",
    template: "%s | Smile Live"
  },
  description: "Inspired by Alexandra Storyteller. Experience the next evolution of social media with 4K live streams and real-time interaction.",
  
  keywords: ["Smile Live", "Social Media App", "4K Streaming", "Alexandra Storyteller", "Live Connection"],
  authors: [{ name: "Smile Live Team" }],
  
  // OpenGraph (WhatsApp, Facebook, Instagram)
  openGraph: {
    title: "Smile Live | The Future of Social Connection",
    description: "Experience 4K live feeds and interactive social moments. Inspired by Alexandra Storyteller.",
    url: "https://www.smileliveapp.com",
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

  // Twitter/X Preview
  twitter: {
    card: "summary_large_image",
    title: "Smile Live | Next-Gen Social Media",
    description: "Join the future of 4K live streaming and real-time connection.",
    images: ["/logosmile.jpeg"],
  },

  // Iconițe Browser & Mobile App
  icons: {
    icon: "/logosmile.ico",         
    shortcut: "/logosmile.ico",     
    apple: "/logosmile.jpeg",       
    other: [
      {
        rel: 'icon',
        type: 'image/jpeg',
        url: '/logosmile.jpeg',
      },
    ],
  },

  // Optimizare Indexare Motoare de Căutare
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="scroll-smooth">
      <body className="antialiased font-sans bg-black text-white selection:bg-yellow-400 selection:text-black">
        {/* Main Content Area */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

//*************************************************  END OF STORY **************************************/
