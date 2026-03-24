import { Button } from "@/components/ui/button";

type AppErrorFallbackProps = {
  error: unknown;
  eventId: string;
  resetError: () => void;
};

const AppErrorFallback = ({
  error,
  eventId,
  resetError,
}: AppErrorFallbackProps) => {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error interrupted the app.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          That&apos;s embarrassing.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This failure was caught by the app-level Sentry boundary. A future
          custom "Report issue" flow can attach to this fallback and use the
          Sentry event ID below.
        </p>
        <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium text-foreground">{errorMessage}</p>
          <p className="mt-2 break-all text-muted-foreground">Event ID: {eventId}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={resetError} variant="outline">
            Retry render
          </Button>
          <Button onClick={() => window.location.reload()}>Reload app</Button>
        </div>
      </div>
    </div>
  );
};

export default AppErrorFallback;
