import { Metadata } from "next";
import { createBrowserClient } from "@supabase/ssr";
import PostShareClient from "./PostShareClient";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Preluăm datele postării și ale profilului
  const { data: post } = await supabase
    .from("posts")
    .select("video_url, caption, thumbnail_url, profiles(username)")
    .eq("id", id)
    .single();

  const username = (post?.profiles as any)?.username || "Smile User";
  
  /** 
   * LOGICA PENTRU POZA DE SHARE (THUMBNAIL):
   * 1. Folosește thumbnail_url dacă există în baza de date.
   * 2. Dacă nu, folosește un proxy (wsrv.nl) care generează un JPG din video-ul tău.
   * 3. Fallback final la logo-ul tău dacă video-ul lipsește.
   */
  let previewImage = "https://www.smileliveapp.com"; // Fallback obligatoriu

  if (post?.thumbnail_url) {
    previewImage = post.thumbnail_url;
  } else if (post?.video_url) {
    // Generăm un link de imagine JPG direct din video folosind un proxy gratuit
    previewImage = `https://wsrv.nl{encodeURIComponent(post.video_url)}&output=jpg&n=-1`;
  }

  return {
    title: `Smile Live | @${username}`,
    description: post?.caption || "Uită-te la acest clip pe Smile Live!",
    openGraph: {
      title: `Smile Live - @${username}`,
      description: post?.caption || "Redefine entertainment with Smile Live.",
      url: `https://www.smileliveapp.com{id}`,
      siteName: "Smile Live",
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
        },
      ],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title: `Smile Live | @${username}`,
      description: post?.caption,
      images: [previewImage],
    },
  };
}

export default async function Page({ params }: any) {
  const { id } = await params;
  return <PostShareClient id={id} />;
}
