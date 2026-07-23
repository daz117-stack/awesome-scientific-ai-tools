import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-slate-600">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-sm">Page not found.</p>
      <Link to="/" className="mt-4 text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
