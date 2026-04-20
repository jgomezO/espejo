import { useState } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import BottomNav from "./BottomNav.jsx";

export default function AppShell() {
  const isChat = useMatch("/reflection/:id/chat");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar-nav">
        <div className="sidebar-header">
          {!collapsed && <span className="sidebar-brand">Espejo</span>}
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <BottomNav collapsed={collapsed} />
      </aside>
      <main className={`app-main${isChat ? " app-main--chat" : ""}`}>
        <Outlet />
      </main>
      <div className="mobile-nav">
        <BottomNav />
      </div>
    </div>
  );
}
