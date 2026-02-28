import { useEffect, useMemo } from "react";
import { useStableSearchParams } from "./useStableSearchParams";

type UseUrlTabOptions = {
  param?: string;
  defaultTab: string;
  tabs?: string[];
};

export const useUrlTab = ({ param = "tab", defaultTab, tabs }: UseUrlTabOptions) => {
  const { searchParams, setParam } = useStableSearchParams();
  const rawTab = searchParams.get(param) ?? "";

  const setTab = (nextTab: string) => {
    setParam(param, nextTab);
  };

  const tab = useMemo(() => {
    const trimmed = rawTab.trim();
    if (!trimmed) return defaultTab;
    if (tabs && !tabs.includes(trimmed)) return defaultTab;
    return trimmed;
  }, [rawTab, defaultTab, tabs]);

  useEffect(() => {
    if (rawTab === tab) return;

    setParam(param, tab, { replace: true });
  }, [param, rawTab, setParam, tab]);

  return { tab, setTab };
};
