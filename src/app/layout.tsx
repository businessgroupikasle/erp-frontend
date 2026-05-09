import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito'
});

export const metadata: Metadata = {
  title: "Ikasle ERP | Business Management",
  description: "Enterprise Resource Planning by Ikasle — manage sales, purchases, accounting and more",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={nunito.variable}>
      <body className={`${nunito.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppShell>
                {children}
              </AppShell>
            </ToastProvider>
          </AuthProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
