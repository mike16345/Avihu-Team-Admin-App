export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dietaryType?: string[];
  password?: string;
  dateJoined?: Date;
  dateFinished: Date;
  planType: string;
  remindIn: number;
}
