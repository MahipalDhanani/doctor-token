import React from 'react';

const TokenBoardSkeleton = () => {
    return (
        <div className="w-full px-4 py-8 max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="text-center mb-10">
                {/* Clinic Name */}
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-2/3 lg:w-1/2 mx-auto mb-3 animate-shimmer bg-[length:200%_100%]"></div>

                {/* Doctor Name */}
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/2 lg:w-1/3 mx-auto mb-2 animate-shimmer bg-[length:200%_100%]"></div>

                {/* Phone */}
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/3 lg:w-1/4 mx-auto mb-6 animate-shimmer bg-[length:200%_100%]"></div>

                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                    {/* Doctor Status Badge */}
                    <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-40 animate-shimmer bg-[length:200%_100%]"></div>

                    {/* Sound Control */}
                    <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-32 animate-shimmer bg-[length:200%_100%]"></div>

                    {/* Notification Button */}
                    <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-44 animate-shimmer bg-[length:200%_100%]"></div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Current Token & Actions */}
                <div className="lg:col-span-5 xl:col-span-4 order-1">
                    <div className="sticky top-8 space-y-6">
                        {/* Current Token Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                            <div className="text-center">
                                {/* "Now Serving" text */}
                                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 mx-auto mb-6 animate-shimmer bg-[length:200%_100%]"></div>

                                {/* Large Token Number Circle */}
                                <div className="w-40 h-40 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center animate-shimmer bg-[length:200%_100%]">
                                    <div className="h-16 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded w-20 animate-shimmer bg-[length:200%_100%]"></div>
                                </div>

                                {/* Token label */}
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 mx-auto animate-shimmer bg-[length:200%_100%]"></div>
                            </div>
                        </div>

                        {/* Book Token Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="text-center">
                                {/* Title */}
                                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 mx-auto mb-2 animate-shimmer bg-[length:200%_100%]"></div>

                                {/* Description */}
                                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-48 mx-auto mb-6 animate-shimmer bg-[length:200%_100%]"></div>

                                {/* Book Button */}
                                <div className="h-14 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 rounded-xl w-full animate-shimmer bg-[length:200%_100%]"></div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Total Booked */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                                <div className="h-8 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded w-12 mx-auto mb-2 animate-shimmer bg-[length:200%_100%]"></div>
                                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 mx-auto animate-shimmer bg-[length:200%_100%]"></div>
                            </div>

                            {/* Remaining */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                                <div className="h-8 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded w-12 mx-auto mb-2 animate-shimmer bg-[length:200%_100%]"></div>
                                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 mx-auto animate-shimmer bg-[length:200%_100%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Next Tokens List */}
                <div className="lg:col-span-7 xl:col-span-8 order-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 animate-shimmer bg-[length:200%_100%]"></div>
                            <div className="h-6 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full w-24 animate-shimmer bg-[length:200%_100%]"></div>
                        </div>

                        {/* Token Cards Grid */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Skeleton Token Cards */}
                                {[1, 2, 3, 4, 5, 6].map((index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            {/* Token Number */}
                                            <div className="h-8 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded w-16 animate-shimmer bg-[length:200%_100%]"></div>
                                            {/* Status Badge */}
                                            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-20 animate-shimmer bg-[length:200%_100%]"></div>
                                        </div>

                                        {/* Patient Name */}
                                        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 mb-2 animate-shimmer bg-[length:200%_100%]"></div>

                                        {/* Time */}
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2 animate-shimmer bg-[length:200%_100%]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenBoardSkeleton;
