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
import { USER_TOKEN_STORAGE_KEY } from "@/constants/constants";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import useAuth from "@/hooks/Authentication/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import CustomButton from "../ui/CustomButton";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

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
  const { loginUser } = useUsersApi();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrors({
        ...errors,
        email: "אנא הכנס מייל תקין.",
      });
      return;
    }
    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      secureLocalStorage.setItem(USER_TOKEN_STORAGE_KEY, res.data);
      await login();
      navigate("/");

      setIsLoading(false);
      toast.success(`ברוך הבא ${res.data.data.user.firstName}`);
    } catch (err: any) {
      setIsLoading(false);
      console.log(err);
      toast.error(err.data.message);
    }

    setErrors({});
  };

  return (
    <Card className="w-full max-w-sm">
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
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
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
                className="absolute cursor-pointer inset-y-0 left-0 pl-3 flex items-center"
              >
                {isPasswordVisible ? <EyeOff /> : <Eye />}
              </span>
              <Input
                placeholder="סיסמה"
                name="password"
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                autoComplete="current-password"
                required
                className="pl-10"
              />
            </div>
            {errors.password && <p className="text-red-500">{errors.password}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <CustomButton
            title="כניסה"
            isLoading={isLoading}
            type="submit"
            className="w-full font-bold"
          />
        </CardFooter>
      </form>
    </Card>
  );
}
