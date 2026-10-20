import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EmailInsights({ email, onClose }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  async function analyzeEmail() {
    if (!email) {
      setError("Select an email first.");
      return;
    }

    setLoading(true);
    setError("");
    setInsights(null);

    try {
      const response = await fetch(`${API}/api/ai/insights`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: email.id || email.messageId,
          subject: email.subject || "",
          body:
            email.body ||
            email.text ||
            email.snippet ||
            "",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to analyze this email."
        );
      }

      setInsights(data.insights || data.result || data);
    } catch (err) {
      setError(
        err.message || "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  const actionItems = Array.isArray(insights?.actionItems)
    ? insights.actionItems
    : [];

  const deadlines = Array.isArray(insights?.deadlines)
    ? insights.deadlines
    : [];

  function formatItem(item) {
    if (typeof item === "string") return item;

    if (item && typeof item === "object") {
      return [
        item.task || item.title || item.description || "Task",
        item.date ? `Date: ${item.date}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
    }

    return String(item);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/20"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-[#FAF9F5] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#E8E8DF] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E3EDDB] p-2 text-[#355B42]">
              <Sparkles size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-[#29372D]">
                Email Insights
              </h2>
              <p className="text-sm text-[#849084]">
                Summary, tasks and deadlines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close insights"
            className="rounded-lg p-2 text-[#718071] transition hover:bg-[#E3EDDB]"
          >
            <X size={19} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {email ? (
            <div className="rounded-xl border border-[#E8E8DF] bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#849084]">
                Selected email
              </p>

              <h3 className="font-medium text-[#29372D]">
                {email.subject || "(No subject)"}
              </h3>

              <p className="mt-1 truncate text-sm text-[#849084]">
                {email.from || email.sender || ""}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E8E8DF] bg-white p-5 text-center">
              <Sparkles
                size={24}
                className="mx-auto mb-3 text-[#849084]"
              />
              <p className="text-sm text-[#718071]">
                Select an email from your inbox to generate insights.
              </p>
            </div>
          )}

          <button
            onClick={analyzeEmail}
            disabled={!email || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#355B42] px-4 py-3 font-medium text-white transition hover:bg-[#294A35] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={17} />
            {loading ? "Analyzing email..." : "Generate insights"}
          </button>

          {error && (
            <div className="flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {insights && (
            <div className="space-y-4">
              {/* Summary */}
              <section className="rounded-xl border border-[#E8E8DF] bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#29372D]">
                  <Sparkles size={17} className="text-[#60866A]" />
                  Summary
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-6 text-[#59665A]">
                  {typeof insights.summary === "string"
                    ? insights.summary
                    : "No summary returned by the server."}
                </p>
              </section>

              {/* Action items */}
              <section className="rounded-xl border border-[#E8E8DF] bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#29372D]">
                  <ListTodo size={17} className="text-[#60866A]" />
                  Action items
                  <span className="ml-auto rounded-full bg-[#E3EDDB] px-2 py-0.5 text-xs text-[#355B42]">
                    {actionItems.length}
                  </span>
                </h3>

                {actionItems.length > 0 ? (
                  <ul className="space-y-3">
                    {actionItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-[#59665A]"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-[#60866A]"
                        />
                        <span>{formatItem(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#849084]">
                    No action items found.
                  </p>
                )}
              </section>

              {/* Deadlines */}
              <section className="rounded-xl border border-[#E8E8DF] bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#29372D]">
                  <Clock size={17} className="text-[#60866A]" />
                  Deadlines
                  <span className="ml-auto rounded-full bg-[#E3EDDB] px-2 py-0.5 text-xs text-[#355B42]">
                    {deadlines.length}
                  </span>
                </h3>

                {deadlines.length > 0 ? (
                  <ul className="space-y-3">
                    {deadlines.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-lg bg-[#F7F8F2] p-3 text-sm text-[#59665A]"
                      >
                        {formatItem(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#849084]">
                    No deadlines found.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
