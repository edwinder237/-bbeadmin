// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect the root route ("/") to the dashboard since no auth is required
  redirect("/dashboard/clients");
}