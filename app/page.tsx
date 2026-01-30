// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  const userRole = "landing"; //

  if (userRole === "landing") redirect("/landing");
  else if (userRole === "app") redirect("/app");
  else redirect("/dashboard");
} 
