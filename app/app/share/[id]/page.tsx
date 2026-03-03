// app/app/share/[id]/page.tsx
import { Metadata } from "next";
import { createBrowserClient } from "@supabase/ssr";
import PostShareClient from "./PostShareClient"; // FĂRĂ .js, FĂRĂ .tsx

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("posts")
    .select("video_url, caption")
    .eq("id", id)
    .single();
  
  // TRUCUL: #t=0.1 pentru preview pe WhatsApp
  const thumb = post?.video_url ? `${post.video_url}#t=0.1` : "/logosmile.jpeg";

  return {
    title: "Smile Live Video",
    description: post?.caption || "Uită-te la acest clip!",
    openGraph: {
      images: [{ url: thumb }],
    },
  };
}

export default async function Page({ params }: any) {
  const { id } = await params;
  // AICI folosim exact numele importat de sus
  return <PostShareClient id={id} />;
}
