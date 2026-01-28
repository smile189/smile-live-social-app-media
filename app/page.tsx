// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  const userRole = "landing"; //

  if (userRole === "landing") redirect("/landing");
  else if (userRole === "smile_social") redirect("/smile_social");
  else redirect("/dashboard");
} 
