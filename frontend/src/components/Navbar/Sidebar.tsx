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

type LinkProps = {
  to: string;
  linkName: string;
  icon: ReactNode;
};

export const Sidebar = () => {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const links: LinkProps[] = [
    {
      to: "/",
      linkName: "בית",
      icon: <FaHome size={24} />,
    },
    {
      to: "/users",
      linkName: "משתמשים",
      icon: <FaUser size={24} />,
    },
    {
      to: "/blogs",
      linkName: "בלוגים",
      icon: <FaEdit size={24} />,
    },
    {
      to: "/dietPlans",
      linkName: "תפריטים",
      icon: <PiNotepadFill size={24} />,
    },
    {
      to: "/workoutPlans",
      linkName: "תוכנית אימון",
      icon: <GiBiceps size={24} />,
    },
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
                    key={link.linkName}
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
        <SheetContent dir="rtl" side="right" className=" sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium p-4">
            {links.map((link) => {
              return (
                <Link
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
        </SheetContent>
      </Sheet>
    </>
  );
};
