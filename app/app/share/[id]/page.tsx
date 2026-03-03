import { Metadata } from "next";
import { createBrowserClient } from "@supabase/ssr";
import PostShareClient from "./PostShareClient";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Tragem video_url și caption-ul real al postării
  const { data: post } = await supabase
    .from("posts")
    .select("video_url, caption, profiles(username)")
    .eq("id", id)
    .single();
  
  // TRUCUL PENTRU IMAGINEA DE POSTARE:
  // Folosim video_url cu #t=0.5 (secunda 0.5) pentru a extrage cadrul.
  // Dacă ai coloana 'thumbnail_url' în DB, înlocuiește linia de mai jos cu: post.thumbnail_url
  const postPreviewImage = post?.video_url 
    ? `${post.video_url}#t=0.5` 
    : "https://www.smileliveapp.com"; 

  return {
    title: `Smile Live | @${post?.profiles?.username || 'Video'}`,
    description: post?.caption || "Uită-te la acest clip pe Smile Live!",
    openGraph: {
      title: "Smile Live App - Redefine Entertainment",
      description: post?.caption,
      url: `https://www.smileliveapp.com{id}`,
      siteName: "Smile Live",
      images: [
        {
          url: postPreviewImage, // AICI e imaginea TA din postare!
          width: 1200,
          height: 630,
        },
      ],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title: `Smile Live | @${post?.profiles?.username}`,
      images: [postPreviewImage],
    }
  };
}

export default async function Page({ params }: any) {
  const { id } = await params;
  return <PostShareClient id={id} />;
}
