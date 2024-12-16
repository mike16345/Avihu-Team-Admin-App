import { IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { FC } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import BasicUserDetails from "./BasicUserDetails";

interface UserInfoProps {
  user: IUser;
}

const UserInfo: FC<UserInfoProps> = ({ user }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 xs:justify-between">
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
      <ul className="flex flex-col text-sm xs:w-fit w-full">
        <Link
          className=" flex items-center justify-between xs:w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md "
          to={"/workout-plans/" + user._id}
        >
          <p>תוכנית אימון</p>
          <FaPencilAlt size={12} />
        </Link>
        <Link
          className="flex items-center  justify-between xs:w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
          to={"/diet-plans/" + user._id}
        >
          תפריט תזונה
          <FaPencilAlt size={12} />
        </Link>
        <Link
          className=" flex items-center justify-between xs:w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md "
          to={"/users/edit/" + user._id}
          
        >
          <p>עריכת משתמש</p>
          <FaPencilAlt size={12} />
        </Link>
      </ul>
    </div>
  );
};

export default UserInfo;
