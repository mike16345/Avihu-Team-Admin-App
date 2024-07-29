import { Link } from "react-router-dom";
import { ModeToggle } from "../theme/mode-toggle";
import { FaEdit, FaHome, FaUser } from "react-icons/fa";
import { ReactNode } from "react";
import { PiNotepadFill } from "react-icons/pi";
import { GiBiceps } from "react-icons/gi";

type LinkProps = {
  to: string;
  linkName: string;
  icon: ReactNode;
};
export const Sidebar = () => {
  const links: LinkProps[] = [
    {
      to: "/",
      linkName: "בית",
      icon: <FaHome />,
    },
    {
      to: "/users",
      linkName: "משתמשים",
      icon: <FaUser />,
    },
    {
      to: "/blogs",
      linkName: "בלוגים",
      icon: <FaEdit />,
    },
    {
      to: "/users",
      linkName: "לקוחות",
      icon: <FaUser />,
    },

    {
      to: "/dietPlans",
      linkName: "תפריטים",
      icon: <PiNotepadFill />,
    },
    {
      to: "/workoutPlans",
      linkName: "תוכנית אימון",
      icon: <GiBiceps />,
    },
  ];

  return (
    <div className=" size-full flex flex-col gap-2 text-secondary-foreground">
      <div className="flex items-center justify-between p-2 border-b-2">
        <h1 className="text-xl font-medium">אביהו בושרי</h1>
        <ModeToggle />
      </div>

      <div className="flex flex-col items-center gap-2 px-3">
        {links.map((link) => {
          return (
            <Link
              key={link.linkName}
              className="w-full flex items-center px-2 py-1 gap-3 text-xl hover:bg-primary hover:text-secondary rounded"
              to={link.to}
            >
              {link.icon}
              <p>{link.linkName}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
