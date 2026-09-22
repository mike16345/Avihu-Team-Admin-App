import type { DietV2CatalogCandidate, DietV2PlanItem } from "@/interfaces/IDietPlanV2";

export const normalizeCatalogName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export const hasCategoryDuplicate = (
  items: Pick<DietV2PlanItem, "name">[],
  candidateName: string
): boolean => {
  const candidate = normalizeCatalogName(candidateName);
  if (!candidate) return false;

  return items.some((item) => normalizeCatalogName(item.name) === candidate);
};

export const dedupeCatalogCandidates = (
  candidates: DietV2CatalogCandidate[]
): DietV2CatalogCandidate[] => {
  const seen = new Set<string>();

  return candidates.reduce<DietV2CatalogCandidate[]>((deduped, candidate) => {
    const name = candidate.name.trim();
    const key = `${candidate.category}:${normalizeCatalogName(name)}`;
    if (!name || seen.has(key)) return deduped;

    seen.add(key);
    deduped.push({ ...candidate, name });

    return deduped;
  }, []);
};
