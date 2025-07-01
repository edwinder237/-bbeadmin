// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Temporarily redirect directly to dashboard to break auth loops
  // TODO: Re-add auth check once Clerk is configured properly
  redirect("/dashboard/clients");
}