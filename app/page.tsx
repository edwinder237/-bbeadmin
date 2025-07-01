// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    // User is authenticated, redirect to dashboard
    redirect("/dashboard/clients");
  } else {
    // User is not authenticated, redirect to sign-in
    redirect("/sign-in");
  }
}