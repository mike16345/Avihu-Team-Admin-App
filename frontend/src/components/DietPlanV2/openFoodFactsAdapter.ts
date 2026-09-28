/**
 * Adapter — Open Food Facts product → our FoodLibraryItem.
 *
 * OFF (https://world.openfoodfacts.org) is a public, CORS-enabled,
 * open-licensed food database. The search endpoint returns products
 * with macros per 100g under `nutriments`. We map a subset of the
 * fields we care about and infer the diet-plan category from the
 * product's `categories_tags`.
 *
 * Production migration: once Mike exposes a server-side foods
 * endpoint backed by a cached snapshot of OFF (and optionally
 * Israeli MoH data), the adapter shape stays the same — only the
 * fetch target swaps.
 */
import type { DietV2CategoryKind } from "@/interfaces/IDietPlanV2";
import type { FoodLibraryItem } from "./dietPlanV2Utils";

interface OffNutriments {
  ["proteins_100g"]?: number | string;
  ["carbohydrates_100g"]?: number | string;
  ["fat_100g"]?: number | string;
  ["energy-kcal_100g"]?: number | string;
}

export interface OffProduct {
  code?: string;
  product_name?: string;
  product_name_he?: string;
  product_name_en?: string;
  brands?: string;
  categories_tags?: string[];
  nutriments?: OffNutriments;
  serving_size?: string;
}

const KEYWORDS_TO_KIND: { keywords: string[]; kind: DietV2CategoryKind }[] = [
  {
    kind: "protein",
    keywords: [
      "meats",
      "meat",
      "chicken",
      "beef",
      "fish",
      "seafood",
      "dairy",
      "dairies",
      "egg",
      "cheese",
      "yogurt",
      "yoghurt",
      "legumes",
      "tofu",
      "protein",
    ],
  },
  {
    kind: "fat",
    keywords: ["oils", "oil", "butter", "nut", "nuts", "seed", "seeds", "spread", "fat", "fats"],
  },
  {
    kind: "vegetables",
    keywords: ["vegetable", "vegetables", "salad", "leafy"],
  },
  {
    kind: "carbs",
    keywords: [
      "cereal",
      "cereals",
      "breakfast",
      "grain",
      "grains",
      "bread",
      "breads",
      "pasta",
      "rice",
      "fruit",
      "fruits",
      "sugar",
      "sweet",
      "snack",
      "snacks",
      "potato",
      "potatoes",
    ],
  },
];

const inferKindFromTags = (tags: string[] | undefined): DietV2CategoryKind => {
  if (!tags?.length) return "carbs";
  const lowered = tags.map((tag) => tag.toLowerCase());
  for (const { keywords, kind } of KEYWORDS_TO_KIND) {
    if (lowered.some((tag) => keywords.some((kw) => tag.includes(kw)))) {
      return kind;
    }
  }
  return "carbs";
};

const toNumber = (value: number | string | undefined): number => {
  if (value === undefined) return 0;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const mapOffProductToFoodLibraryItem = (off: OffProduct): FoodLibraryItem | null => {
  const nutr = off.nutriments;
  if (!nutr) return null;

  const name = (off.product_name_he || off.product_name || "").trim();
  if (!name) return null;

  const calories = toNumber(nutr["energy-kcal_100g"]);
  const protein = toNumber(nutr["proteins_100g"]);
  const carbs = toNumber(nutr["carbohydrates_100g"]);
  const fat = toNumber(nutr["fat_100g"]);

  // Discard products with no macro data at all — they'd add noise
  // to search without giving the trainer useful numbers.
  if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) return null;

  const aliases: string[] = [];
  if (off.product_name_en && off.product_name_en !== name) aliases.push(off.product_name_en);
  if (off.brands) aliases.push(off.brands);

  return {
    id: `off-${off.code || name.replace(/\s+/g, "-")}`,
    name,
    kind: inferKindFromTags(off.categories_tags),
    defaultUnit: "g",
    per100: { protein, carbs, fat, calories },
    aliases: aliases.length ? aliases : undefined,
  };
};

const OFF_SEARCH_BASE = "https://world.openfoodfacts.org/cgi/search.pl";

export const buildOffSearchUrl = (query: string, limit = 10): string => {
  // The CGI search supports `search_simple=1` for free-text query.
  // `lc=he` and `cc=il` bias results towards Hebrew-labelled products
  // sold in Israel.
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(limit),
    fields:
      "code,product_name,product_name_he,product_name_en,brands,nutriments,categories_tags,serving_size",
    lc: "he",
    cc: "il",
  });
  return `${OFF_SEARCH_BASE}?${params.toString()}`;
};

/**
 * Fetch + adapt OFF search results to our FoodLibraryItem shape.
 * Throws on network errors — callers (the query hook) decide how
 * to surface that to the UI.
 */
export const searchOpenFoodFacts = async (
  query: string,
  limit = 10
): Promise<FoodLibraryItem[]> => {
  const url = buildOffSearchUrl(query, limit);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Open Food Facts search failed: ${response.status}`);
  }
  const data = (await response.json()) as { products?: OffProduct[] };
  const products = data.products ?? [];
  return products
    .map(mapOffProductToFoodLibraryItem)
    .filter((item): item is FoodLibraryItem => item !== null);
};
