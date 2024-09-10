import AnalyticsCard from "@/components/AdminDashboard/AnalyticsCard";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import GenericCarousel from "@/components/ui/GenericCarousel";
import React from "react";

const AdminDashboard = () => {
  return (
    <div className="size-full">
      <h1>admin page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <UserCheckIn />
        <div className="px-5">
          <GenericCarousel
            carouselItems={[
              <AnalyticsCard title="לקוחות ללא תוכנית אימון" dataKey="workoutPlan" />,
              <AnalyticsCard title="לקוחות ללא תפריט תזונה" dataKey="dietPlan" />,
              <AnalyticsCard title="לקוחות שמסיימים תהליך החודש" dataKey="expiringUsers" />,
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
