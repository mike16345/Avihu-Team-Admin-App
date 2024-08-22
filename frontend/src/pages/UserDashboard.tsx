import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import Loader from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link, useLocation, useParams } from "react-router-dom";

export const UserDashboard = () => {
  const user = useLocation().state;
  const { getUser } = useUsersApi();
  const { id } = useParams();

  const [currentUser, setCurrentUser] = useState<IUser | null>(user);
  const [isLoading, setIsLoading] = useState(false);

  console.log("user", user);
  useEffect(() => {
    if (!id || currentUser) return;

    setIsLoading(true);
    getUser(id)
      .then((user) => setCurrentUser(user))
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader size="large" />;

  return (
    <div className="size-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 xs:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold flex items-center gap-2 ">
            לקוח:
            <span className="font-normal">
              {(currentUser && `${currentUser.firstName}  ${currentUser.lastName}`) || ""}
            </span>
          </h1>
          <h2 className="text-lg text-muted-foreground font-bold flex items-center gap-2 ">
            סוג תוכנית:
            <p className="font-normal">{currentUser?.planType}</p>
          </h2>
          <h2 className="text-lg text-muted-foreground font-bold flex items-center gap-2 ">
            תחילת ליווי:
            <p className="font-normal">
              {DateUtils.formatDate(currentUser?.dateJoined!, "DD/MM/YYYY")}
            </p>
          </h2>
          <h2 className="text-lg text-muted-foreground font-bold flex items-center gap-2 ">
            סיום ליווי:
            <p className="font-normal">
              {DateUtils.formatDate(currentUser?.dateFinished!, "DD/MM/YYYY")}
            </p>
          </h2>
        </div>
        <ul className="flex flex-col text-sm xs:w-fit w-full">
          <Link
            className=" flex items-center justify-between xs:w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md "
            to={"/workout-plans/" + id}
          >
            <p>תוכנית אימון</p>
            <FaPencilAlt size={12} />
          </Link>
          <Link
            className="flex items-center  justify-between xs:w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/diet-plans/" + id}
          >
            תפריט תזונה
            <FaPencilAlt size={12} />
          </Link>
          <Link
            className=" flex items-center justify-between xs:w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md "
            to={"/users/edit/" + id}
          >
            <p>עריכת משתמש</p>
            <FaPencilAlt size={12} />
          </Link>
        </ul>
      </div>
      <div>
        <Tabs dir="rtl" defaultValue="מעקב שקילה" className="w-full">
          <TabsList>
            <TabsTrigger value="מעקב שקילה">מעקב שקילה</TabsTrigger>
            <TabsTrigger value="מעקב אימון">מעקב אימון</TabsTrigger>
          </TabsList>
          <TabsContent value="מעקב שקילה">
            <WeightProgression />
          </TabsContent>
          <TabsContent value="מעקב אימון">
            <WorkoutProgression />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
