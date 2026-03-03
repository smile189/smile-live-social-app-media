import { Metadata } from "next";
import { createBrowserClient } from "@supabase/ssr";
import PostShareClient from "./PostShareClient";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Luăm datele postării (inclusiv thumbnail_url-ul tău real)
  const { data: post } = await supabase
    .from("posts")
    .select("video_url, caption, thumbnail_url, profiles(username)")
    .eq("id", id)
    .single();
  
  // REPARARE EROARE BUILD: Forțăm tipul pentru username
  const profile = post?.profiles as any;
  const username = profile?.username || 'Smile User';

  // IMAGINEA: Prioritate pe thumbnail_url din DB, apoi cadrul din video
  const postPreviewImage = post?.thumbnail_url || 
    (post?.video_url ? `${post.video_url}#t=0.5` : "https://www.smileliveapp.com"); 

  return {
    title: `Smile Live | @${username}`,
    description: post?.caption || "Uită-te la acest clip pe Smile Live!",
    openGraph: {
      title: "Smile Live App - Redefine Entertainment",
      description: post?.caption || "Interactive Social Moments",
      // REPARARE 404: Ruta trebuie să fie completă
      url: `https://www.smileliveapp.com{id}`,
      siteName: "Smile Live",
      images: [
        {
          url: postPreviewImage,
          width: 1200,
          height: 630,
        },
      ],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title: `Smile Live | @${username}`,
      images: [postPreviewImage],
    }
  };
}

export default async function Page({ params }: any) {
  const { id } = await params;
  // Pasăm ID-ul către componenta de client
  return <PostShareClient id={id} />;
}
