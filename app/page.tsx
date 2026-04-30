// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // app main
  const userRole = "app"; 

  if (userRole === "app") {
    redirect("/app");
  } else if (userRole === "landing") {
    redirect("/landing");
  } else {
    redirect("/dashboard");
  }
}

//*************************************************  END OF STORY **************************************/
