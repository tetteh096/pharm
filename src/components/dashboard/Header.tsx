"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, ChevronDown, Moon, Sun, UserCog } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

import { getMyProfileSnapshot } from "@/app/actions/profile"
import { resolveDashboardPage } from "@/data/dashboard-nav"
import { canAccessAccountSettings } from "@/lib/dashboard-rbac"
import { DashboardHeaderSearch } from "@/components/dashboard/DashboardHeaderSearch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  PHARMACIST: "Pharmacist",
  STAFF: "Staff",
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { data: session, update } = useSession()
  const [profileImage, setProfileImage] = React.useState<string | null | undefined>(
    session?.user?.image ?? null
  )

  const user = session?.user
  const displayName = user?.name ?? "User"
  const role = user?.role ?? "STAFF"
  const showAccountSettings = canAccessAccountSettings(role)
  const avatarSrc = profileImage ?? user?.image ?? null
  const page = resolveDashboardPage(pathname)

  React.useEffect(() => {
    let cancelled = false
    getMyProfileSnapshot()
      .then((snap) => {
        if (cancelled) return
        setProfileImage(snap.image)
        if (snap.image !== session?.user?.image) {
          void update({ user: { image: snap.image } })
        }
      })
      .catch(() => {
        /* keep session fallback */
      })
    return () => {
      cancelled = true
    }
  }, [pathname, session?.user?.image, update])

  return (
    <header className="dashboard-header sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-3 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="h-9 w-9 shrink-0" />
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight md:hidden">
            {page.title}
          </p>
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-sm text-muted-foreground">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-semibold">{page.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="hidden flex-1 justify-center px-2 sm:flex">
        <DashboardHeaderSearch />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="sm:hidden">
          <DashboardHeaderSearch compact />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto gap-2 rounded-full py-1 pl-1 pr-2",
                "hover:bg-muted/80"
              )}
            >
              <Avatar size="lg" className="ring-2 ring-border">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-600 text-xs font-bold text-white">
                  {initialsFromName(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[8rem] truncate text-left lg:block">
                <span className="block text-sm font-semibold leading-tight">{displayName}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {ROLE_LABELS[role]}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar size="lg" className="ring-2 ring-border">
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-600 text-xs font-bold text-white">
                    {initialsFromName(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {showAccountSettings ? (
              <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/account">
                    <UserCog className="mr-2 h-4 w-4" />
                    Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/signin" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
