export type SomeType = "some" | "type";

export type ApiResponse<T> = {
  data: T;
  message: string;
};

export type Option = {
  name: string;
  value: string;
};
