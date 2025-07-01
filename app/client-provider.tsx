// app/client-provider.tsx
"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}