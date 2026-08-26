import { useState } from "react";
import type { AccountStatus, IUser, IStatusHistoryEntry } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { FaPenToSquare, FaTrashCan, FaUser } from "react-icons/fa6";

import { CredentialsMessageCard } from "./CredentialsMessageCard";
import {
  describeSystemEntry,
  formatMonthsAndDays,
  getStatusPillClassName,
  STATUS_DESCRIPTION,
  STATUS_LABEL,
} from "./userDashboardStatus";

interface UserDashboardProfileTabProps {
  user?: IUser;
  status: AccountStatus;
  onEdit: () => void;
  onAddStatusNote: (note: string) => Promise<void>;
  onDeleteStatusEntry: (at: Date | string) => Promise<void>;
}

export function UserDashboardProfileTab({
  user,
  status,
  onEdit,
  onAddStatusNote,
  onDeleteStatusEntry,
}: UserDashboardProfileTabProps) {
  if (!user) return null;

  const dateJoined = user.dateJoined ? DateUtils.formatDate(user.dateJoined, "DD/MM/YYYY") : "—";
  const dateFinished = user.dateFinished
    ? DateUtils.formatDate(user.dateFinished, "DD/MM/YYYY")
    : "—";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaUser size={16} className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">פרטי משתמש</h2>
          </div>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <FaPenToSquare size={11} />
            <span>עריכה</span>
          </button>
        </div>

        <UserStatusSummary user={user} status={status} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileField label="שם פרטי" value={user.firstName} />
          <ProfileField label="שם משפחה" value={user.lastName} />
          <ProfileField label="טלפון" value={user.phone} dir="ltr" />
          <ProfileField label="אימייל" value={user.email} dir="ltr" />
          <ProfileField label="סוג תוכנית" value={user.planType} />
          <ProfileField label="תאריך תחילת הליווי" value={dateJoined} />
          <ProfileField label="תאריך סיום הליווי" value={dateFinished} />
        </div>
        {user.dietaryType && user.dietaryType.length > 0 && (
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <ProfileField label="הגבלות תזונה" value={user.dietaryType.join(", ")} />
          </div>
        )}

        <CredentialsMessageCard user={user} />
      </div>

      <div className="flex w-full flex-col gap-4">
        {status === "frozen" && <FreezeDocumentationCard user={user} />}
        <StatusHistoryCard
          user={user}
          onAddNote={onAddStatusNote}
          onDeleteEntry={onDeleteStatusEntry}
        />
      </div>
    </div>
  );
}

function UserStatusSummary({ user, status }: { user: IUser; status: AccountStatus }) {
  const isFrozenWithSnapshot = status === "frozen" && typeof user.frozenDaysRemaining === "number";
  const statusPillClassName = getStatusPillClassName(status);
  const statusDotClassName =
    status === "active"
      ? "bg-emerald-500"
      : status === "user"
        ? "bg-blue-500"
        : status === "frozen"
          ? "bg-cyan-500"
          : "bg-rose-500";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">סטטוס במערכת:</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
          statusPillClassName
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClassName)} />
        {STATUS_LABEL[status]}
      </span>
      {isFrozenWithSnapshot ? (
        <span className="ms-auto inline-flex items-center gap-1.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
          ❄️
          {user.frozenAt
            ? ` הוקפא ${DateUtils.formatDate(new Date(user.frozenAt), "DD/MM/YYYY")}`
            : ""}
          {" · נשארו "}
          {formatMonthsAndDays(user.frozenDaysRemaining)}
        </span>
      ) : (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {STATUS_DESCRIPTION[status]}
        </span>
      )}
    </div>
  );
}

function FreezeDocumentationCard({ user }: { user: IUser }) {
  const totalDays = user.frozenDaysRemaining ?? 0;
  const frozenAt = user.frozenAt
    ? DateUtils.formatDate(new Date(user.frozenAt), "DD/MM/YYYY")
    : "—";

  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/40 dark:bg-cyan-950/20 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
          ❄️
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">תיעוד הקפאה</h3>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="text-xs text-slate-600 dark:text-slate-300">
          הוקפא ב-<span className="font-bold text-slate-800 dark:text-slate-100">{frozenAt}</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="inline-flex items-baseline gap-1 rounded-md bg-white dark:bg-slate-900 px-2 py-0.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
          נשארו {formatMonthsAndDays(totalDays)}
          <span className="text-[10px] font-normal text-slate-400">({totalDays} ימים)</span>
        </span>
      </div>
      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        הזמן שנשמר יוחזר לתום הליווי כשתחזיר את המתאמן לפעיל
      </p>
    </section>
  );
}

function StatusHistoryCard({
  user,
  onAddNote,
  onDeleteEntry,
}: {
  user: IUser;
  onAddNote: (note: string) => Promise<void>;
  onDeleteEntry: (at: Date | string) => Promise<void>;
}) {
  const [draftNote, setDraftNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (entryAt: Date | string) => {
    const key = new Date(entryAt).getTime();
    if (pendingDeleteKey !== key) {
      setPendingDeleteKey(key);
      return;
    }
    setIsDeleting(true);
    try {
      await onDeleteEntry(entryAt);
      setPendingDeleteKey(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedEntries = [...(user.statusHistory || [])].sort(
    (first, second) => new Date(second.at).getTime() - new Date(first.at).getTime()
  );

  const handleSaveNote = async () => {
    const text = draftNote.trim();
    if (!text || isSavingNote) return;
    setIsSavingNote(true);
    try {
      await onAddNote(text);
      setDraftNote("");
      setShowNoteInput(false);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
            🕒
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              היסטוריית סטטוסים
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              שינויי סטטוס אוטומטיים + הערות שאתה מוסיף ידנית
            </p>
          </div>
        </div>
        {!showNoteInput && (
          <button
            type="button"
            onClick={() => setShowNoteInput(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 transition-all hover:-translate-y-0.5 hover:bg-blue-100"
          >
            <FaPenToSquare size={9} />
            הוסף הערה ידנית
          </button>
        )}
      </div>

      {showNoteInput && (
        <div className="mb-3 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-3">
          <p className="mb-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
            הערה ידנית — תיווסף ליומן עם תאריך והסטטוס הנוכחי
          </p>
          <textarea
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="לדוגמה: דיברתי עם המתאמן לגבי המשך התוכנית…"
            maxLength={500}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowNoteInput(false);
                setDraftNote("");
              }}
              disabled={isSavingNote}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={!draftNote.trim() || isSavingNote}
              className="rounded-lg brand-gradient brand-gradient-hover px-4 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSavingNote ? "שומר…" : "שמור הערה"}
            </button>
          </div>
        </div>
      )}

      {sortedEntries.length === 0 && !showNoteInput ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 py-8 text-center">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">אין עדיין רשומות</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            שינוי סטטוס או הערה ידנית יופיעו כאן
          </p>
        </div>
      ) : (
        <ul className="flex max-h-[400px] flex-col gap-2 overflow-y-auto p-2 custom-scrollbar">
          {sortedEntries.map((entry, index) => {
            const entryKey = new Date(entry.at).getTime();

            return (
              <StatusHistoryEntry
                key={index}
                entry={entry}
                onRequestDelete={() => handleDelete(entry.at)}
                isPendingDelete={pendingDeleteKey === entryKey}
                isDeleting={isDeleting && pendingDeleteKey === entryKey}
                onCancelDelete={() => setPendingDeleteKey(null)}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StatusHistoryEntry({
  entry,
  onRequestDelete,
  isPendingDelete,
  isDeleting,
  onCancelDelete,
}: {
  entry: IStatusHistoryEntry;
  onRequestDelete: () => void;
  isPendingDelete: boolean;
  isDeleting: boolean;
  onCancelDelete: () => void;
}) {
  const isManual = entry.kind === "manual";
  const entryClassName = isManual
    ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20"
    : "border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30";
  const kindClassName = isManual
    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
    : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
  const noteClassName = isManual
    ? "text-amber-900 dark:text-amber-200"
    : "text-slate-700 dark:text-slate-200";

  return (
    <li className={cn("group relative flex flex-col gap-2 rounded-xl border px-4 py-3", entryClassName)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              kindClassName
            )}
          >
            {isManual ? "✏️ ידני" : "🤖 מערכת"}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {DateUtils.formatDate(new Date(entry.at), "DD/MM/YYYY")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isManual && entry.fromStatus !== entry.toStatus && (
            <div className="flex items-center gap-1">
              <StatusPill status={entry.fromStatus} />
              <span className="text-slate-400 text-xs">→</span>
              <StatusPill status={entry.toStatus} />
            </div>
          )}
          {isPendingDelete ? (
            <span className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={onCancelDelete}
                disabled={isDeleting}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={onRequestDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                <FaTrashCan size={8} />
                {isDeleting ? "מוחק…" : "מחק"}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={onRequestDelete}
              aria-label="מחק רשומה"
              title="מחק רשומה"
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-950/40"
            >
              <FaTrashCan size={10} />
            </button>
          )}
        </div>
      </div>

      {!isManual && (
        <p className="text-sm text-slate-700 dark:text-slate-200">{describeSystemEntry(entry)}</p>
      )}
      {entry.note && (
        <p className={cn("text-sm", noteClassName)}>{isManual ? entry.note : `📝 ${entry.note}`}</p>
      )}
    </li>
  );
}

function StatusPill({ status }: { status: AccountStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        getStatusPillClassName(status)
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function ProfileField({
  label,
  value,
  dir = "rtl",
}: {
  label: string;
  value?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div
        dir={dir}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100"
      >
        {value || "—"}
      </div>
    </div>
  );
}
