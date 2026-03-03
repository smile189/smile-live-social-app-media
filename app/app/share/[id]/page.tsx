import { Metadata } from "next";
import { createBrowserClient } from "@supabase/ssr";
import PostShareClient from "./PostShareClient";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Luăm thumbnail-ul și caption-ul real
  const { data: post } = await supabase
    .from("posts")
    .select("video_url, caption, thumbnail_url, profiles(username)")
    .eq("id", id)
    .single();

  const profile = post?.profiles as any;
  const username = profile?.username || "Smile User";
  
  // AICI e imaginea TA: thumbnail din DB sau cadrul din video
  const previewImage = post?.thumbnail_url || 
                       (post?.video_url ? `${post.video_url}#t=0.5` : "https://www.smileliveapp.com");

  return {
    title: `Smile Live | @${username}`,
    description: post?.caption || "Uită-te la acest clip pe Smile Live!",
    openGraph: {
      title: `Smile Live - @${username}`,
      description: post?.caption,
     url: `https://www.smileliveapp.com/share/${id}`,
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
      images: [previewImage],
    },
  };
}

export default async function Page({ params }: any) {
  const { id } = await params;
  return <PostShareClient id={id} />;
}
