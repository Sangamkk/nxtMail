
import { useState } from "react";
import { X, Minus, Send, Paperclip } from "lucide-react";

export default function ComposeEmail({ onClose, onSend }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      await onSend?.({ to, subject, message });
      onClose?.();
    } catch (err) {
      setError(err.message || "Unable to send email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center sm:p-6">
      <section className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-[#E5E9DF] bg-[#FAF9F5] shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between bg-[#EAF0E5] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#355B42]">
            New message
          </h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close compose"
              className="rounded-lg p-2 text-[#58705A] hover:bg-white/70"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-col">
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To"
            required
            className="border-b border-[#E7E9DF] bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#899389] focus:bg-white/60"
          />

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="border-b border-[#E7E9DF] bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#899389] focus:bg-white/60"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            required
            rows={10}
            className="min-h-[180px] flex-1 resize-y bg-transparent px-5 py-4 text-sm leading-7 outline-none placeholder:text-[#899389] focus:bg-white/60"
          />

          {error && (
            <p role="alert" className="px-5 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <footer className="flex items-center justify-between border-t border-[#E7E9DF] px-5 py-4">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 rounded-xl bg-[#355B42] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#294A34] disabled:opacity-60"
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send"}
            </button>

            <button
              type="button"
              aria-label="Attachments coming soon"
              title="Attachments coming soon"
              className="rounded-xl p-3 text-[#788477] hover:bg-[#EAF0E5]"
            >
              <Paperclip size={18} />
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
