// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to sign-in for authentication
  redirect("/sign-in");
}