/**
 * Toaster — wraps Sonner with the admin-panel design language.
 *
 * Brand-aligned color story: every toast type (success / info / error /
 * warning / loading) uses the SAME brand-blue accent palette. Avihu's
 * call: the panel should feel like one product, not "now a green ok",
 * "now a red error", "now a black default". Status is communicated by
 * the icon + copy, not by traffic-light backgrounds.
 *
 * - White card, soft slate border, brand-blue accent ring (`--toast-border`).
 * - Brand-blue icon for every type.
 * - Tiny, bold title in Assistant; muted description below.
 * - Pill close button.
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
          "--width": "320px",
          "--border-radius": "14px",
          // Force every Sonner type to brand-blue. Sonner reads these
          // CSS vars per-type when richColors is on; we override all
          // five so success/info/error/warning/loading look identical
          // in chrome — only the icon glyph distinguishes them.
          "--normal-bg": "#ffffff",
          "--normal-text": "#0f172a",
          "--normal-border": "#dbeafe",
          "--success-bg": "#ffffff",
          "--success-text": "#0f172a",
          "--success-border": "#dbeafe",
          "--info-bg": "#ffffff",
          "--info-text": "#0f172a",
          "--info-border": "#dbeafe",
          "--warning-bg": "#ffffff",
          "--warning-text": "#0f172a",
          "--warning-border": "#dbeafe",
          "--error-bg": "#ffffff",
          "--error-text": "#0f172a",
          "--error-border": "#fecaca",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border !shadow-md !gap-2 !py-2.5 !px-3.5 " +
            // Brand-blue accent edge on the start side (RTL: right).
            "!relative !overflow-hidden " +
            "before:!content-[''] before:!absolute before:!inset-y-0 before:!end-0 before:!w-[3px] before:!bg-gradient-to-b before:!from-blue-500 before:!to-indigo-500",
          title: "!text-[13px] !font-bold !leading-tight !text-slate-900",
          description: "!text-[11px] !mt-0.5 !text-slate-500 !leading-snug",
          // Force all type-icons to brand blue, regardless of the
          // toast type. Sonner colours its built-in icons via the SVG
          // fill/stroke = currentColor, so colouring the wrapper
          // cascades down.
          icon:
            "!ms-0 !me-1 !text-blue-600 [&_svg]:!h-4 [&_svg]:!w-4 [&_svg]:!text-blue-600",
          actionButton:
            "!rounded-md brand-gradient !text-white !text-[11px] !font-bold !px-2.5 !py-1 hover:!brightness-110",
          cancelButton:
            "!rounded-md !border !border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !text-slate-600 dark:!text-slate-300 !text-[11px] !font-semibold !px-2.5 !py-1",
          closeButton:
            "!rounded-full !bg-white dark:!bg-slate-900 !border !border-slate-200 dark:!border-slate-800 !text-slate-400 dark:!text-slate-500 hover:!text-blue-600 hover:!border-blue-300 !h-5 !w-5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
