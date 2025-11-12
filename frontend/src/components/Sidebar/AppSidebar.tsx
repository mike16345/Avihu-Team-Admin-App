import { Home, BicepsFlexed, LucideIcon, User, Edit, SquareMenu, User2, Inbox } from "lucide-react";
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
import { Link, useLocation } from "react-router-dom";
import LogoutButton from "../Navbar/LogoutButton";
import { ModeToggle } from "../theme/mode-toggle";
import { useUsersStore } from "@/store/userStore";
import { userFullName } from "@/lib/utils";

type LinkProps = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type SidebarItem = {
  title: string;
  icon: LucideIcon;
  url?: string;
  children?: LinkProps[];
};

const items: SidebarItem[] = [
  {
    url: "/",
    title: "בית",
    icon: Home,
  },
  {
    title: "לקוחות",
    icon: User,
    children: [
      {
        url: "/users",
        title: "לקוחות",
        icon: User,
      },
      {
        url: "/leads",
        title: "לידים",
        icon: Inbox,
      },
    ],
  },
  {
    url: "/blogs",
    title: "מאמרים",
    icon: Edit,
  },
  {
    url: "/dietPlans",
    title: "תפריטים",
    icon: SquareMenu,
  },
  {
    url: "/workoutPlans",
    title: "תוכנית אימון",
    icon: BicepsFlexed,
  },
];

const SidebarItems = () => {
  const location = useLocation();

  return items.map((item) => {
    const hasChildren = Boolean(item.children?.length);
    const isActive = hasChildren
      ? item.children?.some((child) => child.url === location.pathname)
      : location.pathname === item.url;

    if (!hasChildren && item.url) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive}>
            <Link
              className={`w-full rounded-full  ${
                isActive && " text-secondary bg-secondary-foreground"
              } `}
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
        <SidebarMenuButton isActive={Boolean(isActive)}>
          <div className="flex items-center gap-2">
            <item.icon />
            <span>{item.title}</span>
          </div>
        </SidebarMenuButton>
        <SidebarMenuSub>
          {item.children?.map((child) => {
            const childActive = location.pathname === child.url;
            return (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton asChild isActive={childActive}>
                  <Link
                    className={`flex items-center gap-2 ${
                      childActive && " text-secondary bg-secondary-foreground"
                    }`}
                    to={child.url}
                  >
                    {child.icon ? <child.icon /> : null}
                    <span>{child.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </SidebarMenuItem>
    );
  });
};

const Header = () => {
  const currentUser = useUsersStore((state) => state.currentUser);

  return (
    <>
      {currentUser && (
        <SidebarHeader>
          <div className="flex items-center gap-2 text-lg font-semibold ">
            <User2 size={20} />
            <span>{userFullName(currentUser)}</span>
          </div>
        </SidebarHeader>
      )}
    </>
  );
};

export function AppSidebar() {
  return (
    <Sidebar side="right">
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
      <SidebarFooter className="flex flex-row items-center">
        <div className="flex-1">
          <LogoutButton />
        </div>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
