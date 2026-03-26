import { useLocation, useNavigate } from "react-router-dom";
import { Home, Feather, BookOpen, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/",        label: "Inicio",    Icon: Home },
  { path: "/reflect", label: "Reflexión", Icon: Feather },
  { path: "/history", label: "Historial", Icon: BookOpen },
  { path: "/profile", label: "Perfil",    Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${active ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <item.Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
