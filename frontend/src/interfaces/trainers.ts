import { PaginationResult } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";

export type TrainerId = string;
export type SubTrainerId = string;

export const TRAINER_SUBSCRIPTION_PLANS = ["Pro", "בסיסי"] as const;
export const TRAINER_STATUSES = ["active", "inactive", "blocked"] as const;
export const TRAINER_SOURCES = [
  "פנייה קרה",
  "יוטיוב",
  "גוגל",
  "פייסבוק",
  "אינסטגרם",
  "פה לאוזן",
] as const;

export type TrainerSubscriptionPlan = (typeof TRAINER_SUBSCRIPTION_PLANS)[number];
export type TrainerStatus = (typeof TRAINER_STATUSES)[number];
export type TrainerSource = (typeof TRAINER_SOURCES)[number];
export type SubTrainerPosition = "מאמן" | "תזונאי" | "יועץ תזונה" | "אחר";
export type SubTrainerStatus = "active" | "inactive";

export type TrainerFilter = Record<string, unknown>;
export type TrainerSort = Record<string, unknown>;

export type TrainerPaginatedParams = {
  page?: number;
  limit?: number;
  query?: string | TrainerFilter;
  sort?: string | TrainerSort;
};

export type SubTrainerPaginatedParams = {
  page?: number;
  limit?: number;
  query?: string | TrainerFilter;
  sort?: string | TrainerSort;
};

export interface IBaseTrainer {
  fullName: string;
  email: string;
  phone: string;
}

export interface Trainer extends IBaseTrainer {
  _id: TrainerId;
  subscriptionPlan: TrainerSubscriptionPlan;
  clientLimit: number;
  subTrainerLimit: number;
  status: TrainerStatus;
  source: TrainerSource;
  videoLibraryAccess: boolean;
  userId?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubTrainer extends IBaseTrainer {
  _id: SubTrainerId;
  position: SubTrainerPosition;
  status: SubTrainerStatus;
  trainerId: TrainerId;
  userId?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PaginatedResponse<T> = PaginationResult<T>;

export type PaginatedTrainerRow = Trainer & {
  traineeCount: number;
  subTrainerCount: number;
};

export type PaginatedSubTrainerRow = SubTrainer & {
  traineeCount: number;
};

export type TrainerOverview = {
  trainees: {
    current: number;
  };
  subTrainers: {
    current: number;
  };
};

export type SubTrainerOverview = {
  trainees: {
    current: number;
  };
};

export type TrainerGetOneDTO = {
  trainer: Trainer;
  overview: TrainerOverview;
};

export type SubTrainerGetOneDTO = {
  subTrainer: SubTrainer;
  overview: SubTrainerOverview;
};

export type CreateTrainerBody = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  subscriptionPlan: TrainerSubscriptionPlan;
  clientLimit: number;
  subTrainerLimit: number;
  status: TrainerStatus;
  source: TrainerSource;
  videoLibraryAccess: boolean;
};

export type UpdateTrainerBody = {
  fullName: string;
  email: string;
  phone: string;
  subscriptionPlan: TrainerSubscriptionPlan;
  clientLimit: number;
  subTrainerLimit: number;
  status: TrainerStatus;
  source: TrainerSource;
  videoLibraryAccess: boolean;
  userId?: string;
  isDeleted?: boolean;
};

export type CreateSubTrainerBody = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  position: SubTrainerPosition;
  status: SubTrainerStatus;
  trainerId?: TrainerId;
};

export type UpdateSubTrainerBody = {
  fullName: string;
  email: string;
  phone: string;
  position: SubTrainerPosition;
  status: SubTrainerStatus;
  trainerId?: TrainerId;
  userId?: string;
  isDeleted?: boolean;
};

export type TrainersResponse = ApiResponse<Trainer[]>;
export type TrainerResponse = ApiResponse<Trainer>;
export type TrainerDeleteResponse = ApiResponse<Trainer | null>;
export type TrainerPaginatedResponse = ApiResponse<PaginatedResponse<PaginatedTrainerRow>>;
export type TrainerGetOneResponse = ApiResponse<TrainerGetOneDTO>;

export type SubTrainersResponse = ApiResponse<SubTrainer[]>;
export type SubTrainerResponse = ApiResponse<SubTrainer>;
export type SubTrainerDeleteResponse = ApiResponse<SubTrainer | null>;
export type SubTrainerPaginatedResponse = ApiResponse<PaginatedResponse<PaginatedSubTrainerRow>>;
export type SubTrainerGetOneResponse = ApiResponse<SubTrainerGetOneDTO>;
