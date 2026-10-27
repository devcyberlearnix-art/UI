import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-ink-800/80 ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
};

export const CourseCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-glass-card rounded-2xl p-4 border border-white/5 space-y-3.5">
      {/* Thumbnail placeholder */}
      <Skeleton className="w-full aspect-[16/9] rounded-xl" />

      {/* Meta tags */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Skeleton className="w-full h-5 rounded-md" />
        <Skeleton className="w-3/4 h-5 rounded-md" />
      </div>

      {/* Description lines */}
      <Skeleton className="w-full h-3.5 rounded-md" />
      <Skeleton className="w-5/6 h-3.5 rounded-md" />

      {/* Divider */}
      <div className="border-t border-white/5 pt-3 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
    </div>
  );
};

export default Skeleton;
