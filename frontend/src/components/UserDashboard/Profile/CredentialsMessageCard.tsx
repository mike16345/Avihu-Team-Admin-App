import { useState } from "react";
import { FaArrowRotateLeft, FaCheck, FaCopy, FaPenToSquare } from "react-icons/fa6";

import type { IUser } from "@/interfaces/IUser";
import { cn } from "@/lib/utils";

function buildCredentialsMessage(user: IUser) {
  const email = user.email?.trim() || "—";
  const password = user.phone?.trim() || "—";

  return (
    `ברוך הבא לליווי כושר והתזונה 💪\n\n` +
    `אלו פרטי ההתחברות שלך לאפליקציה:\n` +
    `📧 אימייל: ${email}\n` +
    `🔑 סיסמה: ${password}\n\n` +
    `הורדה לאייפון  - https://apps.apple.com/il/app/avihu-team/id6739640144?l=he\n` +
    `הורדה אנדרואיד - https://play.google.com/store/apps/details?id=com.avihuteam.avihuteam\n\n` +
    `ברוך הבא לתהליך 👋\n` +
    `כדי להתחיל יש לבצע כמה שלבים קצרים:\n\n` +
    `➡️ שלב 1 – כניסה לאפליקציה\n` +
    `בעמוד הראשי של האפליקציה יש להזין:\n` +
    `האימייל ששלחתי לך + הסיסמה\n\n` +
    `➡️ שלב 2 – מילוי שאלון היכרות\n` +
    `לאחר הכניסה יופיע שאלון מעמיק עם כ-40 שאלות.\n` +
    `המטרה שלו היא להכיר אותך לעומק כדי שאוכל להתאים לך את התהליך בצורה המדויקת ביותר.\n\n` +
    `➡️ שלב 3 – שליחה\n` +
    `בסיום השאלון פשוט ללחוץ על שלח, והוא יגיע אליי ישירות למערכת.\n\n` +
    `ברגע שזה נשלח אני עובר על הכל ומתחילים להתקדם 🚀\n` +
    `זמן בנייה של המעטפת יום - יומיים ואז תהיה שיחת חיבור 🎯`
  );
}

export function CredentialsMessageCard({ user }: { user: IUser }) {
  const defaultMessage = buildCredentialsMessage(user);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const message = customMessage ?? defaultMessage;
  const isCustomized = customMessage !== null && customMessage !== defaultMessage;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setCustomMessage(null);
    setIsEditing(false);
  };

  return (
    <div dir="rtl" className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          הודעת פרטי התחברות
        </label>
        <div className="flex items-center gap-1.5">
          {isCustomized && !isEditing && (
            <button
              type="button"
              onClick={handleReset}
              title="החזר לברירת מחדל"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <FaArrowRotateLeft size={9} />
              איפוס
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              isEditing
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            )}
          >
            <FaPenToSquare size={9} />
            {isEditing ? "סיום עריכה" : "ערוך"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            )}
          >
            {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
            {copied ? "הועתק" : "העתק"}
          </button>
        </div>
      </div>
      {isEditing ? (
        <textarea
          dir="rtl"
          value={message}
          onChange={(event) => setCustomMessage(event.target.value)}
          rows={9}
          className="w-full resize-y rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3 text-right font-heebo text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/60"
        />
      ) : (
        <pre
          dir="rtl"
          className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3 text-right font-heebo text-[13px] leading-relaxed text-slate-700 dark:text-slate-200"
        >
          {message}
        </pre>
      )}
    </div>
  );
}
