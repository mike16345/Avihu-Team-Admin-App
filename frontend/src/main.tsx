import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProviderWrapper from "./hooks/Authentication/AuthProviderWrapper.tsx";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProviderWrapper>
          <App />
        </AuthProviderWrapper>
        <Toaster dir="rtl" richColors position="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);
