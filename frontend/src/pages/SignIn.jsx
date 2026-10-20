
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { Mail } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSignin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify(form),
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-5">
      <div className="w-full max-w-sm rounded-3xl border border-[#E7E9DF] bg-white p-8 shadow-sm">
        <Link to="/" className="text-3xl font-bold tracking-tight">
          nxt<span className="text-[#527957]">Mail</span>
        </Link>

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF0E5] text-[#355B42]">
          <Mail size={22} />
        </div>

        <h1 className="mt-5 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-[#899389]">
          Sign in to your account
        </p>

        <form onSubmit={handleSignin} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[#E7E9DF] bg-[#FAF9F5] p-3 text-sm outline-none transition focus:border-[#527957] focus:ring-2 focus:ring-[#E3EDDB]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-[#E7E9DF] bg-[#FAF9F5] p-3 text-sm outline-none transition focus:border-[#527957] focus:ring-2 focus:ring-[#E3EDDB]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#355B42] p-3 text-sm font-medium text-white transition hover:bg-[#294A34] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#899389]">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-[#355B42] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
