
import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  Tag,
  Trash2,
  Mail,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Inbox", icon: Inbox },
  { name: "Starred", icon: Star },
  { name: "Snoozed", icon: Clock },
  { name: "Sent", icon: Send },
  { name: "Drafts", icon: FileText },
  { name: "Important", icon: Tag },
  { name: "Trash", icon: Trash2 },
  { name: "All Mail", icon: Mail },
];

export default function Sidebar({
  activeFolder = "Inbox",
  onFolderChange,
  onCompose,
  onSettings,
}) {
  return (
    <aside className="flex h-full w-[76px] shrink-0 flex-col bg-[#F0F4E9] px-2 py-6 sm:w-60 sm:px-4">
      {/* Logo */}
      <div className="mb-10 hidden px-2 text-2xl font-bold tracking-tight sm:block">
        nxt<span className="text-[#527957]">Mail</span>
      </div>

      {/* Compose */}
      <button
        onClick={onCompose}
        className="mb-7 flex items-center justify-center gap-3 rounded-2xl bg-[#DDE9D5] px-3 py-4 font-medium text-[#355B42] transition hover:bg-[#D3E2C9] sm:justify-start sm:px-4"
      >
        <Mail size={21} strokeWidth={1.8} />
        <span className="hidden sm:block">Compose</span>
      </button>

      {/* Folders */}
      <nav className="space-y-2">
        {menuItems.map(({ name, icon: Icon }) => {
          const isActive = activeFolder === name;

          return (
            <button
              key={name}
              onClick={() => onFolderChange?.(name)}
              title={name}
              aria-current={isActive ? "page" : undefined}
              className={`flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3.5 text-sm transition sm:justify-start sm:px-4 ${
                isActive
                  ? "bg-[#DDE9D5] font-semibold text-[#355B42]"
                  : "text-[#788477] hover:bg-white/60 hover:text-[#355B42]"
              }`}
            >
              <Icon size={21} strokeWidth={1.8} />
              <span className="hidden sm:block">{name}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <button
        onClick={onSettings}
        className="mt-auto flex items-center justify-center gap-3 rounded-xl px-3 py-3.5 text-sm text-[#788477] transition hover:bg-white/60 hover:text-[#355B42] sm:justify-start sm:px-4"
      >
        <Settings size={21} strokeWidth={1.8} />
        <span className="hidden sm:block">Settings</span>
      </button>
    </aside>
  );
}
