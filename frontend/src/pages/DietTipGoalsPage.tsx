import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaCircleCheck, FaPencil, FaPlus, FaTrash } from "react-icons/fa6";
import { deleteItem, fetchData, updateItem } from "@/API/api";
import { useUsersStore } from "@/store/userStore";
import TextEditor from "@/components/ui/TextEditor";

interface Goal {
  key: string;
  label: string;
  tips: string[];
}

const DEFAULT_GOALS: Array<{ key: string; label: string }> = [
  { key: "cutting", label: "חיטוב" },
  { key: "mass", label: "מסה" },
];

const isEmptyHtml = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim().length === 0;

const slugify = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 64) || `goal-${Date.now()}`;

interface GoalCardState {
  editorHtml: string;
  savedHtml: string;
  editing: boolean;
  saving: boolean;
}

const emptyCardState: GoalCardState = {
  editorHtml: "",
  savedHtml: "",
  editing: true,
  saving: false,
};

const DietTipGoalsPage = () => {
  const currentUser = useUsersStore((s) => s.currentUser);
  const trainerId = currentUser?.trainerId || currentUser?._id;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [cardState, setCardState] = useState<Record<string, GoalCardState>>({});
  const [addingGoal, setAddingGoal] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState("");

  useEffect(() => {
    if (!trainerId) return;
    (async () => {
      try {
        const res = await fetchData<{ data?: Goal[] | { data?: Goal[] } }>(
          `trainers/diet-tip-goals`,
          { trainerId }
        );
        const raw = res?.data as unknown;
        const list: Goal[] = Array.isArray(raw)
          ? (raw as Goal[])
          : ((raw as { data?: Goal[] })?.data ?? []);
        setGoals(list);
        const nextState: Record<string, GoalCardState> = {};
        list.forEach((g) => {
          const html = (g.tips || []).join(" ");
          nextState[g.key] = {
            editorHtml: html,
            savedHtml: html,
            editing: isEmptyHtml(html),
            saving: false,
          };
        });
        setCardState(nextState);
      } catch {}
    })();
  }, [trainerId]);

  const seedDefaultGoals = () => {
    const nextGoals: Goal[] = DEFAULT_GOALS.map((g) => ({ ...g, tips: [] }));
    setGoals(nextGoals);
    setCardState((s) => {
      const next = { ...s };
      nextGoals.forEach((g) => {
        if (!next[g.key]) next[g.key] = { ...emptyCardState };
      });
      return next;
    });
  };

  const patchCard = (key: string, patch: Partial<GoalCardState>) => {
    setCardState((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
  };

  const persist = async (goal: Goal, tipsArr: string[]) => {
    if (!trainerId) return false;
    patchCard(goal.key, { saving: true });
    try {
      await updateItem(`trainers/diet-tip-goals`, {
        trainerId,
        key: goal.key,
        label: goal.label,
        tips: tipsArr,
      });
      toast.success("נשמר");
      return true;
    } catch {
      toast.error("שמירה נכשלה");
      return false;
    } finally {
      patchCard(goal.key, { saving: false });
    }
  };

  const onSave = async (goal: Goal) => {
    const state = cardState[goal.key];
    if (!state) return;
    const arr = isEmptyHtml(state.editorHtml) ? [] : [state.editorHtml];
    const ok = await persist(goal, arr);
    if (!ok) return;
    patchCard(goal.key, {
      savedHtml: state.editorHtml,
      editing: isEmptyHtml(state.editorHtml),
    });
  };

  const onClear = async (goal: Goal) => {
    const ok = await persist(goal, []);
    if (!ok) return;
    patchCard(goal.key, { editorHtml: "", savedHtml: "", editing: true });
  };

  const onDeleteGoal = async (goal: Goal) => {
    if (!trainerId) return;
    if (!window.confirm(`למחוק את "${goal.label}"?`)) return;
    try {
      await deleteItem(`trainers/diet-tip-goals`, undefined, undefined, {
        trainerId,
        key: goal.key,
      });
      setGoals((g) => g.filter((x) => x.key !== goal.key));
      setCardState((s) => {
        const next = { ...s };
        delete next[goal.key];
        return next;
      });
      toast.success("נמחק");
    } catch {
      toast.error("מחיקה נכשלה");
    }
  };

  const onAddGoal = () => {
    const label = newGoalLabel.trim();
    if (!label) return;
    const existingKeys = new Set(goals.map((g) => g.key));
    let key = slugify(label);
    let n = 1;
    while (existingKeys.has(key)) key = `${slugify(label)}-${++n}`;
    const goal: Goal = { key, label, tips: [] };
    setGoals((g) => [...g, goal]);
    setCardState((s) => ({ ...s, [key]: { ...emptyCardState } }));
    setNewGoalLabel("");
    setAddingGoal(false);
  };

  return (
    <div dir="rtl" className="mx-auto max-w-6xl px-4 py-6 font-heebo">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          דגשי ברירת מחדל לתפריט תזונה
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          קבע דגשים לפי מטרה. בעורך הדגשים של תפריט התזונה יופיע כפתור לכל מטרה, ולחיצה עליו תוסיף את הדגש לתוכן הנוכחי. חל על מתאמנים חדשים; לא משפיע רטרואקטיבית.
        </p>
      </div>

      {goals.length === 0 && (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mx-auto max-w-lg">
            <div className="mb-3 text-4xl opacity-40">💧</div>
            <h2 className="mb-2 text-lg font-bold text-slate-700 dark:text-slate-200">
              עוד לא הוגדרו יעדי דגשים
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              יעדי דגשים הם רשימות של דגשי תזונה שתופיע לך ככפתור בעורך התפריט של המתאמן.
              <br />
              לחיצה על הכפתור בעריכת התפריט תוסיף את הדגשים לתוכן בבת אחת — חוסך זמן חוזר.
              <br />
              <span className="mt-2 inline-block font-semibold">
                לדוגמה: יעד "חיטוב" עם דגשים כמו "לשתות 3 ליטר מים", "אין אכילה אחרי 20:00" וכו׳.
              </span>
            </p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={seedDefaultGoals}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                התחל עם חיטוב + מסה
              </button>
              <button
                type="button"
                onClick={() => setAddingGoal(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FaPlus className="inline-block" size={11} /> הוסף יעד משלי
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const state = cardState[goal.key] ?? emptyCardState;
          const busy = state.saving;
          const hasSaved = !isEmptyHtml(state.savedHtml);
          const dirty = state.editorHtml !== state.savedHtml;
          return (
            <div
              key={goal.key}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {goal.label}
                  </div>
                  {hasSaved && !dirty && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <FaCircleCheck size={10} />
                      נשמר
                    </span>
                  )}
                  {dirty && hasSaved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      שינוי לא שמור
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  title="מחק מטרה"
                  onClick={() => onDeleteGoal(goal)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                >
                  <FaTrash size={12} />
                </button>
              </div>

              {state.editing ? (
                <>
                  <div className="quill-rtl min-h-[200px]">
                    <TextEditor
                      value={state.editorHtml}
                      onChange={(value) => patchCard(goal.key, { editorHtml: value })}
                    />
                  </div>
                  <div className="mt-14 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onClear(goal)}
                      disabled={busy}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    >
                      נקה
                    </button>
                    <button
                      type="button"
                      onClick={() => onSave(goal)}
                      disabled={busy}
                      className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busy ? "שומר…" : "שמור"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="ql-editor prose prose-sm max-w-none rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm leading-relaxed text-slate-800 dark:border-emerald-900/40 dark:bg-emerald-950/10 dark:text-slate-200"
                    style={{ minHeight: 200, direction: "rtl", textAlign: "right" }}
                    dangerouslySetInnerHTML={{ __html: state.savedHtml }}
                  />
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onClear(goal)}
                      disabled={busy}
                      className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                    >
                      נקה
                    </button>
                    <button
                      type="button"
                      onClick={() => patchCard(goal.key, { editing: true })}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      <FaPencil size={11} />
                      ערוך
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 p-4 dark:border-slate-800">
          {addingGoal ? (
            <div className="flex w-full max-w-sm flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                שם המטרה החדשה
              </label>
              <input
                autoFocus
                value={newGoalLabel}
                onChange={(e) => setNewGoalLabel(e.target.value)}
                placeholder="למשל: שמירה"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onAddGoal();
                  if (e.key === "Escape") {
                    setAddingGoal(false);
                    setNewGoalLabel("");
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddingGoal(false);
                    setNewGoalLabel("");
                  }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={onAddGoal}
                  disabled={!newGoalLabel.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  הוסף
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingGoal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaPlus size={12} />
              הוסף מטרה
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietTipGoalsPage;
