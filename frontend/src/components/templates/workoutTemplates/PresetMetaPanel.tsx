import React, { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  LEVEL_OPTIONS,
  GOAL_OPTIONS,
  MUSCLE_FOCUS_OPTIONS,
  EQUIPMENT_OPTIONS,
  muscleFocusLabel,
} from "@/lib/workoutMeta";
import {
  FaCalendarWeek,
  FaClock,
  FaSignal,
  FaBullseye,
  FaCircleExclamation,
  FaNoteSticky,
  FaPersonRays,
  FaDumbbell,
  FaUser,
  FaChevronDown,
} from "react-icons/fa6";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import { Field } from "./PresetMetaPanelPrimitives";
import { PresetMetaSummary, type PresetMetaValues } from "./PresetMetaSummary";
import { getPillClassName } from "./presetMetaPanelStyles";

const getBuilderOptionLabel = ({
  firstName,
  lastName,
  email,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) => {
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  if (name) return `${name} (אני)`;

  const fallback = email || "אני";
  return `${fallback} (אני)`;
};

const countFilledPresetMetaValues = (values: PresetMetaValues) => {
  let count = 0;

  if (values.workoutsPerWeek) count += 1;
  if (values.durationMinutes) count += 1;
  if (values.level) count += 1;
  if (values.goal) count += 1;
  if (values.equipment) count += 1;
  if (values.muscleFocus.length > 0) count += 1;
  if (values.builtByTrainerId) count += 1;
  if (values.note.trim()) count += 1;
  if (values.limitations.trim()) count += 1;

  return count;
};

const getFilledCountLabel = (filledCount: number) => {
  if (filledCount > 0) return `${filledCount} מאפיינים תויגו`;
  return "כל המאפיינים אופציונליים";
};

const getHeaderClassName = (expanded: boolean) => {
  if (expanded) return "border-b border-blue-100/60 dark:border-blue-900/40";
  return "";
};

const getExpandedToggleLabel = (expanded: boolean) => {
  if (expanded) return "סגור";
  return "ערוך תיוג";
};

const getChevronRotationClassName = (expanded: boolean) => {
  if (expanded) return "rotate-180";
  return "";
};

const getNumberButtonClassName = (active: boolean) => {
  if (active) {
    return "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/30 -translate-y-px";
  }

  return "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700";
};

const getMuscleFocusButtonClassName = (active: boolean) => {
  if (active) {
    return "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/25 -translate-y-px";
  }

  return "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300";
};

const getToggledOptionValue = <T,>(active: boolean, value: T) => {
  if (active) return undefined;
  return value;
};

const getFullBodyFocusValue = (currentValue: string[], focusValue: string) => {
  if (currentValue.includes(focusValue)) return [];
  return [focusValue];
};

const getNumericInputValue = (value: string) => {
  if (value === "") return undefined;
  return Number(value);
};

const PresetMetaPanel: React.FC = () => {
  const { control, watch } = useFormContext();

  const currentUser = useUsersStore((s) => s.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();
  const builderOptions = React.useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (currentUser?._id) {
      list.push({
        value: currentUser._id,
        label: getBuilderOptionLabel(currentUser),
      });
    }
    subTrainers.forEach((t) => {
      if (t._id && t._id !== currentUser?._id) {
        list.push({ value: t._id, label: t.fullName || "ללא שם" });
      }
    });
    return list;
  }, [currentUser, subTrainers]);

  const presetValues: PresetMetaValues = {
    workoutsPerWeek: watch("workoutsPerWeek") as number | undefined,
    durationMinutes: watch("durationMinutes") as number | undefined,
    level: watch("level") as string | undefined,
    goal: watch("goal") as string | undefined,
    equipment: watch("equipment") as string | undefined,
    muscleFocus: (watch("muscleFocus") as string[] | undefined) ?? [],
    builtByTrainerId: watch("builtByTrainerId") as string | undefined,
    note: (watch("note") as string | undefined) ?? "",
    limitations: (watch("limitations") as string | undefined) ?? "",
  };
  const filledCount = countFilledPresetMetaValues(presetValues);

  const [expanded, setExpanded] = useState<boolean>(false);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const jumpToField = (id: string) => {
    setExpanded(true);
    requestAnimationFrame(() => {
      const el = fieldRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.querySelector<HTMLElement>("input, textarea, button");
        focusable?.focus({ preventScroll: true });
      }
    });
  };

  const builderName = builderOptions.find((b) => b.value === presetValues.builtByTrainerId)?.label;
  const muscleNames = presetValues.muscleFocus.map(muscleFocusLabel).filter(Boolean) as string[];

  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-2xl border border-blue-100/60 bg-white font-heebo shadow-sm dark:border-blue-900/40 dark:bg-slate-900"
    >
      <header
        className={`relative flex flex-wrap items-center gap-2.5 ${getHeaderClassName(
          expanded
        )} bg-gradient-to-l from-blue-50/60 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/20 px-4 py-3`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-blue-500/25">
          <FaBullseye size={13} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">מאפייני התוכנית</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {getFilledCountLabel(filledCount)}
          </p>
        </div>

        {!expanded && (
          <PresetMetaSummary
            values={presetValues}
            builderName={builderName}
            muscleNames={muscleNames}
            onJumpToField={jumpToField}
          />
        )}

        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          className="ms-auto inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-px dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
        >
          {getExpandedToggleLabel(expanded)}
          <FaChevronDown
            size={10}
            className={`transition-transform ${getChevronRotationClassName(expanded)}`}
          />
        </button>
      </header>

      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-slate-900 dark:via-blue-950/10 dark:to-slate-900">
          <div className="px-5 lg:border-l lg:border-blue-100/40 lg:dark:border-blue-900/30">
            <Field
              ref={(el) => (fieldRefs.current["workoutsPerWeek"] = el)}
              icon={<FaCalendarWeek size={11} />}
              label="תדירות בשבוע"
            >
              <Controller
                control={control}
                name="workoutsPerWeek"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                      const active = Number(field.value) === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => field.onChange(getToggledOptionValue(active, n))}
                          className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all duration-150 ${getNumberButtonClassName(
                            active
                          )}`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>

            <Field
              ref={(el) => (fieldRefs.current["level"] = el)}
              icon={<FaSignal size={11} />}
              label="רמת קושי"
            >
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1">
                    {LEVEL_OPTIONS.map((opt) => {
                      const active = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(getToggledOptionValue(active, opt.value))}
                          className={getPillClassName(active)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>

            <Field
              ref={(el) => (fieldRefs.current["equipment"] = el)}
              icon={<FaDumbbell size={11} />}
              label="ציוד נדרש"
            >
              <Controller
                control={control}
                name="equipment"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1">
                    {EQUIPMENT_OPTIONS.map((opt) => {
                      const active = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(getToggledOptionValue(active, opt.value))}
                          className={getPillClassName(active)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>

            <Field
              ref={(el) => (fieldRefs.current["muscleFocus"] = el)}
              icon={<FaPersonRays size={11} />}
              label='פוקוס שרירים (עד 3, או "כללי")'
            >
              <Controller
                control={control}
                name="muscleFocus"
                render={({ field }) => {
                  const value: string[] = field.value ?? [];
                  const toggle = (v: string, isFullBody?: boolean) => {
                    if (isFullBody) {
                      field.onChange(getFullBodyFocusValue(value, v));
                      return;
                    }
                    const withoutFB = value.filter((x) => x !== "full-body");
                    if (withoutFB.includes(v)) {
                      field.onChange(withoutFB.filter((x) => x !== v));
                    } else if (withoutFB.length >= 3) {
                      return;
                    } else {
                      field.onChange([...withoutFB, v]);
                    }
                  };
                  const specificCount = value.filter((x) => x !== "full-body").length;
                  return (
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_FOCUS_OPTIONS.map((opt) => {
                        const active = value.includes(opt.value);
                        const disabled = !active && !opt.isFullBody && specificCount >= 3;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggle(opt.value, opt.isFullBody)}
                            disabled={disabled}
                            className={`inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${getMuscleFocusButtonClassName(
                              active
                            )}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </Field>

            {builderOptions.length > 0 && (
              <Field
                ref={(el) => (fieldRefs.current["builtByTrainerId"] = el)}
                icon={<FaUser size={11} />}
                label="מאמן שבנה"
                isLast
              >
                <Controller
                  control={control}
                  name="builtByTrainerId"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {builderOptions.map((b) => {
                        const active = field.value === b.value;
                        return (
                          <button
                            key={b.value}
                            type="button"
                            onClick={() => field.onChange(getToggledOptionValue(active, b.value))}
                            className={`inline-flex h-9 items-center rounded-xl border px-3 text-xs font-bold transition-all duration-150 ${getMuscleFocusButtonClassName(
                              active
                            )}`}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </Field>
            )}
          </div>

          <div className="px-5">
            <Field
              ref={(el) => (fieldRefs.current["durationMinutes"] = el)}
              icon={<FaClock size={11} />}
              label="משך אימון (דקות)"
            >
              <Controller
                control={control}
                name="durationMinutes"
                render={({ field }) => (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      type="number"
                      min={10}
                      max={240}
                      step={5}
                      placeholder="60"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(getNumericInputValue(e.target.value))}
                      className="h-9 w-16 rounded-xl border border-blue-100/60 bg-blue-50/40 px-2 text-center text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-200 dark:focus:bg-slate-900"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[30, 45, 60, 75, 90, 120].map((m) => {
                        const active = Number(field.value) === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => field.onChange(getToggledOptionValue(active, m))}
                            className={`h-9 rounded-xl border px-3 text-xs font-bold transition-all duration-150 ${getNumberButtonClassName(
                              active
                            )}`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            </Field>

            <Field
              ref={(el) => (fieldRefs.current["goal"] = el)}
              icon={<FaBullseye size={11} />}
              label="דגש"
            >
              <Controller
                control={control}
                name="goal"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1">
                    {GOAL_OPTIONS.map((opt) => {
                      const active = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(getToggledOptionValue(active, opt.value))}
                          className={getPillClassName(active)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </Field>

            <Field
              ref={(el) => (fieldRefs.current["note"] = el)}
              icon={<FaNoteSticky size={11} />}
              label="הערה / פידבק"
            >
              <Controller
                control={control}
                name="note"
                render={({ field }) => (
                  <textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={2}
                    placeholder="טיפ פנימי על התוכנית…"
                    maxLength={500}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    className="w-full min-h-[64px] rounded-xl border border-blue-100/60 bg-blue-50/30 p-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 resize-none overflow-hidden dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-200 dark:focus:bg-slate-900"
                  />
                )}
              />
            </Field>

            <Field
              ref={(el) => (fieldRefs.current["limitations"] = el)}
              icon={<FaCircleExclamation size={11} />}
              label="מגבלות"
              isLast
            >
              <Controller
                control={control}
                name="limitations"
                render={({ field }) => (
                  <textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={2}
                    placeholder="פציעות / דברים להימנע…"
                    maxLength={500}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    className="w-full min-h-[64px] rounded-xl border border-blue-100/60 bg-blue-50/30 p-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 resize-none overflow-hidden dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-200 dark:focus:bg-slate-900"
                  />
                )}
              />
            </Field>
          </div>
        </div>
      )}
    </section>
  );
};

export default PresetMetaPanel;
