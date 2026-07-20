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
  kind: DietV2CategoryKind;
  defaultUnit: DietV2Unit;
  per100: DietV2OptionMacros;
  aliases?: string[];
  unitGrams?: Partial<Record<DietV2Unit, number>>;
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

export const MOCK_FOOD_LIBRARY: FoodLibraryItem[] = [
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
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);

  if (scored.length >= 3) return scored.slice(0, limit).map((entry) => entry.food);

  const wide = MOCK_FOOD_LIBRARY
    .filter((food) => !kind || food.kind !== kind)
    .map((food) => ({ food, score: scoreFoodMatch(food, normalised) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.length - b.food.name.length);

  return [...scored, ...wide].slice(0, limit).map((entry) => entry.food);
};

const GENERIC_UNIT_TO_GRAMS: Record<DietV2Unit, number> = {
  g: 1,
  spoons: 15,
  cups: 240,
  units: 50,
  slice: 28,
  piece: 100,
  piece_medium: 80,
};

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
    ratio = (quantity * gramsForUnit(food, requestedUnit)) / 100;
  } else {
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

export const isConvertedUnit = (food: FoodLibraryItem, unit: DietV2Unit): boolean => {
  if (unit === food.defaultUnit) return false;
  return !food.unitGrams?.[unit];
};

export interface MacroRange {
  min: number;
  max: number;
  avg: number;
}

export const computeCategoryRange = (
  category: DietV2Category,
  pick: keyof DietV2OptionMacros
): MacroRange | null => {
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

export const computeCategoryAverage = (
  category: DietV2Category,
  pick: keyof DietV2OptionMacros
): number => computeCategoryRange(category, pick)?.avg ?? 0;

export const computeMealAverage = (
  meal: DietV2Meal,
  pick: keyof DietV2OptionMacros
): number => computeMealRange(meal, pick).avg;

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

export const deriveMealManualMacros = (meal: DietV2Meal): DietV2OptionMacros => {
  const hasAnyCategoryManual = meal.categories.some(
    (cat) => cat.manualPrimaryGrams != null || cat.manualCalories != null
  );

  if (!hasAnyCategoryManual) {
    return meal.manualMacros ?? { protein: 0, carbs: 0, fat: 0, calories: 0 };
  }

  const totals: DietV2OptionMacros = { protein: 0, carbs: 0, fat: 0, calories: 0 };
  for (const cat of meal.categories) {
    const primary = primaryMacroForCategory(cat.kind);
    if (primary && cat.manualPrimaryGrams != null) totals[primary] += cat.manualPrimaryGrams;
    if (cat.manualCalories != null) totals.calories += cat.manualCalories;
  }
  return totals;
};

const round = (value: number): number => Math.round(value * 10) / 10;

let idCounter = 0;
export const makeLocalId = (prefix: string): string =>
  `${prefix}-${++idCounter}-${Math.floor(Date.now() / 1000)}`;

export const buildEmptyMeal = (index: number): DietV2Meal => ({
  id: makeLocalId("meal"),
  name: `ארוחה ${index}`,
  categories: DIET_V2_DEFAULT_CATEGORIES.map((kind) => ({ kind, options: [] })),
  macroMode: "manual",
});

const DIET_V2_DEFAULT_CATEGORIES: DietV2CategoryKind[] = [
  "protein",
  "carbs",
  "fat",
  "vegetables",
];

const UNIT_SYNONYMS: { match: RegExp; unit: DietV2Unit }[] = [
  { match: /^(גרם|ג׳|ג'|ג|גר|gram|g)$/i, unit: "g" },
  { match: /^(כפות|כף|כפית|כפיות)$/i, unit: "spoons" },
  { match: /^(כוסות|כוס)$/i, unit: "cups" },
  { match: /^(יחידות|יחידה|יח׳|יח)$/i, unit: "units" },
  { match: /^(פרוסות|פרוסה|פרו׳)$/i, unit: "slice" },
  { match: /^(חתיכות|חתיכה)$/i, unit: "piece" },
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

export const isPlateDescription = (trimmed: string): boolean => {
  const tokens = trimmed
    .replace(/[,،]/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean);
  if (tokens.length < 3) return false;

  const numericIndex = tokens.findIndex((tok) => {
    const num = Number(tok);
    return Number.isFinite(num) && num > 0;
  });
  if (numericIndex <= 0 || numericIndex >= tokens.length - 1) return false;

  const left = tokens[numericIndex - 1];
  const right = tokens[numericIndex + 1];
  if (matchUnit(left) || matchUnit(right)) return false;
  const anyOtherUnit = tokens.some((tok, i) => i !== numericIndex && matchUnit(tok));
  if (anyOtherUnit) return false;
  return true;
};

export const parseQuickAddText = (
  raw: string,
  categoryKind: DietV2CategoryKind
): ParsedQuickAdd | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/[+,]/.test(trimmed) || / ו-?/.test(trimmed) || isPlateDescription(trimmed)) {
    return {
      quantity: 1,
      unit: "units",
      foodName: trimmed,
      matchedFood: null,
    };
  }

  const text = trimmed
    .replace(/[,،]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(חתיכה|חתיכות)\s+(בינונית|בינוניות)\b/gi, "__piece_medium__");

  const tokens = text.split(" ");

  const numericIndex = tokens.findIndex((tok) => {
    const num = Number(tok);
    return Number.isFinite(num) && num > 0;
  });
  const typedQuantity = numericIndex === -1 ? null : Number(tokens[numericIndex]);

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

  const nameTokens = tokens.filter((token, index) => {
    if (index === numericIndex) return false;
    if (index === consumedUnitIndex) return false;
    if (matchUnit(token)) return false;
    return true;
  });

  const foodName = nameTokens.join(" ").trim();
  if (!foodName) return null;

  const matchedFood = bestFoodMatch(foodName, categoryKind);
  const resolvedUnit = unit ?? matchedFood?.defaultUnit ?? "units";

  const fallbackQuantity = resolvedUnit === "g" ? 100 : 1;
  const quantity = typedQuantity ?? matchedFood?.defaultQuantity ?? fallbackQuantity;

  return {
    quantity,
    unit: resolvedUnit,
    foodName,
    matchedFood: matchedFood ?? null,
  };
};

export const parseCompoundQuickAdd = (
  raw: string,
  categoryKind: DietV2CategoryKind
): ParsedQuickAdd[] => {
  const parts = raw
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return [];

  return parts.map((part) => {
    const parsed = parseQuickAddText(part, categoryKind);
    if (parsed) return parsed;
    return {
      quantity: 1,
      unit: "units" as DietV2Unit,
      foodName: part,
      matchedFood: null,
    };
  });
};

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
