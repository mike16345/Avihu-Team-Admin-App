/**
 * Feature-local helpers for the v2 ("options") diet plan editor.
 * Mock food library will be replaced by an API-backed query when the
 * backend exposes a foods endpoint — keep the shape stable.
 */
import type {
  DietV2Category,
  DietV2CategoryKind,
  DietV2Meal,
  DietV2OptionMacros,
  DietV2Unit,
} from "@/interfaces/IDietPlanV2";

export interface FoodLibraryItem {
  id: string;
  name: string;
  /** Default category this food usually belongs to. */
  kind: DietV2CategoryKind;
  defaultUnit: DietV2Unit;
  /** Macros per 100g (or per single unit, depending on `defaultUnit`). */
  per100: DietV2OptionMacros;
  /** Optional alternate / colloquial names for ranking lookups. */
  aliases?: string[];
  /** Food-specific gram weight for non-default units. Used when the
   *  generic global conversion is wildly off — e.g. 1 cup of
   *  cornflakes ≈ 30g, whereas 1 cup of milk = 240g. Whatever isn't
   *  listed here falls through to GENERIC_UNIT_TO_GRAMS. */
  unitGrams?: Partial<Record<DietV2Unit, number>>;
  /** Sensible portion to seed the row with when the trainer adds
   *  this food without an explicit quantity — e.g. a bag of Bamba
   *  is ~80g, a cottage container is ~200g. Falls back to 100 for
   *  gram-based foods and 1 for unit-based ones when omitted. */
  defaultQuantity?: number;
}

export const CATEGORY_LABELS: Record<DietV2CategoryKind, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
};

export const CATEGORY_TONES: Record<
  DietV2CategoryKind,
  { ring: string; chip: string; chipText: string }
> = {
  protein: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-blue-50 dark:bg-blue-950/40",
    chipText: "text-blue-700 dark:text-blue-300",
  },
  carbs: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-sky-50 dark:bg-sky-950/40",
    chipText: "text-sky-700 dark:text-sky-300",
  },
  fat: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-indigo-50 dark:bg-indigo-950/40",
    chipText: "text-indigo-700 dark:text-indigo-300",
  },
  vegetables: {
    ring: "border-blue-200 dark:border-blue-900/40",
    chip: "bg-cyan-50 dark:bg-cyan-950/40",
    chipText: "text-cyan-700 dark:text-cyan-300",
  },
};

/**
 * Mock food library — Hebrew labels, common Israeli foods.
 * Macros are approximate per-100g where the default unit is grams,
 * or per-unit for spoons/cups/units/slice. Real data will come from
 * the backend foods table; the shape here intentionally matches.
 */
/**
 * Production note: this is a mock library used until the backend
 * exposes a foods search endpoint. The target real source is either
 * Open Food Facts (free, has Hebrew labels) or the Israeli Ministry
 * of Health food composition table. The search and matching logic
 * below is shaped to map cleanly onto a server-side endpoint —
 * scoring/normalisation will move to the server, but the consumer
 * code (FoodPicker, parseQuickAddText) won't need to change.
 */
export const MOCK_FOOD_LIBRARY: FoodLibraryItem[] = [
  // ===== חלבונים =====
  { id: "f-chicken-breast", name: "חזה עוף", kind: "protein", defaultUnit: "g",
    per100: { protein: 31, carbs: 0, fat: 3.6, calories: 165 } },
  { id: "f-turkey-breast", name: "חזה הודו", kind: "protein", defaultUnit: "g",
    per100: { protein: 29, carbs: 0, fat: 2, calories: 135 } },
  { id: "f-eggs", name: "ביצים", kind: "protein", defaultUnit: "units",
    per100: { protein: 6, carbs: 0.6, fat: 5, calories: 70 } },
  { id: "f-egg-whites", name: "חלבון ביצה", kind: "protein", defaultUnit: "units",
    per100: { protein: 4, carbs: 0.2, fat: 0, calories: 17 } },
  { id: "f-yogurt-greek", name: "יוגורט יווני 0%", kind: "protein", defaultUnit: "g",
    per100: { protein: 10, carbs: 4, fat: 0, calories: 59 } },
  { id: "f-tuna", name: "טונה", kind: "protein", defaultUnit: "g",
    per100: { protein: 26, carbs: 0, fat: 8, calories: 180 } },
  { id: "f-salmon", name: "סלמון", kind: "protein", defaultUnit: "g",
    per100: { protein: 20, carbs: 0, fat: 13, calories: 208 } },
  { id: "f-cottage", name: "קוטג׳ 5%", kind: "protein", defaultUnit: "g",
    per100: { protein: 11, carbs: 3, fat: 5, calories: 103 },
    defaultQuantity: 200 },
  { id: "f-cottage-skim", name: "קוטג׳ 3%", kind: "protein", defaultUnit: "g",
    per100: { protein: 11, carbs: 3, fat: 3, calories: 81 },
    defaultQuantity: 200 },
  { id: "f-white-cheese", name: "גבינה לבנה 5%", kind: "protein", defaultUnit: "g",
    per100: { protein: 9, carbs: 4, fat: 5, calories: 95 } },
  { id: "f-yellow-cheese", name: "גבינה צהובה", kind: "protein", defaultUnit: "g",
    per100: { protein: 25, carbs: 1, fat: 27, calories: 360 } },
  { id: "f-mozzarella", name: "מוצרלה", kind: "protein", defaultUnit: "g",
    per100: { protein: 22, carbs: 2.2, fat: 22, calories: 300 } },
  { id: "f-beef-fillet", name: "פילה בקר", kind: "protein", defaultUnit: "g",
    per100: { protein: 27, carbs: 0, fat: 8, calories: 187 } },
  { id: "f-steak", name: "סטייק אנטריקוט", kind: "protein", defaultUnit: "g",
    per100: { protein: 25, carbs: 0, fat: 18, calories: 271 } },
  { id: "f-tofu", name: "טופו", kind: "protein", defaultUnit: "g",
    per100: { protein: 8, carbs: 2, fat: 4.8, calories: 76 } },
  { id: "f-protein-powder", name: "אבקת חלבון", kind: "protein", defaultUnit: "spoons",
    per100: { protein: 24, carbs: 3, fat: 1.5, calories: 120 } },
  { id: "f-milk", name: "חלב 3%", kind: "protein", defaultUnit: "cups",
    per100: { protein: 8, carbs: 12, fat: 7.5, calories: 145 } },

  // ===== פחמימות =====
  { id: "f-rice-white", name: "אורז לבן", kind: "carbs", defaultUnit: "g",
    per100: { protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
    unitGrams: { cups: 158 } },
  { id: "f-rice-brown", name: "אורז מלא", kind: "carbs", defaultUnit: "g",
    per100: { protein: 2.6, carbs: 23, fat: 0.9, calories: 112 },
    unitGrams: { cups: 195 } },
  { id: "f-rice-basmati", name: "אורז בסמטי", kind: "carbs", defaultUnit: "g",
    per100: { protein: 3, carbs: 28, fat: 0.4, calories: 130 },
    unitGrams: { cups: 158 } },
  { id: "f-pasta", name: "פסטה מבושלת", kind: "carbs", defaultUnit: "g",
    per100: { protein: 5, carbs: 31, fat: 1.1, calories: 158 },
    unitGrams: { cups: 140 } },
  { id: "f-bread-whole", name: "לחם מלא", kind: "carbs", defaultUnit: "slice",
    per100: { protein: 4, carbs: 12, fat: 1, calories: 70 } },
  { id: "f-bread-white", name: "לחם לבן", kind: "carbs", defaultUnit: "slice",
    per100: { protein: 2.5, carbs: 14, fat: 0.8, calories: 75 } },
  { id: "f-pita", name: "פיתה", kind: "carbs", defaultUnit: "units",
    per100: { protein: 9, carbs: 55, fat: 1.2, calories: 270 } },
  { id: "f-potato", name: "תפוח אדמה אפוי", kind: "carbs", defaultUnit: "g",
    per100: { protein: 2, carbs: 17, fat: 0.1, calories: 77 } },
  { id: "f-sweet-potato", name: "בטטה", kind: "carbs", defaultUnit: "g",
    per100: { protein: 1.6, carbs: 20, fat: 0.1, calories: 86 } },
  { id: "f-oats", name: "שיבולת שועל", kind: "carbs", defaultUnit: "g",
    per100: { protein: 13, carbs: 67, fat: 7, calories: 389 },
    unitGrams: { cups: 81, spoons: 9 } },
  { id: "f-granola", name: "גרנולה", kind: "carbs", defaultUnit: "g",
    per100: { protein: 10, carbs: 64, fat: 14, calories: 471 },
    unitGrams: { cups: 110, spoons: 14 } },
  { id: "f-quinoa", name: "קינואה", kind: "carbs", defaultUnit: "g",
    per100: { protein: 4.4, carbs: 21, fat: 1.9, calories: 120 },
    unitGrams: { cups: 185 } },
  { id: "f-couscous", name: "קוסקוס", kind: "carbs", defaultUnit: "g",
    per100: { protein: 3.8, carbs: 23, fat: 0.2, calories: 112 },
    unitGrams: { cups: 173 } },
  { id: "f-banana", name: "בננה", kind: "carbs", defaultUnit: "units",
    per100: { protein: 1.3, carbs: 27, fat: 0.4, calories: 105 } },
  { id: "f-apple", name: "תפוח", kind: "carbs", defaultUnit: "units",
    per100: { protein: 0.5, carbs: 25, fat: 0.3, calories: 95 } },

  // ===== שומנים =====
  { id: "f-olive-oil", name: "שמן זית", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 0, carbs: 0, fat: 14, calories: 124 } },
  { id: "f-butter", name: "חמאה", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 0.1, carbs: 0, fat: 11, calories: 102 } },
  { id: "f-avocado", name: "אבוקדו", kind: "fat", defaultUnit: "g",
    per100: { protein: 2, carbs: 9, fat: 15, calories: 160 } },
  { id: "f-almonds", name: "שקדים", kind: "fat", defaultUnit: "g",
    per100: { protein: 21, carbs: 22, fat: 50, calories: 579 } },
  { id: "f-walnuts", name: "אגוזי מלך", kind: "fat", defaultUnit: "g",
    per100: { protein: 15, carbs: 14, fat: 65, calories: 654 } },
  { id: "f-cashews", name: "קשיו", kind: "fat", defaultUnit: "g",
    per100: { protein: 18, carbs: 30, fat: 44, calories: 553 } },
  { id: "f-tahini", name: "טחינה", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 3, carbs: 3, fat: 8, calories: 89 } },
  { id: "f-hummus", name: "חומוס", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 2, carbs: 4, fat: 4, calories: 50 } },
  { id: "f-peanut-butter", name: "חמאת בוטנים", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 4, carbs: 3, fat: 8, calories: 94 } },
  { id: "f-olives", name: "זיתים", kind: "fat", defaultUnit: "g",
    per100: { protein: 0.8, carbs: 6, fat: 11, calories: 115 } },

  // ===== ירקות =====
  { id: "f-tomato", name: "עגבנייה", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18 } },
  { id: "f-cucumber", name: "מלפפון", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 0.7, carbs: 3.6, fat: 0.1, calories: 16 } },
  { id: "f-lettuce", name: "חסה", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.4, carbs: 2.9, fat: 0.2, calories: 15 } },
  { id: "f-broccoli", name: "ברוקולי", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 2.8, carbs: 7, fat: 0.4, calories: 34 } },
  { id: "f-cauliflower", name: "כרובית", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.9, carbs: 5, fat: 0.3, calories: 25 } },
  { id: "f-pepper", name: "פלפל אדום", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1, carbs: 6, fat: 0.3, calories: 31 } },
  { id: "f-carrot", name: "גזר", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 0.9, carbs: 10, fat: 0.2, calories: 41 } },
  { id: "f-onion", name: "בצל", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.1, carbs: 9, fat: 0.1, calories: 40 } },
  { id: "f-zucchini", name: "קישוא", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.2, carbs: 3.1, fat: 0.3, calories: 17 } },
  { id: "f-eggplant", name: "חציל", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1, carbs: 6, fat: 0.2, calories: 25 } },
  { id: "f-mushrooms", name: "פטריות", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 3.1, carbs: 3.3, fat: 0.3, calories: 22 } },
  { id: "f-spinach", name: "תרד", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23 } },

  // ===== Extended library — proteins =====
  { id: "f-chicken-thigh", name: "ירך עוף", kind: "protein", defaultUnit: "g",
    per100: { protein: 24, carbs: 0, fat: 11, calories: 200 } },
  { id: "f-chicken-shawarma", name: "שווארמה הודו", kind: "protein", defaultUnit: "g",
    per100: { protein: 22, carbs: 1, fat: 14, calories: 224 } },
  { id: "f-ground-beef-5", name: "בשר בקר טחון 5%", kind: "protein", defaultUnit: "g",
    per100: { protein: 22, carbs: 0, fat: 5, calories: 137 } },
  { id: "f-ground-beef-15", name: "בשר בקר טחון 15%", kind: "protein", defaultUnit: "g",
    per100: { protein: 19, carbs: 0, fat: 15, calories: 215 } },
  { id: "f-schnitzel", name: "שניצל עוף אפוי", kind: "protein", defaultUnit: "g",
    per100: { protein: 22, carbs: 14, fat: 8, calories: 220 } },
  { id: "f-tilapia", name: "אמנון (טילפיה)", kind: "protein", defaultUnit: "g",
    aliases: ["טילפיה", "אמנון"],
    per100: { protein: 26, carbs: 0, fat: 3, calories: 128 } },
  { id: "f-sea-bream", name: "דניס", kind: "protein", defaultUnit: "g",
    per100: { protein: 21, carbs: 0, fat: 5, calories: 130 } },
  { id: "f-sea-bass", name: "לברק", kind: "protein", defaultUnit: "g",
    per100: { protein: 23, carbs: 0, fat: 4, calories: 124 } },
  { id: "f-sardines", name: "סרדינים בשמן", kind: "protein", defaultUnit: "g",
    per100: { protein: 25, carbs: 0, fat: 11, calories: 208 } },
  { id: "f-smoked-salmon", name: "סלמון מעושן", kind: "protein", defaultUnit: "g",
    per100: { protein: 22, carbs: 0, fat: 4.3, calories: 117 } },
  { id: "f-shrimp", name: "שרימפס", kind: "protein", defaultUnit: "g",
    per100: { protein: 24, carbs: 0, fat: 0.3, calories: 99 } },
  { id: "f-bulgarian", name: "גבינה בולגרית 9%", kind: "protein", defaultUnit: "g",
    per100: { protein: 14, carbs: 1.5, fat: 9, calories: 145 } },
  { id: "f-feta", name: "פטה", kind: "protein", defaultUnit: "g",
    per100: { protein: 14, carbs: 4, fat: 21, calories: 264 } },
  { id: "f-camembert", name: "קממבר", kind: "protein", defaultUnit: "g",
    per100: { protein: 20, carbs: 0.5, fat: 24, calories: 300 } },
  { id: "f-tzfat-cheese-5", name: "גבינת צפת 5%", kind: "protein", defaultUnit: "g",
    per100: { protein: 16, carbs: 3, fat: 5, calories: 120 } },
  { id: "f-ricotta", name: "ריקוטה", kind: "protein", defaultUnit: "g",
    per100: { protein: 11, carbs: 3, fat: 13, calories: 174 } },
  { id: "f-skyr", name: "סקיר", kind: "protein", defaultUnit: "g",
    aliases: ["יוגורט סקיר"],
    per100: { protein: 11, carbs: 4, fat: 0.2, calories: 63 } },
  { id: "f-yogurt-natural", name: "יוגורט טבעי", kind: "protein", defaultUnit: "g",
    per100: { protein: 4, carbs: 6, fat: 3, calories: 65 } },
  { id: "f-milk-skim", name: "חלב 1%", kind: "protein", defaultUnit: "cups",
    per100: { protein: 8, carbs: 12, fat: 2.5, calories: 105 } },
  { id: "f-soy-milk", name: "חלב סויה", kind: "protein", defaultUnit: "cups",
    per100: { protein: 7, carbs: 4, fat: 4, calories: 80 } },
  { id: "f-chickpeas-cooked", name: "חומוס מבושל", kind: "protein", defaultUnit: "g",
    aliases: ["גרגירי חומוס"],
    per100: { protein: 8.9, carbs: 27, fat: 2.6, calories: 164 } },
  { id: "f-lentils-cooked", name: "עדשים מבושלות", kind: "protein", defaultUnit: "g",
    per100: { protein: 9, carbs: 20, fat: 0.4, calories: 116 } },
  { id: "f-beans-cooked", name: "שעועית מבושלת", kind: "protein", defaultUnit: "g",
    per100: { protein: 9, carbs: 23, fat: 0.5, calories: 127 } },
  { id: "f-edamame", name: "אדמאמה", kind: "protein", defaultUnit: "g",
    per100: { protein: 11, carbs: 8.9, fat: 5, calories: 122 } },
  { id: "f-seitan", name: "סייטן", kind: "protein", defaultUnit: "g",
    per100: { protein: 25, carbs: 14, fat: 1.9, calories: 175 } },

  // ===== Extended library — carbs =====
  { id: "f-rice-wild", name: "אורז בר", kind: "carbs", defaultUnit: "g",
    per100: { protein: 4, carbs: 21, fat: 0.3, calories: 101 } },
  { id: "f-pasta-whole", name: "פסטה מלאה מבושלת", kind: "carbs", defaultUnit: "g",
    per100: { protein: 5.3, carbs: 25, fat: 1.1, calories: 124 } },
  { id: "f-pasta-protein", name: "פסטה חלבונית", kind: "carbs", defaultUnit: "g",
    per100: { protein: 14, carbs: 30, fat: 2, calories: 195 } },
  { id: "f-bulgur", name: "בורגול מבושל", kind: "carbs", defaultUnit: "g",
    per100: { protein: 3.1, carbs: 18.6, fat: 0.2, calories: 83 } },
  { id: "f-freekeh", name: "פריקה מבושלת", kind: "carbs", defaultUnit: "g",
    per100: { protein: 5.6, carbs: 33, fat: 1.1, calories: 167 } },
  { id: "f-mash-potato", name: "פירה תפו״א", kind: "carbs", defaultUnit: "g",
    aliases: ["פירה", "פירה תפוחי אדמה"],
    per100: { protein: 1.9, carbs: 15, fat: 4, calories: 106 } },
  { id: "f-bread-rye", name: "לחם שיפון", kind: "carbs", defaultUnit: "slice",
    per100: { protein: 2.7, carbs: 15, fat: 0.6, calories: 83 } },
  { id: "f-cracker-rice", name: "פריכיות אורז", kind: "carbs", defaultUnit: "units",
    per100: { protein: 0.7, carbs: 7.3, fat: 0.3, calories: 35 } },
  { id: "f-tortilla", name: "טורטיה", kind: "carbs", defaultUnit: "units",
    per100: { protein: 4, carbs: 24, fat: 3, calories: 140 } },
  { id: "f-lafa", name: "לאפה", kind: "carbs", defaultUnit: "units",
    per100: { protein: 8, carbs: 50, fat: 2, calories: 260 } },
  { id: "f-bagel", name: "בייגל", kind: "carbs", defaultUnit: "units",
    per100: { protein: 11, carbs: 56, fat: 1.8, calories: 286 } },
  { id: "f-corn", name: "תירס מבושל", kind: "carbs", defaultUnit: "g",
    per100: { protein: 3.3, carbs: 19, fat: 1.5, calories: 96 } },
  { id: "f-peas", name: "אפונה ירוקה", kind: "carbs", defaultUnit: "g",
    per100: { protein: 5.4, carbs: 14, fat: 0.4, calories: 81 } },
  { id: "f-grapes", name: "ענבים", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.7, carbs: 18, fat: 0.2, calories: 69 } },
  { id: "f-watermelon", name: "אבטיח", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.6, carbs: 8, fat: 0.2, calories: 30 } },
  { id: "f-melon", name: "מלון", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.8, carbs: 8, fat: 0.2, calories: 34 } },
  { id: "f-orange", name: "תפוז", kind: "carbs", defaultUnit: "units",
    per100: { protein: 1.2, carbs: 15, fat: 0.2, calories: 62 } },
  { id: "f-strawberries", name: "תותים", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.7, carbs: 7.7, fat: 0.3, calories: 32 } },
  { id: "f-blueberries", name: "אוכמניות", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.7, carbs: 14, fat: 0.3, calories: 57 } },
  { id: "f-mango", name: "מנגו", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.8, carbs: 15, fat: 0.4, calories: 60 } },
  { id: "f-pineapple", name: "אננס", kind: "carbs", defaultUnit: "g",
    per100: { protein: 0.5, carbs: 13, fat: 0.1, calories: 50 } },
  { id: "f-pear", name: "אגס", kind: "carbs", defaultUnit: "units",
    per100: { protein: 0.4, carbs: 27, fat: 0.2, calories: 102 } },
  { id: "f-dates", name: "תמרים", kind: "carbs", defaultUnit: "units",
    per100: { protein: 0.2, carbs: 18, fat: 0, calories: 66 } },
  { id: "f-pomegranate", name: "רימון", kind: "carbs", defaultUnit: "g",
    per100: { protein: 1.7, carbs: 19, fat: 1.2, calories: 83 } },
  { id: "f-honey", name: "דבש", kind: "carbs", defaultUnit: "spoons",
    per100: { protein: 0, carbs: 17, fat: 0, calories: 64 } },
  { id: "f-silan", name: "סילאן (דבש תמרים)", kind: "carbs", defaultUnit: "spoons",
    aliases: ["סילאן"],
    per100: { protein: 0.1, carbs: 16, fat: 0, calories: 62 } },

  // ===== Extended library — fats =====
  { id: "f-pistachios", name: "פיסטוקים", kind: "fat", defaultUnit: "g",
    per100: { protein: 20, carbs: 28, fat: 45, calories: 562 } },
  { id: "f-pecan", name: "פקאן", kind: "fat", defaultUnit: "g",
    per100: { protein: 9.2, carbs: 14, fat: 72, calories: 691 } },
  { id: "f-sunflower-seeds", name: "גרעיני חמנייה", kind: "fat", defaultUnit: "g",
    per100: { protein: 21, carbs: 20, fat: 51, calories: 584 } },
  { id: "f-pumpkin-seeds", name: "גרעיני דלעת", kind: "fat", defaultUnit: "g",
    per100: { protein: 19, carbs: 54, fat: 19, calories: 446 } },
  { id: "f-chia", name: "זרעי צ׳יה", kind: "fat", defaultUnit: "spoons",
    aliases: ["צ׳יה", "צ'יה"],
    per100: { protein: 5, carbs: 12, fat: 9, calories: 138 } },
  { id: "f-flax", name: "זרעי פשתן", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 1.9, carbs: 3, fat: 4.2, calories: 55 } },
  { id: "f-coconut-oil", name: "שמן קוקוס", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 0, carbs: 0, fat: 14, calories: 121 } },
  { id: "f-canola-oil", name: "שמן קנולה", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 0, carbs: 0, fat: 14, calories: 124 } },
  { id: "f-cream", name: "שמנת מתוקה", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 2.5, carbs: 3, fat: 36, calories: 340 } },
  { id: "f-sour-cream", name: "שמנת חמוצה", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 2.4, carbs: 4, fat: 19, calories: 198 } },
  { id: "f-mayo", name: "מיונז", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 1, carbs: 0.6, fat: 75, calories: 680 } },
  { id: "f-pesto", name: "פסטו", kind: "fat", defaultUnit: "spoons",
    per100: { protein: 4, carbs: 5, fat: 39, calories: 405 } },
  { id: "f-dark-chocolate", name: "שוקולד מריר 70%", kind: "fat", defaultUnit: "g",
    per100: { protein: 7.8, carbs: 46, fat: 43, calories: 598 } },

  // ===== Extended library — vegetables =====
  { id: "f-cabbage", name: "כרוב", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.3, carbs: 5.8, fat: 0.1, calories: 25 } },
  { id: "f-kale", name: "קייל", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 4.3, carbs: 8.8, fat: 0.9, calories: 49 } },
  { id: "f-arugula", name: "רוקט", kind: "vegetables", defaultUnit: "g",
    aliases: ["ארוגולה"],
    per100: { protein: 2.6, carbs: 3.7, fat: 0.7, calories: 25 } },
  { id: "f-beetroot", name: "סלק", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.6, carbs: 10, fat: 0.2, calories: 43 } },
  { id: "f-radish", name: "צנון", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 0.7, carbs: 3.4, fat: 0.1, calories: 16 } },
  { id: "f-garlic", name: "שום", kind: "vegetables", defaultUnit: "units",
    per100: { protein: 0.2, carbs: 1, fat: 0, calories: 4 } },
  { id: "f-celery", name: "סלרי", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 0.7, carbs: 3, fat: 0.2, calories: 14 } },
  { id: "f-asparagus", name: "אספרגוס", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 2.2, carbs: 3.9, fat: 0.1, calories: 20 } },
  { id: "f-green-beans", name: "שעועית ירוקה", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.8, carbs: 7, fat: 0.2, calories: 31 } },
  { id: "f-pepper-green", name: "פלפל ירוק", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 0.9, carbs: 4.6, fat: 0.2, calories: 20 } },
  { id: "f-pepper-yellow", name: "פלפל צהוב", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1, carbs: 6.3, fat: 0.2, calories: 27 } },
  { id: "f-okra", name: "במיה", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.9, carbs: 7.5, fat: 0.2, calories: 33 } },
  { id: "f-artichoke", name: "ארטישוק", kind: "vegetables", defaultUnit: "units",
    per100: { protein: 3.3, carbs: 11, fat: 0.2, calories: 47 } },
  { id: "f-leek", name: "כרישה", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.5, carbs: 14, fat: 0.3, calories: 61 } },
  { id: "f-chard", name: "מנגולד", kind: "vegetables", defaultUnit: "g",
    per100: { protein: 1.8, carbs: 3.7, fat: 0.2, calories: 19 } },

  // ===== Brand/breakfast cereals (carbs) =====
  { id: "f-cornflakes", name: "קורנפלקס", kind: "carbs", defaultUnit: "g",
    aliases: ["קורנפלקס אלופים", "אלופים", "Cornflakes", "Kellogg"],
    per100: { protein: 7, carbs: 84, fat: 0.4, calories: 357 },
    unitGrams: { cups: 28 } },
  { id: "f-frosties", name: "פתיתי שיבולת שועל מצופים", kind: "carbs", defaultUnit: "g",
    aliases: ["פרוסטיז", "פרוסטד פלייקס", "פתיתי דגנים בסוכר"],
    per100: { protein: 4, carbs: 88, fat: 0.6, calories: 375 },
    unitGrams: { cups: 32 } },
  { id: "f-cocopops", name: "קוקו פופס", kind: "carbs", defaultUnit: "g",
    aliases: ["coco pops", "קוקו"],
    per100: { protein: 5, carbs: 84, fat: 2.5, calories: 384 },
    unitGrams: { cups: 31 } },
  { id: "f-cheerios", name: "צ׳יריוס", kind: "carbs", defaultUnit: "g",
    aliases: ["cheerios", "צירוס"],
    per100: { protein: 11, carbs: 73, fat: 6, calories: 367 },
    unitGrams: { cups: 28 } },
  { id: "f-muesli", name: "מוזלי", kind: "carbs", defaultUnit: "g",
    per100: { protein: 10, carbs: 66, fat: 6, calories: 362 },
    unitGrams: { cups: 85 } },
  { id: "f-bamba", name: "במבה", kind: "carbs", defaultUnit: "g",
    aliases: ["במבה אסם"],
    per100: { protein: 12, carbs: 50, fat: 33, calories: 540 },
    defaultQuantity: 80 },
  { id: "f-bissli", name: "ביסלי", kind: "carbs", defaultUnit: "g",
    per100: { protein: 8, carbs: 68, fat: 22, calories: 510 } },
  { id: "f-rice-cake", name: "פריכית אורז", kind: "carbs", defaultUnit: "units",
    aliases: ["פריכיות אורז"],
    per100: { protein: 0.7, carbs: 7.3, fat: 0.3, calories: 35 } },
  { id: "f-protein-bar", name: "חטיף חלבון", kind: "protein", defaultUnit: "units",
    per100: { protein: 20, carbs: 25, fat: 8, calories: 240 } },
];

/**
 * Category fallback per-100 macros — used when the typed food
 * doesn't match anything in the library. Lets every option still
 * receive sensible numbers (the row stays useful) and the trainer
 * can adjust the macros manually if needed. Tagged with `estimated`
 * downstream so the UI shows a "מוערך" badge for transparency.
 */
const CATEGORY_FALLBACK_PER100: Record<DietV2CategoryKind, DietV2OptionMacros> = {
  protein: { protein: 25, carbs: 1, fat: 5, calories: 150 },
  carbs: { protein: 3, carbs: 25, fat: 1, calories: 130 },
  fat: { protein: 5, carbs: 5, fat: 50, calories: 500 },
  vegetables: { protein: 1.5, carbs: 5, fat: 0.2, calories: 25 },
};

export const estimateMacrosForUnknown = (
  quantity: number,
  unit: DietV2Unit,
  categoryKind: DietV2CategoryKind
): DietV2OptionMacros => {
  const per = CATEGORY_FALLBACK_PER100[categoryKind];
  const ratio = unit === "g" ? quantity / 100 : quantity;
  return {
    protein: round(per.protein * ratio),
    carbs: round(per.carbs * ratio),
    fat: round(per.fat * ratio),
    calories: Math.round(per.calories * ratio),
  };
};

/**
 * Normalise a Hebrew string for matching:
 *   - lowercase (no-op for Hebrew but keeps Latin food names sane)
 *   - strip Hebrew niqqud marks (U+0591-U+05C7)
 *   - collapse final-letter variants to their base form
 *   - drop punctuation, parens, quotes and extra whitespace
 * Trainers type quickly and inconsistently; normalising both query
 * and corpus through the same function makes ranking robust.
 */
const FINAL_LETTERS: Record<string, string> = {
  "ך": "כ",
  "ם": "מ",
  "ן": "נ",
  "ף": "פ",
  "ץ": "צ",
};

export const normaliseHebrew = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[֑-ׇ]/g, "")
    .replace(/[״”"'’`׳()\[\]{}.,;:!?]/g, " ")
    .split("")
    .map((ch) => FINAL_LETTERS[ch] ?? ch)
    .join("")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Score a food candidate against a normalised query.
 * Higher score = better match. Layered so exact wins over prefix,
 * prefix over word-boundary, word-boundary over substring, and
 * substring over partial-token overlap. Aliases participate.
 */
const scoreFoodMatch = (food: FoodLibraryItem, normalisedQuery: string): number => {
  if (!normalisedQuery) return 0;

  const candidates = [food.name, ...(food.aliases ?? [])].map(normaliseHebrew);
  const queryTokens = normalisedQuery.split(" ").filter(Boolean);

  let best = 0;
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === normalisedQuery) {
      best = Math.max(best, 100);
      continue;
    }
    if (candidate.startsWith(normalisedQuery)) {
      best = Math.max(best, 85);
      continue;
    }
    // Word-boundary match — query is a whole token inside the name.
    const candidateTokens = candidate.split(" ");
    const allQueryTokensInCandidate = queryTokens.every((token) =>
      candidateTokens.some((cTok) => cTok === token)
    );
    if (allQueryTokensInCandidate && queryTokens.length > 0) {
      best = Math.max(best, 75);
      continue;
    }
    if (candidate.includes(normalisedQuery)) {
      best = Math.max(best, 60);
      continue;
    }
    if (normalisedQuery.includes(candidate)) {
      best = Math.max(best, 55);
      continue;
    }
    // Token overlap — count how many query tokens appear anywhere.
    const overlap = queryTokens.filter((token) =>
      candidateTokens.some((cTok) => cTok.includes(token) || token.includes(cTok))
    ).length;
    if (overlap > 0) {
      best = Math.max(best, 20 + overlap * 8);
    }
  }
  return best;
};

export const searchFoodLibrary = (
  query: string,
  kind?: DietV2CategoryKind,
  limit = 10
): FoodLibraryItem[] => {
  const normalised = normaliseHebrew(query);
  // No query → return top items of the requested category (or a
  // broad starter set) so the picker isn't empty when it opens.
  if (!normalised) {
    const pool = kind
      ? MOCK_FOOD_LIBRARY.filter((food) => food.kind === kind)
      : MOCK_FOOD_LIBRARY;
    return pool.slice(0, limit);
  }

  const scored = MOCK_FOOD_LIBRARY
    .filter((food) => (kind ? food.kind === kind : true))
    .map((food) => ({ food, score: scoreFoodMatch(food, normalised) }))
    .filter((entry) => entry.score > 0)
    // Same-kind ties go to the shorter name (more specific).
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);

  if (scored.length >= 3) return scored.slice(0, limit).map((entry) => entry.food);

  // Few same-kind hits — widen to all categories to catch e.g.
  // "ביצים" typed under the wrong category.
  const wide = MOCK_FOOD_LIBRARY
    .filter((food) => !kind || food.kind !== kind)
    .map((food) => ({ food, score: scoreFoodMatch(food, normalised) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);

  return [...scored, ...wide].slice(0, limit).map((entry) => entry.food);
};

/**
 * Best-effort grams-per-unit conversion. Used when the trainer
 * chose a unit that doesn't match the food's default unit (e.g.
 * a food whose macros are stored per-100g, but the trainer asks
 * for "3 slices"). Values are typical household-portion sizes.
 */
const GENERIC_UNIT_TO_GRAMS: Record<DietV2Unit, number> = {
  g: 1,
  spoons: 15,
  cups: 240,
  units: 50,
  slice: 28,
  piece: 100,
  piece_medium: 80,
};

/**
 * Compute macros for a known food at a given quantity + unit.
 * When `food.defaultUnit` matches the requested `unit` (or no unit
 * override is given), uses the food's per-100g/per-unit table
 * directly. When the trainer overrides the unit (e.g. yellow
 * cheese stored per-100g but asked for in slices), the requested
 * unit is converted to grams via GENERIC_UNIT_TO_GRAMS and then
 * the per-100g math runs as usual. Conversion-derived rows are
 * marked downstream so the trainer knows to double-check.
 */
/** Pick the gram weight for one unit of `food`. Food-specific
 *  override wins, then the generic global table. */
const gramsForUnit = (food: FoodLibraryItem, unit: DietV2Unit): number =>
  food.unitGrams?.[unit] ?? GENERIC_UNIT_TO_GRAMS[unit];

export const computeMacrosFromFood = (
  food: FoodLibraryItem,
  quantity: number,
  unit?: DietV2Unit
): DietV2OptionMacros => {
  const requestedUnit = unit ?? food.defaultUnit;
  let ratio: number;
  if (requestedUnit === food.defaultUnit) {
    ratio = food.defaultUnit === "g" ? quantity / 100 : quantity;
  } else if (food.defaultUnit === "g") {
    // per-100g table + non-gram requested unit → convert to grams
    // using the food-specific gram weight (or generic fallback).
    ratio = (quantity * gramsForUnit(food, requestedUnit)) / 100;
  } else {
    // food table is per-unit; trainer asked for a different unit.
    const grams = quantity * gramsForUnit(food, requestedUnit);
    const baseGrams = gramsForUnit(food, food.defaultUnit);
    ratio = grams / baseGrams;
  }
  return {
    protein: round(food.per100.protein * ratio),
    carbs: round(food.per100.carbs * ratio),
    fat: round(food.per100.fat * ratio),
    calories: Math.round(food.per100.calories * ratio),
  };
};

/** True when the requested unit isn't the food's default unit AND
 *  the food doesn't carry a specific override for it. Override-
 *  backed conversions are accurate enough to NOT be marked as
 *  estimated. */
export const isConvertedUnit = (food: FoodLibraryItem, unit: DietV2Unit): boolean => {
  if (unit === food.defaultUnit) return false;
  return !food.unitGrams?.[unit];
};

/**
 * Per the council verdict, the meal card does not carry a typed
 * target — instead show the live macro range across the category's
 * options. min/max preserves the trainer's intent better than a
 * single average (which can lie when options aren't equivalent).
 */
export interface MacroRange {
  min: number;
  max: number;
  avg: number;
}

export const computeCategoryRange = (
  category: DietV2Category,
  pick: keyof DietV2OptionMacros
): MacroRange | null => {
  // Estimated rows (macros guessed because the food wasn't matched)
  // are excluded from the average so they don't pollute it. The
  // row itself still renders for the trainee to read; it's just
  // not weighted into the trainer-facing macro summary.
  const reliable = category.options.filter((option) => !option.estimated);
  if (!reliable.length) return null;
  const values = reliable.map((option) => option.macros[pick]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
  return { min: round(min), max: round(max), avg: round(avg) };
};

export const computeMealRange = (meal: DietV2Meal, pick: keyof DietV2OptionMacros): MacroRange => {
  const ranges = meal.categories
    .map((category) => computeCategoryRange(category, pick))
    .filter((range): range is MacroRange => range !== null);
  if (!ranges.length) return { min: 0, max: 0, avg: 0 };
  const min = ranges.reduce((acc, range) => acc + range.min, 0);
  const max = ranges.reduce((acc, range) => acc + range.max, 0);
  const avg = ranges.reduce((acc, range) => acc + range.avg, 0);
  return { min: round(min), max: round(max), avg: round(avg) };
};

/** Shortcut: average of a single macro across a category's options.
 *  Returns 0 when the category is empty. */
export const computeCategoryAverage = (
  category: DietV2Category,
  pick: keyof DietV2OptionMacros
): number => computeCategoryRange(category, pick)?.avg ?? 0;

/** Shortcut: average of a single macro across all of the meal's
 *  categories (sum of category averages). */
export const computeMealAverage = (
  meal: DietV2Meal,
  pick: keyof DietV2OptionMacros
): number => computeMealRange(meal, pick).avg;

/** Returns the "primary" macro key for a given category — the
 *  macro the category is named after. Used by the category card
 *  to highlight one figure (e.g. protein category → protein g). */
export const primaryMacroForCategory = (
  kind: DietV2CategoryKind
): keyof DietV2OptionMacros | null => {
  switch (kind) {
    case "protein":
      return "protein";
    case "carbs":
      return "carbs";
    case "fat":
      return "fat";
    case "vegetables":
      return null; // no single macro stands out for veggies
  }
};

const round = (value: number): number => Math.round(value * 10) / 10;

/** Local id generator — keeps mock data stable until backend assigns ids. */
let idCounter = 0;
export const makeLocalId = (prefix: string): string =>
  `${prefix}-${++idCounter}-${Math.floor(Date.now() / 1000)}`;

export const buildEmptyMeal = (index: number): DietV2Meal => ({
  id: makeLocalId("meal"),
  name: `ארוחה ${index}`,
  categories: DIET_V2_DEFAULT_CATEGORIES.map((kind) => ({ kind, options: [] })),
});

const DIET_V2_DEFAULT_CATEGORIES: DietV2CategoryKind[] = [
  "protein",
  "carbs",
  "fat",
  "vegetables",
];

/**
 * Hebrew unit synonyms — every form the trainer might type maps to
 * one canonical DietV2Unit. "ג׳" and "ג" treated as grams; "כף"
 * (singular) and "כפות" (plural) both → spoons; etc.
 */
const UNIT_SYNONYMS: { match: RegExp; unit: DietV2Unit }[] = [
  { match: /^(גרם|ג׳|ג'|ג|גר|gram|g)$/i, unit: "g" },
  { match: /^(כפות|כף|כפית|כפיות)$/i, unit: "spoons" },
  { match: /^(כוסות|כוס)$/i, unit: "cups" },
  { match: /^(יחידות|יחידה|יח׳|יח)$/i, unit: "units" },
  { match: /^(פרוסות|פרוסה|פרו׳)$/i, unit: "slice" },
  // Order matters: the more specific "חתיכה בינונית" / "חתיכות
  // בינוניות" is matched as a two-token sequence in parseQuickAddText
  // below. Plain "חתיכה"/"חתיכות" maps to the standard 100g piece.
  { match: /^(חתיכות|חתיכה)$/i, unit: "piece" },
  // Token produced by the multi-word collapse in parseQuickAddText.
  { match: /^__piece_medium__$/i, unit: "piece_medium" },
];

const matchUnit = (token: string): DietV2Unit | null => {
  for (const { match, unit } of UNIT_SYNONYMS) {
    if (match.test(token)) return unit;
  }
  return null;
};

export interface ParsedQuickAdd {
  quantity: number;
  unit: DietV2Unit;
  foodName: string;
  matchedFood: FoodLibraryItem | null;
}

/**
 * Quick-add parser: takes a free-text Hebrew string like
 *   "300 גרם אורז"             →  qty:300 unit:g     name:"אורז"
 *   "6 כפות אורז"              →  qty:6   unit:spoons name:"אורז"
 *   "3 ביצים"                  →  qty:3   unit:units  name:"ביצים"
 *   "חזה עוף 150"              →  qty:150 unit:g     name:"חזה עוף"
 *   "כוס קורנפלקס 30 גרם"      →  qty:30  unit:g     name:"קורנפלקס"
 *                                 (the number+unit PAIR wins over
 *                                  a loose unit token elsewhere)
 *
 * Strategy:
 *   1. Pick the first numeric token as the quantity.
 *   2. Prefer a unit that sits IMMEDIATELY next to that number
 *      (either side) — `30 גרם` and `גרם 30` are both treated as
 *      an explicit qty+unit pair.
 *   3. Otherwise fall back to any unit token anywhere, or the
 *      matched food's default unit.
 *   4. Drop ALL unit tokens from the name (so "כוס" doesn't
 *      pollute the food name when grams won the pair race).
 */
export const parseQuickAddText = (
  raw: string,
  categoryKind: DietV2CategoryKind
): ParsedQuickAdd | null => {
  // Collapse multi-word unit phrases BEFORE tokenising — e.g.
  // "חתיכה בינונית" becomes a single sentinel token the unit
  // matcher recognises. Otherwise the parser would only see
  // "חתיכה" and resolve to the 100g piece, ignoring the size hint.
  const text = raw
    .trim()
    .replace(/[,،]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(חתיכה|חתיכות)\s+(בינונית|בינוניות)\b/gi, "__piece_medium__");
  if (!text) return null;

  const tokens = text.split(" ");

  // Step 1 — locate the first numeric token. When the trainer types
  // just a name ("חטיף חלבון של Win") with no quantity, default to
  // 1 of the food's natural unit — better than refusing the input.
  const numericIndex = tokens.findIndex((tok) => {
    const num = Number(tok);
    return Number.isFinite(num) && num > 0;
  });
  const typedQuantity = numericIndex === -1 ? null : Number(tokens[numericIndex]);

  // Step 2 — prefer an adjacent unit (right neighbour first, then
  // left). When the trainer writes "30 גרם" or "גרם 30" the unit
  // intent is unambiguous. Skip the adjacency check when there is
  // no numeric token at all — there's nothing to be adjacent to.
  let unit: DietV2Unit | null = null;
  let consumedUnitIndex = -1;
  if (numericIndex !== -1) {
    const rightUnit = numericIndex + 1 < tokens.length ? matchUnit(tokens[numericIndex + 1]) : null;
    if (rightUnit) {
      unit = rightUnit;
      consumedUnitIndex = numericIndex + 1;
    } else {
      const leftUnit = numericIndex - 1 >= 0 ? matchUnit(tokens[numericIndex - 1]) : null;
      if (leftUnit) {
        unit = leftUnit;
        consumedUnitIndex = numericIndex - 1;
      }
    }
  }

  // Step 3 — fall back to any unit elsewhere in the string if no
  // adjacent pair was found.
  if (unit === null) {
    for (let i = 0; i < tokens.length; i++) {
      if (i === numericIndex) continue;
      const matched = matchUnit(tokens[i]);
      if (matched) {
        unit = matched;
        consumedUnitIndex = i;
        break;
      }
    }
  }

  // Step 4 — build the food name from everything that wasn't the
  // number, the consumed unit, or ANY other unit token (so leftover
  // unit words don't bleed into the food name).
  const nameTokens = tokens.filter((token, index) => {
    if (index === numericIndex) return false;
    if (index === consumedUnitIndex) return false;
    if (matchUnit(token)) return false;
    return true;
  });

  const foodName = nameTokens.join(" ").trim();
  if (!foodName) return null;

  const matchedFood = bestFoodMatch(foodName, categoryKind);
  // Unit resolution priority: an explicit unit word wins; otherwise
  // use the matched library item's default (rice/chicken default to
  // grams, eggs default to units); otherwise — when the trainer
  // typed "2 מעדני חלבון גו" with no unit and no library match —
  // assume the number counts WHOLE ITEMS, not grams. Falling back
  // to grams turned "2 yogurt" into "2g yogurt" → near-zero kcal.
  const resolvedUnit = unit ?? matchedFood?.defaultUnit ?? "units";

  // Quantity resolution: trainer-typed wins. Otherwise pull the
  // food's portion default (a Bamba bag = 80g, a cottage tub =
  // 200g); fall back to 100 for gram foods and 1 for unit foods.
  const fallbackQuantity = resolvedUnit === "g" ? 100 : 1;
  const quantity = typedQuantity ?? matchedFood?.defaultQuantity ?? fallbackQuantity;

  return {
    quantity,
    unit: resolvedUnit,
    foodName: matchedFood?.name ?? foodName,
    matchedFood: matchedFood ?? null,
  };
};

/**
 * Quick-add matcher: pick the single best food for a typed phrase.
 * Reuses the same scoring as the picker's search — same-category
 * hits beat cross-category hits, exact normalised matches always
 * win. Returns null when nothing scores above a confidence floor
 * (so the parser falls back to the category estimator instead of
 * silently inserting a wrong food).
 */
const QUICK_MATCH_CONFIDENCE_FLOOR = 40;

const bestFoodMatch = (
  needle: string,
  categoryKind: DietV2CategoryKind
): FoodLibraryItem | null => {
  const cleaned = normaliseHebrew(needle);
  if (!cleaned) return null;

  const sameKind = MOCK_FOOD_LIBRARY
    .filter((food) => food.kind === categoryKind)
    .map((food) => ({ food, score: scoreFoodMatch(food, cleaned) }))
    .filter((entry) => entry.score >= QUICK_MATCH_CONFIDENCE_FLOOR)
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);

  if (sameKind[0]) return sameKind[0].food;

  const wide = MOCK_FOOD_LIBRARY
    .map((food) => ({ food, score: scoreFoodMatch(food, cleaned) }))
    .filter((entry) => entry.score >= QUICK_MATCH_CONFIDENCE_FLOOR)
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);

  return wide[0]?.food ?? null;
};
