import React from "react";
import {
  BarChart3,
  BicepsFlexed,
  ChevronDown,
  Clipboard,
  Edit,
  Home,
  Inbox,
  LucideIcon,
  SquareMenu,
  User,
  User2,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useUsersStore } from "@/store/userStore";
import { userFullName } from "@/lib/utils";
import LogoutButton from "../Navbar/LogoutButton";
import { ModeToggle } from "../theme/mode-toggle";
import { Separator } from "../ui/separator";
import { type AppRouteAccessKey, canAccessRoute, normalizeAppRole } from "@/routes/routeAccess";
import { LuChevronsUpDown } from "react-icons/lu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    {
      url: "/",
      title: "בית",
      icon: Home,
      accessKey: "home",
    },
    {
      url: "/trainer-analytics",
      title: "לוח בקרה",
      icon: BarChart3,
      accessKey: "trainerAnalytics",
    },
    {
      url: "/trainers",
      title: "מאמנים",
      icon: Users,
      accessKey: "trainers",
    },
    {
      url: "/sub-trainers",
      title: "תת-מאמנים",
      icon: User2,
      accessKey: "subTrainers",
    },
    {
      url: "/users",
      title: "משתמשים",
      icon: User,
      accessKey: "users",
    },
  ],
  [
    {
      url: "/blogs",
      title: "מאמרים",
      icon: Edit,
      accessKey: "blogs",
    },
    {
      url: "/dietPlans",
      title: "תפריטים",
      icon: SquareMenu,
      accessKey: "dietPlans",
    },
    {
      url: "/workoutPlans",
      title: "תוכנית אימון",
      icon: BicepsFlexed,
      accessKey: "workoutPlans",
    },
  ],
  [
    {
      url: "/leads",
      title: "לידים",
      icon: Inbox,
      accessKey: "leads",
    },
    {
      url: "/form-builder",
      title: "שאלונים",
      icon: Clipboard,
      accessKey: "formBuilder",
    },
  ],
];

const SidebarItems = () => {
  const location = useLocation();
  const currentUser = useUsersStore((state) => state.currentUser);
  const role = normalizeAppRole(currentUser?.role);

  const createSidebarTestId = (url?: string) =>
    url
      ? `sidebar-link-${
          url === "/" ? "home" : url.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")
        }`
      : undefined;

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
    <>
      {visibleGroups.map((group, index) => (
        <React.Fragment key={index}>
          {!!index && <Separator className="my-4" />}
          {group.map((item) => {
            const visibleChildren =
              item.children?.filter((child) => canAccessRoute(role, child.accessKey)) ?? [];
            const hasChildren = visibleChildren.length > 0;
            const isActive = hasChildren
              ? visibleChildren.some((child) => child.url === location.pathname)
              : location.pathname === item.url;

            if (!hasChildren && item.url) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      data-testid={createSidebarTestId(item.url)}
                      className={`w-full rounded-full ${
                        isActive && "bg-secondary-foreground text-secondary"
                      }`}
                      to={item.url}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible defaultOpen={Boolean(isActive)} className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between" asChild>
                    <SidebarMenuButton isActive={Boolean(isActive)}>
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown className="mr-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {visibleChildren.map((child) => {
                        const childActive = location.pathname === child.url;

                        return (
                          <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton asChild isActive={childActive}>
                              <Link
                                data-testid={createSidebarTestId(child.url)}
                                className={`flex items-center gap-2 ${
                                  childActive && "bg-secondary text-secondary"
                                }`}
                                to={child.url}
                              >
                                <child.icon />
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

const Header = () => {
  const currentUser = useUsersStore((state) => state.currentUser);

  return (
    <>
      {currentUser && (
        <SidebarHeader className=" border-b border-accented bg-background py-3">
          <div className="flex items-center gap-5 text-lg font-semibold">
            <img
              className="h-10 w-10 rounded-lg shadow-lg border border-muted"
              src="../public/images/app-logo.png"
              alt=""
            />
            <span>מערכת ניהול</span>
          </div>
        </SidebarHeader>
      )}
    </>
  );
};

export function AppSidebar() {
  const user = useUsersStore((state) => state.currentUser);

  return (
    <Sidebar side="right" data-testid="app-sidebar">
      <Header />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarFooter className="flex flex-row items-center border-t border-accented bg-background gap-3 py-4 cursor-pointer hover:bg-muted">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.firstName}&radius=50&size=36`}
              alt="avatar"
            />

            <div>
              <div className="text-sm ">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email.slice(0, 22).padStart(25, "...")}
              </div>
            </div>

            <div className="w-full flex justify-end text-accented">
              <LuChevronsUpDown />
            </div>
          </SidebarFooter>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex items-center flex-row gap-2">
            <div className="flex-1">
              <LogoutButton />
            </div>
            <ModeToggle />
          </div>
        </PopoverContent>
      </Popover>
    </Sidebar>
  );
}
