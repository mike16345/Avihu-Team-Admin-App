/**
 * MeasurementsProgression — מעקב היקפים (עיצוב חדש)
 *
 * 6 כרטיסי סטטיסטיקה (חזה/זרוע/מותן/ישבן/ירך/תאומים) + טבלה עורכת.
 * חיבור לשרת: useMeasurementApi → GET/POST/PUT/DELETE /measurements
 */
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FaHeartPulse,
  FaPencil,
  FaPlus,
  FaFloppyDisk,
  FaXmark,
  FaTrash,
} from "react-icons/fa6";
import moment from "moment-timezone";
import { toast } from "sonner";
import { useMeasurementApi } from "@/hooks/api/useMeasurementsApi";
import useMeasurementQuery from "@/hooks/queries/measurements/useMeasurementQuery";
import { QueryKeys } from "@/enums/QueryKeys";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { IMuscleMeasurement } from "@/interfaces/measurements";

type MeasurementKey = "chest" | "arm" | "waist" | "glutes" | "thigh" | "calf";

const COLUMNS: { key: MeasurementKey; label: string; color: string }[] = [
  { key: "chest", label: "חזה", color: "text-blue-600" },
  { key: "arm", label: "זרוע", color: "text-purple-600" },
  { key: "waist", label: "מותן", color: "text-emerald-600" },
  { key: "glutes", label: "ישבן", color: "text-orange-600" },
  { key: "thigh", label: "ירך", color: "text-pink-600" },
  { key: "calf", label: "תאומים", color: "text-indigo-600" },
];

// We use NaN to represent "empty / not measured" in the draft.
// On save we convert NaN → 0 (server requires numbers).
const blankMeasurement = (): IMuscleMeasurement =>
  ({
    date: moment().format("DD/MM/YYYY"),
    chest: NaN,
    arm: NaN,
    waist: NaN,
    glutes: NaN,
    thigh: NaN,
    calf: NaN,
  } as IMuscleMeasurement);

const MeasurementsProgression = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useMeasurementQuery(id);
  const { addMeasurement, updateMeasurement, deleteMeasurement } = useMeasurementApi();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<IMuscleMeasurement | null>(null);
  const [saving, setSaving] = useState(false);

  const measurements: IMuscleMeasurement[] = useMemo(() => {
    if (!data?.measurements) return [];
    return data.measurements.map((m: IMuscleMeasurement) => ({
      ...m,
      date: m.date ? moment(m.date).format("DD/MM/YYYY") : "",
    }));
  }, [data]);

  const sorted = useMemo(
    () =>
      [...measurements].sort((a, b) => {
        const dateA = moment(a.date, "DD/MM/YYYY").toDate().getTime();
        const dateB = moment(b.date, "DD/MM/YYYY").toDate().getTime();
        return dateB - dateA;
      }),
    [measurements]
  );

  const latest = sorted[0];
  const earliest = sorted[sorted.length - 1];

  const getDelta = (key: MeasurementKey) => {
    if (!latest || !earliest) return { text: "0", color: "text-slate-400 dark:text-slate-500", arrow: "" };
    const diff = (latest[key] as number) - (earliest[key] as number);
    if (diff === 0) return { text: "0", color: "text-slate-400 dark:text-slate-500", arrow: "" };
    if (diff < 0) return { text: `${diff}`, color: "text-emerald-600", arrow: "↓" };
    return { text: `+${diff}`, color: "text-rose-600", arrow: "↑" };
  };

  const startEdit = (m: IMuscleMeasurement) => {
    setEditingId(m._id || m.date);
    setDraft({ ...m });
  };

  const startNew = () => {
    setEditingId("__new__");
    setDraft(blankMeasurement());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USER_MEASUREMENTS + id] });
  };

  const saveEdit = async () => {
    if (!draft || !id) return;
    setSaving(true);
    try {
      // Convert NaN (empty) → 0 for server compatibility (fields are required on server)
      const cleanNum = (v: any) => (typeof v === "number" && !isNaN(v) ? v : 0);
      const payload: IMuscleMeasurement = {
        ...draft,
        date: moment(draft.date, "DD/MM/YYYY").toISOString(),
        chest: cleanNum(draft.chest),
        arm: cleanNum(draft.arm),
        waist: cleanNum(draft.waist),
        glutes: cleanNum(draft.glutes),
        thigh: cleanNum(draft.thigh),
        calf: cleanNum(draft.calf),
      };
      // The server returns the full updated document (with all measurements)
      // in the POST response. We use that to update the react-query cache
      // directly — works around a server-side issue where GET /measurements/one
      // returns 404 due to trainer-scope filtering even when the doc exists.
      const res: any =
        editingId === "__new__"
          ? await addMeasurement(id, payload)
          : await updateMeasurement(id, payload);
      toast.success(editingId === "__new__" ? "המדידה נוספה בהצלחה!" : "המדידה עודכנה בהצלחה!");
      if (res?.data) {
        queryClient.setQueryData([QueryKeys.USER_MEASUREMENTS + id], res.data);
      } else {
        refresh();
      }
      setEditingId(null);
      setDraft(null);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בשמירת המדידה");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: IMuscleMeasurement) => {
    if (!id || !m.date) return;
    if (!window.confirm(`למחוק את המדידה מ-${m.date}?`)) return;
    try {
      // Server deletes per (date, muscle) — pass ISO date, helper fans out across muscles
      const iso = moment(m.date, "DD/MM/YYYY").toISOString();
      await deleteMeasurement(id, iso);
      toast.success("המדידה נמחקה");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("שגיאה במחיקת המדידה");
    }
  };

  if (isLoading) return <Loader size="large" />;
  // 404 = no measurements yet, 401/403 = no permission (still show empty UI)
  const errorStatus = (error as any)?.status;
  const isPermissionError = errorStatus === 401 || errorStatus === 403;
  if (isError && errorStatus !== 404 && !isPermissionError)
    return <ErrorPage message={(error as any)?.message} />;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Summary stat cards */}
      {measurements.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COLUMNS.map((c) => {
            const delta = getDelta(c.key);
            return (
              <div
                key={c.key}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {c.label}
                </p>
                <p className={`mt-1 text-2xl font-bold ${c.color}`}>
                  {latest?.[c.key] ?? "—"}
                  <span className="text-xs text-slate-400 dark:text-slate-500 me-1">ס״מ</span>
                </p>
                <p className={`mt-0.5 text-xs font-semibold ${delta.color}`}>
                  {delta.arrow} {delta.text} מהתחלה
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <FaHeartPulse size={15} className="text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">מעקב היקפים</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">({measurements.length} מדידות)</span>
          </div>
          <button
            onClick={startNew}
            disabled={editingId !== null}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaPlus size={11} />
            <span>הוסף מדידה</span>
          </button>
        </div>

        {measurements.length === 0 && editingId !== "__new__" ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500">אין מדידות עדיין — הוסף את המדידה הראשונה</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">
                    תאריך
                  </th>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody>
                {editingId === "__new__" && draft && (
                  <EditRow
                    columns={COLUMNS}
                    draft={draft}
                    setDraft={setDraft}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    saving={saving}
                    highlight
                  />
                )}
                {sorted.map((m, i) => {
                  const rowId = m._id || m.date;
                  const isEditingThis = editingId === rowId;
                  if (isEditingThis && draft) {
                    return (
                      <EditRow
                        key={rowId}
                        columns={COLUMNS}
                        draft={draft}
                        setDraft={setDraft}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                        saving={saving}
                      />
                    );
                  }
                  return (
                    <tr
                      key={rowId}
                      className={`border-t border-slate-100 dark:border-slate-800 transition-colors ${
                        i === 0 ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                        {m.date}
                        {i === 0 && (
                          <span className="ms-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                            אחרונה
                          </span>
                        )}
                      </td>
                      {COLUMNS.map((c) => {
                        const val = m[c.key] as number;
                        const isEmpty = !val || val === 0;
                        return (
                          <td
                            key={c.key}
                            className={`px-4 py-3 text-center font-semibold ${
                              isEmpty ? "text-slate-300" : i === 0 ? c.color : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {isEmpty ? "—" : val}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(m)}
                            disabled={editingId !== null}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-40"
                            aria-label="ערוך"
                          >
                            <FaPencil size={10} />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            disabled={editingId !== null}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                            aria-label="מחק"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function EditRow({
  columns,
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  highlight = false,
}: {
  columns: { key: MeasurementKey; label: string; color: string }[];
  draft: IMuscleMeasurement;
  setDraft: (m: IMuscleMeasurement) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={`border-t border-slate-100 dark:border-slate-800 ${highlight ? "bg-emerald-50/50" : "bg-blue-50/60"}`}>
      <td className="px-4 py-3 text-right">
        <input
          type="text"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          className="w-28 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
          dir="ltr"
          placeholder="DD/MM/YYYY"
        />
      </td>
      {columns.map((c) => {
        const v = draft[c.key] as number;
        const display = typeof v === "number" && !isNaN(v) && v !== 0 ? v : "";
        return (
          <td key={c.key} className="px-4 py-3 text-center">
            <input
              type="number"
              value={display}
              onChange={(e) => {
                const raw = e.target.value;
                const num = raw === "" ? NaN : Number(raw);
                setDraft({ ...draft, [c.key]: num } as IMuscleMeasurement);
              }}
              placeholder="—"
              className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-center text-sm placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
          </td>
        );
      })}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            <FaFloppyDisk size={9} />
            <span>{saving ? "שומר..." : "שמור"}</span>
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            <FaXmark size={9} />
            <span>בטל</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default MeasurementsProgression;
