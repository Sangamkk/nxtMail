import { useEffect, useState } from "react";
import { Clock, RotateCcw, Mail, CalendarClock } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Snoozed() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchSnoozed() {
        try {
            setLoading(true);

            const res = await fetch(`${API}/api/snooze`, {
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to load snoozed emails");
            }

            setEmails(Array.isArray(data) ? data : data.emails || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function unsnoozeEmail(id) {
        try {
            const res = await fetch(`${API}/api/snooze/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to unsnooze email");
            }

            await fetchSnoozed();
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        fetchSnoozed();

        const refresh = () => fetchSnoozed();
        window.addEventListener("refresh-snoozed", refresh);

        return () => {
            window.removeEventListener("refresh-snoozed", refresh);
        };
    }, []);

    if (loading) {
        return <p className="p-6 text-sm text-[#849084]">Loading snoozed emails...</p>;
    }

    if (error && emails.length === 0) {
        return <p className="p-6 text-sm text-red-600">{error}</p>;
    }

    if (!emails.length) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-[#849084]">
                <Clock size={34} />
                <p className="mt-3 text-sm">No snoozed emails</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {error && <p className="p-4 text-sm text-red-600">{error}</p>}

            {emails.map((email) => {
                const id = email.id || email.messageId;
                const until = email.snooze_until || email.snoozedUntil;

                return (
                    <div
                        key={id}
                        className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EDF0E8] p-5 hover:bg-[#F7F9F4]"
                    >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="rounded-full bg-[#E3EDDB] p-2 text-[#355B42]">
                                <Mail size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#29372D]">
                                    {email.from || email.sender || "Unknown sender"}
                                </p>

                                <p className="mt-1 text-sm text-[#29372D]">
                                    {email.subject || "(No subject)"}
                                </p>

                                <p className="mt-1 text-sm text-[#59665A]">
                                    {email.body || email.text || email.snippet || "No preview available"}
                                </p>

                                {email.to && (
                                    <p className="mt-2 text-xs text-[#849084]">
                                        To: {email.to}
                                    </p>
                                )}

                                {email.cc && (
                                    <p className="text-xs text-[#849084]">
                                        CC: {email.cc}
                                    </p>
                                )}

                                {email.date && (
                                    <p className="mt-1 text-xs text-[#849084]">
                                        Received: {new Date(email.date).toLocaleString()}
                                    </p>
                                )}

                                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#58765A]">
                                    <CalendarClock size={14} />
                                    {until
                                        ? `Returns ${new Date(until).toLocaleString()}`
                                        : "Return time unavailable"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => unsnoozeEmail(id)}
                            className="flex shrink-0 items-center gap-2 rounded-lg border border-[#DCE5D5] px-3 py-2 text-sm text-[#355B42] hover:bg-[#E3EDDB]"
                        >
                            <RotateCcw size={15} />
                            Unsnooze
                        </button>
                    </div>
                );
            })}
        </div>
    );
}