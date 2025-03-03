import { auth } from "@clerk/nextjs/server"; // Server-side import
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
// Import Clerk's SignIn component in the same file.
// We'll render it inside a nested client component below.
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to the IT admin dashboard",
};

export default async function LoginPage() {
  // 1. SERVER COMPONENT LOGIC
  // Check user session on the server
  const { userId } = await auth();

  // If the user is already logged in, redirect to the dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // 2. RETURN JSX (Server component output)
  // Renders the layout, including a nested client component for the Clerk SignIn form
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          IT Admin Dashboard
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This admin dashboard has revolutionized how we manage our
              IT infrastructure and client relationships.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the IT admin dashboard
            </p>
          </div>

          {/* 3. NESTED CLIENT COMPONENT WITH CLERK SIGN-IN */}
          <ClientSignIn />

          <p className="px-8 text-center text-sm text-muted-foreground">
            By logging in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// 4. DEFINE A CLIENT COMPONENT **INSIDE** THIS SERVER FILE
function ClientSignIn() {
  "use client";
  return <SignIn />;
}