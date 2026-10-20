import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Archive, Trash2, RotateCcw, Star, Reply,
  Sparkles, Clock, Calendar, ChevronDown, X,
} from "lucide-react";

export default function EmailDetail({
  email,
  onBack,
  onStar,
  onArchive,
  onDelete,
  onSnooze,
  onRestore,
  onPermanentDelete,
  onReply,
  onSummarize,
  isTrash = false,
}) {
  const [showSnooze, setShowSnooze] = useState(false);
  const [snoozeDate, setSnoozeDate] = useState("");
  const [snoozeTime, setSnoozeTime] = useState("09:00");
  const [error, setError] = useState("");
  const snoozeRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (snoozeRef.current && !snoozeRef.current.contains(e.target)) {
        setShowSnooze(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!email) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-[#849084]">
        <Reply size={32} strokeWidth={1.3} />
        <p className="mt-3 text-sm">Select an email to read</p>
      </div>
    );
  }

  const button =
    "flex items-center gap-2 rounded-lg border border-[#E8E8DF] px-3 py-2 text-sm transition hover:bg-[#E3EDDB]";

  function confirmSnooze() {
    if (!snoozeDate || !snoozeTime) {
      setError("Select a date and time.");
      return;
    }

    const selectedDate = new Date(`${snoozeDate}T${snoozeTime}`);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() <= Date.now()) {
      setError("Choose a future date and time.");
      return;
    }

    onSnooze?.(selectedDate.toISOString());
    setShowSnooze(false);
    setSnoozeDate("");
    setError("");
  }

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-[#EDF0E8] p-4">
        <button onClick={onBack} className={`${button} lg:hidden`}>
          <ArrowLeft size={17} /> Back
        </button>

        {!isTrash && (
          <>
            <button onClick={onArchive} className={button} title="Archive">
              <Archive size={17} />
              <span className="hidden sm:inline">Archive</span>
            </button>

            <button onClick={onStar} className={button} title="Star">
              <Star
                size={17}
                className={
                  email.starred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-[#B0B9AB]"
                }
              />
              <span className="hidden sm:inline">
                {email.starred ? "Starred" : "Star"}
              </span>
            </button>

            <button onClick={onDelete} className={button} title="Move to Trash">
              <Trash2 size={17} />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <div className="relative" ref={snoozeRef}>
              <button
                onClick={() => {
                  setShowSnooze(prev => !prev);
                  setError("");
                }}
                className={`${button} ${showSnooze ? "bg-[#E3EDDB] text-[#355B42]" : ""
                  }`}
              >
                <Clock size={17} /> Snooze
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showSnooze ? "rotate-180" : ""
                    }`}
                />
              </button>

              {showSnooze && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[290px] max-w-[calc(100vw-32px)] rounded-xl border border-[#E8E8DF] bg-white p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-[#29372D]">
                      Snooze until
                    </h3>
                    <button
                      onClick={() => setShowSnooze(false)}
                      className="rounded-md p-1 text-[#849084] hover:bg-[#F2F5EE]"
                      aria-label="Close snooze menu"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <p className="mb-4 text-xs text-[#849084]">
                    Choose when this email returns to your inbox.
                  </p>

                  <label className="mb-1 block text-xs font-medium text-[#59665A]">
                    Date
                  </label>
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#E8E8DF] px-3 focus-within:border-[#789575]">
                    <Calendar size={17} className="shrink-0 text-[#58765A]" />
                    <input
                      type="date"
                      min={localToday}
                      value={snoozeDate}
                      onChange={e => {
                        setSnoozeDate(e.target.value);
                        setError("");
                      }}
                      className="w-full min-w-0 bg-transparent py-2 text-sm text-[#29372D] outline-none"
                    />
                  </div>

                  <label className="mb-1 block text-xs font-medium text-[#59665A]">
                    Time
                  </label>
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#E8E8DF] px-3 focus-within:border-[#789575]">
                    <Clock size={17} className="shrink-0 text-[#58765A]" />
                    <input
                      type="time"
                      value={snoozeTime}
                      onChange={e => {
                        setSnoozeTime(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-transparent py-2 text-sm text-[#29372D] outline-none"
                    />
                  </div>

                  {error && (
                    <p className="mb-3 text-xs text-red-600">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSnooze(false)}
                      className="flex-1 rounded-lg border border-[#E8E8DF] px-3 py-2 text-sm hover:bg-[#F5F6F1]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmSnooze}
                      className="flex-1 rounded-lg bg-[#355B42] px-3 py-2 text-sm font-medium text-white hover:bg-[#294A35]"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isTrash && (
          <>
            <button onClick={onRestore} className={button}>
              <RotateCcw size={17} /> Restore
            </button>
            <button
              onClick={onPermanentDelete}
              className={`${button} text-[#A24F43]`}
            >
              <Trash2 size={17} /> Delete permanently
            </button>
          </>
        )}

        <button
          onClick={onSummarize}
          className={`${button} ml-auto text-[#355B42]`}
        >
          <Sparkles size={17} />
          AI Summary
        </button>
      </header>

      <article className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
        <h1 className="mb-5 break-words text-xl font-semibold text-[#29372D] sm:text-2xl">
          {email.subject || "(No subject)"}
        </h1>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E3EDDB] font-semibold text-[#355B42]">
            {(email.from || email.sender || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="break-words text-sm font-medium text-[#29372D]">
              {email.from || email.sender || "Unknown sender"}
            </p>
            <p className="mt-1 text-xs text-[#849084]">
              {email.date ? new Date(email.date).toLocaleString() : ""}
            </p>
          </div>
        </div>

        <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#59665A]">
          {email.body ||
            email.text ||
            email.snippet ||
            "No email content available."}
        </div>
      </article>
    </div>
  );
}
