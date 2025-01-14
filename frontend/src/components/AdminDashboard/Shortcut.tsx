import React, { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutProps {
  icon: ReactElement<any, any>;
  actionName: string;
  navLink: string;
}

const Shortcut: React.FC<ShortcutProps> = ({ icon, actionName, navLink }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex p-2 justify-between items-center bg-accent h-14 sm:h-16 w-full rounded-full cursor-pointer hover:opacity-70"
      onClick={() => navigate(navLink)}
    >
      <p className="font-bold px-4 text-lg">{actionName}</p>
      <div className="bg-background rounded-full h-full w-12 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
};

export default Shortcut;
