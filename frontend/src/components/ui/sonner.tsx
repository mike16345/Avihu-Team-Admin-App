import { useTheme } from "next-themes";
import { Toaster as Sonner, useSonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const ToastTestIds = () => {
  const { toasts } = useSonner();
  const hasSuccess = toasts.some((toast) => toast.type === "success");
  const hasError = toasts.some((toast) => toast.type === "error");

  return (
    <div aria-hidden="true" className="sr-only">
      {hasSuccess && <span data-testid="toast-success" />}
      {hasError && <span data-testid="alert-error" />}
    </div>
  );
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
      <ToastTestIds />
    </>
  );
};

export { Toaster };
