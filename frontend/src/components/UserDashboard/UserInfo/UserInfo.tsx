import { IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { FC } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import BasicUserDetails from "./BasicUserDetails";

interface UserInfoProps {
  user: IUser;
}

const links = [
  {
    label: "תוכנית אימון",
    path: "/workout-plans/",
    icon: <FaPencilAlt size={12} />,
  },
  {
    label: "תפריט תזונה",
    path: "/diet-plans/",
    icon: <FaPencilAlt size={12} />,
  },
  {
    label: "עריכת משתמש",
    path: "/users/edit/",
    icon: <FaPencilAlt size={12} />,
  },
];

const UserInfo: FC<UserInfoProps> = ({ user }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:justify-between">
      <div className="flex flex-col gap-1">
        <BasicUserDetails user={user} />
        <h2 className="text-lg text-muted-foreground font-bold flex items-center gap-2 ">
          תחילת ליווי:
          <p className="font-normal">{DateUtils.formatDate(user?.dateJoined!, "DD/MM/YYYY")}</p>
        </h2>
        <h2 className="text-lg text-muted-foreground font-bold flex items-center gap-2 ">
          סיום ליווי:
          <p className="font-normal">{DateUtils.formatDate(user?.dateFinished!, "DD/MM/YYYY")}</p>
        </h2>
      </div>
      <ul className="flex flex-col sm:text-sm sm:w-fit w-full">
        {links.map((link) => {
          return (
            <Link
              className="flex items-center justify-between sm:w-40 hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
              to={link.path + user._id}
            >
              <p>{link.label}</p>
              {link.icon}
            </Link>
          );
        })}
      </ul>
    </div>
  );
};

export default UserInfo;
