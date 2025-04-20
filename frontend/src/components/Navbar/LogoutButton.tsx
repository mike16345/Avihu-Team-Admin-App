import { Button } from "../ui/button";
import { BiExit } from "react-icons/bi";
import { FC } from "react";
import useAuth from "@/hooks/Authentication/useAuth";

const LogoutButton: FC = () => {
  const { logout } = useAuth();

  return (
    <Button className="w-full flex items-center gap-2" onClick={logout} variant={"outline"}>
      <span>יציאה</span>
      <BiExit />
    </Button>
  );
};

export default LogoutButton;
