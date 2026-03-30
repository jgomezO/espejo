import { Outlet, useMatch } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";

export default function AppShell() {
  const isChat = useMatch("/reflection/:id/chat");

  return (
    <div className="app-shell">
      <main className={`app-main${isChat ? " app-main--chat" : ""}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
