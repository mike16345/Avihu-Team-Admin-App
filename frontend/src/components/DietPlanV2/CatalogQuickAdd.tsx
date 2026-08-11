import { useMemo, useState } from "react";
import { FaPlus, FaSpinner, FaXmark } from "react-icons/fa6";

import DeleteModal from "@/components/Alerts/DeleteModal";
import { useDeleteDietV2CatalogItem } from "@/hooks/mutations/dietV2Catalog/useDeleteDietV2CatalogItem";
import { useDietV2CatalogSearchQuery } from "@/hooks/queries/dietV2Catalog/useDietV2CatalogSearchQuery";
import { useDietV2PopularItemsQuery } from "@/hooks/queries/dietV2Catalog/useDietV2PopularItemsQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type {
  DietV2CatalogCategory,
  DietV2CatalogItem,
  DietV2PlanItem,
} from "@/interfaces/IDietPlanV2";

import { hasCategoryDuplicate } from "./dietPlanV2Catalog";

interface CatalogQuickAddProps {
  category: DietV2CatalogCategory;
  existingItems: DietV2PlanItem[];
  onAdd: (item: DietV2PlanItem) => void;
  placeholder?: string;
}

const CatalogQuickAdd: React.FC<CatalogQuickAddProps> = ({
  category,
  existingItems,
  onAdd,
  placeholder = "חפש או כתוב מאכל ולחץ Enter…",
}) => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DietV2CatalogItem | null>(null);
  const debouncedQuery = useDebouncedValue(query, 175);
  const popularQuery = useDietV2PopularItemsQuery();
  const searchQuery = useDietV2CatalogSearchQuery(category, debouncedQuery);
  const deleteMutation = useDeleteDietV2CatalogItem();

  const suggestions = useMemo(() => {
    const source = query.trim() ? searchQuery.data : popularQuery.data?.[category];

    return (source ?? []).filter((item) => !hasCategoryDuplicate(existingItems, item.name));
  }, [category, existingItems, popularQuery.data, query, searchQuery.data]);

  const addItem = (item: DietV2PlanItem) => {
    if (hasCategoryDuplicate(existingItems, item.name)) {
      setError("המאכל כבר קיים בקטגוריה הזו");
      return;
    }

    onAdd(item);
    setQuery("");
    setError("");
  };

  const addTypedItem = () => {
    const name = query.trim();
    if (!name) return;
    addItem({ name });
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete._id, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  const isSearching = query.trim().length > 0 && searchQuery.isFetching;

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/40 px-2 py-1.5 shadow-sm transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-200/50 dark:border-blue-900/40 dark:bg-blue-950/20 dark:focus-within:bg-slate-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {isSearching ? <FaSpinner className="animate-spin" size={10} /> : <FaPlus size={10} />}
          </span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              addTypedItem();
            }}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          <button
            type="button"
            onClick={addTypedItem}
            disabled={!query.trim()}
            className="shrink-0 rounded-md brand-gradient brand-gradient-hover px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-blue-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            הוסף
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-blue-100 bg-white/70 p-2 dark:border-blue-900/40 dark:bg-slate-950/30">
            <span className="px-1 text-[10px] font-bold text-slate-400">
              {query.trim() ? "תוצאות:" : "הוספה מהירה:"}
            </span>
            {suggestions.map((item) => (
              <span
                key={item._id}
                className="inline-flex max-w-full overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => addItem({ name: item.name, catalogItemId: item._id })}
                  className="truncate px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-950/40"
                  title={item.name}
                >
                  + {item.name}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  aria-label={`הסר ${item.name} מהקטלוג`}
                  className="border-r border-slate-200 px-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:bg-rose-950/40"
                >
                  <FaXmark size={8} />
                </button>
              </span>
            ))}
          </div>
        )}

        {error && <p className="px-1 text-[11px] font-bold text-rose-600">{error}</p>}
      </div>

      <DeleteModal
        isModalOpen={!!pendingDelete}
        setIsModalOpen={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        title="להסיר מהקטלוג?"
        confirmLabel="הסר"
        alertMessage={
          pendingDelete
            ? `האם להסיר את “${pendingDelete.name}” מהקטלוג המשותף? תפריטים קיימים לא ישתנו.`
            : ""
        }
      />
    </>
  );
};

export default CatalogQuickAdd;
