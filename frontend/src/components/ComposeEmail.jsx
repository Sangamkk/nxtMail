import { useState } from "react";
import { X, Minus, Send } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ComposeEmail({ onClose, onSent }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendEmail() {
    if (!to.trim()) {
      setError("Enter a recipient email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/gmail/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");

      onSent?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft() {
    if (!to.trim() && !subject.trim() && !body.trim()) {
      onClose?.();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/gmail/drafts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save draft");

      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <section className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E7E9DF] bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-[#EDF0E8] bg-[#F4F6EF] px-5 py-3">
          <h2 className="font-semibold text-[#29372D]">New Message</h2>
          <button onClick={saveDraft} disabled={loading} title="Save draft and close">
            <X size={19} className="text-[#59665A]" />
          </button>
        </header>

        <div className="flex flex-col px-5">
          <input
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="To"
            className="border-b border-[#EDF0E8] py-3 text-sm outline-none"
          />
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="border-b border-[#EDF0E8] py-3 text-sm outline-none"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your email..."
            className="min-h-56 resize-y py-4 text-sm leading-6 outline-none"
          />
        </div>

        {error && <p className="px-5 text-sm text-red-600">{error}</p>}

        <footer className="flex items-center justify-between border-t border-[#EDF0E8] p-4">
          <button
            onClick={saveDraft}
            disabled={loading}
            className="rounded-lg border border-[#E7E9DF] px-4 py-2 text-sm text-[#355B42] hover:bg-[#F4F6EF] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Cancel"}
          </button>
          <button
            onClick={sendEmail}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#355B42] px-4 py-2 text-sm text-white hover:bg-[#294A35] disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Sending..." : "Send"}
          </button>
        </footer>
      </section>
    </div>
  );
}
