export interface UsersCheckIn {
  _id: string;
  firstName: string;
  lastName: string;
  isChecked: boolean;
}

export interface UsersWithoutPlans {
  _id: string;
  firstName: string;
  lastName: string;
}
