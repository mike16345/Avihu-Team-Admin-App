/**
 * PresetMetaPanel — compact meta-data card shown at the top of the
 * workout-preset editor.
 *
 * Density tweaks: tighter row padding, smaller chips, no per-row
 * hints (labels are self-explanatory), and two equal columns with a
 * thin centre divider. Same fields and form bindings — purely a
 * visual compaction pass.
 */
import React, { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  LEVEL_OPTIONS,
  GOAL_OPTIONS,
  MUSCLE_FOCUS_OPTIONS,
  EQUIPMENT_OPTIONS,
  goalLabel,
  levelLabel,
  equipmentLabel,
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
  FaPlus,
} from "react-icons/fa6";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";

/** Compact field — single row of label + control. */
const Field = React.forwardRef<
  HTMLDivElement,
  {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    isLast?: boolean;
  }
>(({ icon, label, children, isLast }, ref) => (
  <div
    ref={ref}
    className={`relative flex flex-col gap-2 py-3 ${
      isLast
        ? ""
        : // soft gradient divider — fades at the ends so the row separators
          // feel like quiet threads rather than hard boxed-in lines.
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-l after:from-transparent after:via-slate-200/80 after:to-transparent dark:after:via-slate-700/60"
    }`}
  >
    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60">
        {icon}
      </span>
      {label}
    </label>
    <div>{children}</div>
  </div>
));
Field.displayName = "Field";

/**
 * Shared pill — brand-aligned and uniform across every selection in
 * this panel: same shape (rounded-xl rectangle), same height (h-9),
 * same font size (text-xs). Inactive uses a soft brand tint so the
 * pills feel inviting; active uses the full brand gradient with glow.
 */
const pillClass = (active: boolean, _toneActive?: string) => {
  void _toneActive;
  return `inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-bold transition-all duration-150 ${
    active
      ? "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/25 -translate-y-px"
      : "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
  }`;
};

const PresetMetaPanel: React.FC = () => {
  const { control, watch } = useFormContext();

  // "Builder" picker — current user (whoever's logged in) + every
  // sub-trainer they manage. SafeAuthUser doesn't always carry the
  // first/last name, so we fall back to the email so the current
  // user *always* appears in the list.
  const currentUser = useUsersStore((s) => s.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();
  const builderOptions = React.useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (currentUser?._id) {
      const name = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
      const fallback = currentUser.email || "אני";
      list.push({
        value: currentUser._id,
        label: name ? `${name} (אני)` : `${fallback} (אני)`,
      });
    }
    subTrainers.forEach((t) => {
      // Don't duplicate the current user if they happen to also
      // appear in the sub-trainers list (defensive).
      if (t._id && t._id !== currentUser?._id) {
        list.push({ value: t._id, label: t.fullName || "ללא שם" });
      }
    });
    return list;
  }, [currentUser, subTrainers]);

  // Current values (drives the chip summary)
  const v = {
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
  const filledCount =
    (v.workoutsPerWeek ? 1 : 0) +
    (v.durationMinutes ? 1 : 0) +
    (v.level ? 1 : 0) +
    (v.goal ? 1 : 0) +
    (v.equipment ? 1 : 0) +
    (v.muscleFocus.length > 0 ? 1 : 0) +
    (v.builtByTrainerId ? 1 : 0) +
    (v.note.trim() ? 1 : 0) +
    (v.limitations.trim() ? 1 : 0);

  /**
   * Always start collapsed — the chip summary row is always enough as
   * a first impression. The trainer expands the panel on demand by
   * clicking the "ערוך תיוג" toggle or any individual chip. This keeps
   * the workouts area front-and-centre without forcing meta tagging up
   * front, even on a brand-new preset.
   */
  const [expanded, setExpanded] = useState<boolean>(false);

  /**
   * Clicking a chip jumps straight to its field — expand the panel
   * first if needed, then scroll/focus the matching control. Refs
   * are keyed by chip id below.
   */
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const jumpToField = (id: string) => {
    setExpanded(true);
    // Wait for the expand animation/render then scroll into view.
    requestAnimationFrame(() => {
      const el = fieldRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.querySelector<HTMLElement>("input, textarea, button");
        focusable?.focus({ preventScroll: true });
      }
    });
  };

  // Resolved display labels for the summary chips.
  const builderName = builderOptions.find((b) => b.value === v.builtByTrainerId)?.label;
  const muscleNames = v.muscleFocus.map(muscleFocusLabel).filter(Boolean) as string[];

  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Compact header — always visible. Carries the toggle and,
          when collapsed, the chip summary so the trainer never loses
          sight of what's already tagged. Subtle blue gradient ties it
          to the brand without competing with the cards above. */}
      <header
        className={`relative flex flex-wrap items-center gap-2.5 ${
          expanded ? "border-b border-blue-100/60 dark:border-blue-900/40" : ""
        } bg-gradient-to-l from-blue-50/60 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/20 px-4 py-3`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-blue-500/25">
          <FaBullseye size={13} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">מאפייני התוכנית</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {filledCount > 0 ? `${filledCount} מאפיינים תויגו` : "כל המאפיינים אופציונליים"}
          </p>
        </div>

        {/* Chip summary — only when collapsed. Each chip is the
            shortcut to its field; ghost chips invite the trainer to
            fill the empty fields without forcing the full editor open. */}
        {!expanded && (
          <div className="order-3 flex w-full flex-wrap items-center gap-1.5 pt-1 sm:order-none sm:w-auto sm:flex-1 sm:pt-0">
            {v.workoutsPerWeek ? (
              <SummaryChip
                icon={<FaCalendarWeek size={9} />}
                label={`${v.workoutsPerWeek}× בשבוע`}
                onClick={() => jumpToField("workoutsPerWeek")}
              />
            ) : (
              <GhostChip label="תדירות" onClick={() => jumpToField("workoutsPerWeek")} />
            )}
            {v.durationMinutes ? (
              <SummaryChip
                icon={<FaClock size={9} />}
                label={`${v.durationMinutes} דק׳`}
                onClick={() => jumpToField("durationMinutes")}
              />
            ) : (
              <GhostChip label="משך" onClick={() => jumpToField("durationMinutes")} />
            )}
            {v.level ? (
              <SummaryChip
                icon={<FaSignal size={9} />}
                label={levelLabel(v.level as any) ?? v.level}
                onClick={() => jumpToField("level")}
              />
            ) : (
              <GhostChip label="רמה" onClick={() => jumpToField("level")} />
            )}
            {v.goal ? (
              <SummaryChip
                icon={<FaBullseye size={9} />}
                label={goalLabel(v.goal as any) ?? v.goal}
                onClick={() => jumpToField("goal")}
              />
            ) : (
              <GhostChip label="דגש" onClick={() => jumpToField("goal")} />
            )}
            {v.equipment ? (
              <SummaryChip
                icon={<FaDumbbell size={9} />}
                label={equipmentLabel(v.equipment as any) ?? v.equipment}
                onClick={() => jumpToField("equipment")}
              />
            ) : (
              <GhostChip label="ציוד" onClick={() => jumpToField("equipment")} />
            )}
            {muscleNames.length > 0 ? (
              <SummaryChip
                icon={<FaPersonRays size={9} />}
                label={muscleNames.join(" · ")}
                onClick={() => jumpToField("muscleFocus")}
              />
            ) : (
              <GhostChip label="פוקוס שריר" onClick={() => jumpToField("muscleFocus")} />
            )}
            {builderName ? (
              <SummaryChip
                icon={<FaUser size={9} />}
                label={builderName}
                onClick={() => jumpToField("builtByTrainerId")}
              />
            ) : (
              <GhostChip label="מאמן שבנה" onClick={() => jumpToField("builtByTrainerId")} />
            )}
            {v.note.trim() && (
              <SummaryChip
                icon={<FaNoteSticky size={9} />}
                label="הערה"
                onClick={() => jumpToField("note")}
              />
            )}
            {v.limitations.trim() && (
              <SummaryChip
                icon={<FaCircleExclamation size={9} />}
                label="מגבלות"
                onClick={() => jumpToField("limitations")}
                tone="rose"
              />
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          className="ms-auto inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-px dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
        >
          {expanded ? "סגור" : "ערוך תיוג"}
          <FaChevronDown
            size={10}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </header>

      {/* 2-column body — collapsed when only the chip summary is needed */}
      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-slate-900 dark:via-blue-950/10 dark:to-slate-900">
          {/* RIGHT column */}
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
                          onClick={() => field.onChange(active ? undefined : n)}
                          className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all duration-150 ${
                            active
                              ? "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/30 -translate-y-px"
                              : "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                          }`}
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
                          onClick={() => field.onChange(active ? undefined : opt.value)}
                          className={pillClass(
                            active,
                            `border ${opt.tone.border} ${opt.tone.bg} ${opt.tone.text}`
                          )}
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
                          onClick={() => field.onChange(active ? undefined : opt.value)}
                          className={pillClass(
                            active,
                            `border ${opt.tone.border} ${opt.tone.bg} ${opt.tone.text}`
                          )}
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
                      field.onChange(value.includes(v) ? [] : [v]);
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
                            className={`inline-flex h-9 items-center gap-1 rounded-xl border px-3 text-xs font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                              active
                                ? "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/25 -translate-y-px"
                                : "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                            }`}
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
                            onClick={() => field.onChange(active ? undefined : b.value)}
                            className={`inline-flex h-9 items-center rounded-xl border px-3 text-xs font-bold transition-all duration-150 ${
                              active
                                ? "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/25 -translate-y-px"
                                : "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700"
                            }`}
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

          {/* LEFT column */}
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
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                      className="h-9 w-16 rounded-xl border border-blue-100/60 bg-blue-50/40 px-2 text-center text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-200 dark:focus:bg-slate-900"
                    />
                    <div className="flex flex-wrap gap-1">
                      {[30, 45, 60, 75, 90, 120].map((m) => {
                        const active = Number(field.value) === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => field.onChange(active ? undefined : m)}
                            className={`h-9 rounded-xl border px-3 text-xs font-bold transition-all duration-150 ${
                              active
                                ? "brand-gradient brand-gradient-hover border-transparent text-white shadow-md shadow-blue-500/30 -translate-y-px"
                                : "border-blue-100/60 bg-blue-50/40 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-300 dark:hover:border-blue-700"
                            }`}
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
                          onClick={() => field.onChange(active ? undefined : opt.value)}
                          className={pillClass(
                            active,
                            `border ${opt.tone.border} ${opt.tone.bg} ${opt.tone.text}`
                          )}
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

/* -------------------------------------------------------------------- */

/**
 * A single resolved-value chip on the collapsed summary row. Clickable
 * — jumps the trainer straight to the field that owns this value.
 */
const SummaryChip: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "blue" | "rose";
}> = ({ icon, label, onClick, tone = "blue" }) => {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${toneClass}`}
    >
      {icon}
      <span className="max-w-[180px] truncate">{label}</span>
    </button>
  );
};

/**
 * Placeholder chip for an empty field. Looks like a dashed-outline
 * "add me" affordance, click jumps to the field.
 */
const GhostChip: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-transparent px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
  >
    <FaPlus size={8} />
    {label}
  </button>
);

export default PresetMetaPanel;
