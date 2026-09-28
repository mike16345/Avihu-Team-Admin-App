import { useEffect, useState } from "react";
import { fetchData } from "@/API/api";
import { useUsersStore } from "@/store/userStore";

interface DietTipGoal {
  key: string;
  label: string;
  tips: string[];
}

interface DietTipGoalsResponse {
  data?: DietTipGoal[] | { data?: DietTipGoal[] };
}

export const useDietTipGoals = () => {
  const currentUser = useUsersStore((s) => s.currentUser);
  const trainerId = currentUser?.trainerId || currentUser?._id;
  const [goals, setGoals] = useState<DietTipGoal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetchData<DietTipGoalsResponse>(
          `trainers/diet-tip-goals`,
          { trainerId }
        );
        if (cancelled) return;
        const raw = res?.data as unknown;
        const list: DietTipGoal[] = Array.isArray(raw)
          ? (raw as DietTipGoal[])
          : ((raw as { data?: DietTipGoal[] })?.data ?? []);
        setGoals(list.filter((g) => g.tips && g.tips.length > 0));
      } catch {
        if (!cancelled) setGoals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  return { goals, loading };
};
