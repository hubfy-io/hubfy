import { useState } from "react";
import {
  House,
  BookOpen,
  Users,
  FolderOpen,
  Settings,
  ShoppingBag,
  CreditCard,
  Receipt,
  Palette,
  Plug,
  Shield,
  Mail,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  icon: React.ComponentType;
  labelKey: string;
  end?: boolean;
}

const mainItems: NavItem[] = [
  { to: "/admin", icon: House, labelKey: "nav.home", end: true },
  { to: "/admin/orders", icon: Receipt, labelKey: "nav.orders" },
  { to: "/admin/customers", icon: Users, labelKey: "nav.customers" },
  { to: "/admin/products", icon: ShoppingBag, labelKey: "nav.products" },
  { to: "/admin/checkouts", icon: CreditCard, labelKey: "nav.checkouts" },
];

const workspaceItems: NavItem[] = [
  { to: "/admin/assets", icon: FolderOpen, labelKey: "nav.myFiles" },
  { to: "/admin/courses", icon: BookOpen, labelKey: "nav.courses" },
  { to: "/admin/integrations", icon: Plug, labelKey: "nav.integrations" },
  { to: "/admin/settings", icon: Settings, labelKey: "nav.settings" },
];

export function NavMain() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const renderItems = (items: NavItem[]) =>
    items.map((item) => {
      const label = t(item.labelKey);
      return (
        <SidebarMenuItem key={item.labelKey}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.to, item.end)}
            tooltip={label}
          >
            <NavLink to={item.to} end={item.end} onClick={closeMobile}>
              <item.icon />
              <span>{label}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  const emailActive = isActive("/admin/email");

  const [emailOpen, setEmailOpen] = useState(true);

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>{renderItems(mainItems)}</SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>{t("nav.marketing")}</SidebarGroupLabel>
        <SidebarMenu>
          <Collapsible open={emailOpen} onOpenChange={setEmailOpen} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={t("nav.email")} isActive={emailActive}>
                  <Mail />
                  <span>{t("nav.email")}</span>
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/admin/email/broadcasts")}
                    >
                      <NavLink to="/admin/email/broadcasts" onClick={closeMobile}>
                        <span>{t("nav.emailBroadcasts")}</span>
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActive("/admin/email/contacts")}
                    >
                      <NavLink to="/admin/email/contacts" onClick={closeMobile}>
                        <span>{t("nav.emailContacts")}</span>
                      </NavLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/admin/onboardings")}
              tooltip={t("nav.onboardings")}
            >
              <NavLink to="/admin/onboardings" onClick={closeMobile}>
                <ClipboardList />
                <span>{t("nav.onboardings")}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/admin/design")}
              tooltip={t("nav.design")}
            >
              <NavLink to="/admin/design" onClick={closeMobile}>
                <Palette />
                <span>{t("nav.design")}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>{t("workspace.label")}</SidebarGroupLabel>
        <SidebarMenu>{renderItems(workspaceItems)}</SidebarMenu>
      </SidebarGroup>

      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Hubfy</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Superadmin">
                <NavLink to="/superadmin/dashboard" onClick={closeMobile}>
                  <Shield />
                  <span>Superadmin</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}
