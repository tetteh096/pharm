import type { CSSProperties } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { DashboardHeader } from "@/components/dashboard/Header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"

// Private staff area — never index any dashboard route.
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="dashboard-shell min-h-svh w-full bg-background text-foreground">
          <SidebarProvider
            className="w-full min-h-svh"
            style={
              {
                /* Default 3rem is too tight for dashboard icons */
                "--sidebar-width-icon": "4.75rem",
              } as CSSProperties
            }
          >
            <DashboardSidebar />
            <SidebarInset className="dashboard-inset bg-background">
              <DashboardHeader />
              <div className="dashboard-content-area flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 xl:px-10">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster position="top-right" richColors closeButton />
        </div>
      </TooltipProvider>
    </AuthProvider>
  )
}
