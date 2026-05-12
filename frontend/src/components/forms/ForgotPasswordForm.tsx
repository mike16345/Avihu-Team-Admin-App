import { useMemo, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import {
  changePasswordWithResetSession,
  requestPasswordResetOtp,
  validatePasswordResetOtp,
} from "@/services/authApi";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomButton from "@/components/ui/CustomButton";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

type ForgotPasswordStep = "email" | "otp" | "password";

type ForgotPasswordErrors = {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
};

const validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const normalizeEmail = (email: string) => email.toLowerCase().trim();

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? error?.data?.message ?? fallback;

const isExpiredResetCodeError = (error: any) => {
  const status = error?.status ?? error?.response?.status;
  const message = String(getErrorMessage(error, ""));

  if (status === 410 || status === 440) {
    return true;
  }

  return /expired|otp.*expir|code.*expir|session.*expir|פג|פגה|תוקף/i.test(message);
};

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [normalizedEmail, setNormalizedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});

  const stepDescription = useMemo(() => {
    switch (step) {
      case "otp":
        return `שלחנו קוד אימות בן 6 ספרות אל ${normalizedEmail}. הזינו אותו כדי להמשיך.`;
      case "password":
        return "הגדירו סיסמה חדשה כדי להשלים את איפוס החשבון.";
      case "email":
      default:
        return "הזינו את כתובת המייל ונשלח אליה קוד אימות בן 6 ספרות.";
    }
  }, [normalizedEmail, step]);

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setNormalizedEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setSessionId("");
    setErrors({});
    setIsLoading(false);
  };

  const resetToOtpStep = () => {
    setStep(normalizedEmail ? "otp" : "email");
    setOtp("");
    setSessionId("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const handleBackToLogin = () => {
    resetForm();
    onBackToLogin();
  };

  const handleSendOtp = async () => {
    const nextEmail = normalizeEmail(email);

    if (!validateEmail(nextEmail)) {
      setErrors((current) => ({ ...current, email: "אנא הזינו כתובת מייל תקינה." }));
      return;
    }

    try {
      setIsLoading(true);
      await requestPasswordResetOtp(nextEmail);
      setEmail(nextEmail);
      setNormalizedEmail(nextEmail);
      setErrors({});
      setStep("otp");
      toast.success("קוד האימות נשלח למייל.");
    } catch (error) {
      toast.error(getErrorMessage(error, "שליחת קוד האימות נכשלה."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (otp.length !== 6) {
      setErrors((current) => ({ ...current, otp: "הזינו קוד אימות בן 6 ספרות." }));
      return;
    }

    try {
      setIsLoading(true);
      const response = await validatePasswordResetOtp(normalizedEmail, otp);
      const nextSessionId = response.data?.changePasswordSessionId;

      if (!nextSessionId) {
        throw new Error("Missing reset session");
      }

      setSessionId(nextSessionId);
      setErrors({});
      setStep("password");
    } catch (error) {
      if (isExpiredResetCodeError(error)) {
        resetToOtpStep();
        setErrors((current) => ({
          ...current,
          otp: "תוקף הקוד פג. שלחו קוד חדש והזינו אותו שוב.",
        }));
        toast.error("תוקף קוד האימות פג. שלחו קוד חדש כדי להמשיך.");
        return;
      }

      setErrors((current) => ({ ...current, otp: "קוד האימות שהוזן אינו תקין." }));
      toast.error(getErrorMessage(error, "אימות הקוד נכשל."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!normalizedEmail) {
      return;
    }

    try {
      setIsLoading(true);
      await requestPasswordResetOtp(normalizedEmail);
      toast.success("קוד אימות חדש נשלח.");
    } catch (error) {
      toast.error(getErrorMessage(error, "שליחת קוד האימות נכשלה."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    let passwordWasChanged = false;

    if (!password) {
      setErrors((current) => ({ ...current, password: "יש להזין סיסמה חדשה." }));
      return;
    }

    if (confirmPassword !== password) {
      setErrors((current) => ({
        ...current,
        confirmPassword: "אימות הסיסמה חייב להיות זהה לסיסמה החדשה.",
      }));
      return;
    }

    try {
      setIsLoading(true);
      await changePasswordWithResetSession(normalizedEmail, password, sessionId);
      passwordWasChanged = true;
    } catch (error) {
      if (isExpiredResetCodeError(error)) {
        resetToOtpStep();
        setErrors((current) => ({
          ...current,
          otp: "תוקף הקוד פג. שלחו קוד חדש והזינו אותו שוב.",
        }));
        toast.error("תוקף קוד האימות פג. שלחו קוד חדש כדי להמשיך.");
        return;
      }

      toast.error(getErrorMessage(error, "עדכון הסיסמה נכשל."));
    } finally {
      setIsLoading(false);
    }

    if (passwordWasChanged) {
      toast.success("הסיסמה עודכנה בהצלחה.");
      handleBackToLogin();
    }
  };

  return (
    <>
      <CardHeader className="text-right">
        <CardTitle className="text-2xl">איפוס סיסמה</CardTitle>
        <CardDescription>{stepDescription}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 text-right">
        {step === "email" ? (
          <div className="grid gap-2">
            <Label htmlFor="forgot-password-email">מייל</Label>
            <Input
              id="forgot-password-email"
              data-testid="forgot-password-email"
              type="email"
              value={email}
              dir="ltr"
              autoComplete="email"
              placeholder="m@example.com"
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
            />
            {errors.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
          </div>
        ) : null}

        {step === "otp" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="forgot-password-otp">קוד אימות</Label>
              <div dir="ltr" className="flex justify-center">
                <InputOTP
                  id="forgot-password-otp"
                  data-testid="forgot-password-otp"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={(value) => {
                    
                    setOtp(value);
                    setErrors((current) => ({ ...current, otp: undefined }));
                  }}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.otp ? <p className="text-sm text-red-500">{errors.otp}</p> : null}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>לא קיבלתם את הקוד?</span>
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 font-semibold"
                data-testid="forgot-password-resend"
                disabled={isLoading}
                onClick={handleResendOtp}
              >
                שלחו שוב
              </Button>
            </div>
          </div>
        ) : null}

        {step === "password" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="forgot-password-new-password">סיסמה חדשה</Label>
              <Input
                id="forgot-password-new-password"
                data-testid="forgot-password-password"
                type="password"
                value={password}
                autoComplete="new-password"
                placeholder="סיסמה חדשה"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
              />
              {errors.password ? <p className="text-sm text-red-500">{errors.password}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="forgot-password-confirm-password">אימות סיסמה</Label>
              <Input
                id="forgot-password-confirm-password"
                data-testid="forgot-password-confirm-password"
                type="password"
                value={confirmPassword}
                autoComplete="new-password"
                placeholder="אימות סיסמה"
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrors((current) => ({ ...current, confirmPassword: undefined }));
                }}
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-2">
        {step === "email" ? (
          <CustomButton
            title="שלח קוד אימות"
            type="button"
            isLoading={isLoading}
            data-testid="forgot-password-send-otp"
            className="w-full font-bold"
            onClick={handleSendOtp}
          />
        ) : null}

        {step === "otp" ? (
          <CustomButton
            title="אמת קוד"
            type="button"
            isLoading={isLoading}
            data-testid="forgot-password-verify-otp"
            className="w-full font-bold"
            onClick={handleValidateOtp}
          />
        ) : null}

        {step === "password" ? (
          <CustomButton
            title="עדכן סיסמה"
            type="button"
            isLoading={isLoading}
            data-testid="forgot-password-submit"
            className="w-full font-bold"
            onClick={handleChangePassword}
          />
        ) : null}

        <Button
          type="button"
          variant="link"
          className="w-full"
          data-testid="forgot-password-back"
          disabled={isLoading}
          onClick={handleBackToLogin}
        >
          חזרה להתחברות
        </Button>
      </CardFooter>
    </>
  );
}
