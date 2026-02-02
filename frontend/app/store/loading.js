export default function Loading() {
    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
            {/* Header Skeleton */}
            <section className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300 py-12 sm:py-16 md:py-20 lg:py-24">
                <div className="container-custom">
                    <div className="text-center mb-8 sm:mb-10 md:mb-12 flex flex-col items-center">
                        <div className="h-12 w-64 md:w-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse mb-6"></div>
                        <div className="h-6 w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border p-6 min-h-[140px]">
                                <div className="h-full flex flex-col justify-between animate-pulse">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Templates Grid Skeleton */}
            <section className="pt-10 sm:pt-14 md:pt-18 lg:pt-22 pb-6 sm:pb-8 md:pb-10">
                <div className="container-custom">
                    <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-2"></div>
                            <div className="h-5 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="card-interactive overflow-hidden h-full flex flex-col border border-gray-100 dark:border-dark-card-border bg-white dark:bg-dark-tertiary rounded-xl">
                                {/* Image Skeleton */}
                                <div className="h-48 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>

                                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                                    {/* Title Skeleton */}
                                    <div className="h-5 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded mb-3 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>

                                    {/* Description Skeleton */}
                                    <div className="space-y-2 mb-4">
                                        <div className="h-3 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                                        <div className="h-3 w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                                    </div>

                                    {/* Rating Skeleton */}
                                    <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded mb-4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>

                                    {/* Footer Skeleton */}
                                    <div className="mt-auto flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                                            <div className="h-3 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                                        </div>
                                        <div className="h-5 w-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
