import { useEffect, useMemo } from "react";
import { useStableSearchParams } from "./useStableSearchParams";
import { parseNumber } from "@/lib/utils";

type UseUrlPaginationOptions = {
  namespace?: string;
  pageParam?: string;
  pageSizeParam?: string;
  defaultPage?: number;
  defaultPageSize?: number;
  totalPages?: number;
  resetOn?: unknown[];
};

const clamp = (value: number, min: number, max?: number) => {
  const normalizedMax = typeof max === "number" ? Math.max(max, min) : undefined;

  if (value < min) return min;

  if (typeof normalizedMax === "number" && value > normalizedMax) return normalizedMax;

  return value;
};

export const useUrlPagination = ({
  namespace,
  pageParam,
  pageSizeParam,
  defaultPage = 1,
  defaultPageSize = 10,
  totalPages,
  resetOn,
}: UseUrlPaginationOptions = {}) => {
  const { searchParams, setParams } = useStableSearchParams();

  const resolvedPageParam = pageParam ?? (namespace ? `${namespace}_page` : "page");
  const resolvedPageSizeParam = pageSizeParam ?? (namespace ? `${namespace}_limit` : "limit");

  const parsedPage = parseNumber(searchParams.get(resolvedPageParam));
  const parsedPageSize = parseNumber(searchParams.get(resolvedPageSizeParam));

  const page = useMemo(() => {
    const base = parsedPage ?? defaultPage;

    return clamp(base, 1, totalPages);
  }, [parsedPage, defaultPage, totalPages]);

  const pageSize = useMemo(() => {
    const base = parsedPageSize ?? defaultPageSize;

    return clamp(base, 1);
  }, [parsedPageSize, defaultPageSize]);

  const offset = (page - 1) * pageSize;

  const setPage = (nextPage: number) => {
    const safePage = clamp(nextPage, 1, totalPages);

    setParams({ [resolvedPageParam]: safePage });
  };

  const setPageSize = (nextPageSize: number) => {
    const safePageSize = clamp(nextPageSize, 1);

    setParams({ [resolvedPageSizeParam]: safePageSize, [resolvedPageParam]: defaultPage });
  };

  useEffect(() => {
    if (!resetOn?.length) return;

    setParams(
      {
        [resolvedPageParam]: defaultPage,
      },
      { replace: true }
    );
  }, resetOn || []);

  useEffect(() => {
    const nextPage = clamp(parsedPage ?? defaultPage, 1, totalPages);
    const nextPageSize = clamp(parsedPageSize ?? defaultPageSize, 1);
    if (nextPage !== parsedPage || nextPageSize !== parsedPageSize) {
      setParams(
        {
          [resolvedPageParam]: nextPage,
          [resolvedPageSizeParam]: nextPageSize,
        },
        { replace: true }
      );
    }
  }, [
    defaultPage,
    defaultPageSize,
    parsedPage,
    parsedPageSize,
    resolvedPageParam,
    resolvedPageSizeParam,
    setParams,
    totalPages,
  ]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    offset,
    limit: pageSize,
  };
};
