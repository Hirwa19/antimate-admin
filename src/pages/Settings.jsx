import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { admin } = useAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-2">Admin Account</h2>

        <div>
          <p className="text-sm text-slate-400">Name</p>
          <p className="font-medium">{admin?.name || admin?.fullName || "—"}</p>
        </div>

        <div>
          <p className="text-sm text-slate-400">Email</p>
          <p className="font-medium">{admin?.email || "—"}</p>
        </div>

        <div>
          <p className="text-sm text-slate-400">Role</p>
          <p className="font-medium">{admin?.role || "Admin"}</p>
        </div>
      </div>

      <p className="text-sm text-slate-500 mt-6">
        More settings (password change, notification preferences, API keys) can be added here as the platform grows.
      </p>
    </div>
  );
}
