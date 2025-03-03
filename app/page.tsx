// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Always redirect the root route ("/") to "/sign-in"
  redirect("/sign-in");
}