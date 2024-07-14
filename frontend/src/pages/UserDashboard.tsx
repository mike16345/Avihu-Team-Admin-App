import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsersApi } from "@/hooks/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link, useLocation, useParams } from "react-router-dom";

export const UserDashboard = () => {
  const user = useLocation().state;
  const { getUser } = useUsersApi();
  const { id } = useParams();

  const [currentUser, setCurrentUser] = useState<IUser | null>(user);

  useEffect(() => {
    if (!id || currentUser) return;

    getUser(id)
      .then((user) => setCurrentUser(user))
      .catch((error) => console.error(error));
  }, []);

  // TODO: Display plan type. 

  return (
    <div className="size-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold flex items-center gap-2 underline">
          {`לקוח: ${currentUser?.name || ""}`}
        </div>
        <ul className="flex flex-col text-sm ">
          <Link
            className=" flex items-center justify-between w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md "
            to={"/workout-plans/" + id}
          >
            <p>תוכנית אימון</p>
            <FaPencilAlt size={12} />
          </Link>
          <Link
            className="flex items-center  justify-between w-32 hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/diet-plans/" + id}
          >
            תפריט תזונה
            <FaPencilAlt size={12} />
          </Link>
        </ul>
      </div>
      <div className="">
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
