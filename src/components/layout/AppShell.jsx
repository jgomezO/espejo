import { Outlet, useMatch } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";

export default function AppShell() {
  const isChat = useMatch("/reflection/:id/chat");

  return (
    <div className="app-shell">
      <aside className="sidebar-nav">
        <BottomNav />
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
