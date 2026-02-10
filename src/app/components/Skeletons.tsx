export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32 animate-pulse">
            {/* Header Skeleton */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700" />
                <div className="max-w-xl mx-auto relative z-10">
                    <div className="h-8 w-48 bg-white/20 rounded-lg mb-2" />
                    <div className="h-4 w-32 bg-white/10 rounded" />
                </div>
            </header>

            {/* Content Skeleton */}
            <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200">
                            <div className="h-4 w-16 bg-slate-200 rounded mb-3" />
                            <div className="h-8 w-24 bg-slate-300 rounded mb-2" />
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>

                {/* Notifications Skeleton */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200">
                    <div className="h-5 w-32 bg-slate-300 rounded mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loans List Skeleton */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-5 w-32 bg-slate-300 rounded" />
                        <div className="h-8 w-20 bg-slate-200 rounded-full" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border-2 border-slate-100 rounded-2xl">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 w-32 bg-slate-300 rounded" />
                                        <div className="h-3 w-24 bg-slate-200 rounded" />
                                    </div>
                                    <div className="h-6 w-20 bg-slate-200 rounded-full" />
                                </div>
                                <div className="h-3 w-40 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export function LoanDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-32 animate-pulse">
            {/* Header Skeleton */}
            <header className="relative overflow-hidden pt-8 pb-10 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700" />
                <div className="max-w-xl mx-auto relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full" />
                        <div className="h-6 w-40 bg-white/30 rounded" />
                    </div>
                </div>
            </header>

            {/* Content Skeleton */}
            <main className="max-w-xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
                {/* Amount Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
                    <div className="h-4 w-24 bg-slate-200 rounded mx-auto mb-3" />
                    <div className="h-12 w-48 bg-slate-300 rounded-lg mx-auto mb-4" />
                    <div className="h-8 w-32 bg-slate-100 rounded-full mx-auto" />
                </div>

                {/* Details Sections */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200">
                        <div className="h-5 w-32 bg-slate-300 rounded mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="flex justify-between items-center">
                                    <div className="h-4 w-24 bg-slate-200 rounded" />
                                    <div className="h-4 w-32 bg-slate-300 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

export function GroupsSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-32 animate-pulse">
            {/* Header Skeleton */}
            <header className="relative overflow-hidden pt-8 pb-12 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700" />
                <div className="max-w-xl mx-auto relative z-10 flex items-center justify-between">
                    <div>
                        <div className="h-8 w-32 bg-white/30 rounded mb-2" />
                        <div className="h-4 w-48 bg-white/20 rounded" />
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full" />
                </div>
            </header>

            {/* Groups List Skeleton */}
            <main className="max-w-xl mx-auto px-4 -mt-6 relative z-20 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 space-y-2">
                                <div className="h-6 w-40 bg-slate-300 rounded" />
                                <div className="h-3 w-24 bg-slate-200 rounded" />
                            </div>
                            <div className="w-12 h-12 bg-slate-100 rounded-full" />
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="w-8 h-8 bg-slate-200 rounded-full" />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
