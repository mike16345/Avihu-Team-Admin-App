import { WeightProgression } from "@/components/UserDashboard/WeightProgression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "react-router-dom";

export const UserDashboard = () => {
  const { id } = useParams();

  return (
    <div className="size-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">אביהו בושרי</h1>
        <ul className="flex flex-col text-sm ">
          <Link className=" hover:underline" to={"/diet-plans/" + id}>
            עריכה תפריט
          </Link>
          <Link className=" hover:underline" to={"/workout-plans/" + id}>
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
          <TabsContent value="מעקב אימון">מעקב אימון</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
