import { Skeleton } from "@/components/ui/skeleton"

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[hsl(220,13%,91%)] p-4 h-[110px] flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                    <div>
                        <Skeleton className="h-7 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function AdminListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[hsl(220,13%,91%)] p-4 flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                        <div className="flex items-center gap-2 pt-1">
                            <Skeleton className="h-3 w-12 rounded-full" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function AdminTableSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-[hsl(220,13%,91%)] overflow-hidden hidden lg:block">
            <div className="border-b border-[hsl(220,13%,91%)] p-4">
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 grid grid-cols-4 gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}
