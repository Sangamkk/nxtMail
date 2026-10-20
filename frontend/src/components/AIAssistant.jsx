
import { useState } from "react";
import {
  Sparkles,
  X,
  FileText,
  MessageSquare,
  Copy,
  LoaderCircle,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AIAssistant({ email, onClose }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAction(action) {
    if (!email) {
      setError("Select an email first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      /*
       * Replace this path with your actual AI backend endpoint.
       * No AI result is fabricated by this component.
       */
      const response = await fetch(`${API}/api/ai/${action}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: email.id || email.messageId,
          subject: email.subject || "",
          body: email.body || email.text || email.snippet || "",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
      }

      const text =
        data.summary ||
        data.reply ||
        data.result ||
        data.text;

      if (!text) {
        throw new Error("The AI endpoint returned no result.");
      }

      setResult(text);
    } catch (err) {
      setError(err.message || "Unable to complete the AI request.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setError("Unable to copy. Please select the text manually.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <section className="flex h-full w-full max-w-md flex-col border-l border-[#E5E9DF] bg-[#FAF9F5] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#E5E9DF] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E3EDDB] p-2.5 text-[#355B42]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-semibold">AI Assistant</h2>
              <p className="mt-1 text-xs text-[#899389]">
                {email?.subject || "Choose an email"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI assistant"
            className="rounded-lg p-2 text-[#788477] hover:bg-[#EAF0E5]"
          >
            <X size={19} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-4 text-sm text-[#778276]">
            What would you like help with?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => runAction("summarize")}
              disabled={loading}
              className="rounded-2xl border border-[#E2E8DD] bg-white p-4 text-left transition hover:bg-[#EDF3E7] disabled:opacity-50"
            >
              <FileText size={20} className="mb-3 text-[#547957]" />
              <span className="block text-sm font-medium">Summarize</span>
              <span className="mt-1 block text-xs text-[#899389]">
                Get the key points
              </span>
            </button>

            <button
              onClick={() => runAction("reply")}
              disabled={loading}
              className="rounded-2xl border border-[#E2E8DD] bg-white p-4 text-left transition hover:bg-[#EDF3E7] disabled:opacity-50"
            >
              <MessageSquare size={20} className="mb-3 text-[#547957]" />
              <span className="block text-sm font-medium">Draft reply</span>
              <span className="mt-1 block text-xs text-[#899389]">
                Suggest a response
              </span>
            </button>
          </div>

          {loading && (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#EAF0E5] p-4 text-sm text-[#355B42]">
              <LoaderCircle size={18} className="animate-spin" />
              Working on your email...
            </div>
          )}

          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-6 rounded-2xl border border-[#E2E8DD] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Result</span>
                <button
                  onClick={copyResult}
                  title="Copy result"
                  className="rounded-lg p-2 text-[#547957] hover:bg-[#EDF3E7]"
                >
                  <Copy size={17} />
                </button>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#485449]">
                {result}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
