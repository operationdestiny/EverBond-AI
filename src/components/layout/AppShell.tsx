"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { NavBar } from "@/components/layout/NavBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`v18-shell ${collapsed ? "v51-sidebar-collapsed" : ""}`}>
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <NavBar />
      <div className="v18-main">
        {children}
      </div>
    </div>
  );
}
