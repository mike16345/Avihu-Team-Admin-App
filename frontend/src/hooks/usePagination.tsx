import { useUrlPagination } from "./useUrlPagination";

export function usePagination(initialPage = 1) {
  const { page, setPage } = useUrlPagination({ defaultPage: initialPage });

  return {
    pageNumber: page,
    goToPage: setPage,
  };
}
