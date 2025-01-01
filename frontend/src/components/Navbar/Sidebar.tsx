import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "../theme/mode-toggle";
import { FaEdit, FaHome, FaUser } from "react-icons/fa";
import { ReactNode, useState } from "react";
import { PiNotepadFill } from "react-icons/pi";
import { GiBiceps } from "react-icons/gi";
import { CustomTooltip } from "../ui/custom-tooltip";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import { PanelLeft } from "lucide-react";
import LogoutButton from "./LogoutButton";
import useAuth from "@/hooks/Authentication/useAuth";

type LinkProps = {
  to: string;
  linkName: string;
  icon: ReactNode;
};

export const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const links: LinkProps[] = [
    {
      to: "/",
      linkName: "בית",
      icon: <FaHome className="text-yellow-600 hover:text-yellow-500" size={24} />, // Warm, welcoming color
    },
    {
      to: "/users",
      linkName: "משתמשים",
      icon: <FaUser className="text-blue-600 hover:text-blue-400" size={24} />, // Professional blue
    },
    {
      to: "/blogs",
      linkName: "בלוגים",
      icon: <FaEdit className="text-green-600 hover:text-green-400" size={24} />, // Creative green
    },
    {
      to: "/dietPlans",
      linkName: "תפריטים",
      icon: <PiNotepadFill className="text-purple-600 hover:text-purple-400" size={24} />, // Organized purple
    },
    {
      to: "/workoutPlans",
      linkName: "תוכנית אימון",
      icon: <GiBiceps className="text-amber-700 hover:text-amber-500" size={24} />, // Human skin tone
    },
    // {
    //   to: "/test",
    //   linkName: "Test",
    //   icon: <GiBiceps className="text-amber-700 hover:text-amber-500" size={24} />, // Human skin tone
    // },
  ];

  return (
    <>
      <aside className="inset-y-0 right-0 z-10 hidden w-14 flex-col border-l bg-secondary h-full  sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          {links.map((link) => {
            return (
              <CustomTooltip
                key={link.linkName}
                side="left"
                tooltipContent={link.linkName}
                tooltipTrigger={
                  <Link
                    className={`w-full flex items-center justify-center size-9 px-2 py-1 gap-3 text-xl rounded-full  ${
                      location.pathname == link.to && " text-secondary bg-secondary-foreground"
                    } `}
                    to={link.to}
                  >
                    {link.icon}
                  </Link>
                }
              />
            );
          })}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
          <LogoutButton onLogout={logout} />
          <ModeToggle />
        </nav>
      </aside>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden m-2">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          dir="rtl"
          side="right"
          className=" sm:max-w-xs flex flex-col justify-between "
        >
          <nav className="grid gap-6 text-lg font-medium ">
            {links.map((link) => {
              return (
                <Link
                  key={link.linkName}
                  to={link.to}
                  onClick={() => setIsSheetOpen(false)}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  {link.icon}
                  {link.linkName}
                </Link>
              );
            })}
          </nav>
          <nav className=" flex items-center p-3 gap-4 ">
            <LogoutButton onLogout={logout} />
            <ModeToggle />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};
