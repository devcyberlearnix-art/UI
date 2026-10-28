import React from 'react';
import { ArrowLeft, BookOpen, Code2, GraduationCap, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: BookOpen,
    title: 'Curriculum-Driven Architecture',
    desc: 'Distributed systems, microservices & production patterns',
  },
  {
    icon: Code2,
    title: 'Hands-on Production Labs',
    desc: 'Real-world repos, automated CI/CD and unit suites',
  },
  {
    icon: ShieldCheck,
    title: 'Verifiable Master Credentials',
    desc: 'Cryptographic SHA-256 tamper-proof completion certificates',
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
          className="hidden lg:flex lg:w-1/2 relative bg-[#0F0F13] border-r border-white/[0.04] p-12 xl:p-16 flex-col justify-between overflow-hidden"
          aria-label="FD_LMS Enterprise Experience"
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Signature */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm transition-transform group-hover:scale-105">
                <GraduationCap className="w-6 h-6 text-[#C5A880]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-[#C5A880] transition-colors">
                  FD_LMS
                </span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#C5A880] uppercase -mt-0.5">
                  ENTERPRISE ARCHITECTURE
                </span>
              </div>
            </Link>
          </div>

          {/* Editorial Hero Statement */}
          <div className="relative z-10 my-auto py-12 max-w-lg space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-[#C5A880]/20 text-xs font-semibold text-[#C5A880]">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="tracking-wider uppercase text-[10px] font-bold">Ink & Onyx Architecture</span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-[#F5F5F7] tracking-tight leading-tight">
                Learn Skills.<br />
                <span className="text-[#C5A880]">Build Scalable Futures.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                Master enterprise system design, cloud-native pipelines, and verifiable engineering disciplines within a premier, handcrafted workspace.
              </p>
            </div>

            {/* Architecture Benefit Tiles */}
            <div className="space-y-3">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#14141A]/70 border border-white/[0.04] hover:border-white/[0.08] transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0F0F13] border border-white/[0.06] flex items-center justify-center text-[#C5A880] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F5F7] leading-tight">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Telemetry Verification Strip */}
          <div className="relative z-10 pt-6 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#71717A]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Microservices Gateway Online</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#A1A1AA]">
              <Terminal className="w-3 h-3 text-[#C5A880]" />
              <span>Port 8080 &bull; TLS 1.3</span>
            </div>
          </div>
        </section>
      )}

      {/* ── RIGHT FORM CONTAINER COLUMN ── */}
      <section
        className={`flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 items-center justify-center relative min-h-screen ${
          centered ? 'max-w-xl mx-auto' : ''
        }`}
      >
        {/* Mobile Header Brand (small screens) */}
        <div className="w-full max-w-md lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-sm">FD_LMS</span>
          </Link>

          {showBackHome && (
            <Link
              to="/"
              className="text-xs font-semibold text-[#8E8E93] hover:text-[#F5F5F7] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          )}
        </div>

        {/* Form Card Container */}
        <div className="w-full max-w-md my-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className={`rounded-3xl bg-[#0F0F13] border border-white/[0.04] p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)] ${
              wide ? 'sm:max-w-lg' : ''
            }`}
          >
            {showCardBrand && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold tracking-widest text-[#C5A880] uppercase">
                  FD_LMS AUTH
                </span>
              </div>
            )}

            {children}

            {showTerms && (
              <div className="mt-6 pt-4 border-t border-white/[0.04] text-center text-[11px] text-[#71717A] leading-relaxed">
                By authenticating, you acknowledge adherence to our{' '}
                <a
                  href="/terms"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#C5A880] hover:underline"
                >
                  Architecture Standards
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#C5A880] hover:underline"
                >
                  Privacy Charter
                </a>.
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
        <div className="w-full max-w-md text-center text-[11px] text-[#52525B] pt-6">
          &copy; {new Date().getFullYear()} FD_LMS. Ink & Onyx Security Layer.
        </div>
      </section>
    </main>
  );
};

export default AuthShell;
