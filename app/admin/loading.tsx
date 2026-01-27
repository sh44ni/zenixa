import { StatsSkeleton, AdminListSkeleton } from "@/components/admin/admin-skeletons"

export default function AdminLoading() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
                <div className="h-8 w-32 bg-[hsl(220,13%,91%)] rounded animate-pulse" />
                <div className="h-4 w-48 bg-[hsl(220,13%,91%)] rounded animate-pulse" />
            </div>
            <StatsSkeleton />
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-7 w-40 bg-[hsl(220,13%,91%)] rounded animate-pulse" />
                    <div className="h-5 w-20 bg-[hsl(220,13%,91%)] rounded animate-pulse" />
                </div>
                <AdminListSkeleton />
            </div>
        </div>
    )
}
