"use client";

import { useState } from "react";
import "@/lib/evercoin-copy-overrides";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ChatLayoutCleanup } from "@/components/chat/ChatLayoutCleanup";
import { ChatMediaBridge } from "@/components/media/ChatMediaBridge";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { LocalizedDocumentMetadata } from "@/components/layout/LocalizedDocumentMetadata";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { NavBar } from "@/components/layout/NavBar";
import { ProviderOutageBanner } from "@/components/layout/ProviderOutageBanner";

export function AppShell({
  children
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <LocalizedDocumentMetadata />
      <ChatLayoutCleanup />
      <ChatMediaBridge />
      <div
        className={`v18-shell ${
          collapsed ? "v51-sidebar-collapsed" : ""
        }`}
      >
        <DashboardSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <NavBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <MobileNavigation
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <ProviderOutageBanner />
        <div className="v18-main">{children}</div>
      </div>
    </AuthProvider>
  );
}
