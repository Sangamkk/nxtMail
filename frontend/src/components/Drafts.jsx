import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCw, Trash2 } from "lucide-react";
import ComposeEmail from "./ComposeEmail";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const panel = "flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#E7E9DF] bg-white";

export default function Drafts({ search = "" }) {
    const [drafts, setDrafts] = useState([]);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDrafts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API}/api/gmail/drafts`, {
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Unable to load drafts");

            setDrafts(Array.isArray(data) ? data : data.drafts || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    const visible = drafts.filter(draft =>
        [draft.to, draft.subject, draft.body, draft.snippet]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    async function deleteDraft(draft) {
        const id = draft.id || draft.draftId;
        if (!id) return;

        try {
            const res = await fetch(`${API}/api/gmail/drafts/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) throw new Error(data.message || "Unable to delete draft");

            setDrafts(prev => prev.filter(d => (d.id || d.draftId) !== id));
            setSelected(null);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className={panel}>
            <div className={`w-full min-w-0 flex-col md:flex md:w-[360px] md:shrink-0 md:border-r md:border-[#EDF0E8] ${selected ? "hidden" : "flex"}`}>
                <header className="flex items-center justify-between border-b border-[#EDF0E8] p-5">
                    <h2 className="text-xl font-semibold text-[#29372D]">Drafts</h2>
                    <button onClick={loadDrafts} title="Refresh drafts" className="rounded-lg p-2 hover:bg-[#EDF2E7]">
                        <RefreshCw size={16} />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading ? (
                        <p className="p-6 text-sm text-[#8B9688]">Loading drafts...</p>
                    ) : error ? (
                        <p className="p-6 text-sm text-red-600">{error}</p>
                    ) : visible.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[#849084]">
                            <FileText size={30} className="mx-auto mb-3" />
                            No drafts found
                        </div>
                    ) : visible.map((draft, i) => (
                        <button
                            key={draft.id || draft.draftId || i}
                            onClick={() => {
                                setSelected(draft);
                                setEditing(false);
                            }}
                            className={`w-full border-b border-[#F0F1EB] p-4 text-left hover:bg-[#F4F6EF] ${
                                selected === draft ? "bg-[#EDF3E7]" : ""
                            }`}
                        >
                            <p className="truncate text-sm font-medium text-[#29372D]">
                                {draft.to || "No recipient"}
                            </p>
                            <p className="mt-1 truncate text-sm text-[#29372D]">
                                {draft.subject || "(No subject)"}
                            </p>
                            <p className="mt-1 truncate text-xs text-[#8B9688]">
                                {draft.snippet || draft.body || "Empty draft"}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className={`min-w-0 flex-1 flex-col ${selected ? "flex" : "hidden md:flex"}`}>
                {selected ? (
                    editing ? (
                        <ComposeEmail
                            draft={selected}
                            onClose={() => setEditing(false)}
                            onSent={() => {
                                setSelected(null);
                                loadDrafts();
                            }}
                        />
                    ) : (
                        <>
                            <header className="flex items-center justify-between border-b border-[#EDF0E8] p-4">
                                <button onClick={() => setSelected(null)} className="text-sm text-[#355B42] md:hidden">
                                    Back
                                </button>
                                <span className="truncate text-sm text-[#8B9688]">Draft</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditing(true)} className="rounded-lg bg-[#355B42] px-3 py-2 text-sm text-white">
                                        Continue editing
                                    </button>
                                    <button onClick={() => deleteDraft(selected)} title="Delete draft" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </header>
                            <article className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
                                <h2 className="mb-5 break-words text-2xl font-semibold text-[#29372D]">
                                    {selected.subject || "(No subject)"}
                                </h2>
                                <p className="mb-4 text-sm text-[#59665A]">
                                    To: {selected.to || "No recipient"}
                                </p>
                                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#59665A]">
                                    {selected.body || selected.text || "Empty draft"}
                                </div>
                            </article>
                        </>
                    )
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#849084]">
                        <FileText size={32} strokeWidth={1.3} />
                        <p className="mt-3">Select a draft to view it</p>
                    </div>
                )}
            </div>
        </section>
    );
}
