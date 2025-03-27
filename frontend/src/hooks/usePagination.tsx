import { useSearchParams } from "react-router-dom";
import { useState } from "react";

export function usePagination(initialPage = 1) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageNumber, setPageNumber] = useState<number>(() => {
    const pageNumber = searchParams.get("page");
    
    return pageNumber ? parseInt(pageNumber, 10) : initialPage;
  });

  const goToPage = (page: number) => {
    setPageNumber(page);
    setSearchParams({ page: page.toString() });
  };

  return {
    pageNumber,
    goToPage,
  };
}
