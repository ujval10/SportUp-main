
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProviders';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'SportUp - Connect & Play',
  description: 'SportUp connects sports enthusiasts for games and events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
