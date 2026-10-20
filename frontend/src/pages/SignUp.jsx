
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] p-5">
      <div className="w-full max-w-sm rounded-3xl border border-[#E7E9DF] bg-white p-8">
        <Link to="/" className="text-3xl font-bold">
          nxt<span className="text-[#527957]">Mail</span>
        </Link>

        <p className="mt-2 text-sm text-[#899389]">Create your account</p>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-[#E7E9DF] bg-[#FAF9F5] p-3 outline-none focus:border-[#527957]"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-[#E7E9DF] bg-[#FAF9F5] p-3 outline-none focus:border-[#527957]"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-xl border border-[#E7E9DF] bg-[#FAF9F5] p-3 outline-none focus:border-[#527957]"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#355B42] p-3 font-medium text-white transition hover:bg-[#294A34] disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#899389]">
          Already registered?{" "}
          <Link to="/signin" className="text-[#355B42]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
