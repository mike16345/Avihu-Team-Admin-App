import * as Sentry from "@sentry/react";
import type { PropsWithChildren } from "react";
import AppErrorFallback from "./AppErrorFallback";

const AppErrorBoundary = ({ children }: PropsWithChildren) => {
  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setTag("error_boundary", "app-root");
      }}
      fallback={({ error, eventId, resetError }) => (
        <AppErrorFallback
          error={error}
          eventId={eventId}
          resetError={resetError}
        />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default AppErrorBoundary;
