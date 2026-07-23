import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/constants";
import { NotificationBell } from "./NotificationBell";

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="text-right">
          <div className="text-sm font-medium text-slate-800">{user?.name}</div>
          <div className="text-xs text-slate-500">{user ? ROLE_LABELS[user.role] : ""}</div>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
