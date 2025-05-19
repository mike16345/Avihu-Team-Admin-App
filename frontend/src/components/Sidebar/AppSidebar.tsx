import { Home, BicepsFlexed, LucideIcon, User, Edit, SquareMenu, User2 } from "lucide-react";
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

const items: LinkProps[] = [
  {
    url: "/",
    title: "בית",
    icon: Home,
  },
  {
    url: "/users",
    title: "משתמשים",
    icon: User,
  },
  {
    url: "/blogs",
    title: "שיעורים",
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

export function AppSidebar() {
  const currentUser = useUsersStore((state) => state.currentUser);
  const location = useLocation();

  return (
    <Sidebar side="right">
      {currentUser && (
        <SidebarHeader>
          <div className="flex items-center gap-2 text-lg font-semibold ">
            <User2 size={20} />
            <span>{userFullName(currentUser)}</span>
          </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={`w-full rounded-full  ${
                        location.pathname == item.url && " text-secondary bg-secondary-foreground"
                      } `}
                      to={item.url}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
