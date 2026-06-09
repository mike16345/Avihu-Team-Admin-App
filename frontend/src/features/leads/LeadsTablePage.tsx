/**
 * LeadsTablePage — redesigned leads inbox.
 *
 * Hero header with the inbox icon + total count, top stats row (total /
 * pending / contacted), search + filter pills, and a custom list of
 * row-cards (avatar, name, email/phone, contact toggle, delete) — same
 * brand language as SignedAgreementsTable / FormPresetGrid.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { toast } from "sonner";
import ErrorPage from "@/pages/ErrorPage";
import { useLeadsList } from "@/hooks/queries/leads";
import { useDeleteLead, useUpdateLead } from "@/hooks/mutations/leads";
import type { Lead } from "@/interfaces/leads";
import DateUtils from "@/lib/dateUtils";
import Loader from "@/components/ui/Loader";
import DeleteModal from "@/components/Alerts/DeleteModal";
import {
  FaInbox,
  FaMagnifyingGlass,
  FaEnvelope,
  FaPhone,
  FaCalendarDay,
  FaCircleCheck,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCopy,
  FaWhatsapp,
  FaCheck,
} from "react-icons/fa6";

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
};

type Filter = "all" | "pending" | "contacted";

const LeadsTablePage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pendingContactIds, setPendingContactIds] = useState<string[]>([]);
  const [total, setTotal] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const { page, pageSize, setPage } = useUrlPagination({
    namespace: "leads",
    defaultPage: 1,
    defaultPageSize: 10,
    totalPages: total,
  });
  const limit = pageSize;

  const { data, isLoading, isError, error } = useLeadsList(page, limit);
  // Stats need to span every page, not just the visible slice. Fetch
  // the whole list once with a wide limit and use that for counts.
  // The paginated query above keeps driving the visible rows + page
  // navigation as before.
  const { data: allLeadsData } = useLeadsList(1, 9999);
  const { mutateAsync: updateLead } = useUpdateLead();
  const { mutateAsync: deleteLead } = useDeleteLead();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("הועתק ללוח");
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      toast.error("ההעתקה נכשלה");
    }
  }, []);

  const toWhatsAppUrl = (raw: string) => {
    const digits = (raw || "").replace(/\D/g, "").replace(/^0/, "972");
    return `https://wa.me/${digits}`;
  };

  const sortLeads = useCallback((list: Lead[]) => {
    return [...list].sort((a, b) => {
      if (a.isContacted === b.isContacted) {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        if (Number.isNaN(aDate) || Number.isNaN(bDate)) return 0;
        return bDate - aDate;
      }
      return a.isContacted ? 1 : -1;
    });
  }, []);

  useEffect(() => {
    if (!data) return;
    const totalPages = data.total ? Math.max(1, Math.ceil(data.total / limit)) : 1;
    setTotal(totalPages);
    if (data.items) {
      const normalized = data.items.map((lead) => ({
        ...lead,
        isContacted: Boolean(lead.isContacted),
      }));
      setLeads(sortLeads(normalized));
    }
  }, [data, limit, sortLeads]);

  const handleToggleContacted = useCallback(
    async (lead: Lead, nextValue: boolean) => {
      const previousLeads = leads.map((item) => ({ ...item }));
      setPendingContactIds((prev) => (prev.includes(lead._id) ? prev : [...prev, lead._id]));
      setLeads((current) =>
        sortLeads(
          current.map((item) =>
            item._id === lead._id ? { ...item, isContacted: nextValue } : item
          )
        )
      );
      try {
        const updatedLead = await updateLead({ id: lead._id, body: { isContacted: nextValue } });
        setLeads((current) =>
          sortLeads(
            current.map((item) => (item._id === lead._id ? { ...item, ...updatedLead } : item))
          )
        );
      } catch {
        setLeads(previousLeads);
        toast.error("עדכון הסטטוס נכשל. נסה שוב.");
      } finally {
        setPendingContactIds((prev) => prev.filter((id) => id !== lead._id));
      }
    },
    [leads, sortLeads, updateLead]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteLead(deleteTarget._id);
    toast.success("הלייד נמחק בהצלחה!");
    setDeleteTarget(null);
  };

  /**
   * Stats span every lead in the system, not just the current page.
   * `allLeadsData?.items` carries the full list (wide-limit query).
   * If it hasn't resolved yet we fall back to `data?.total` for the
   * total card and 0 for the splits, so the UI shows nothing stale.
   */
  const stats = useMemo(() => {
    const allItems = allLeadsData?.items ?? [];
    if (allItems.length > 0) {
      const total = allItems.length;
      const contacted = allItems.filter((l) => l.isContacted).length;
      return { total, contacted, pending: total - contacted };
    }
    const total = data?.total ?? 0;
    return { total, contacted: 0, pending: total };
  }, [allLeadsData?.items, data?.total]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter === "pending" && lead.isContacted) return false;
      if (filter === "contacted" && !lead.isContacted) return false;
      if (!q) return true;
      const hay = `${lead.fullName || ""} ${lead.email || ""} ${lead.phone || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [leads, search, filter]);

  if (isError) return <ErrorPage message={error?.message ?? "שגיאה בטעינת הלידים"} />;

  return (
    <div
      dir="rtl"
      data-testid="leads-page"
      className="flex flex-col gap-5 p-1"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md">
            <FaInbox size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">לידים</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              לידים שנכנסו מעמוד הנחיתה — סמן ✓ אחרי שיצרת קשר כדי שלא יוצגו שוב
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<FaInbox size={14} />}
          label="סך הכל"
          value={stats.total}
          tone="blue"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard
          icon={<FaClock size={14} />}
          label="ממתינים ליצירת קשר"
          value={stats.pending}
          tone="amber"
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        />
        <StatCard
          icon={<FaCircleCheck size={14} />}
          label="נוצר קשר"
          value={stats.contacted}
          tone="emerald"
          active={filter === "contacted"}
          onClick={() => setFilter("contacted")}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1 max-w-[420px]">
          <FaMagnifyingGlass
            size={11}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, אימייל או טלפון…"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? "לייד" : "לידים"}
          {filtered.length !== leads.length && ` מתוך ${leads.length}`}
        </span>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 shadow-sm">
              <FaInbox size={18} />
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">
              {leads.length === 0 ? "אין עדיין לידים" : "לא נמצאו תוצאות"}
            </p>
            {leads.length === 0 && (
              <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                כשמישהו ירשם בעמוד הנחיתה — הוא יופיע כאן
              </p>
            )}
          </div>
        ) : (
          <ul>
            {filtered.map((lead) => {
              const isPending = pendingContactIds.includes(lead._id);
              const dateIso = lead.registeredAt ?? lead.createdAt;
              const date = dateIso ? new Date(dateIso) : null;
              const dateStr =
                date && !Number.isNaN(date.getTime())
                  ? DateUtils.formatDate(date, "DD/MM/YYYY")
                  : "-";
              const name = lead.fullName || lead.email || "ללא שם";

              return (
                <li
                  key={lead._id}
                  className={`flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 px-4 py-3 transition-colors last:border-b-0 ${
                    lead.isContacted
                      ? "bg-slate-50/40 dark:bg-slate-800/20"
                      : "hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                  }`}
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-[180px] flex-1">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${
                        lead.isContacted ? "bg-emerald-500" : "brand-gradient"
                      }`}
                    >
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-bold ${
                          lead.isContacted
                            ? "text-slate-500 dark:text-slate-400 line-through"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                        <FaCalendarDay size={8} />
                        <span>נרשם {dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Email — value pill + two action icons */}
                  {lead.email && (
                    <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        <FaEnvelope size={10} />
                        {lead.email}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(lead.email, `email:${lead._id}`);
                        }}
                        aria-label="העתק אימייל"
                        title="העתק"
                        className="flex w-7 items-center justify-center border-r border-slate-200 dark:border-slate-700 text-slate-400 transition-colors hover:bg-blue-100/60 hover:text-blue-700"
                      >
                        {copiedKey === `email:${lead._id}` ? (
                          <FaCheck size={10} className="text-emerald-600" />
                        ) : (
                          <FaCopy size={10} />
                        )}
                      </button>
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="שלח אימייל"
                        title="שלח מייל"
                        className="flex w-7 items-center justify-center border-r border-slate-200 dark:border-slate-700 text-slate-400 transition-colors hover:bg-blue-100/60 hover:text-blue-700"
                      >
                        <FaEnvelope size={10} />
                      </a>
                    </div>
                  )}

                  {/* Phone — value pill + copy + WhatsApp */}
                  {lead.phone && (
                    <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        <FaPhone size={10} />
                        {lead.phone}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(lead.phone!, `phone:${lead._id}`);
                        }}
                        aria-label="העתק טלפון"
                        title="העתק"
                        className="flex w-7 items-center justify-center border-r border-slate-200 dark:border-slate-700 text-slate-400 transition-colors hover:bg-blue-100/60 hover:text-blue-700"
                      >
                        {copiedKey === `phone:${lead._id}` ? (
                          <FaCheck size={10} className="text-emerald-600" />
                        ) : (
                          <FaCopy size={10} />
                        )}
                      </button>
                      <a
                        href={toWhatsAppUrl(lead.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="שלח WhatsApp"
                        title="שלח WhatsApp"
                        className="flex w-7 items-center justify-center border-r border-slate-200 dark:border-slate-700 text-slate-400 transition-colors hover:bg-emerald-100/60 hover:text-emerald-700"
                      >
                        <FaWhatsapp size={11} />
                      </a>
                    </div>
                  )}

                  {/* Contacted toggle */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleContacted(lead, !lead.isContacted)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all disabled:opacity-50 ${
                      lead.isContacted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {lead.isContacted ? (
                      <>
                        <FaCircleCheck size={10} />
                        נוצר קשר
                      </>
                    ) : (
                      <>
                        <FaClock size={10} />
                        סמן כיצירת קשר
                      </>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(lead)}
                    aria-label="מחיקה"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  >
                    <FaTrash size={11} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {total > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            דף {page} מתוך {total}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="הקודם"
            >
              <FaChevronRight size={11} />
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(total, page + 1))}
              disabled={page >= total}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="הבא"
            >
              <FaChevronLeft size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <DeleteModal
        isModalOpen={!!deleteTarget}
        setIsModalOpen={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

/* -------------------------------------------------------------------- */

const TONE: Record<
  string,
  { bg: string; text: string; ring: string; activeBg: string; activeText: string }
> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-300",
    ring: "ring-blue-200/60 dark:ring-blue-900/40",
    activeBg: "bg-blue-600",
    activeText: "text-white",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-200/60 dark:ring-amber-900/40",
    activeBg: "bg-amber-500",
    activeText: "text-white",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-900/40",
    activeBg: "bg-emerald-500",
    activeText: "text-white",
  },
};

const StatCard = ({
  icon,
  label,
  value,
  tone,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "blue" | "amber" | "emerald";
  active?: boolean;
  onClick?: () => void;
}) => {
  const t = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-slate-900 dark:border-slate-200 bg-white dark:bg-slate-900"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors ${
          active ? `${t.activeBg} ${t.activeText} ring-transparent` : `${t.bg} ${t.text} ${t.ring}`
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </button>
  );
};

export default LeadsTablePage;
