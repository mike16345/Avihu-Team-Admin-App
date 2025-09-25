import UserPlanTypes from "@/enums/UserPlanTypes";

export interface IBlog {
  title: string;
  content: string;
  planType?: UserPlanTypes;
  group?: string;
  imageUrl?: string;
  link?: string;
}

export interface IBlogResponse extends IBlog {
  _id: string;
}

export interface ILessonGroup {
  name: string;
}
