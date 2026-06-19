import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment-timezone";
import { toast } from "sonner";
import {
  FaFloppyDisk,
  FaHeartPulse,
  FaPencil,
  FaPlus,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";

import DeleteModal from "@/components/Alerts/DeleteModal";
import { QueryKeys } from "@/enums/QueryKeys";
import { IMuscleMeasurement } from "@/interfaces/measurements";
import { useMeasurementApi } from "@/hooks/api/useMeasurementsApi";
import useMeasurementQuery from "@/hooks/queries/measurements/useMeasurementQuery";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

type MeasurementKey = "chest" | "arm" | "waist" | "glutes" | "thigh" | "calf";

const COLUMNS: { key: MeasurementKey; label: string; color: string }[] = [
  { key: "chest", label: "חזה", color: "text-blue-600" },
  { key: "arm", label: "זרוע", color: "text-purple-600" },
  { key: "waist", label: "מותן", color: "text-emerald-600" },
  { key: "glutes", label: "ישבן", color: "text-orange-600" },
  { key: "thigh", label: "ירך", color: "text-pink-600" },
  { key: "calf", label: "תאומים", color: "text-indigo-600" },
];

const blankMeasurement = (): IMuscleMeasurement =>
  ({
    date: moment().format("DD/MM/YYYY"),
    chest: NaN,
    arm: NaN,
    waist: NaN,
    glutes: NaN,
    thigh: NaN,
    calf: NaN,
  }) as IMuscleMeasurement;

const cleanMeasurementNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value) ? value : 0;

const toMeasurementPayload = (draft: IMuscleMeasurement): IMuscleMeasurement => ({
  ...draft,
  date: moment(draft.date, "DD/MM/YYYY").toISOString(),
  chest: cleanMeasurementNumber(draft.chest),
  arm: cleanMeasurementNumber(draft.arm),
  waist: cleanMeasurementNumber(draft.waist),
  glutes: cleanMeasurementNumber(draft.glutes),
  thigh: cleanMeasurementNumber(draft.thigh),
  calf: cleanMeasurementNumber(draft.calf),
});

const getMeasurementValueClassName = ({
  color,
  isEmpty,
  isLatest,
}: {
  color: string;
  isEmpty: boolean;
  isLatest: boolean;
}) => {
  if (isEmpty) return "text-slate-300";
  if (isLatest) return color;
  return "text-slate-700 dark:text-slate-200";
};

const MeasurementsProgression = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useMeasurementQuery(id);
  const { addMeasurement, updateMeasurement, deleteMeasurement } = useMeasurementApi();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<IMuscleMeasurement | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteMeasurement, setPendingDeleteMeasurement] = useState<IMuscleMeasurement | null>(
    null
  );

  const measurements: IMuscleMeasurement[] = useMemo(() => {
    if (!data?.measurements) return [];
    return data.measurements.map((measurement: IMuscleMeasurement) => ({
      ...measurement,
      date: measurement.date ? moment(measurement.date).format("DD/MM/YYYY") : "",
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
    if (!latest || !earliest) {
      return { text: "0", color: "text-slate-400 dark:text-slate-500", arrow: "" };
    }

    const diff = (latest[key] as number) - (earliest[key] as number);
    if (diff === 0) return { text: "0", color: "text-slate-400 dark:text-slate-500", arrow: "" };
    if (diff < 0) return { text: `${diff}`, color: "text-emerald-600", arrow: "↓" };
    return { text: `+${diff}`, color: "text-rose-600", arrow: "↑" };
  };

  const startEdit = (measurement: IMuscleMeasurement) => {
    setEditingId(measurement._id || measurement.date);
    setDraft({ ...measurement });
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
      const payload = toMeasurementPayload(draft);
      const response: any =
        editingId === "__new__"
          ? await addMeasurement(id, payload)
          : await updateMeasurement(id, payload);

      toast.success(editingId === "__new__" ? "המדידה נוספה בהצלחה!" : "המדידה עודכנה בהצלחה!");

      if (response?.data) {
        queryClient.setQueryData([QueryKeys.USER_MEASUREMENTS + id], response.data);
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

  const requestDelete = (measurement: IMuscleMeasurement) => {
    if (!id || !measurement.date) return;
    setPendingDeleteMeasurement(measurement);
  };

  const confirmDelete = async () => {
    if (!id || !pendingDeleteMeasurement?.date) return;

    try {
      const iso = moment(pendingDeleteMeasurement.date, "DD/MM/YYYY").toISOString();
      await deleteMeasurement(id, iso);
      toast.success("המדידה נמחקה");
      refresh();
      setPendingDeleteMeasurement(null);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה במחיקת המדידה");
    }
  };

  if (isLoading) return <Loader size="large" />;

  const errorStatus = (error as any)?.status;
  const isPermissionError = errorStatus === 401 || errorStatus === 403;
  if (isError && errorStatus !== 404 && !isPermissionError) {
    return <ErrorPage message={(error as any)?.message} />;
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      {measurements.length > 0 && (
        <MeasurementSummaryCards columns={COLUMNS} latest={latest} getDelta={getDelta} />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FaHeartPulse size={15} className="text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">מעקב היקפים</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({measurements.length} מדידות)
            </span>
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
            <p className="text-sm text-slate-400 dark:text-slate-500">
              אין מדידות עדיין — הוסף את המדידה הראשונה
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider">
                    תאריך
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider"
                    >
                      {column.label}
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

                {sorted.map((measurement, index) => {
                  const rowId = measurement._id || measurement.date;
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
                    <MeasurementDisplayRow
                      key={rowId}
                      columns={COLUMNS}
                      measurement={measurement}
                      isLatest={index === 0}
                      actionsDisabled={editingId !== null}
                      onEdit={() => startEdit(measurement)}
                      onDelete={() => requestDelete(measurement)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteModal
        isModalOpen={!!pendingDeleteMeasurement}
        setIsModalOpen={(open) => {
          if (!open) setPendingDeleteMeasurement(null);
        }}
        onCancel={() => setPendingDeleteMeasurement(null)}
        onConfirm={confirmDelete}
        title={
          pendingDeleteMeasurement
            ? `למחוק את המדידה מ-${pendingDeleteMeasurement.date}?`
            : "למחוק מדידה?"
        }
        alertMessage={
          <>
            המדידה תוסר מהיסטוריית ההתקדמות של המתאמן.
            <br />
            פעולה זו אינה ניתנת לביטול.
          </>
        }
      />
    </div>
  );
};

function MeasurementSummaryCards({
  columns,
  latest,
  getDelta,
}: {
  columns: { key: MeasurementKey; label: string; color: string }[];
  latest?: IMuscleMeasurement;
  getDelta: (key: MeasurementKey) => { text: string; color: string; arrow: string };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {columns.map((column) => {
        const delta = getDelta(column.key);
        return (
          <div
            key={column.key}
            className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800/80 dark:bg-slate-900"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {column.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${column.color}`}>
              {latest?.[column.key] ?? "—"}
              <span className="me-1 text-xs text-slate-400 dark:text-slate-500">ס״מ</span>
            </p>
            <p className={`mt-0.5 text-xs font-semibold ${delta.color}`}>
              {delta.arrow} {delta.text} מהתחלה
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MeasurementDisplayRow({
  columns,
  measurement,
  isLatest,
  actionsDisabled,
  onEdit,
  onDelete,
}: {
  columns: { key: MeasurementKey; label: string; color: string }[];
  measurement: IMuscleMeasurement;
  isLatest: boolean;
  actionsDisabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr
      className={`border-t border-slate-100 transition-colors dark:border-slate-800 ${
        isLatest ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50/60"
      }`}
    >
      <td className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
        {measurement.date}
        {isLatest && (
          <span className="ms-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
            אחרונה
          </span>
        )}
      </td>
      {columns.map((column) => {
        const value = measurement[column.key] as number;
        const isEmpty = !value || value === 0;
        const valueClassName = getMeasurementValueClassName({
          color: column.color,
          isEmpty,
          isLatest,
        });

        return (
          <td key={column.key} className={`px-4 py-3 text-center font-semibold ${valueClassName}`}>
            {isEmpty ? "—" : value}
          </td>
        );
      })}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={onEdit}
            disabled={actionsDisabled}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            aria-label="ערוך"
          >
            <FaPencil size={10} />
          </button>
          <button
            onClick={onDelete}
            disabled={actionsDisabled}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            aria-label="מחק"
          >
            <FaTrash size={10} />
          </button>
        </div>
      </td>
    </tr>
  );
}

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
  setDraft: (measurement: IMuscleMeasurement) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  highlight?: boolean;
}) {
  return (
    <tr
      className={`border-t border-slate-100 dark:border-slate-800 ${
        highlight ? "bg-emerald-50/50" : "bg-blue-50/60"
      }`}
    >
      <td className="px-4 py-3 text-right">
        <input
          type="text"
          value={draft.date}
          onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-slate-700"
          dir="ltr"
          placeholder="DD/MM/YYYY"
        />
      </td>
      {columns.map((column) => {
        const value = draft[column.key] as number;
        const display = typeof value === "number" && !Number.isNaN(value) && value !== 0 ? value : "";

        return (
          <td key={column.key} className="px-4 py-3 text-center">
            <input
              type="number"
              value={display}
              onChange={(event) => {
                const raw = event.target.value;
                const num = raw === "" ? NaN : Number(raw);
                setDraft({ ...draft, [column.key]: num } as IMuscleMeasurement);
              }}
              placeholder="—"
              className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-slate-700"
            />
          </td>
        );
      })}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <FaFloppyDisk size={9} />
            <span>{saving ? "שומר..." : "שמור"}</span>
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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
