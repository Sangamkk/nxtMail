
import { useEffect, useState } from "react";
import { Trash2, RotateCcw, Search, LoaderCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Trash({ onRestore, onPermanentDelete }) {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTrash() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/gmail/trash`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to load Trash.");

      const list = Array.isArray(data)
        ? data
        : data.emails ?? data.messages ?? data.data;

      if (!Array.isArray(list)) throw new Error("Invalid Trash response.");
      setEmails(list);
    } catch (err) {
      setError(err.message || "Unable to load Trash.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrash();
  }, []);

  const filtered = emails.filter(email =>
    [email.from, email.sender, email.subject, email.snippet]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  async function performAction(email, action) {
    const id = email.id || email.messageId;
    if (!id) return;

    try {
      setError("");
      const res = await fetch(
        `${API}/api/gmail/emails/${id}${action === "restore" ? "/restore" : ""}`,
        {
          method: action === "restore" ? "POST" : "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Action failed.");

      setEmails(current => current.filter(item =>
        (item.id || item.messageId) !== id
      ));

      if (action === "restore") onRestore?.(email);
      else onPermanentDelete?.(email);
    } catch (err) {
      setError(err.message || "Action failed.");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#FAF9F5]">
      <header className="flex items-center gap-3 border-b border-[#E7E9DF] p-5">
        <Trash2 className="text-[#A24F43]" size={22} />
        <h2 className="flex-1 text-xl font-semibold text-[#29372D]">Trash</h2>
        <span className="text-sm text-[#849084]">{filtered.length}</span>
      </header>

      <div className="flex items-center gap-2 border-b border-[#E7E9DF] bg-white px-4 py-3">
        <Search size={18} className="text-[#849084]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search deleted emails..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-6 text-sm text-[#849084]">
            <LoaderCircle size={16} className="mr-2 inline animate-spin" />
            Loading Trash...
          </p>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">
            {error}
            <button onClick={loadTrash} className="ml-2 underline">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-[#849084]">
            <Trash2 size={32} className="mb-3" />
            <p className="font-medium">{search ? "No matching emails" : "No trash to show"}</p>
          </div>
        ) : filtered.map((email, index) => (
          <div key={email.id || email.messageId || index} className="flex items-center gap-3 border-b border-[#E7E9DF] bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#29372D]">
                {email.from || email.sender || "Unknown sender"}
              </p>
              <p className="truncate text-sm text-[#59665A]">
                {email.subject || "(No subject)"}
              </p>
              <p className="truncate text-xs text-[#849084]">{email.snippet || ""}</p>
            </div>

            <button title="Restore" onClick={() => performAction(email, "restore")} className="rounded-lg p-2 text-[#355B42] hover:bg-[#E3EDDB]">
              <RotateCcw size={18} />
            </button>
            <button title="Delete permanently" onClick={() => window.confirm("Delete permanently?") && performAction(email, "delete")} className="rounded-lg p-2 text-[#A24F43] hover:bg-[#F8E9E5]">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
