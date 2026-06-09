/**
 * LoginForm — clean welcome card for the login screen.
 *
 * Visual refresh:
 *  - Logo + greeting on top
 *  - Generously-spaced inputs with icons
 *  - Show/hide password eye in the trailing edge
 *  - Solid blue primary button with subtle shadow
 *
 * Logic is unchanged — same `loginWithPassword` + `useAuth` flow.
 */
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAuth from "@/hooks/Authentication/useAuth";
import { loginWithPassword } from "@/services/authApi";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaCircleExclamation } from "react-icons/fa6";

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

type LoginFormErrors = { email?: string; password?: string };

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setErrors((current) => ({ ...current, email: "אנא הכנס מייל תקין." }));
      return;
    }

    setIsLoading(true);
    try {
      const session = await loginWithPassword(email, password);
      await login(session);
      navigate("/");
      toast.success(`ברוך הבא ${session.user.firstName ?? session.user.email}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.data?.message ?? "פרטי התחברות שגויים");
    } finally {
      setIsLoading(false);
    }

    setErrors({});
  };

  // Forgot-password sub-flow keeps its own card
  if (isForgotPassword) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-blue-900/5">
        <ForgotPasswordForm onBackToLogin={() => setIsForgotPassword(false)} />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-blue-900/10 dark:shadow-black/30 overflow-hidden"
    >
      {/* Logo strip */}
      <div className="flex flex-col items-center gap-1 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/60 to-transparent dark:from-blue-950/40 px-8 pt-8 pb-6">
        <img
          src="/images/app-logo.png"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          alt="Elevate Coach"
          className="h-32 w-32 object-contain -mb-1"
        />
        <p className="text-xl font-bold tracking-wide text-slate-900 dark:text-slate-100">
          Elevate <span className="text-blue-600 dark:text-blue-400">Coach</span>
        </p>
        <div className="text-center">
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            התחבר כדי להמשיך לפאנל הניהול
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} method="POST" action="#" className="flex flex-col gap-4 p-8">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            כתובת מייל
          </label>
          <div className="relative">
            <FaEnvelope
              size={13}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              name="email"
              id="email"
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              required
              dir="ltr"
              className={`h-11 w-full rounded-xl border bg-slate-50/60 dark:bg-slate-800/60 pr-9 pl-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 ${
                errors.email
                  ? "border-rose-300 dark:border-rose-800"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-400"
              }`}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <FaCircleExclamation size={10} />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              סיסמה
            </label>
            <button
              type="button"
              data-testid="forgot-password-trigger"
              onClick={() => setIsForgotPassword(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              שכחת סיסמה?
            </button>
          </div>
          <div className="relative">
            <FaLock
              size={13}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              name="password"
              id="password"
              data-testid="login-password"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className={`h-11 w-full rounded-xl border bg-slate-50/60 dark:bg-slate-800/60 pr-9 pl-10 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition-colors focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 ${
                errors.password
                  ? "border-rose-300 dark:border-rose-800"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              aria-label={isPasswordVisible ? "הסתר סיסמה" : "הצג סיסמה"}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {isPasswordVisible ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <FaCircleExclamation size={10} />
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit — Elevate Coach brand gradient */}
        <button
          type="submit"
          data-testid="login-submit"
          disabled={isLoading}
          className="brand-gradient brand-gradient-hover brand-glow mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              מתחבר...
            </>
          ) : (
            "כניסה"
          )}
        </button>

        {/* Help text */}
        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          הגישה למערכת מותרת למאמני Elevate Coach בלבד
        </p>
      </form>
    </div>
  );
}
