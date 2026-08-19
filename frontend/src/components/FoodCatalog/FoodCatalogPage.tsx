import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, Loader2, PackageOpen, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFoodCatalogApi from "@/hooks/api/useFoodCatalogApi";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";

interface FoodCatalogPageProps {
  onAdd: () => void;
  onEdit: (catalogItemId: string) => void;
}

const getSourceLabel = (product: FoodCatalogProduct) => {
  if (product.provenance?.provider === "open_food_facts") {
    return "Open Food Facts";
  }

  return "ידני";
};

const FoodCatalogPage = ({ onAdd, onEdit }: FoodCatalogPageProps) => {
  const api = useFoodCatalogApi();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  const productsQuery = useQuery({
    queryKey: ["admin-food-catalog", debouncedQuery],
    queryFn: ({ signal }) => api.search(debouncedQuery, signal),
    staleTime: 20_000,
  });

  const products = productsQuery.data ?? [];

  const resultText = useMemo(() => {
    if (productsQuery.isLoading) {
      return "טוען את מאגר המזון...";
    }

    if (!products.length) {
      return debouncedQuery ? "לא נמצאו תוצאות" : "עדיין אין פריטים במאגר";
    }

    return `${products.length} פריטים`;
  }, [debouncedQuery, products.length, productsQuery.isLoading]);

  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-[1500px] px-4 py-6 font-heebo sm:px-6 lg:px-8 lg:py-8"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              מאגר מזון
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              ניהול מזונות, מנות וערכים תזונתיים
            </p>
          </div>
        </div>

        <Button onClick={onAdd} className="h-11 gap-2 self-start px-5 sm:self-auto">
          <Plus className="h-4 w-4" />
          הוסף מזון
        </Button>
      </div>

      {/* Search + count */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי שם או מותג..."
            className="h-11 bg-white pe-10 dark:bg-slate-950"
          />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">{resultText}</p>
      </div>

      {/* Main catalog container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* Desktop table header */}
        <div className="hidden grid-cols-[minmax(280px,2fr)_minmax(180px,1fr)_150px_170px_70px] gap-5 border-b border-slate-200 bg-slate-50/80 px-6 py-3.5 text-xs font-semibold text-slate-500 md:grid dark:border-slate-800 dark:bg-slate-900/50">
          <div>מזון</div>
          <div>מותג</div>
          <div>סוגי מנה</div>
          <div>מקור</div>
          <div />
        </div>

        {productsQuery.isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">טוען את המאגר...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900">
              <PackageOpen className="h-6 w-6" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {debouncedQuery ? "לא נמצאו מזונות" : "מאגר המזון עדיין ריק"}
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {debouncedQuery
                ? "נסה לחפש בשם אחר או לפי מותג אחר."
                : "הוסף את המזון הראשון כדי להתחיל לבנות את המאגר."}
            </p>

            {!debouncedQuery && (
              <Button onClick={onAdd} variant="outline" className="mt-5 gap-2">
                <Plus className="h-4 w-4" />
                הוסף מזון ראשון
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onEdit(product.id)}
                className="group block w-full text-start transition-colors hover:bg-slate-50/80 focus-visible:bg-slate-50 focus-visible:outline-none dark:hover:bg-slate-900/40 dark:focus-visible:bg-slate-900"
              >
                {/* Desktop row */}
                <div className="hidden grid-cols-[minmax(280px,2fr)_minmax(180px,1fr)_150px_170px_70px] items-center gap-5 px-6 py-5 md:grid">
                  {/* Name */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {product.displayName || "ללא שם"}
                    </p>

                    {product.names?.en && product.names.en !== product.displayName && (
                      <p dir="ltr" className="mt-1 truncate text-start text-xs text-slate-400">
                        {product.names.en}
                      </p>
                    )}
                  </div>

                  {/* Brand */}
                  <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                    {product.brand || "—"}
                  </p>

                  {/* Servings */}
                  <div>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {product.servings.length} סוגי מנה
                    </span>
                  </div>

                  {/* Source */}
                  <p className="text-sm text-slate-500">{getSourceLabel(product)}</p>

                  {/* Action indicator */}
                  <div className="flex justify-end">
                    <ChevronLeft className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-x-1 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </div>

                {/* Mobile row */}
                <div className="flex items-center gap-4 px-4 py-4 md:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {product.displayName || "ללא שם"}
                    </p>

                    {product.names?.en && product.names.en !== product.displayName && (
                      <p dir="ltr" className="mt-0.5 truncate text-start text-xs text-slate-400">
                        {product.names.en}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {product.brand && <span>{product.brand}</span>}

                      <span>{product.servings.length} סוגי מנה</span>

                      <span>{getSourceLabel(product)}</span>
                    </div>
                  </div>

                  <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCatalogPage;
