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

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-lg mb-2">You are currently logged in as:</p>
        <code className="bg-red-100 px-2 py-1 rounded font-mono text-red-800 mb-4 text-xl">
          {session.user.email}
        </code>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 max-w-md w-full">
          <p className="mb-2 text-gray-600">Current Role:</p>
          <p className="text-2xl font-bold text-red-600 mb-6">{session.user.role}</p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              The Admin Panel requires the <strong>ADMIN</strong> role.
              If you have recently promoted this user, your session is stale.
            </p>
            <p className="font-semibold text-gray-900">
              Please Log Out and Log In again to refresh your permissions.
            </p>
            <a
              href="/account"
              className="inline-block w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-700 transition-colors"
            >
              Go to Account to Sign Out
            </a>
          </div>
        </div>
      </div>
    )
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
