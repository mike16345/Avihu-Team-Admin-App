import { makeLocalId } from "./dietPlanV2Utils";

export type DietV2SupplementUnit = "g" | "ml" | "pill";

export interface DietV2Supplement {
  id: string;
  name: string;
  /** Numeric amount. 0 or NaN → "leave the dose blank" (rendered as
   *  an empty field), so a supplement with no numeric dose still
   *  round-trips cleanly. */
  doseAmount: number;
  doseUnit: DietV2SupplementUnit;
}

export const SUPP_UNIT_LABELS: Record<DietV2SupplementUnit, string> = {
  g: "גרם",
  ml: "מ״ל",
  pill: "כדור",
};

// Tokenised match (not regex with `\b`) — `\b` doesn't work for
// Hebrew, so "וויטמין D 2 מל" would silently miss the "מל" hit.
const ML_UNIT_TOKENS = new Set(["מ״ל", 'מ"ל', "מל", "ml", "cc"]);
const PILL_UNIT_TOKENS = new Set([
  "כדור",
  "כדורים",
  "טבליה",
  "טבליות",
  "קפסולה",
  "קפסולות",
  "pill",
  "pills",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
]);

/** Detect the dose unit from a fragment of Hebrew/English text.
 *  Falls back to "g" when no clue is found so old free-text drafts
 *  land in a working state. */
export const detectSupplementUnit = (text: string): DietV2SupplementUnit => {
  const tokens = text
    .split(/[\s,.;:()[\]]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.some((t) => ML_UNIT_TOKENS.has(t))) return "ml";
  if (tokens.some((t) => PILL_UNIT_TOKENS.has(t))) return "pill";
  return "g";
};

/** Extract the leading number from a dose fragment and detect its
 *  unit. "5 גרם ביום" → { amount: 5, unit: "g" }. */
export const parseDose = (
  text: string
): { amount: number; unit: DietV2SupplementUnit } => {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  const amount = match ? Number(match[1]) : 0;

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    unit: detectSupplementUnit(text),
  };
};

/** Parse a full supplement line into its parts.
 *  "קריאטין 5 גרם ביום" → { name: "קריאטין", amount: 5, unit: "g" }
 *  "אומגה 3 1 כדור"    → { name: "אומגה 3", amount: 1, unit: "pill" }
 *  "מולטי ויטמין"      → { name: "מולטי ויטמין", amount: 0, unit: "g" } */
export const splitNameAndDose = (
  raw: string
): { name: string; amount: number; unit: DietV2SupplementUnit } => {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)\s+(\d.*)$/);
  if (match) {
    const parsed = parseDose(match[2]);
    return { name: match[1].trim(), amount: parsed.amount, unit: parsed.unit };
  }

  return { name: trimmed, amount: 0, unit: "g" };
};

/** Migration helper — early drafts stored supplements as a raw
 *  multiline string, then as `{name, dose}` string pairs. Convert
 *  either shape to the structured amount+unit model so the trainer
 *  doesn't lose what they typed across schema iterations. */
export const normaliseSupplements = (raw: unknown): DietV2Supplement[] => {
  if (Array.isArray(raw)) {
    return raw
      .filter(
        (item): item is Record<string, unknown> =>
          !!item &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { name?: unknown }).name === "string"
      )
      .map((item) => {
        if (typeof item.doseAmount === "number" && typeof item.doseUnit === "string") {
          return {
            id: item.id as string,
            name: item.name as string,
            doseAmount: item.doseAmount as number,
            doseUnit: item.doseUnit as DietV2SupplementUnit,
          };
        }
        const dose = typeof item.dose === "string" ? item.dose : "";
        const parsed = parseDose(dose);
        return {
          id: item.id as string,
          name: item.name as string,
          doseAmount: parsed.amount,
          doseUnit: parsed.unit,
        };
      });
  }

  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const split = splitNameAndDose(line);
        return {
          id: makeLocalId("supp"),
          name: split.name,
          doseAmount: split.amount,
          doseUnit: split.unit,
        };
      });
  }

  return [];
};
