'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDate } from '../lib/dateUtils';

export default function ReviewsList({
    reviews,
    currentUser,
    onLike,
    isLikeLoading,
    simple = false
}) {
    const [showAll, setShowAll] = useState(false);
    const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

    const StarRating = ({ rating, size = "small" }) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`${size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (!reviews || reviews.length === 0) return null;

    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / (reviews.filter(r => r.rating).length || 1);
    const hasRatings = reviews.some(r => r.rating);

    const content = (
        <div className={`flex flex-col ${simple ? '' : 'md:flex-row gap-8 md:gap-12'}`}>

            {/* Header & Stats - Left Side (Only if not simple) */}
            {!simple && (
                <div className="md:w-1/3 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary mb-2">
                            تقييمات المستخدمين
                        </h2>
                        <p className="text-accent-600 dark:text-dark-text-secondary text-sm">
                            آراء حقيقية من مجتمع عرب نوشن
                        </p>
                    </div>

                    {hasRatings && (
                        <div className="bg-gray-50 dark:bg-dark-primary p-6 rounded-2xl border border-gray-100 dark:border-dark-card-border backdrop-blur-sm">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-bold text-accent-900 dark:text-dark-text-primary">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="text-accent-500 dark:text-dark-text-quaternary text-lg">/ 5</span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <StarRating rating={averageRating} size="large" />
                                <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                                    ({totalReviews} تقييم)
                                </span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                كل التقييمات من مستخدمين موثوقين
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews Grid */}
            <div className={simple ? 'w-full' : 'md:w-2/3'}>
                <div className="grid gap-4">
                            {displayedReviews.map((review) => {
                                const isRatingOnly = review.rating && !review.review && !review.comment;
                                const displayDate = formatDate(new Date(review.latestDate));
                                const userName = review.user?.name || review.user?.displayName || 'مستخدم';
                                const userInitial = userName.charAt(0).toUpperCase() || 'م';
                                const hasProfilePicture = !!review.user?.profilePicture;

                                // Check if current user liked this (assuming logic is passed or handled differently, but here we use what's available)
                                const currentUserId = currentUser?._id || currentUser?.id;
                                const isLiked = review.likes?.some(like => like.user?._id === currentUserId || like.user === currentUserId);
                                const likeCount = review.likes?.length || 0;

                                return (
                                    <div
                                        key={review.ratingId || review.commentId || review._id || review.id}
                                        className="group relative bg-white dark:bg-dark-primary/60 hover:bg-gray-50 dark:hover:bg-dark-primary transition-all duration-300 rounded-2xl p-5 border border-gray-100 dark:border-dark-card-border hover:shadow-lg dark:hover:shadow-dark-medium backdrop-blur-sm"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 ring-2 ring-white dark:ring-dark-secondary shadow-sm">
                                                    {hasProfilePicture ? (
                                                        <Image
                                                            src={review.user.profilePicture}
                                                            alt={userName}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                                                                {userInitial}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                 {/* Verified Badge */}
                                                 {review.isVerified && (
                                                     <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark-secondary rounded-full p-0.5 shadow-sm">
                                                         <div className="bg-blue-500 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center">
                                                             <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                             </svg>
                                                         </div>
                                                     </div>
                                                 )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-accent-900 dark:text-dark-text-primary text-base">
                                                            {userName}
                                                        </h3>
                                                        <span className="text-xs text-accent-400 dark:text-dark-text-quaternary">
                                                            {displayDate}
                                                        </span>
                                                    </div>
                                                    {review.rating && (
                                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-lg">
                                                            <StarRating rating={review.rating} />
                                                        </div>
                                                    )}
                                                </div>

                                                {review.review && (
                                                    <p className="text-accent-600 dark:text-dark-text-secondary text-sm leading-relaxed mb-3">
                                                        {review.review}
                                                    </p>
                                                )}

                                                {review.comment && (
                                                    <div className={`text-accent-600 dark:text-dark-text-secondary text-sm leading-relaxed ${review.review ? 'pt-3 border-t border-gray-100 dark:border-dark-card-border border-dashed' : ''}`}>
                                                        {review.comment}
                                                    </div>
                                                )}

                                                {!isRatingOnly && review.commentId && (
                                                    <div className="mt-4 flex items-center gap-4">
                                                        <button
                                                            onClick={() => onLike && onLike(review.commentId)}
                                                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked
                                                                ? 'text-red-500'
                                                                : 'text-accent-400 dark:text-dark-text-quaternary hover:text-red-500 dark:hover:text-red-400'
                                                                }`}
                                                        >
                                                            <svg
                                                                className={`w-4 h-4 ${isLiked ? 'fill-current' : 'fill-none stroke-current'}`}
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="2"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            <span>{likeCount > 0 ? likeCount : 'مفيد'}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

            {reviews.length > 3 && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="px-6 py-2.5 bg-white dark:bg-dark-primary border border-gray-200 dark:border-dark-card-border text-accent-600 dark:text-dark-text-secondary rounded-xl hover:bg-gray-50 dark:hover:bg-dark-secondary transition-colors font-medium text-sm shadow-sm"
                                >
                                    {showAll ? 'عرض أقل' : `عرض باقي التقييمات (${reviews.length - 3})`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
    );

    if (simple) return content;

    return (
        <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
            <div className="container-custom">
                {content}
            </div>
        </section>
    );
}
