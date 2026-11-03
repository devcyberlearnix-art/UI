import React from 'react';
import { ArrowLeft, BookOpen, Code2, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: BookOpen,
    title: 'Structured Learning Paths',
    desc: 'Curated courses and guided learning journeys.',
  },
  {
    icon: Code2,
    title: 'Hands-on Practical Learning',
    desc: 'Real projects and industry-relevant skills.',
  },
  {
    icon: Award,
    title: 'Verified Learning Certificates',
    desc: 'Track achievements and verify completed learning.',
  },
];

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

export const AuthShell = ({
  children,
  variant = 'split',
  showTerms = false,
  showBackHome = variant !== 'otp',
  showCardBrand = false,
  wide = false,
}) => {
  const centered = variant === 'success' || variant === 'error' || variant === 'center';

  return (
    <main className="min-h-screen w-full bg-[#070709] font-sans text-[#F5F5F7] flex flex-col lg:flex-row selection:bg-[#C5A880]/30 selection:text-white relative overflow-x-hidden">
      {/* ── DESKTOP BRAND SHOWCASE COLUMN (LEFT) ── */}
      {!centered && (
        <section
          className="hidden lg:flex lg:w-1/2 relative bg-[#0F0F13] border-r border-white/[0.04] p-8 lg:p-12 xl:p-14 flex-col justify-start overflow-hidden"
          aria-label="Asivo Learning Platform"
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Signature Header */}
          <div className="relative z-10 flex items-center">
            <Link to="/" className="inline-flex items-center gap-3.5 group" aria-label="Asivo Home">
              <div className="w-11 h-11 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
                <img
                  src="/assets/asivo-symbol-128.png"
                  alt="Asivo emblem"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/asivo-symbol.png';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#F5F5F7] group-hover:text-[#C5A880] transition-colors leading-none">
                  Asivo
                </span>
                <span className="text-[9px] font-bold tracking-[0.22em] text-[#C5A880] uppercase mt-1">
                  LEARNING PLATFORM
                </span>
              </div>
            </Link>
          </div>

          {/* Editorial Hero Statement (Fixed top offset guarantees 100% stable vertical alignment between Login & Register) */}
          <div className="relative z-10 mt-8 lg:mt-12 xl:mt-14 max-w-lg space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-[#C5A880]/20 text-xs font-semibold text-[#C5A880]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="tracking-wider uppercase text-[10px] font-bold">Ink &amp; Onyx Experience</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-[#F5F5F7] tracking-tight leading-tight">
                Learn. Build. Grow.
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                Build practical skills, master modern technologies and advance your career through structured learning.
              </p>
            </div>

            {/* Benefit Sections */}
            <div className="space-y-3 pt-1">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#14141A]/70 border border-white/[0.04] hover:border-white/[0.08] transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#0F0F13] border border-white/[0.06] flex items-center justify-center text-[#C5A880] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-[#F5F5F7] leading-tight">
                        {b.title}
                      </h2>
                      <p className="text-[11px] text-[#A1A1AA] mt-0.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Trust & Security Strip */}
          <div className="relative z-10 mt-auto pt-8 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#71717A]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[#A1A1AA]">Enterprise Security &amp; Encrypted Sessions</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#71717A]">
              <Link to="/terms" className="hover:text-[#C5A880] transition-colors">
                Terms
              </Link>
              <span>&bull;</span>
              <Link to="/privacy" className="hover:text-[#C5A880] transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── RIGHT FORM CONTAINER COLUMN ── */}
      <section
        className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative min-h-screen ${centered ? 'max-w-xl mx-auto' : ''
          }`}
      >
        {/* Mobile Header Brand (small screens < 1024px) */}
        <div className="w-full max-w-[460px] lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-white/[0.04]">
          <Link to="/" className="inline-flex items-center gap-3 group" aria-label="Asivo Home">
            <div className="w-10 h-10 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center shadow-sm overflow-hidden shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/assets/asivo-symbol-64.png"
                alt="Asivo emblem"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/assets/asivo-symbol.png';
                }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base font-extrabold tracking-tight text-[#F5F5F7] group-hover:text-[#C5A880] transition-colors leading-none">
                Asivo
              </span>
              <span className="text-[8px] font-bold tracking-[0.22em] text-[#C5A880] uppercase mt-1">
                LEARNING PLATFORM
              </span>
            </div>
          </Link>

          {showBackHome && (
            <Link
              to="/"
              className="text-xs font-semibold text-[#A1A1AA] hover:text-[#C5A880] flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-white/[0.02]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          )}
        </div>

        {/* Form Card Container (Standardized 460px width on desktop for visual symmetry) */}
        <div className="w-full max-w-[460px] my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="w-full rounded-3xl bg-[#0F0F13] border border-white/[0.04] p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)]"
          >
            {showCardBrand && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center overflow-hidden">
                  <img src="/assets/asivo-symbol-64.png" alt="Asivo" className="w-4 h-4 object-contain" />
                </div>
                <span className="text-xs font-bold tracking-widest text-[#C5A880] uppercase">
                  ASIVO AUTH
                </span>
              </div>
            )}

            {children}

            {showTerms && (
              <div className="mt-6 pt-4 border-t border-white/[0.04] text-center text-[11px] text-[#71717A] leading-relaxed">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-[#C5A880] hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#C5A880] hover:underline font-medium">
                  Privacy Policy
                </Link>.
              </div>
            )}
          </motion.div>

          {/* Desktop Back Home Link */}
          {showBackHome && (
            <div className="hidden lg:flex justify-center mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#71717A] hover:text-[#C5A880] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to discovery catalog</span>
              </Link>
            </div>
          )}
        </div>

        {/* Minimal Footer Stamp */}
        <div className="w-full max-w-[460px] text-center text-[11px] text-[#52525B] pt-4 flex items-center justify-center gap-3">
          <span>&copy; {new Date().getFullYear()} Asivo. All rights reserved.</span>
          <span>&bull;</span>
          <Link to="/terms" className="hover:text-[#A1A1AA] transition-colors">Terms</Link>
          <span>&bull;</span>
          <Link to="/privacy" className="hover:text-[#A1A1AA] transition-colors">Privacy</Link>
        </div>
      </section>
    </main>
  );
};

export default AuthShell;
