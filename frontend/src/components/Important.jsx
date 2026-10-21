
import { useCallback, useEffect, useState } from "react";
import {
    BrainCircuit,
    RefreshCw,
    Search,
    SlidersHorizontal,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const panel =
    "flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#E7E9DF] bg-white";

export default function Important({ search = "" }) {
    const [emails, setEmails] = useState([]);
    const [selected, setSelected] = useState(null);
    const [preferences, setPreferences] = useState("");
    const [appliedPreferences, setAppliedPreferences] = useState("");
    const [showPreferences, setShowPreferences] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadImportantEmails = useCallback(async (customPreferences = "") => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams();

            if (customPreferences.trim()) {
                params.set("preferences", customPreferences.trim());
            }

            const query = params.toString();
            const url = `${API}/api/gmail/important${query ? `?${query}` : ""}`;

            const response = await fetch(url, {
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load important emails"
                );
            }

            const results = Array.isArray(data)
                ? data
                : data.emails || [];

            setEmails(results);
            setSelected(previous =>
                results.find(email => email.id === previous?.id) || null
            );
            setAppliedPreferences(customPreferences.trim());
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadImportantEmails();
    }, [loadImportantEmails]);

    function applyPreferences(event) {
        event.preventDefault();
        setSelected(null);
        loadImportantEmails(preferences);
    }

    const visibleEmails = emails.filter(email =>
        [
            email.subject,
            email.from || email.sender,
            email.snippet,
            email.reason,
        ]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <section className={panel}>
            {/* Email list */}
            <div
                className={`w-full min-w-0 flex-col md:flex md:w-[360px] md:shrink-0 md:border-r md:border-[#EDF0E8] ${
                    selected ? "hidden" : "flex"
                }`}
            >
                <header className="border-b border-[#EDF0E8] p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-[#29372D]">
                                Important
                            </h2>
                            <p className="mt-1 text-xs text-[#8B9688]">
                                Selected by NXT AI
                            </p>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() =>
                                    setShowPreferences(value => !value)
                                }
                                title="Importance preferences"
                                className={`rounded-lg p-2 hover:bg-[#EDF2E7] ${
                                    showPreferences
                                        ? "bg-[#EDF3E7] text-[#355B42]"
                                        : "text-[#59665A]"
                                }`}
                            >
                                <SlidersHorizontal size={17} />
                            </button>

                            <button
                                onClick={() =>
                                    loadImportantEmails(appliedPreferences)
                                }
                                disabled={loading}
                                title="Refresh important emails"
                                className="rounded-lg p-2 text-[#59665A] hover:bg-[#EDF2E7] disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "animate-spin" : ""}
                                />
                            </button>
                        </div>
                    </div>

                    {showPreferences && (
                        <form onSubmit={applyPreferences} className="mt-4">
                            <label
                                htmlFor="important-preferences"
                                className="mb-2 block text-sm font-medium text-[#29372D]"
                            >
                                What emails matter to you?
                            </label>

                            <textarea
                                id="important-preferences"
                                value={preferences}
                                onChange={event =>
                                    setPreferences(event.target.value)
                                }
                                rows={3}
                                maxLength={1000}
                                placeholder="e.g. Job opportunities, college deadlines, work tasks and payment reminders..."
                                className="w-full resize-y rounded-xl border border-[#E7E9DF] bg-[#FAFBF8] p-3 text-sm text-[#29372D] outline-none placeholder:text-[#9AA397] focus:border-[#78945F]"
                            />

                            <p className="mt-2 text-xs leading-5 text-[#8B9688]">
                                Leave empty to use general AI importance
                                criteria.
                            </p>

                            <div className="mt-3 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-lg bg-[#355B42] px-3 py-2 text-sm font-medium text-white hover:bg-[#294A35] disabled:opacity-50"
                                >
                                    Apply preferences
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreferences("");
                                        setSelected(null);
                                        loadImportantEmails("");
                                    }}
                                    disabled={loading}
                                    className="rounded-lg border border-[#E7E9DF] px-3 py-2 text-sm text-[#59665A] hover:bg-[#F4F6EF]"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    )}

                    {appliedPreferences && !showPreferences && (
                        <button
                            onClick={() => setShowPreferences(true)}
                            className="mt-3 flex max-w-full items-center gap-2 rounded-lg bg-[#EDF3E7] px-3 py-2 text-left text-xs text-[#355B42]"
                        >
                            <Search size={14} className="shrink-0" />
                            <span className="truncate">
                                Using your custom preferences
                            </span>
                        </button>
                    )}
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-6 text-sm text-[#8B9688]">
                            <BrainCircuit
                                size={20}
                                className="mb-3 animate-pulse"
                            />
                            NXT is finding your important emails...
                        </div>
                    ) : error ? (
                        <div className="p-6 text-sm text-red-600">
                            <AlertCircle size={19} className="mb-2" />
                            {error}
                            <button
                                onClick={() =>
                                    loadImportantEmails(appliedPreferences)
                                }
                                className="mt-3 block font-medium underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : visibleEmails.length === 0 ? (
                        <div className="px-6 py-16 text-center text-sm text-[#849084]">
                            <BrainCircuit
                                size={32}
                                className="mx-auto mb-3"
                            />
                            <p className="font-medium text-[#59665A]">
                                No important emails found
                            </p>
                            <p className="mt-2">
                                Try changing your preferences or refreshing.
                            </p>
                        </div>
                    ) : (
                        visibleEmails.map(email => (
                            <button
                                key={email.id}
                                onClick={() => setSelected(email)}
                                className={`w-full border-b border-[#F0F1EB] p-4 text-left hover:bg-[#F4F6EF] ${
                                    selected?.id === email.id
                                        ? "bg-[#EDF3E7]"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-medium text-[#29372D]">
                                        {email.from ||
                                            email.sender ||
                                            "Unknown sender"}
                                    </p>
                                    <BrainCircuit
                                        size={16}
                                        className="shrink-0 text-[#78945F]"
                                    />
                                </div>

                                <p className="mt-1 truncate text-sm text-[#29372D]">
                                    {email.subject || "(No subject)"}
                                </p>

                                <p className="mt-1 truncate text-xs text-[#8B9688]">
                                    {email.reason ||
                                        email.snippet ||
                                        "Classified as important"}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Selected email */}
            <div
                className={`min-w-0 flex-1 flex-col ${
                    selected ? "flex" : "hidden md:flex"
                }`}
            >
                {selected ? (
                    <>
                        <header className="flex items-center gap-3 border-b border-[#EDF0E8] p-4">
                            <button
                                onClick={() => setSelected(null)}
                                className="rounded-lg p-2 text-[#355B42] hover:bg-[#EDF3E7] md:hidden"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <BrainCircuit
                                size={19}
                                className="text-[#355B42]"
                            />

                            <span className="text-sm font-medium text-[#355B42]">
                                Important email
                            </span>
                        </header>

                        <article className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
                            <h2 className="mb-5 break-words text-2xl font-semibold text-[#29372D]">
                                {selected.subject || "(No subject)"}
                            </h2>

                            <p className="mb-2 break-words text-sm text-[#59665A]">
                                From:{" "}
                                {selected.from ||
                                    selected.sender ||
                                    "Unknown sender"}
                            </p>

                            {selected.date && (
                                <p className="mb-5 text-xs text-[#8B9688]">
                                    {selected.date}
                                </p>
                            )}

                            <div className="mb-6 rounded-xl bg-[#F4F6EF] p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#355B42]">
                                    Why NXT considers this important
                                </p>

                                <p className="text-sm leading-6 text-[#59665A]">
                                    {selected.reason ||
                                        "NXT classified this email as important."}
                                </p>
                            </div>

                            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#59665A]">
                                {selected.body ||
                                    selected.text ||
                                    selected.snippet ||
                                    "Email content is not available in this response."}
                            </div>
                        </article>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-sm text-[#849084]">
                        <BrainCircuit size={34} strokeWidth={1.3} />
                        <p className="mt-3">Select an important email</p>
                    </div>
                )}
            </div>
        </section>
    );
}
