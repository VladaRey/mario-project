"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "~/components/ui/sonner";
import { NavigationGuardProvider } from "./navigation-guard";
import { FfpProvider } from "./ffp-launcher";
import { DesktopTopBar } from "./desktop-top-bar";
import { BottomTabBar } from "./bottom-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <NavigationGuardProvider>
      <FfpProvider>
        <DesktopTopBar />
        <main key={pathname} className="motion-page min-h-dvh pb-tabbar duration-200 animate-in fade-in slide-in-from-bottom-1 md:pb-12">
          {children}
        </main>
        <BottomTabBar />
        <Toaster position="top-center" />
      </FfpProvider>
    </NavigationGuardProvider>
  );
}
