import { UserPlan } from "@/enums/User";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  planType: UserPlan;
}
