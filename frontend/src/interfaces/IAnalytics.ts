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

export type DashboardMetric = {
  total: number;
  currentMonthAdded: number;
  previousMonthAdded: number;
  trendCount: number;
  trendPercentage: number;
};

export type DashboardSummaryResponse = {
  activeTrainers: DashboardMetric;
  joinedThisMonth: DashboardMetric & {
    breakdown: {
      trainers: number;
      users: number;
    };
  };
  appUsers: DashboardMetric;
};

export type GetDashboardSummaryApiResponse = {
  message?: string;
  data: DashboardSummaryResponse;
};

export type DashboardSourcesParams = {
  from: string;
  to: string;
};

export type TrainerSourceItem = {
  source: string;
  count: number;
  percentage: number;
};

export type DashboardSourcesResponse = {
  range: {
    from: string;
    to: string;
  };
  total: number;
  items: TrainerSourceItem[];
};

export type GetDashboardSourcesApiResponse = {
  message?: string;
  data: DashboardSourcesResponse;
};

export type DashboardJoinedByMonthParams = {
  year: number;
};

export type DashboardJoinedByMonthBucket = {
  month: number;
  trainers: number;
  users: number;
};

export type DashboardJoinedByMonthResponse = {
  year: number;
  buckets: DashboardJoinedByMonthBucket[];
};

export type GetDashboardJoinedByMonthApiResponse = {
  message?: string;
  data: DashboardJoinedByMonthResponse;
};

export type DashboardTrainerCloseToLimitItem = {
  _id: string;
  fullName: string;
  email: string;
  subscriptionPlan: string;
  clientLimit: number;
  traineeCount: number;
  utilizationPercentage: number;
};

export type DashboardCloseToLimitResponse = DashboardTrainerCloseToLimitItem[];

export type GetDashboardCloseToLimitApiResponse = {
  message?: string;
  data: DashboardCloseToLimitResponse;
};
