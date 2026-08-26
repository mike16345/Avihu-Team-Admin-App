import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/Alerts/ConfirmationDialog";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { QueryKeys } from "@/enums/QueryKeys";
import type { IUser } from "@/interfaces/IUser";

type Style = NonNullable<IUser["setInputType"]>;

const OPTIONS: { value: Style; label: string }[] = [
  { value: "wheel", label: "גלילה" },
  { value: "table", label: "הקלדה" },
];

const LABEL_BY_VALUE: Record<Style, string> = {
  wheel: "גלילה",
  table: "הקלדה",
};

export default function SetInputStyleToggle({ userId }: { userId: string }) {
  const { data: user } = useUserQuery(userId);
  const current: Style = user?.setInputType ?? "wheel";
  const { updateUserField } = useUsersApi();
  const qc = useQueryClient();

  const [pending, setPending] = useState<Style | null>(null);

  
  const mutation = useMutation({
    mutationFn: (value: Style) => updateUserField(userId, "setInputType", value),
    onSuccess: (_, value) => {
      console.log("SetInputStyleToggle: mutation success",_, value);
      qc.setQueryData<IUser | undefined>([QueryKeys.USERS, userId], (prev) =>
        prev ? { ...prev, setInputType: value } : prev
      );
      qc.invalidateQueries({ queryKey: [QueryKeys.USERS, userId] });
      toast.success(`סגנון הזנת הסטים עודכן ל־${LABEL_BY_VALUE[value]}`);
    },
    onError: () => toast.error("שמירה נכשלה"),
  });

  const handleConfirmChange = useCallback(async () => {
    if (!pending) return;

    const res = await mutation.mutateAsync(pending);
    console.log("SetInputStyleToggle: mutation result", res);
    setPending(null);
  }, [pending, mutation]);
  return (
    <>
      <div
        className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-sm"
        role="group"
        aria-label="סגנון הזנת סטים"
        title="בחר איך המתאמן מזין סטים באפליקציה"
      >
        {OPTIONS.map((opt) => {
          const active = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={mutation.isPending || active}
              onClick={() => setPending(opt.value)}
              className={
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all " +
                (active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <ConfirmationDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={handleConfirmChange}
        title="להחליף את סגנון הזנת הסטים?"
        description={
          pending && (
            <span>
              הסטים יוצגו למתאמן בסגנון <strong>{LABEL_BY_VALUE[pending]}</strong>.
            </span>
          )
        }
        confirmLabel="החלף"
        cancelLabel="בטל"
      />
    </>
  );
}
