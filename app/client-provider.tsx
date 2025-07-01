// app/client-provider.tsx
"use client";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}