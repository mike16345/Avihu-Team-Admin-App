import type { AccountStatus, IUser } from "@/interfaces/IUser";
import CustomSelect from "@/components/ui/CustomSelect";
import DateUtils from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { FaArrowRight, FaCalendarCheck, FaCalendarDays } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa6";

import { STATUS_COLORS } from "./userDashboardStatus";
import { UserAvatar } from "@/components/users/UserAvatar";

interface UserDashboardHeaderProps {
  user?: IUser;
  initials: string;
  planType: string;
  status: AccountStatus;
  isPending: boolean;
  onBack: () => void;
  onPlanTypeChange: (planType: string) => void;
  onStatusChange: (status: AccountStatus) => void;
}

const PLAN_TYPE_OPTIONS = [
  { name: "חיטוב", value: "חיטוב" },
  { name: "מסה", value: "מסה" },
];

const STATUS_OPTIONS: { name: string; value: AccountStatus }[] = [
  { name: "פעיל", value: "active" },
  { name: "משתמש", value: "user" },
  { name: "הקפאה", value: "frozen" },
  { name: "כבוי", value: "disabled" },
];

export function UserDashboardHeader({
  user,
  initials,
  planType,
  status,
  isPending,
  onBack,
  onPlanTypeChange,
  onStatusChange,
}: UserDashboardHeaderProps) {
  const statusColors = STATUS_COLORS[status];
  const dateJoined = user?.dateJoined ? DateUtils.formatDate(user.dateJoined, "DD/MM/YYYY") : "—";
  const dateFinished = user?.dateFinished
    ? DateUtils.formatDate(user.dateFinished, "DD/MM/YYYY")
    : "—";
  const whatsappNumber = (user?.phone || "").replace(/\D/g, "").replace(/^0/, "972");

  return (
    <>
      <button
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400"
      >
        <FaArrowRight size={11} />
        <span>חזרה לרשימת המתאמנים</span>
      </button>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="absolute inset-y-0 right-0 w-1.5 bg-blue-400" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              user={user}
              showImage
              className="flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-400
              text-2xl
              font-bold
              text-white
              ring-4
              ring-white"
            />
            <div className="flex flex-col gap-1">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  לקוח
                </p>
                <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                  {user?.firstName} {user?.lastName}
                </h2>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FaCalendarDays size={12} className="text-blue-500" />
                  <span className="font-semibold">תחילת ליווי:</span>
                  <span className="text-slate-500 dark:text-slate-400">{dateJoined}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FaCalendarCheck size={12} className="text-indigo-500" />
                  <span className="font-semibold">סיום ליווי:</span>
                  <span className="text-slate-500 dark:text-slate-400">{dateFinished}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-end">
            {user?.phone && (
              <div className="flex w-full flex-col gap-1 sm:w-auto">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  צור קשר
                </label>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`שלח הודעה ב-WhatsApp ל-${user.firstName ?? "מתאמן"}`}
                  title="פתח שיחת WhatsApp"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <FaWhatsapp size={16} className="text-emerald-600 dark:text-emerald-300" />
                  WhatsApp
                </a>
              </div>
            )}

            <div className="flex w-full flex-col gap-1 sm:min-w-[170px] sm:w-auto">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                סוג תוכנית
              </label>
              <CustomSelect
                items={PLAN_TYPE_OPTIONS}
                selectedValue={planType}
                onValueChange={onPlanTypeChange}
                disabled={isPending}
                placeholder="בחר סוג"
                className="h-10 rounded-xl border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="flex w-full flex-col gap-1 sm:min-w-[170px] sm:w-auto">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                סטטוס
              </label>
              <CustomSelect
                items={STATUS_OPTIONS}
                selectedValue={status}
                onValueChange={(nextValue) => onStatusChange(nextValue as AccountStatus)}
                disabled={isPending}
                startAdornment={
                  <span
                    className={cn("block h-2.5 w-2.5 rounded-full shadow-sm", statusColors.dot)}
                  />
                }
                className={cn(
                  "h-10 rounded-xl border py-2 text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-blue-200",
                  statusColors.border,
                  statusColors.bg,
                  statusColors.text
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
