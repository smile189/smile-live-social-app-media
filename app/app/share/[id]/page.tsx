import { Metadata } from "next";
import { createBrowserClient } from "@supabase/ssr";
import PostShareClient from "./PostShareClient";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("posts")
    .select("video_url, caption, thumbnail_url, profiles(username)")
    .eq("id", id)
    .single();

  // FIX PENTRU USERNAME (Type Error)
  const profile = post?.profiles as any;
  const username = profile?.username || "Smile User";

  // FIX PENTRU IMAGINEA DE POSTARE (Cadrul real din video sau thumbnail)
  const previewImage = post?.thumbnail_url || 
                       (post?.video_url ? `${post.video_url}#t=0.5` : "https://www.smileliveapp.com");

  return {
    title: `Smile Live | @${username}`,
    description: post?.caption || "Uită-te la acest clip pe Smile Live!",
    openGraph: {
      title: "Smile Live App",
      description: post?.caption,
      // URL-ul TREBUIE să conțină /app/ dacă acolo e folderul!
      url: `https://www.smileliveapp.com{id}`,
      images: [{ 
        url: previewImage, 
        width: 1200, 
        height: 630,
        alt: "Smile Live Video Preview"
      }],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      images: [previewImage],
    }
  };
}

export default async function Page({ params }: any) {
  const { id } = await params;
  return <PostShareClient id={id} />;
}
