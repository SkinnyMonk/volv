import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ProtectedLayout } from "@/components/auth/ProtectedLayout";

export const metadata: Metadata = {
  title: "volv",
  description: "A powerful trading platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen w-screen bg-gray-50">
        <AuthProvider>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

