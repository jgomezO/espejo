import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav.jsx";

export default function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
