// app/page.tsx
/*
* global page of app.
*  - if user is not logged in, redirect to landing page.
* author Ș BM26
*/
import { redirect } from "next/navigation";

export default function RootPage() {
  // app main
  const userRole = "landing"; 

  if (userRole === "landing") {
    redirect("/landing");
  } else if (userRole === "app") {
    redirect("/app");
  } else {
    redirect("/dashboard");
  }
}

//*************************************************  END OF STORY **************************************/
