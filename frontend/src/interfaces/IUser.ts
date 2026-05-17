export interface IBaseUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subTrainerId?: string;
  dietaryType?: string[];
  dateFinished: Date;
  planType: string;
  remindIn: number;
}

export interface IUser extends IBaseUser {
  _id?: string;
  dateJoined: Date;
  isChecked: boolean;
  checkInAt: number;
  hasAccess: boolean;
  onboardingCompleted: boolean;
}

export interface IUserPost extends IBaseUser {}
