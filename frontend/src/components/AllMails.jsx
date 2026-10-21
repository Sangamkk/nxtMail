import { useCallback, useEffect, useState } from "react";
import { Mail, Archive, RefreshCw, ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AllMails({ search = "" }) {
    const [emails, setEmails] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadEmails = useCallback(async () => {
        console.log("loadEmails called");
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/gmail/all`, {
                credentials: "include",
            });
            const data = await res.json();
            console.log("....", data);
            if (!res.ok) throw new Error(data.message);
            setEmails(data.emails || []);
            setSelected(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadEmails(); }, [loadEmails]);

    const visible = emails.filter(e =>
        [e.from, e.subject, e.snippet].join(" ").toLowerCase()
            .includes(search.toLowerCase())
    );

    async function archiveEmail() {
        const res = await fetch(`${API}/api/gmail/archive/${selected.id}`, {
            method: "PATCH",
            credentials: "include",
        });
        if (!res.ok) throw new Error("Archive failed");
        await loadEmails();
    }

    return (
        <section className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#E7E9DF] bg-white">
            <div className={`${selected ? "hidden" : "flex"} w-full min-w-0 flex-col md:flex md:w-[380px] md:shrink-0 md:border-r md:border-[#EDF0E8]`}>
                <header className="flex items-center justify-between border-b border-[#EDF0E8] p-5">
                    <h2 className="text-xl font-semibold text-[#29372D]">All Mail</h2>
                    <span className="text-xs text-[#8B9688]">{loading ? "Loading..." : visible.length}</span>
                    <button onClick={loadEmails} title="Refresh" className="rounded-lg p-2 hover:bg-[#EDF2E7]">
                        <RefreshCw size={17} />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading ? (
                        <p className="p-6 text-sm text-[#849084]">Loading emails...</p>
                    ) : visible.length ? visible.map((e, i) => (
                        <button
                            key={e.id || e.messageId || i}
                            onClick={() => setSelected(e)}
                            className={`flex w-full items-start gap-3 border-b border-[#F0F1EB] px-4 py-5 text-left transition hover:bg-[#F4F6EF] ${selected?.id === e.id ? "bg-[#EDF3E7]" : ""
                                }`}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5EDDF] font-semibold text-[#547D5D]">
                                {(e.from || e.sender || "?").charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#29372D]">
                                    {e.from || e.sender || "Unknown sender"}
                                </p>
                                <p className="mt-1 truncate text-sm text-[#29372D]">
                                    {e.subject || "(No subject)"}
                                </p>
                                <p className="mt-1 truncate text-xs text-[#8B9688]">
                                    {e.snippet || ""}
                                </p>
                            </div>

                            <button
                                onClick={event => {
                                    event.stopPropagation();
                                    setSelected(e);
                                }}
                                title="View email"
                                className="shrink-0 rounded-lg p-1 text-[#8B9688] hover:bg-[#E5EDDF]"
                            >
                                <Mail size={17} />
                            </button>
                        </button>
                    )) : (
                        <div className="py-16 text-center text-sm text-[#849084]">
                            <Mail size={30} className="mx-auto mb-3" />
                            No emails found
                        </div>
                    )}
                </div>
            </div>

            <div className={`${selected ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`}>
                {selected ? (
                    <>
                        <header className="flex items-center justify-between border-b border-[#EDF0E8] p-4">
                            <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-[#355B42] hover:bg-[#EDF3E7] md:hidden">
                                <ArrowLeft size={18} />
                            </button>

                            <span className="text-sm text-[#8B9688]">All Mail</span>

                            {selected.labelIds?.includes("INBOX") && (
                                <button
                                    onClick={archiveEmail}
                                    title="Archive"
                                    className="rounded-lg p-2 text-[#59665A] hover:bg-[#EDF3E7]"
                                >
                                    <Archive size={18} />
                                </button>
                            )}
                        </header>

                        <article className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
                            <h2 className="mb-5 break-words text-2xl font-semibold text-[#29372D]">
                                {selected.subject || "(No subject)"}
                            </h2>

                            <div className="mb-6 border-b border-[#EDF0E8] pb-5">
                                <p className="break-words text-sm font-medium text-[#29372D]">
                                    {selected.from || selected.sender || "Unknown sender"}
                                </p>
                                {selected.date && (
                                    <p className="mt-1 text-xs text-[#8B9688]">
                                        {selected.date}
                                    </p>
                                )}
                            </div>

                            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#59665A]">
                                {selected.body || selected.text || selected.snippet || "No content available."}
                            </div>
                        </article>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#849084]">
                        <Mail size={32} strokeWidth={1.3} />
                        <p className="mt-3">Select an email to read</p>
                    </div>
                )}
            </div>
        </section>
    );
}
