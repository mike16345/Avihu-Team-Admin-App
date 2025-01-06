export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dietaryType?: string[];
  password?: string;
  dateJoined: Date;
  dateFinished: Date;
  planType: string;
  remindIn: number;
  isChecked: boolean;
  checkInAt: number;
  hasAccess: boolean;
}

export interface ISession extends Document {
  _id: string;
  userId: string;
  type: "login";
  data?: any; // Additional session-specific data
  createdAt: Date;
  updatedAt: Date;
}
