import AnalyticsCard from "@/components/AdminDashboard/AnalyticsCard";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import GenericCarousel from "@/components/ui/GenericCarousel";
import React from "react";
const analyticsList = [
  { firstName: "John", lastName: "Doe", navLink: "/dashboard/john" },
  { firstName: "Jane", lastName: "Smith", navLink: "/dashboard/jane" },
  { firstName: "Michael", lastName: "Johnson", navLink: "/dashboard/michael" },
  { firstName: "Emily", lastName: "Brown", navLink: "/dashboard/emily" },
  { firstName: "David", lastName: "Williams", navLink: "/dashboard/david" },
  { firstName: "Sarah", lastName: "Jones", navLink: "/dashboard/sarah" },
  { firstName: "Robert", lastName: "Garcia", navLink: "/dashboard/robert" },
  { firstName: "Olivia", lastName: "Miller", navLink: "/dashboard/olivia" },
  { firstName: "James", lastName: "Martinez", navLink: "/dashboard/james" },
  { firstName: "Sophia", lastName: "Davis", navLink: "/dashboard/sophia" },
];

const AdminDashboard = () => {
  return (
    <div className="size-full">
      <h1>admin page</h1>
      {/* <UserCheckIn /> */}
      <GenericCarousel
        carouselItems={[
          <AnalyticsCard title="testing" data={analyticsList} />,
          <AnalyticsCard title="testing" data={analyticsList} />,
        ]}
      />
    </div>
  );
};

export default AdminDashboard;
