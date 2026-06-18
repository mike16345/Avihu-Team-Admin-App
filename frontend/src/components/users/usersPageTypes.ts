export type StatusFilter =
  | "הכל"
  | "פעיל"
  | "משתמשים"
  | "הקפאה"
  | "מסתיים בקרוב"
  | "ללא תאריך סיום";

export type UsersStats = {
  active: number;
  endingSoon: number;
  frozen: number;
  inOnboarding: number;
  total: number;
};
