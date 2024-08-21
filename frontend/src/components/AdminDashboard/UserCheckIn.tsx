import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { Checkbox } from "../ui/checkbox";

const tempUsers = [
  {
    _id: "1a2b3c",
    firstName: "Emily",
    lastName: "Johnson",
    isChecked: true,
  },
  {
    _id: "4d5e6f",
    firstName: "Michael",
    lastName: "Smith",
    isChecked: false,
  },
  {
    _id: "7g8h9i",
    firstName: "Sarah",
    lastName: "Williams",
    isChecked: true,
  },
  {
    _id: "10j11k",
    firstName: "David",
    lastName: "Brown",
    isChecked: false,
  },
  {
    _id: "12l13m",
    firstName: "Jessica",
    lastName: "Jones",
    isChecked: true,
  },
  {
    _id: "14n15o",
    firstName: "Daniel",
    lastName: "Garcia",
    isChecked: false,
  },
  {
    _id: "16p17q",
    firstName: "Ashley",
    lastName: "Martinez",
    isChecked: true,
  },
  {
    _id: "18r19s",
    firstName: "Christopher",
    lastName: "Rodriguez",
    isChecked: false,
  },
  {
    _id: "20t21u",
    firstName: "Amanda",
    lastName: "Lopez",
    isChecked: true,
  },
  {
    _id: "22v23w",
    firstName: "Matthew",
    lastName: "Wilson",
    isChecked: false,
  },
];

const UserCheckIn = () => {
  const [users, setUsers] = useState<UsersCheckIn[]>(tempUsers);

  const handleCheckChange = (val: boolean, id: string) => {
    const newUsers = users.map((user) => (user._id === id ? { ...user, isChecked: val } : user));

    setUsers(newUsers);
  };

  return (
    <Card dir="rtl" className="w-[40%] shadow-md py-5">
      <CardHeader>
        <CardTitle>לקוחות לבדיקה</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[40vh] overflow-y-scroll">
        {users.map((user) => (
          <div key={user._id} className="w-full flex justify-between items-center border-b-2 p-5">
            <div className="flex gap-5">
              <h2>{user.firstName}</h2>
              <h2>{user.lastName}</h2>
            </div>
            <Checkbox
              onCheckedChange={(val) => handleCheckChange(val, user._id)}
              checked={user.isChecked}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserCheckIn;
