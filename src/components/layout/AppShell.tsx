"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "./Sidebar";
import RefrensHeader from "./RefrensHeader";

const PUBLIC_PATHS = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      router.replace("/login");
    } else if (user && isPublicPath) {
      const role = (
        (user as any).role?.name ||
        (user as any).role ||
        ""
      ).toUpperCase();

      if (role === "FRANCHISE_ADMIN") {
        router.replace("/franchise/dashboard");
      } else if (role === "STAFF") {
        router.replace("/pos");
      } else {
        router.replace("/");
      }
    }
  }, [user, loading, isPublicPath, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
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
  );
}
