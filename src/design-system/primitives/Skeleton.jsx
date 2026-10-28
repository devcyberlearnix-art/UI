import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#0F0F13] border border-white/[0.04] ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
};

export const CourseCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-[#14141A] rounded-2xl p-4 border border-white/[0.04] space-y-3.5 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7)]">
      {/* 16:9 Thumbnail placeholder */}
      <Skeleton className="w-full aspect-[16/9] rounded-xl" />

      {/* Meta tags & rating */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-1.5 pt-1">
        <Skeleton className="w-full h-5 rounded-md" />
        <Skeleton className="w-3/4 h-5 rounded-md" />
      </div>

      {/* Description lines */}
      <div className="space-y-1">
        <Skeleton className="w-full h-3.5 rounded-md" />
        <Skeleton className="w-4/5 h-3.5 rounded-md" />
      </div>

      {/* Footer with Instructor & Action */}
      <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
    </div>
  );
};

export const TelemetrySkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col items-center space-y-2"
        >
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-24 h-3 rounded-md" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
