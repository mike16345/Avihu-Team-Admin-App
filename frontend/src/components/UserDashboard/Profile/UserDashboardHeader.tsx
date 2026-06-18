import type { AccountStatus, IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { FaArrowRight, FaCalendarCheck, FaCalendarDays, FaChevronDown } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa6";
import { STATUS_COLORS } from "./userDashboardStatus";

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
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600"
      >
        <FaArrowRight size={11} />
        <span>חזרה לרשימת המתאמנים</span>
      </button>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1.5 bg-blue-400" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-400 text-2xl font-bold text-white ring-4 ring-white">
              {initials}
            </div>
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

          <div className="flex items-center gap-3">
            {user?.phone && (
              <div className="flex flex-col gap-1">
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

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                סוג תוכנית
              </label>
              <div className="relative">
                <select
                  value={planType}
                  onChange={(event) => onPlanTypeChange(event.target.value)}
                  disabled={isPending}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pe-9 ps-4 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="" disabled>
                    בחר סוג
                  </option>
                  <option value="חיטוב">חיטוב</option>
                  <option value="מסה">מסה</option>
                </select>
                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                סטטוס
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => onStatusChange(event.target.value as AccountStatus)}
                  disabled={isPending}
                  className={cn(
                    "cursor-pointer appearance-none rounded-xl border py-2 pe-9 ps-9 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200",
                    statusColors.border,
                    statusColors.bg,
                    statusColors.text
                  )}
                >
                  <option value="active">פעיל</option>
                  <option value="user">משתמש</option>
                  <option value="frozen">הקפאה</option>
                  <option value="disabled">כבוי</option>
                </select>
                <span
                  className={cn(
                    "pointer-events-none absolute start-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full shadow-sm",
                    statusColors.dot
                  )}
                />
                <FaChevronDown
                  size={10}
                  className={cn(
                    "pointer-events-none absolute end-3 top-1/2 -translate-y-1/2",
                    statusColors.text
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
