"use client";

import { useState } from "react";
import "@/lib/evercoin-copy-overrides";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ChatLayoutCleanup } from "@/components/chat/ChatLayoutCleanup";
import { ChatMediaBridge } from "@/components/media/ChatMediaBridge";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { LocalizedDocumentMetadata } from "@/components/layout/LocalizedDocumentMetadata";
import { NavBar } from "@/components/layout/NavBar";

export function AppShell({
  children
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

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
        <NavBar />
        <div className="v18-main">{children}</div>
      </div>
    </AuthProvider>
  );
}
