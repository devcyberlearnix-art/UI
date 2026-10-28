import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { useAdminReviews, useDeleteReviewAdmin } from '../../hooks/useAdmin';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import Skeleton from '../../design-system/primitives/Skeleton';
import EmptyState from '../../design-system/feedback/EmptyState';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export default function AdminReviews() {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  const {
    data: reviews = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminReviews();

  const deleteReviewMutation = useDeleteReviewAdmin();

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        search === '' ||
        (r.user || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.comment || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.courseTitle || '').toLowerCase().includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === 'ALL' ||
        (ratingFilter === '5' && r.rating === 5) ||
        (ratingFilter === '4' && r.rating === 4) ||
        (ratingFilter === 'CRITICAL' && r.rating <= 3);

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to purge this review from the public registry?')) {
      await deleteReviewMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Header Bar */}
      <div className="border-b border-white/[0.04] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              Curriculum Reviews & Ratings Moderation
            </h1>
            <Badge
              variant="pewter"
              className="bg-[#14141A] text-[#C5A880] border-white/5 font-mono text-[10px] px-2 py-0.5"
            >
              {reviews.length} Total
            </Badge>
          </div>
          <p className="text-xs text-[#8E8E93] font-light mt-0.5">
            Distributed learner telemetry, review auditing, and catalog rating governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs bg-[#14141A] border-white/5 hover:border-white/10 cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={`text-[#C5A880] ${isFetching ? 'animate-spin' : ''}`}
            />
            <span>{isFetching ? 'Syncing...' : 'Revalidate'}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F0F13] p-3 rounded-2xl border border-white/[0.04]">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by learner, comment, or course..."
            className="w-full bg-[#14141A] border border-white/[0.04] focus:border-[#C5A880]/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Stars' },
            { id: '5', label: '5 Stars ★' },
            { id: '4', label: '4 Stars ★' },
            { id: 'CRITICAL', label: '≤ 3 Stars (Flagged)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRatingFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap border ${
                ratingFilter === tab.id
                  ? 'border-[#C5A880]/40 text-[#C5A880] bg-[#14141A]'
                  : 'border-white/[0.04] text-[#8E8E93] hover:text-[#F5F5F7] bg-[#070709]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-[#0F0F13] p-4 rounded-2xl border border-white/[0.04] flex items-center justify-between"
            >
              <div className="space-y-2 w-3/4">
                <Skeleton className="h-4 w-1/4 rounded bg-[#14141A]" />
                <Skeleton className="h-3 w-3/4 rounded bg-[#14141A]" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg bg-[#14141A]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#0F0F13] p-8 rounded-2xl border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-[#F5F5F7]">Failed to Sync Reviews</h3>
          <p className="text-xs text-[#8E8E93]">{error.message || 'Microservice gateway response rejected'}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="cursor-pointer">
            Retry Network Stream
          </Button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title="No Reviews Found"
          description={search ? 'No reviews matching your search criteria.' : 'No learner feedback registered in this filter.'}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setRatingFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review, idx) => (
              <motion.div
                key={review.id || `rev-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.02, ...SPRING }}
                className="bg-[#0F0F13] hover:bg-[#14141A] transition-colors p-4 rounded-2xl border border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#1B1B24] flex items-center justify-center text-[#C5A880] text-xs font-semibold">
                        {(review.user || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-[#F5F5F7]">{review.user}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-[#C5A880]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-[#C5A880] text-[#C5A880]' : 'text-white/10'}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] text-[#71717A] font-mono">{review.date}</span>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-[#8E8E93] bg-[#070709] px-2 py-0.5 rounded border border-white/[0.04]">
                      {review.courseTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleteReviewMutation.isPending}
                    title="Purge review from registry"
                    className="p-2 rounded-xl text-[#71717A] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}