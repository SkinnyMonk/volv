import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "volv - Login",
  description: "A powerful trading platform",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
