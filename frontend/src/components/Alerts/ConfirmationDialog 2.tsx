import React from "react";

import { cn } from "@/lib/utils";

import CustomAlertDialog from "./DialogAlert/CustomAlertDialog";

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  variant?: "default" | "destructive";
  contentClassName?: string;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "האם אתה בטוח?",
  description,
  confirmLabel = "אשר",
  cancelLabel = "בטל",
  variant = "default",
  contentClassName,
}) => {
  const isDestructive = variant === "destructive";

  return (
    <CustomAlertDialog
      alertDialogProps={{
        open,
        onOpenChange,
      }}
      alertDialogContentProps={{
        dir: "rtl",
        className: cn(
          "mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-900",
          contentClassName
        ),
        children: description ? (
          <div
            className={cn(
              "mx-6 mb-2 rounded-2xl border px-4 py-3 text-right text-sm leading-6",
              isDestructive
                ? "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
                : "border-blue-200 bg-blue-50/80 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
            )}
          >
            {description}
          </div>
        ) : null,
      }}
      alertDialogHeaderProps={{
        className: "px-6 pb-0 pt-6 text-right",
      }}
      alertDialogTitleProps={{
        children: title,
        className: "text-right text-xl font-bold text-slate-900 dark:text-slate-100",
      }}
      alertDialogFooterProps={{
        className: "px-6 pb-6 pt-2",
      }}
      alertDialogCancelProps={{
        children: cancelLabel,
        className:
          "mt-0 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        onClick: (event) => {
          event.stopPropagation();
          onCancel?.();
          onOpenChange(false);
        },
      }}
      alertDialogActionProps={{
        children: confirmLabel,
        className: cn(
          "rounded-xl text-white shadow-sm",
          isDestructive
            ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-300 dark:bg-rose-600 dark:hover:bg-rose-500"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500"
        ),
        onClick: (event) => {
          event.stopPropagation();
          onConfirm();
          onOpenChange(false);
        },
      }}
    />
  );
};

export default ConfirmationDialog;
