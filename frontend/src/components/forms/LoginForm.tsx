import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/Authentication/useAuth";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../ui/CustomButton";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginWithPassword } from "@/services/authApi";
import { Button } from "@/components/ui/button";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const description =
  "A simple login form with email and password. The submit button says 'Sign in'.";

const validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

type LoginFormErrors = {
  email?: string;
  password?: string;
};

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
      setErrors((current) => ({
        ...current,
        email: "אנא הכנס מייל תקין.",
      }));
      return;
    }

    setIsLoading(true);

    try {
      const session = await loginWithPassword(email, password);
      await login(session);
      navigate("/");
      toast.success(`ברוך הבא ${session.user.firstName ?? session.user.email}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.data?.message);
    } finally {
      setIsLoading(false);
    }

    setErrors({});
  };

  return (
    <Card className="w-full max-w-sm">
      {isForgotPassword ? (
        <ForgotPasswordForm onBackToLogin={() => setIsForgotPassword(false)} />
      ) : (
        <form onSubmit={handleSubmit} method="POST" action="#">
          <CardHeader>
            <CardTitle className="text-2xl">כניסה</CardTitle>
            <CardDescription>אנא הכנס מייל וסיסמה כדי להתחבר.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">מייל</Label>
              <Input
                name="email"
                id="email"
                data-testid="login-email"
                type="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="m@example.com"
                autoComplete="email"
                required
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <span
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  className="absolute inset-y-0 left-0 flex cursor-pointer items-center pl-3"
                >
                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                </span>
                <Input
                  placeholder="סיסמה"
                  name="password"
                  id="password"
                  data-testid="login-password"
                  type={isPasswordVisible ? "text" : "password"}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  autoComplete="current-password"
                  required
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-red-500">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                data-testid="forgot-password-trigger"
                className="h-auto px-0 font-semibold"
                onClick={() => setIsForgotPassword(true)}
              >
                שכחת סיסמה?
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <CustomButton
              title="כניסה"
              isLoading={isLoading}
              type="submit"
              data-testid="login-submit"
              className="w-full font-bold"
            />
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
