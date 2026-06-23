/**
 * LoginPage — gradient background + centered card layout.
 * The form itself lives in <LoginForm/>; this page is just the
 * wrapping presentation: subtle radial gradient backdrop, decorative
 * blobs, and a footer credit.
 */
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div
      data-testid="login-page"
      dir="rtl"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-3xl"
      />

      {/* Form */}
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
      </div>

      {/* Footer credit */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 dark:text-slate-600">
        Elevate Coach © {new Date().getFullYear()}
      </p>
    </div>
  );
}
