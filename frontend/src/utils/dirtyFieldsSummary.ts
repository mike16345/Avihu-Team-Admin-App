/**
 * dirtyFieldsSummary — converts a react-hook-form `dirtyFields` object
 * into a short list of human-readable Hebrew strings describing what
 * the user changed.
 *
 * RHF's `dirtyFields` mirrors the shape of the form values — e.g.
 *   { meals: [{ totalProtein: { quantity: true } }, undefined, {...}] }
 *   { workoutPlans: [{ planName: true, muscleGroups: [...] }] }
 *
 * We don't try to be exhaustive (there can be hundreds of nested
 * fields). We surface only the top one or two levels with friendly
 * labels — enough for the user to recognise WHAT they edited without
 * scrolling through a wall of text.
 */

type Dirty = boolean | Dirty[] | { [k: string]: Dirty };

const isDirtyAnywhere = (v: Dirty | undefined): boolean => {
  if (v == null) return false;
  if (typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.some(isDirtyAnywhere);
  return Object.values(v).some(isDirtyAnywhere);
};

/** Summarise dirty diet-plan fields. */
export function summariseDietDirty(dirty: any | undefined): string[] {
  if (!dirty) return [];
  const out: string[] = [];

  if (isDirtyAnywhere(dirty.freeCalories)) {
    out.push("קלוריות חופשיות שונו");
  }
  if (isDirtyAnywhere(dirty.customInstructions)) {
    out.push("דגשים נערכו");
  }
  if (isDirtyAnywhere(dirty.supplements)) {
    out.push("תוספים נערכו");
  }

  const meals = Array.isArray(dirty.meals) ? dirty.meals : [];
  meals.forEach((m: Dirty, i: number) => {
    if (!isDirtyAnywhere(m)) return;
    const mealNo = i + 1;
    // Identify which macro sections changed inside this meal.
    const sections: { key: string; label: string }[] = [
      { key: "totalProtein", label: "חלבון" },
      { key: "totalCarbs", label: "פחמימות" },
      { key: "totalFats", label: "שומנים" },
      { key: "totalVeggies", label: "ירקות" },
    ];
    const changedSections = sections
      .filter((s) => isDirtyAnywhere((m as any)?.[s.key]))
      .map((s) => s.label);
    if (changedSections.length > 0) {
      out.push(`ארוחה ${mealNo} — ${changedSections.join(", ")}`);
    } else {
      out.push(`ארוחה ${mealNo} שונתה`);
    }
  });

  return out;
}

/** Summarise dirty workout-plan fields. */
export function summariseWorkoutDirty(dirty: any | undefined): string[] {
  if (!dirty) return [];
  const out: string[] = [];

  if (isDirtyAnywhere(dirty.tips)) out.push("דגשים נערכו");
  if (isDirtyAnywhere(dirty.cardio)) out.push("תוכנית האירובי שונתה");

  const plans = Array.isArray(dirty.workoutPlans) ? dirty.workoutPlans : [];
  plans.forEach((p: Dirty, i: number) => {
    if (!isDirtyAnywhere(p)) return;
    const planNo = i + 1;
    const pAny = p as any;
    if (pAny?.planName && !pAny?.muscleGroups) {
      out.push(`שם אימון ${planNo} שונה`);
    } else if (isDirtyAnywhere(pAny?.muscleGroups)) {
      const groups = Array.isArray(pAny.muscleGroups) ? pAny.muscleGroups : [];
      const changedGroups = groups
        .map((g: Dirty, gi: number) => (isDirtyAnywhere(g) ? gi + 1 : null))
        .filter((x: number | null): x is number => x !== null);
      if (changedGroups.length > 0) {
        out.push(
          `אימון ${planNo} — שונו ${changedGroups.length} ${
            changedGroups.length === 1 ? "קבוצה" : "קבוצות שריר"
          }`
        );
      } else {
        out.push(`אימון ${planNo} שונה`);
      }
    } else {
      out.push(`אימון ${planNo} שונה`);
    }
  });

  return out;
}
