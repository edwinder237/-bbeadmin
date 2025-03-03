"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInCatchAll() {
  return (
    <SignIn
      routing="path"  // Path-based multi-step flows
      path="/sign-in" // Must match your folder name
    />
  );
}