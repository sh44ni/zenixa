import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav"
import "./admin-styles.css"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Not logged in or not an admin - redirect to admin login
  if (!session?.user || !session.user.isAdmin) {
    redirect("/admin/login")
  }

  return (
    <div className="admin-panel admin-bg flex min-h-screen">
      {/* Sidebar - hidden on mobile */}
      <AdminSidebar />

      <main className="flex-1 min-h-screen min-w-0">
        {/* Top padding for mobile header, bottom padding for mobile nav */}
        <div className="pt-16 pb-24 lg:pt-0 lg:pb-0">
          <div className="p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Nav - only on mobile */}
      <AdminBottomNav />
    </div>
  )
}
