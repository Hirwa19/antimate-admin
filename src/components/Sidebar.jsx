import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Cpu,
  Shield,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();

  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      title: "Generate Device",
      icon: <Cpu size={20} />,
      path: "/generate-device",
    },
    {
      title: "GenerateGateway",
      icon: <Shield size={20} />,
      path: "/generate-gateway",
    },
    {
      title: "Workers",
      icon: <Users size={20} />,
      path: "/workers/add",
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-white/10 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">
          ANTIMATE
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : "hover:bg-slate-800 text-gray-300"
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logoutUser}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

    </aside>
  );
}