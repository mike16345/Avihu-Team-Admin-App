/**
 * AppSidebar — auto-hide sidebar (redesign 2026-06-03).
 *
 * Behavior:
 *  - The full sidebar is hidden off-screen by default (right side, RTL).
 *  - A thin invisible "hover zone" sits flush against the right edge.
 *  - Moving the mouse close to the right edge slides the sidebar in.
 *  - When the mouse leaves both the hover zone and the sidebar, it slides
 *    back out. There's a small dismissal delay so a quick stray cursor
 *    doesn't make it flicker.
 *  - A persistent small chevron at the right edge hints to the user that
 *    something is there.
 *
 * Visuals match the rest of the redesigned admin panel:
 *  - Heebo, slate-200/80 borders, white card, blue accents, rounded items.
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

const SIDEBAR_WIDTH = 272; // px — matches `w-72` for the visible drawer
const HOVER_TRIGGER_WIDTH = 14; // px — thin invisible strip on the right edge
const CLOSE_DELAY_MS = 200; // small grace period before re-hiding

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
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon
        size={17}
        className={
          active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700"
        }
        strokeWidth={2.2}
      />
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
    <nav className="flex flex-col gap-2">
      {visibleGroups.map((group, gIdx) => (
        <React.Fragment key={gIdx}>
          {gIdx > 0 && <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />}
          <ul className="flex flex-col gap-0.5">
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

              // Group with children (collapsible). Not used in the current
              // config but kept for future extensibility.
              return (
                <li key={item.title}>
                  <details open={isActive} className="group rounded-xl">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-900">
                      <span className="flex items-center gap-3">
                        <item.icon
                          size={17}
                          className="text-slate-400 dark:text-slate-500"
                          strokeWidth={2.2}
                        />
                        <span>{item.title}</span>
                      </span>
                      <ChevronDown
                        size={14}
                        className="text-slate-400 dark:text-slate-500 transition-transform group-open:rotate-180"
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
  // For "did the user pin it open via click" — future enhancement; for now,
  // pure hover is sufficient.
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

  // Close on Escape, as a courtesy.
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

      {/* Subtle visual hint — a thin handle on the edge */}
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
        className={`fixed right-0 top-0 z-50 flex h-screen flex-col border-l border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        {/* Header */}
        {user && (
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
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
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  מערכת ניהול
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Avihu Team</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגור תפריט"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronLeft size={16} />
            </button>
          </header>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarItems />
        </div>

        {/* User footer */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 border-t border-slate-100 dark:border-slate-800 px-4 py-3 text-right transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-amber-900 shadow-sm">
                  {((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
                <LuChevronsUpDown className="text-slate-400 dark:text-slate-500" />
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
