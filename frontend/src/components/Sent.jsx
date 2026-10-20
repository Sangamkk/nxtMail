import { useEffect, useState } from "react";
import EmailDetail from "./EmailDetail";
import { Star } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Sent({ onStar, onArchive, onDelete, onReply, onSummarize }) {
    const [emails, setEmails] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API}/api/gmail/sent`, { credentials: "include" })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load sent emails");
                setEmails(data.emails || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#E7E9DF] bg-white">
            <div className="flex w-full min-w-0 flex-col border-r border-[#EDF0E8] md:w-[395px] md:shrink-0">
                <header className="flex items-center justify-between border-b border-[#EDF0E8] p-5">
                    <h2 className="text-xl font-semibold text-[#29372D]">Sent</h2>
                    <span className="text-xs text-[#8B9688]">{emails.length}</span>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading ? (
                        <p className="p-6 text-sm text-[#8B9688]">Loading emails...</p>
                    ) : error ? (
                        <p className="p-6 text-sm text-red-600">{error}</p>
                    ) : emails.length === 0 ? (
                        <p className="p-6 text-sm text-[#8B9688]">No sent emails found.</p>
                    ) : emails.map((email, i) => (
                        <button
                            key={email.id || email.messageId || i}
                            onClick={() => setSelected(email)}
                            className={`w-full border-b border-[#F0F1EB] p-4 text-left transition hover:bg-[#F4F6EF] ${
                                selected === email ? "bg-[#F0F4EA]" : ""
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium text-[#29372D]">
                                    To: {email.to || "Unknown recipient"}
                                </p>
                                <Star size={16} className={email.starred ? "shrink-0 fill-yellow-400 text-yellow-400" : "shrink-0 text-[#B0B9AB]"} />
                            </div>
                            <p className="mt-1 truncate text-sm text-[#29372D]">
                                {email.subject || "(No subject)"}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#8B9688]">
                                {email.snippet || "No preview available"}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="hidden min-h-0 min-w-0 flex-1 md:flex">
                {selected ? (
                    <EmailDetail
                        email={selected}
                        onBack={() => setSelected(null)}
                        onStar={() => onStar?.(selected)}
                        onArchive={() => onArchive?.(selected)}
                        onDelete={() => onDelete?.(selected)}
                        onReply={onReply}
                        onSummarize={onSummarize}
                    />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-[#849084]">
                        <p className="text-sm">Select an email to read</p>
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-40 flex bg-white md:hidden">
                    <EmailDetail
                        email={selected}
                        onBack={() => setSelected(null)}
                        onStar={() => onStar?.(selected)}
                        onArchive={() => onArchive?.(selected)}
                        onDelete={() => onDelete?.(selected)}
                        onReply={onReply}
                        onSummarize={onSummarize}
                    />
                </div>
            )}
        </section>
    );
}
