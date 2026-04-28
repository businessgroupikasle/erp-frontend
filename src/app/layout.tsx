import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import RefrensHeader from "@/components/layout/RefrensHeader";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";

import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <SidebarProvider>
                <div className="flex h-screen overflow-hidden bg-background text-foreground">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <RefrensHeader />
                    <main className="flex-1 overflow-y-auto bg-background custom-scrollbar p-6">
                      {children}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
