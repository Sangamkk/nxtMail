
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAF9F5]">
      <h1 className="text-4xl font-bold text-[#355B42]">404</h1>
      <p className="text-sm text-[#899389]">Page not found</p>
      <Link to="/dashboard" className="text-sm text-[#355B42] underline">
        Back to nxtMail
      </Link>
    </main>
  );
}
