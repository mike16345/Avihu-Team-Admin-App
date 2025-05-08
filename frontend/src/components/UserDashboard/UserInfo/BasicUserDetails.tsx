import { IUser } from "@/interfaces/IUser";
import { FC } from "react";

const BasicUserDetails: FC<{ user: IUser }> = ({ user }) => {
  return (
    <div className="w-fit">
      <h1 className="text-2xl font-bold flex items-center gap-2 ">
        לקוח:
        <span className="font-normal">{(user && `${user.firstName}  ${user.lastName}`) || ""}</span>
      </h1>
      <h2 className="text-lg text-muted-foreground font-bold flex items-center gap-2 ">
        סוג תוכנית:
        <p className="font-normal">{user?.planType}</p>
      </h2>
    </div>
  );
};

export default BasicUserDetails;
