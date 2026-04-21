import { useState } from "react";
import { MessageSquare, User, Wrench, Shield, Send, Cog } from "lucide-react";

const ROLE_ICON = {
  TECHNICIAN: Wrench,
  ADMIN: Shield,
  STUDENT: User,
  LECTURER: User,
  USER: User,
  SYSTEM: Cog,
};

const ROLE_COLOR = {
  TECHNICIAN: "bg-blue-50 text-blue-700",
  ADMIN: "bg-rose-50 text-rose-700",
  STUDENT: "bg-emerald-50 text-emerald-700",
  LECTURER: "bg-amber-50 text-amber-700",
  USER: "bg-slate-100 text-slate-700",
  SYSTEM: "bg-slate-100 text-slate-500",
};

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Vertical comment list with author, role chip, timestamp.
 * Optional bottom composer — pass `onSubmit(message)` to enable it.
 */
export default function CommentThread({ comments = [], onSubmit }) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(draft.trim());
      setDraft("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {comments.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <MessageSquare className="w-7 h-7 mx-auto mb-1.5 opacity-50" />
          <p className="text-sm">No comments yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const Icon = ROLE_ICON[c.authorRole] || User;
            const color = ROLE_COLOR[c.authorRole] || ROLE_COLOR.USER;
            return (
              <li key={c.commentId} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">{c.authorRole || "USER"}</span>
                    <span className="text-[11px] text-slate-400">{fmt(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{c.message}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {onSubmit && (
        <form onSubmit={submit} className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Post
          </button>
        </form>
      )}
    </div>
  );
}
