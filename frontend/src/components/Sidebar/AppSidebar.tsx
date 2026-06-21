/**
 * AppSidebar — single expanding sidebar.
 *
 * Default state: narrow icon rail (76px) with logo + icons.
 * On hover anywhere on the rail, the rail itself smoothly expands to
 * 272px and the labels fade in beside each icon. Leaving collapses it
 * back. This is one continuous panel — not two stacked panels — so the
 * transition between collapsed and expanded feels natural.
 *
 * Layout note: the rail is `fixed` to the right edge. A sibling spacer
 * div takes 76px of layout width so main content doesn't shift when
 * the rail expands (the expansion overlays content, doesn't push it).
 */
import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BicepsFlexed,
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
import { UserAvatar } from "../users/UserAvatar";

type NavItem = {
  accessKey: AppRouteAccessKey;
  title: string;
  url: string;
  icon: LucideIcon;
};

/**
 * Three sidebar groups, separated by thin dividers:
 *  1. Daily work — used by every role (trainer / admin / owner alike).
 *  2. Leads.
 *  3. Management — admin / owner only. The `accessKey` filter inside
 *     `canAccessRoute()` hides items the current role isn't allowed
 *     to see, so a plain trainer never even sees group #3.
 *
 * Empty groups (after access filtering) collapse silently so the
 * separator above them doesn't render either.
 */
const sidebarGroups: NavItem[][] = [
  // Group 1 — Daily work
  [
    { url: "/", title: "בית", icon: Home, accessKey: "home" },
    { url: "/users", title: "לקוחות", icon: Users, accessKey: "users" },
    { url: "/blogs", title: "מאמרים", icon: Edit, accessKey: "blogs" },
    {
      url: "/workoutPlans",
      title: "תוכנית אימון",
      icon: BicepsFlexed,
      accessKey: "workoutPlans",
    },
    { url: "/dietPlans", title: "תפריט תזונה", icon: SquareMenu, accessKey: "dietPlans" },
    { url: "/form-builder", title: "שאלונים", icon: Clipboard, accessKey: "formBuilder" },
    { url: "/sub-trainers", title: "הצוות שלי", icon: UserCog, accessKey: "subTrainers" },
  ],
  // Group 2 — Leads
  [{ url: "/leads", title: "לידים", icon: Inbox, accessKey: "leads" }],
  // Group 3 — Management (admin / owner only)
  [
    {
      url: "/trainer-analytics",
      title: "לוח בקרה",
      icon: BarChart3,
      accessKey: "trainerAnalytics",
    },
    { url: "/trainers", title: "מאמנים", icon: User2, accessKey: "trainers" },
  ],
];

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 240;
const CLOSE_DELAY_MS = 200;

/**
 * Single nav link. The icon stays anchored to the right (in RTL),
 * and the label slides/fades in to its left when `expanded` is true.
 * `whitespace-nowrap` on the label prevents wrapping during the
 * expand animation.
 */
const NavLink: React.FC<{
  to: string;
  icon: LucideIcon;
  title: string;
  active: boolean;
  expanded: boolean;
  testId?: string;
}> = ({ to, icon: Icon, title, active, expanded, testId }) => (
  <Link
    to={to}
    data-testid={testId}
    aria-label={title}
    className={`group relative flex h-11 items-center gap-3 overflow-hidden rounded-2xl px-3 transition-all ${
      active
        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    }`}
  >
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      <Icon size={19} strokeWidth={2.1} />
    </span>
    <span
      className={`whitespace-nowrap text-sm font-semibold transition-opacity duration-200 ${
        expanded ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {title}
    </span>
  </Link>
);

export function AppSidebar() {
  const location = useLocation();
  const user = useUsersStore((state) => state.currentUser);
  const role = normalizeAppRole(user?.role);

  const [expanded, setExpanded] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => setExpanded(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => cancelClose(), []);

  // Escape collapses
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  if (!user) return null;

  // Filter each group; drop entirely empty groups so we don't render
  // dangling dividers.
  const visibleGroups = sidebarGroups
    .map((group) => group.filter((item) => canAccessRoute(role, item.accessKey)))
    .filter((group) => group.length > 0);

  return (
    <>
      {/* Spacer — reserves the collapsed width in the flex layout so the
          main content doesn't shift when the sidebar expands. */}
      <div style={{ width: COLLAPSED_WIDTH, minWidth: COLLAPSED_WIDTH }} aria-hidden />

      {/* The sidebar itself — fixed to the right edge, expands on hover. */}
      <aside
        dir="rtl"
        data-testid="app-sidebar"
        onMouseEnter={() => {
          cancelClose();
          setExpanded(true);
        }}
        onMouseLeave={scheduleClose}
        style={{
          fontFamily: "Heebo, system-ui, sans-serif",
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        }}
        className="fixed right-0 top-0 z-50 flex h-screen flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-[width] duration-300 ease-out"
      >
        {/* Header — logo + (label that fades in on expand) */}
        <Link
          to="/"
          aria-label="ראשי"
          className="flex h-24 shrink-0 items-center gap-2.5 overflow-hidden px-2"
        >
          <img
            src="/images/app-logo.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            alt="Elevate Coach"
            className="h-20 w-20 shrink-0 object-contain"
          />
          <span
            className={`flex flex-col whitespace-nowrap transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Elevate Coach
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              פאנל ניהול
            </span>
          </span>
        </Link>

        {/* Nav — grouped with thin dividers between groups */}
        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-3">
          {visibleGroups.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              {gIdx > 0 && (
                <div aria-hidden className="my-3 mx-1 h-px bg-slate-300 dark:bg-slate-600" />
              )}
              <ul className="flex flex-col gap-1">
                {group.map((item) => (
                  <li key={item.url}>
                    <NavLink
                      to={item.url}
                      icon={item.icon}
                      title={item.title}
                      active={location.pathname === item.url}
                      expanded={expanded}
                      testId={`sidebar-link-${
                        item.url === "/"
                          ? "home"
                          : item.url.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </React.Fragment>
          ))}
        </nav>

        {/* Footer — theme toggle + user row */}
        <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 px-3 py-3">
          {/* Theme */}
          <div className="flex h-12 items-center gap-3 overflow-hidden rounded-2xl px-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center">
              <ModeToggle />
            </span>
            <span
              className={`whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400 transition-opacity duration-200 ${
                expanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              מצב כהה
            </span>
          </div>

          {/* User popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="חשבון משתמש"
                className="flex h-12 items-center gap-3 overflow-hidden rounded-2xl px-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <UserAvatar
                  showImage
                  user={user}
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white shadow-md shadow-blue-600/30 ring-2 ring-white dark:ring-slate-900"
                />

                <span
                  className={`flex min-w-0 flex-col text-right whitespace-nowrap transition-opacity duration-200 ${
                    expanded ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {user.email}
                  </span>
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              dir="rtl"
              side="left"
              sideOffset={12}
              align="end"
              className="w-64 p-3"
              style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
            >
              <div className="mb-2 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserAvatar user={user} showImage />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <LogoutButton />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>
    </>
  );
}
