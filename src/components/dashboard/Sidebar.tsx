"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  UserCog,
  PlusCircle,
  HeartPulse,
  Pill,
  ExternalLink,
  Building2,
  Calculator,
  Users,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/brand/BrandLogo"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

const collapsedIconBtn =
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:w-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&_svg]:size-5"

function collapsedNavTooltip(label: string) {
  return {
    children: label,
    sideOffset: 10,
    className:
      "border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-md",
  }
}

const navMain = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Accounting", url: "/dashboard/accounting", icon: Calculator },
  { title: "Inventory", url: "/dashboard/products", icon: Pill },
  { title: "Branches", url: "/dashboard/branches", icon: Building2 },
  { title: "Patients", url: "/dashboard/customers", icon: Users },
  { title: "Chronic care", url: "/dashboard/chronic", icon: HeartPulse },
  { title: "Consultations", url: "/dashboard/consultations", icon: MessageSquare },
  { title: "Health blog", url: "/dashboard/blog", icon: FileText },
  { title: "Staff", url: "/dashboard/users", icon: UserCog },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { toggleSidebar, state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="text-slate-200">
      {/* Header */}
      <SidebarHeader className="overflow-hidden px-3 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <Link
          href="/dashboard"
          title={isCollapsed ? "Enviro dashboard" : undefined}
          className="flex items-center gap-3 text-slate-200 hover:text-white group-data-[collapsible=icon]:justify-center"
        >
          <BrandLogo
            variant="icon"
            className="hidden h-11 w-11 shrink-0 rounded-xl bg-white/95 p-1.5 shadow-sm group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12"
          />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <BrandLogo variant="full" className="h-10 w-full max-w-[9.5rem]" />
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Staff Dashboard
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main nav */}
      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-2.5">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:gap-1.5">
              {navMain.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsedNavTooltip(item.title)}
                      className={cn(
                        collapsedIconBtn,
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white data-[active=true]:bg-sidebar-accent data-[active=true]:text-white [&_svg]:text-current"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Quick actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={collapsedNavTooltip("Add product")}
                  className={collapsedIconBtn}
                >
                  <Link href="/dashboard/products/new">
                    <PlusCircle className="text-emerald-400" />
                    <span className="font-medium text-emerald-400">Add product</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 py-3 group-data-[collapsible=icon]:px-2.5">
        <SidebarMenu className="group-data-[collapsible=icon]:gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={collapsedNavTooltip("Back to website")}
              className={cn(
                collapsedIconBtn,
                "text-slate-400 hover:bg-sidebar-accent hover:text-white [&_svg]:text-current"
              )}
            >
              <Link href="/">
                <ExternalLink />
                <span>Back to website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!isMobile && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={toggleSidebar}
                tooltip={collapsedNavTooltip(isCollapsed ? "Expand sidebar" : "Collapse sidebar")}
                className={cn(
                  collapsedIconBtn,
                  "text-slate-400 hover:bg-sidebar-accent hover:text-white [&_svg]:text-current"
                )}
              >
                {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
                <span>{isCollapsed ? "Expand" : "Collapse"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
