import type { AccountStatus, IStatusHistoryEntry, IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";

export const STATUS_LABEL: Record<AccountStatus, string> = {
  active: "פעיל",
  user: "משתמש",
  disabled: "כבוי",
  frozen: "הקפאה",
};

export const STATUS_DESCRIPTION: Record<AccountStatus, string> = {
  active: "מתאמן פעיל — יש גישה מלאה לאפליקציה",
  user: "משתמש רשום — יש גישה לאפליקציה",
  disabled: "חסום — לא יוכל להתחבר לאפליקציה",
  frozen: "הקפאה זמנית — שומר על גישה לאפליקציה, מוסתר מרשימות מעקב",
};

export const STATUS_COLORS: Record<
  AccountStatus,
  { border: string; bg: string; text: string; dot: string }
> = {
  active: {
    border: "border-emerald-200 dark:border-emerald-900/60",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  user: {
    border: "border-blue-200 dark:border-blue-900/60",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  disabled: {
    border: "border-red-200 dark:border-red-900/60",
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  frozen: {
    border: "border-cyan-200 dark:border-cyan-900/60",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
};

export const getInitials = (firstName?: string, lastName?: string) => {
  const firstInitial = firstName?.[0] || "";
  const lastInitial = lastName?.[0] || "";
  return (firstInitial + lastInitial).toUpperCase() || "?";
};

export const getStoredBaseStatus = (user: IUser): AccountStatus => {
  if (user.accountStatus) return user.accountStatus;

  return user.hasAccess === false ? "disabled" : "active";
};

export const getDaysRemaining = (dateFinished?: Date | string | null) => {
  if (!dateFinished) return null;

  return Math.max(
    0,
    Math.ceil((new Date(dateFinished).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
};

export const getStatusPillClassName = (status: AccountStatus) => {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "user") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  }
  if (status === "frozen") {
    return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300";
  }
  return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
};

export const getStatusModalTitle = (fromStatus: AccountStatus, toStatus: AccountStatus) => {
  if (toStatus === "disabled") return "⚠️ אישור חסימת מתאמן";
  if (fromStatus === "disabled") return "✅ הפעלת מתאמן";
  if (toStatus === "frozen") return "❄️ אישור הקפאת מתאמן";

  return "שינוי סטטוס";
};

export const getStatusModalBodyClassName = (toStatus: AccountStatus) => {
  if (toStatus === "disabled") {
    return "border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300";
  }

  if (toStatus === "frozen") {
    return "border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300";
  }

  return "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-800";
};

export const formatMonthsAndDays = (totalDays?: number): string => {
  if (typeof totalDays !== "number" || totalDays <= 0) return "";
  if (totalDays < 30) return `${totalDays} ${totalDays === 1 ? "יום" : "ימים"}`;

  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  const monthsText = `${months} ${months === 1 ? "חודש" : "חודשים"}`;

  if (days === 0) return monthsText;

  const daysText = `${days} ${days === 1 ? "יום" : "ימים"}`;

  return `${monthsText} ו-${daysText}`;
};

export const describeSystemEntry = (entry: IStatusHistoryEntry): string => {
  const dateLabel = DateUtils.formatDate(new Date(entry.at), "DD/MM/YYYY");

  if (entry.toStatus === "frozen") {
    const remainText = formatMonthsAndDays(entry.frozenDaysRemaining);

    return `הוקפא בתאריך ${dateLabel}${remainText ? ` — נשארו ${remainText} לליווי` : ""}`;
  }

  if (entry.fromStatus === "frozen") {
    const addedText = formatMonthsAndDays(entry.daysAdded);
    const fromLabel = STATUS_LABEL[entry.fromStatus];
    const toLabel = STATUS_LABEL[entry.toStatus];

    return `שוחרר מ${fromLabel} ל${toLabel} בתאריך ${dateLabel}${addedText ? ` — נוספו ${addedText} לתום הליווי` : ""}`;
  }

  return `סטטוס שונה מ-${STATUS_LABEL[entry.fromStatus]} ל-${STATUS_LABEL[entry.toStatus]} בתאריך ${dateLabel}`;
};
