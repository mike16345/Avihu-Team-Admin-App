import { Button } from "@/components/ui/button";
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
import { useState } from "react";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors({
        ...errors,
        email: "אנא הכנס מייל תקין.",
      });
      return;
    }

    console.log({ email, password });

    setErrors({});
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">כניסה</CardTitle>
        <CardDescription>אנא הכנס מייל וסיסמה כדי להתחבר.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">מייל</Label>
          <Input
            id="email"
            type="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="m@example.com"
            required
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            placeholder="סיסמה"
            id="password"
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
