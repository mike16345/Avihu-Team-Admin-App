import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AuthProviderWrapper from "./hooks/Authentication/AuthProviderWrapper.tsx";
import queryClient from "./QueryClient/queryClient.ts";
import persister from "./QueryClient/queryPersister.ts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: persister }}>
        <AuthProviderWrapper>
          <App />
        </AuthProviderWrapper>
        <Toaster dir="rtl" richColors position="bottom-left" />
        {/* <ReactQueryDevtools client={queryClient} /> */}
      </PersistQueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);
