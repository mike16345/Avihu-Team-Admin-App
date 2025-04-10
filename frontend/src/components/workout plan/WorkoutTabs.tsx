import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import React from "react";

interface WorkoutTabsProps {
  workoutPlan: React.ReactNode;
  cardioPlan: React.ReactNode;
}

const WorkoutTabs: React.FC<WorkoutTabsProps> = ({ workoutPlan, cardioPlan }) => {
  return (
    <Tabs defaultValue="workout" dir="rtl">
      <TabsList>
        <TabsTrigger value="workout">אימונים</TabsTrigger>
        <TabsTrigger value="cardio">אירובי</TabsTrigger>
      </TabsList>
      <TabsContent value="cardio">{cardioPlan}</TabsContent>
      <TabsContent value="workout">{workoutPlan}</TabsContent>
    </Tabs>
  );
};

export default WorkoutTabs;
