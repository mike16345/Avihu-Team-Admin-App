/**
 * FormResponsesTable — clean card-based redesign
 *
 * Keeps all the existing data hooks (useFormResponsesQuery, toggleIsCheckedResponse,
 * deleteFormById) but replaces the DataTableHebrew table with a card grid: each
 * form response is a clickable card showing user / form / date / type / read state.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FaClipboardList,
  FaCircleCheck,
  FaRegCircle,
  FaTrash,
  FaMagnifyingGlass,
  FaEye,
} from "react-icons/fa6";
import useFormResponsesQuery from "@/hooks/queries/formResponses/useFormResponsesQuery";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FormTypes } from "@/interfaces/IForm";
import { FormTypeOptions, FormTypesInHebrew } from "@/constants/form";
import ErrorPage from "@/pages/ErrorPage";
import Loader from "@/components/ui/Loader";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import queryClient from "@/QueryClient/queryClient";
import { formResponsesKeys } from "@/hooks/queries/formResponses/formResponsesKeys";
import { resolveUserName } from "@/components/agreements/SignedAgreementsTable";
import DeleteModal from "@/components/Alerts/DeleteModal";
import DateUtils from "@/lib/dateUtils";
import FilterMultiSelect from "./FilterMultiSelect";

type FormResponsesTableProps = {
  userId?: string;
  paginationKey?: string;
};

const formatDate = (submittedAt?: string) => {
  if (!submittedAt) return "—";
  const d = new Date(submittedAt);
  if (Number.isNaN(d.getTime())) return submittedAt;
  return DateUtils.formatDate(d, "DD/MM/YYYY");
};

// Map form type → accent color
const TYPE_ACCENT: Record<string, { bg: string; text: string; ring: string }> = {
  start: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  monthly: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
  general: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200" },
};
const accentOf = (type?: string) => TYPE_ACCENT[type || "general"] || TYPE_ACCENT.general;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

const FormResponsesTable = ({ userId }: FormResponsesTableProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFormResponsesQuery(
    userId ? { userId } : undefined
  );

  const { deleteFormById, toggleIsCheckedResponse } = useFormResponsesApi();

  const deleteResponseMutation = useMutation({
    mutationFn: (id: string) => deleteFormById(id),
    onSuccess: () => {
      toast.success("התגובה נמחקה בהצלחה!");
      queryClient.invalidateQueries({ queryKey: formResponsesKeys.all });
    },
    onError: () => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
    },
  });

  const [selectedTypes, setSelectedTypes] = useState<FormTypes[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "viewed">("all");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<FormResponse | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const all: FormResponse[] = data?.data || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((r) => {
      if (selectedTypes.length && !selectedTypes.includes(r.formType as FormTypes)) {
        return false;
      }
      if (statusFilter === "viewed" && !r.isChecked) return false;
      if (statusFilter === "waiting" && r.isChecked) return false;
      if (!q) return true;
      const user = (resolveUserName(r.userId) ?? "").toLowerCase();
      const form = (r.formTitle ?? r.formId?.name ?? "").toLowerCase();
      return user.includes(q) || form.includes(q);
    });
  }, [all, selectedTypes, query]);

  const stats = useMemo(() => {
    const total = all.length;
    const viewed = all.filter((r) => r.isChecked).length;
    return { total, viewed, unviewed: total - viewed };
  }, [all]);

  const handleView = (r: FormResponse) => {
    if (!r?._id) return;
    navigate(`/form-responses/${r._id}`);
  };

  const handleToggleViewed = async (r: FormResponse, next: boolean) => {
    if (!r._id) return;
    setPendingToggleId(r._id);
    try {
      await toggleIsCheckedResponse(r._id, next);
      queryClient.invalidateQueries({ queryKey: formResponsesKeys.all });
    } catch {
      toast.error("לא הצלחנו לעדכן את סטטוס הצפייה");
    } finally {
      setPendingToggleId(null);
    }
  };

  const errorStatus = (error as any)?.status;
  const isExpectedEmpty = errorStatus === 401 || errorStatus === 403 || errorStatus === 404;
  if (isError && !isExpectedEmpty) return <ErrorPage message={error?.message} />;
  if (isLoading) return <Loader size="large" />;

  const STATUS_TABS: { value: typeof statusFilter; label: string; count: number }[] = [
    { value: "all", label: "הכל", count: stats.total },
    { value: "waiting", label: "ממתינים", count: stats.unviewed },
    { value: "viewed", label: "נצפו", count: stats.viewed },
  ];

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Slim toolbar — search + status tabs + type filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1 max-w-[360px]">
          <FaMagnifyingGlass
            size={11}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי משתמש או שאלון…"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white"
          />
        </div>

        {/* Status segmented control */}
        <div className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-0.5">
          {STATUS_TABS.map((t) => {
            const active = statusFilter === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setStatusFilter(t.value)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition-all ${
                  active
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-blue-700"
                }`}
              >
                {t.label}
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {FormTypeOptions.length > 0 && (
          <FilterMultiSelect
            className="w-48"
            label="סוג"
            options={FormTypeOptions}
            selected={selectedTypes}
            onChange={(values) => setSelectedTypes(values as FormTypes[])}
            placeholder="כל הסוגים"
          />
        )}

        <span className="ms-auto text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? "תוצאה" : "תוצאות"}
          {filtered.length !== all.length && ` מתוך ${all.length}`}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
            <FaClipboardList size={24} className="text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700">
            {all.length === 0 ? "אין שאלונים עדיין" : "לא נמצאו תוצאות"}
          </h3>
          <p className="max-w-sm text-sm text-slate-400">
            {all.length === 0
              ? "כאשר מתאמן ימלא שאלון, התשובות יופיעו כאן."
              : "נסה סינון אחר או חיפוש שונה."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const userName = resolveUserName(r.userId) ?? "משתמש לא ידוע";
            const formName = r.formTitle ?? r.formId?.name ?? "שאלון ללא שם";
            const typeKey = (r.formType ?? r.formId?.type) as string | undefined;
            const typeLabel = typeKey ? FormTypesInHebrew[typeKey as FormTypes] ?? typeKey : "—";
            const accent = accentOf(typeKey);
            const viewed = Boolean(r.isChecked);
            const togglePending = pendingToggleId === r._id;

            return (
              <article
                key={r._id}
                className={`group relative flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                  viewed ? "border-slate-200/80" : "border-blue-200"
                }`}
              >
                {/* Top row: avatar + names + type pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm">
                      {initialsOf(userName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                      <p
                        className="mt-0.5 truncate text-xs text-slate-500"
                        title={formName}
                      >
                        {formName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${accent.bg} ${accent.text} ${accent.ring}`}
                  >
                    {typeLabel}
                  </span>
                </div>

                {/* Middle row: date + viewed badge */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-slate-400">נשלח:</span>
                    <span className="font-semibold text-slate-700">
                      {formatDate(r.submittedAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleViewed(r, !viewed)}
                    disabled={togglePending}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      viewed
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    {viewed ? <FaCircleCheck size={11} /> : <FaRegCircle size={11} />}
                    {viewed ? "נצפה" : "סמן כנצפה"}
                  </button>
                </div>

                {/* Bottom actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleView(r)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow"
                  >
                    <FaEye size={11} />
                    <span>צפה בתשובות</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(r)}
                    title="מחק"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <DeleteModal
        isModalOpen={!!confirmDelete}
        setIsModalOpen={(open) => !open && setConfirmDelete(null)}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?._id) {
            deleteResponseMutation.mutate(confirmDelete._id);
          }
          setConfirmDelete(null);
        }}
      />
    </div>
  );
};

export default FormResponsesTable;
