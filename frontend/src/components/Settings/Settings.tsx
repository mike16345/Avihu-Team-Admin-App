import { SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import useAuth from "@/hooks/Authentication/useAuth";

const Settings = () => {
  const { logout } = useAuth();

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size="icon">
          <SettingsIcon />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => logout()}>יציאה</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Settings;
