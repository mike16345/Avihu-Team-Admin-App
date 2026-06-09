/**
 * Toaster — wraps Sonner with the admin-panel design language.
 *
 * - Wider, more generous card (Heebo, rounded-2xl, soft slate borders).
 * - Bigger icon + more breathing room between icon and text.
 * - Bolder title; subtle muted description.
 * - Pill close button.
 * - Works with `richColors` which Sonner uses to colour the icon/text
 *   per toast type.
 *
 * Notes on Tailwind versioning: we deliberately avoid `data-[type=...]`
 * arbitrary variants in classNames here. Some Tailwind builds drop them
 * silently — and a single dropped class can prevent the Toaster from
 * mounting at all (we hit this).
 */
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          fontFamily: "Assistant, Heebo, system-ui, sans-serif",
          "--width": "300px",
          "--border-radius": "14px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border !shadow-md !gap-2 !py-2.5 !px-3.5 group-[.toaster]:!bg-background group-[.toaster]:!text-foreground group-[.toaster]:!border-border",
          title: "!text-[13px] !font-semibold !leading-tight",
          description: "!text-[11px] !mt-0.5 !opacity-80 !leading-snug",
          icon: "!ms-0 !me-0.5 [&_svg]:!h-3.5 [&_svg]:!w-3.5",
          actionButton:
            "!rounded-md !bg-blue-600 !text-white !text-[11px] !font-semibold !px-2.5 !py-1 hover:!bg-blue-700",
          cancelButton:
            "!rounded-md !border !border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !text-slate-600 dark:!text-slate-300 !text-[11px] !font-semibold !px-2.5 !py-1",
          closeButton:
            "!rounded-full !bg-white dark:!bg-slate-900 !border !border-slate-200 dark:!border-slate-800 !text-slate-400 dark:!text-slate-500 hover:!text-slate-600 dark:hover:!text-slate-300 !h-5 !w-5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
