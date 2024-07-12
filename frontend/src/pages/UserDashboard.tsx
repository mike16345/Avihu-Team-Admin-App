import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "react-router-dom";

export const UserDashboard = () => {
  const { id } = useParams();

  return (
    <div className="size-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">אביהו בושרי</h1>
        <ul className="flex flex-col text-sm ">
          <Link
            className=" hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/diet-plans/" + id}
          >
            עריכה תפריט
          </Link>
          <Link
            className="  hover:bg-secondary font-bold px-2 py-0.5 rounded-md"
            to={"/workout-plans/" + id}
          >
            עריכה תוכנית אימון
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
