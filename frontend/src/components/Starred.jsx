import { useEffect, useState } from "react";
import { Star, Mail } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Starred() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStarred() {
      try {
        const res = await fetch(`${API}/api/gmail/starred`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load starred emails.");
        setEmails(Array.isArray(data) ? data : data.emails ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStarred();
  }, []);

  if (loading) return <p className="p-6">Loading starred emails...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  if (!emails.length)
    return (
      <div className="p-10 text-center text-gray-500">
        <Mail size={32} className="mx-auto mb-3" />
        <p>No starred emails</p>
      </div>
    );

  return (
    <div className="divide-y divide-[#E7E9DF]">
      {emails.map((email) => (
        <div key={email.id || email.messageId} className="flex items-center gap-3 p-4">
          <Star size={18} className="fill-yellow-400 text-yellow-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{email.from || email.sender}</p>
            <p className="truncate text-sm text-gray-500">{email.subject}</p>
            <p className="truncate text-sm text-gray-400">{email.snippet}</p>
          </div>
        </div>
      ))}
    </div>
  );
}