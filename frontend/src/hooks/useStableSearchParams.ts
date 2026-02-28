import { normalizeValue, type ParamValue } from "@/lib/utils";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type SetParamsOptions = { replace?: boolean };

export const useStableSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void, options?: SetParamsOptions) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        updater(next);

        if (next.toString() === prev.toString()) return prev;

        return next;
      }, options);
    },
    [setSearchParams]
  );

  const setParam = useCallback(
    (key: string, value: ParamValue, options?: SetParamsOptions) => {
      updateParams((params) => {
        const normalized = normalizeValue(value);

        if (normalized === null) {
          params.delete(key);
        } else {
          params.set(key, normalized);
        }
      }, options);
    },
    [updateParams]
  );

  const setParams = useCallback(
    (patch: Record<string, ParamValue>, options?: SetParamsOptions) => {
      updateParams((params) => {
        Object.entries(patch).forEach(([key, value]) => {
          const normalized = normalizeValue(value);

          if (normalized === null) {
            params.delete(key);
            return;
          }

          params.set(key, normalized);
        });
      }, options);
    },
    [updateParams]
  );

  const deleteParam = useCallback(
    (key: string, options?: SetParamsOptions) => {
      updateParams((params) => params.delete(key), options);
    },
    [updateParams]
  );

  return {
    searchParams,
    setParam,
    setParams,
    deleteParam,
  };
};
