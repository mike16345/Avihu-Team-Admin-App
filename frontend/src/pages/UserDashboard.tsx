import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsersApi } from "@/hooks/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const UserDashboard = () => {
  const { id } = useParams();
  const {getUser}=useUsersApi()

  const [user,setUser]=useState<IUser|null>(null)

  useEffect(()=>{
    if (!id) return 

    getUser(id)
    .then(res=>setUser(res))
    .catch(err=>console.log(err))

  },[])

  return (
    <div className="size-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user?`${user?.firstName} ${user?.lastName}`:``}</h1>
        <ul className="flex flex-col text-sm ">
          <Link
            className=" hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/users/edit/" + id}
          >
            עריכת משתמש
          </Link>
          <Link
            className=" hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/diet-plans/" + id}
          >
            עריכת תפריט
          </Link>
          <Link
            className="  hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/workout-plans/" + id}
          >
            עריכת תוכנית אימון
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
