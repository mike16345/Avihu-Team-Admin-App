/**
 * AppSidebar — auto-hide drawer that matches the rest of the admin panel.
 *
 * Behavior:
 *  - Hidden off-screen by default on the right (RTL).
 *  - A thin invisible hover strip on the right edge slides it in.
 *  - Closes on mouse-leave (with a short grace period) or Escape.
 *  - A faint blue handle hints to the user that something is there.
 *
 * Visuals:
 *  - White surface + slate borders, Heebo font, blue accents.
 *  - Active item: rounded-full blue pill (iCount-inspired layout, kept
 *    in our existing palette).
 *  - All colour tokens hoisted into a single `T` object below so future
 *    tweaks live in one place.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BicepsFlexed,
  ChevronDown,
  ChevronLeft,
  Clipboard,
  Edit,
  Home,
  Inbox,
  LucideIcon,
  SquareMenu,
  User2,
  Users,
  UserCog,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUsersStore } from "@/store/userStore";
import LogoutButton from "../Navbar/LogoutButton";
import { ModeToggle } from "../theme/mode-toggle";
import { type AppRouteAccessKey, canAccessRoute, normalizeAppRole } from "@/routes/routeAccess";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LuChevronsUpDown } from "react-icons/lu";

type LinkProps = {
  accessKey: AppRouteAccessKey;
  title: string;
  url: string;
  icon: LucideIcon;
};

type SidebarItem = {
  title: string;
  icon: LucideIcon;
  url?: string;
  accessKey?: AppRouteAccessKey;
  children?: LinkProps[];
};

const sidebarGroups: SidebarItem[][] = [
  [
    { url: "/", title: "בית", icon: Home, accessKey: "home" },
    {
      url: "/trainer-analytics",
      title: "לוח בקרה",
      icon: BarChart3,
      accessKey: "trainerAnalytics",
    },
    { url: "/trainers", title: "מאמנים", icon: User2, accessKey: "trainers" },
    { url: "/sub-trainers", title: "הצוות שלי", icon: UserCog, accessKey: "subTrainers" },
    { url: "/users", title: "לקוחות", icon: Users, accessKey: "users" },
  ],
  [
    { url: "/blogs", title: "מאמרים", icon: Edit, accessKey: "blogs" },
    { url: "/dietPlans", title: "תפריטים", icon: SquareMenu, accessKey: "dietPlans" },
    {
      url: "/workoutPlans",
      title: "תוכנית אימון",
      icon: BicepsFlexed,
      accessKey: "workoutPlans",
    },
  ],
  [
    { url: "/leads", title: "לידים", icon: Inbox, accessKey: "leads" },
    { url: "/form-builder", title: "שאלונים", icon: Clipboard, accessKey: "formBuilder" },
  ],
];

const SIDEBAR_WIDTH = 272;
const HOVER_TRIGGER_WIDTH = 14;
const CLOSE_DELAY_MS = 200;

/**
 * Theme tokens — keeps our existing white/blue palette while adopting
 * the iCount-inspired layout (rounded-full pills for active items,
 * generous spacing). One central object so future colour tweaks land
 * in a single diff.
 */
const T = {
  surface: "bg-white",
  surfaceDark: "dark:bg-slate-900",
  border: "border-slate-200/80",
  borderSoft: "border-slate-100 dark:border-slate-800",
  textPrimary: "text-slate-900 dark:text-slate-100",
  textMuted: "text-slate-600 dark:text-slate-300",
  textSubtle: "text-slate-400 dark:text-slate-500",
  hoverItem: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900",
  activeItem: "bg-blue-600 text-white shadow-sm shadow-blue-600/20",
  iconInactive: "text-slate-400 dark:text-slate-500 group-hover:text-slate-700",
  iconActive: "text-white",
  divider: "bg-slate-100 dark:bg-slate-800",
};

const SidebarLink: React.FC<{
  to: string;
  icon: LucideIcon;
  title: string;
  active: boolean;
  testId?: string;
}> = ({ to, icon: Icon, title, active, testId }) => (
  <li>
    <Link
      to={to}
      data-testid={testId}
      className={`group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
        active ? T.activeItem : `${T.textMuted} ${T.hoverItem}`
      }`}
    >
      <Icon size={17} className={active ? T.iconActive : T.iconInactive} strokeWidth={2.2} />
      <span>{title}</span>
    </Link>
  </li>
);

const SidebarItems: React.FC = () => {
  const location = useLocation();
  const currentUser = useUsersStore((state) => state.currentUser);
  const role = normalizeAppRole(currentUser?.role);

  const visibleGroups = sidebarGroups
    .map((group) =>
      group.filter((item) => {
        if (item.children?.length) {
          return item.children.some((child) => canAccessRoute(role, child.accessKey));
        }
        return item.accessKey ? canAccessRoute(role, item.accessKey) : true;
      })
    )
    .filter((group) => group.length > 0);

  return (
    <nav className="flex flex-col gap-3">
      {visibleGroups.map((group, gIdx) => (
        <React.Fragment key={gIdx}>
          {gIdx > 0 && <div className={`my-1 h-px ${T.divider}`} />}
          <ul className="flex flex-col gap-1">
            {group.map((item) => {
              const visibleChildren =
                item.children?.filter((child) => canAccessRoute(role, child.accessKey)) ?? [];
              const hasChildren = visibleChildren.length > 0;
              const isActive = hasChildren
                ? visibleChildren.some((child) => child.url === location.pathname)
                : location.pathname === item.url;

              if (!hasChildren && item.url) {
                return (
                  <SidebarLink
                    key={item.title}
                    to={item.url}
                    icon={item.icon}
                    title={item.title}
                    active={isActive}
                    testId={`sidebar-link-${
                      item.url === "/"
                        ? "home"
                        : item.url.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")
                    }`}
                  />
                );
              }

              // Collapsible group with children — kept for future use.
              return (
                <li key={item.title}>
                  <details open={isActive} className="group rounded-full">
                    <summary
                      className={`flex cursor-pointer list-none items-center justify-between rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${T.textMuted} ${T.hoverItem}`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon size={17} className={T.iconInactive} strokeWidth={2.2} />
                        <span>{item.title}</span>
                      </span>
                      <ChevronDown
                        size={14}
                        className={`${T.textSubtle} transition-transform group-open:rotate-180`}
                      />
                    </summary>
                    <ul className="mt-1 flex flex-col gap-0.5 pr-7">
                      {visibleChildren.map((child) => {
                        const childActive = location.pathname === child.url;
                        return (
                          <SidebarLink
                            key={child.title}
                            to={child.url}
                            icon={child.icon}
                            title={child.title}
                            active={childActive}
                          />
                        );
                      })}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      ))}
    </nav>
  );
};

export function AppSidebar() {
  const user = useUsersStore((state) => state.currentUser);
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div dir="rtl" style={{ fontFamily: "Heebo, system-ui, sans-serif" }} data-testid="app-sidebar">
      {/* Invisible hover trigger glued to the right edge */}
      <div
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: HOVER_TRIGGER_WIDTH,
          zIndex: 40,
        }}
      />

      {/* Edge hint — emerald handle now to match the new accent */}
      <div
        aria-hidden
        className={`pointer-events-none fixed top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        style={{ right: 2, zIndex: 41 }}
      >
        <div className="flex h-16 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-blue-500 to-blue-700 shadow-sm" />
      </div>

      {/* The drawer itself */}
      <aside
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col ${T.surface} ${T.surfaceDark} border-l ${T.border} shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        {/* Header */}
        {user && (
          <header
            className={`flex items-center justify-between gap-3 border-b ${T.borderSoft} px-5 py-4`}
          >
            <div className="flex items-center gap-3">
              <img
                src="/images/app-logo.png"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                alt=""
                className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 object-cover shadow-sm"
              />
              <div>
                <p className={`text-base font-bold ${T.textPrimary}`}>מערכת ניהול</p>
                <p className={`text-[11px] ${T.textSubtle}`}>Avihu Team</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגור תפריט"
              className={`flex h-7 w-7 items-center justify-center rounded-full ${T.textMuted} transition-colors hover:bg-white/10 hover:text-white`}
            >
              <ChevronLeft size={16} />
            </button>
          </header>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarItems />
        </div>

        {/* User footer — emerald pill style like the reference's CTA */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`flex w-full items-center gap-3 border-t ${T.borderSoft} px-4 py-3 text-right transition-colors hover:bg-white/5`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-amber-900 shadow-sm">
                  {((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className={`truncate text-sm font-semibold ${T.textPrimary}`}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className={`truncate text-[11px] ${T.textMuted}`}>{user.email}</p>
                </div>
                <LuChevronsUpDown className={T.textMuted} />
              </button>
            </PopoverTrigger>
            <PopoverContent dir="rtl" className="w-56 p-2">
              <div className="flex flex-col gap-2">
                <LogoutButton />
                <ModeToggle />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </aside>
    </div>
  );
}
