export const DIETARY_OPTIONS = [
  "טבעוני",
  "צמחוני",
  "ללא גלוטן",
  "ללא לקטוז",
  "ללא חלב",
  "אלרגיה לאגוזים",
];

export const REMIND_IN_OPTIONS = [
  { value: 604800, label: "שבוע" },
  { value: 1209600, label: "שבועיים" },
  { value: 1814400, label: "שלושה שבועות" },
  { value: 2592000, label: "חודש" },
];

export const DATE_PRESETS = [
  { label: "חודש", days: 30 },
  { label: "חודשיים", days: 60 },
  { label: "שלושה חודשים", days: 90 },
  { label: "ארבעה חודשים", days: 120 },
  { label: "חצי שנה", days: 180 },
  { label: "שנה", days: 360 },
];

// Compact month-count selector — every value 1..12 in a single row.
// Trainer can pick any number of months instead of being limited to
// the named shortcuts above. Days approximated at 30 per month, the
// same convention the existing presets use.
export const MONTH_PRESETS: { months: number; days: number }[] = Array.from(
  { length: 12 },
  (_, idx) => ({ months: idx + 1, days: (idx + 1) * 30 })
);
