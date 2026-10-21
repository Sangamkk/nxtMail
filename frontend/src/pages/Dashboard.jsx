import { useEffect, useState } from "react";
import { Inbox, Search, RefreshCw, Sparkles, Mail, Link2, Star, ListTodo } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ComposeEmail from "../components/ComposeEmail";
import EmailDetail from "../components/EmailDetail";
import AIAssistant from "../components/AIAssistant";
import EmailInsights from "../components/EmailInsights";
import Trash from "../components/Trash";
import Starred from "../components/Starred";
import Snoozed from "../components/Snoozed";
import Sent from "../components/Sent";
import Drafts from "../components/Drafts";
import Important from "../components/Important";
import AllMails from "../components/AllMails";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const panel = "rounded-2xl border border-[#E7E9DF] bg-white/80";
const action = "rounded-xl p-3 transition hover:bg-[#EDF2E7]";

export default function Dashboard() {
    const [emails, setEmails] = useState([]);
    const [selected, setSelected] = useState(null);
    const [active, setActive] = useState("Inbox");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [needsGmail, setNeedsGmail] = useState(false);
    const [composeOpen, setComposeOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [insightsOpen, setInsightsOpen] = useState(false);

    async function fetchEmails() {
        setLoading(true);
        setError("");
        setNeedsGmail(false);
        try {
            const res = await fetch(`${API}/api/gmail/emails`, { credentials: "include" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (data.message?.toLowerCase().includes("connect gmail")) setNeedsGmail(true);
                throw new Error(data.message || "Unable to load emails.");
            }
            const list = Array.isArray(data) ? data : data.emails ?? data.messages ?? data.data;
            if (!Array.isArray(list)) throw new Error("Unexpected email response.");
            setEmails(list.map(email => ({
                ...email,
                starred: email.starred ?? email.labelIds?.includes("STARRED") ?? false,
            })));
        } catch (err) {
            setError(err.message || "Could not connect to backend.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchEmails(); }, []);

    const connectGmail = () => {
        window.location.href = `${API}/api/gmail/connect`;
    };

    const changeFolder = (folder) => {
        setActive(folder);
        setSelected(null);
        setSearch("");
        setError("");
        if (folder === "Inbox") fetchEmails();
    };

    const filtered = emails.filter(e =>
        [e.from, e.sender, e.subject, e.snippet]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    async function emailAction(id, path, method) {
        try {
            const res = await fetch(`${API}/api/gmail/emails/${id}${path}`, {
                method,
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Email action failed.");
            setSelected(null);
            await fetchEmails();
        } catch (err) {
            setError(err.message);
        }
    }

    async function snoozeEmail(email, snoozedUntil) {
        try {
            const snoozeDate = new Date(snoozedUntil);

            if (Number.isNaN(snoozeDate.getTime()) || snoozeDate <= new Date()) {
                setError("Please select a future date and time.");
                return;
            }

            const res = await fetch(`${API}/api/snooze/${email.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    snoozedUntil: snoozeDate.toISOString(),
                    from: email.from,
                    subject: email.subject,
                    snippet: email.snippet,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to snooze email");
            }

            setSelected(null);
            await fetchEmails();
        } catch (err) {
            setError(err.message);
        }
    }

    async function toggleStar(email) {
        const id = email.id || email.messageId;
        const starred = !email.starred;
        const update = e => (e.id || e.messageId) === id ? { ...e, starred } : e;

        setEmails(prev => prev.map(update));
        setSelected(prev => prev ? update(prev) : prev);

        try {
            const res = await fetch(`${API}/api/gmail/emails/${id}/${starred ? "star" : "unstar"}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to update star");
        } catch (err) {
            setEmails(prev => prev.map(e => (e.id || e.messageId) === id ? { ...e, starred: !starred } : e));
            setSelected(prev => prev && (prev.id || prev.messageId) === id ? { ...prev, starred: !starred } : prev);
            setError(err.message);
        }
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#FAF9F5] text-[#29372D]">
            <Sidebar
                activeFolder={active}
                onFolderChange={changeFolder}
                onCompose={() => setComposeOpen(true)}
                onSettings={() => { }}
            />

            <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:p-6">
                <header className="flex items-center gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E7E9DF] bg-white px-3 py-3">
                        <Search size={18} className="text-[#8B9688]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search emails..."
                            className="w-full bg-transparent text-sm outline-none"
                        />
                    </div>
                    <button
                        title="Refresh"
                        onClick={() => {
                            if (active === "Inbox") fetchEmails();
                            else window.dispatchEvent(new Event(`refresh-${active.toLowerCase()}`));
                        }}
                        className={action}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button title="AI Assistant" onClick={() => setAiOpen(true)} className={`${action} bg-[#E3EDDB] text-[#355B42]`}>
                        <Sparkles size={19} />
                    </button>
                    <button title="Email Insights" onClick={() => setInsightsOpen(true)} className={`${action} text-[#355B42]`}>
                        <ListTodo size={19} />
                    </button>
                </header>

                {active === "Trash" ? (
                    <section className={`${panel} min-h-0 flex-1 overflow-y-auto`}>
                        <Trash onRestore={fetchEmails} onPermanentDelete={() => { }} />
                    </section>
                ) : active === "Starred" ? (
                    <section className={`${panel} min-h-0 flex-1 overflow-y-auto`}>
                        <Starred />
                    </section>
                ) : active === "Sent" ? (
                    <section className={`${panel} min-h-0 flex-1 overflow-y-auto`}>
                        <Sent onSelectEmail={setSelected} />
                    </section>
                ) : active === "Snoozed" ? (
                    <section className={`${panel} min-h-0 flex-1 overflow-y-auto`}>
                        <Snoozed />
                    </section>
                ) : active === "Drafts" ? (
                    <section className={`${panel} min-h-0 flex-1 overflow-y-auto`}>
                        <Drafts search={search} />
                    </section>
                ) : active === "Important" ? (
                    <section className={`${panel} min-h-0 flex-1 overflow-y-auto`}>
                        <Important search={search} />
                    </section>
                ) : active === "All Mail" ? (
                    <section className={`${panel} flex min-h-0 flex-1 overflow-hidden`}>
                        <AllMails search={search} />
                    </section>
                ) : (
                    <section className={`${panel} flex min-h-0 flex-1 overflow-hidden`}>
                        <div className={`${selected ? "hidden lg:flex" : "flex"} w-full min-w-0 flex-col lg:w-[360px] lg:shrink-0 lg:border-r lg:border-[#EDF0E8]`}>
                            <div className="flex items-center justify-between border-b border-[#EDF0E8] p-5">
                                <h2 className="text-xl font-semibold">{active}</h2>
                                <span className="text-xs text-[#8B9688]">{loading ? "Loading..." : filtered.length}</span>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {loading ? (
                                    <p className="p-6 text-sm text-[#849084]">Loading emails...</p>
                                ) : error ? (
                                    <div className="space-y-4 p-6 text-center">
                                        <Mail size={28} className="mx-auto text-[#8DA18B]" />
                                        <p className="text-sm">{error}</p>
                                        {needsGmail && (
                                            <button onClick={connectGmail} className="rounded-xl bg-[#355B42] px-4 py-2 text-sm text-white">
                                                <Link2 size={15} className="mr-2 inline" />Connect Gmail
                                            </button>
                                        )}
                                        <button onClick={fetchEmails} className="mx-auto block text-sm text-[#355B42]">Try again</button>
                                    </div>
                                ) : filtered.length ? filtered.map((email, i) => (
                                    <div
                                        key={email.id || email.messageId || i}
                                        onClick={() => setSelected(email)}
                                        className={`flex w-full items-start gap-3 border-b border-[#F0F1EB] p-4 text-left hover:bg-[#F4F6EF] cursor-pointer ${selected === email ? "bg-[#EDF3E7]" : ""}`}
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5EDDF] font-semibold text-[#547D5D]">
                                            {(email.from || email.sender || "?").charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{email.from || email.sender || "Unknown sender"}</p>
                                            <p className="mt-1 truncate text-sm">{email.subject || "(No subject)"}</p>
                                            <p className="mt-1 truncate text-xs text-[#8B9688]">{email.snippet || ""}</p>
                                        </div>

                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                toggleStar(email);
                                            }}
                                            className="shrink-0 p-1"
                                        >
                                            <Star
                                                size={16}
                                                fill={email.starred ? "#EAB308" : "none"}
                                                className={email.starred ? "fill-yellow-400 text-yellow-400" : "text-[#B0B9AB]"}
                                            />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-16 text-center text-sm text-[#849084]">
                                        <Inbox size={30} className="mx-auto mb-3" />
                                        {search ? "No matching emails" : "Your inbox is empty"}
                                        {!search && (
                                            <button onClick={connectGmail} className="mx-auto mt-3 block text-[#355B42]">Connect Gmail</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${selected ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col`}>
                            <EmailDetail
                                email={selected}
                                onBack={() => setSelected(null)}
                                onStar={() => selected && toggleStar(selected)}
                                onArchive={() => selected && emailAction(selected.id || selected.messageId, "/archive", "PATCH")}
                                onDelete={() => selected && emailAction(selected.id || selected.messageId, "/trash", "POST")}
                                onSnooze={until => selected && snoozeEmail(selected, until)}
                                onReply={() => console.log("Reply:", selected?.id)}
                                onSummarize={() => setAiOpen(true)}
                            />
                        </div>
                    </section>
                )}
            </main>

            {composeOpen && <ComposeEmail onClose={() => setComposeOpen(false)} onSend={async email => console.log("Compose:", email)} />}
            {aiOpen && <AIAssistant email={selected} onClose={() => setAiOpen(false)} />}
            {insightsOpen && <EmailInsights email={selected} onClose={() => setInsightsOpen(false)} />}
        </div>
    );
}
