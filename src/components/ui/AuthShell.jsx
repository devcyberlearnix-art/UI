import { motion } from "framer-motion";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const AuthShell = ({
  title,
  subtitle,
  eyebrow = "LearnMaster Suite",
  highlights = [],
  children,
}) => {
  const cards =
    highlights.length > 0
      ? highlights
      : [
          { value: "50K+", label: "Learners" },
          { value: "300+", label: "Courses" },
          { value: "98%", label: "Satisfaction" },
        ];

  return (
    <div className="relative min-h-screen overflow-hidden lms-auth-bg">
      <div className="pointer-events-none absolute inset-0 lms-grid-mask" />
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full lms-glow-a" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full lms-glow-b" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-6 px-4 py-8 md:px-8 lg:grid-cols-2">
        <div className="absolute left-4 right-4 top-4 z-20 md:left-8 md:right-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/35 bg-white/70 px-3 py-2 backdrop-blur md:px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-lms-primary/30 bg-lms-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-lms-primary">
              <Sparkles size={12} />
              {eyebrow}
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              <ChevronLeft size={14} />
              Back to Home
            </Link>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hidden rounded-3xl border border-white/30 bg-white/55 p-10 pt-16 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:block"
        >
          <div className="mb-7 lms-chip">{eyebrow}</div>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">{subtitle}</p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {cards.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/50 bg-white/75 px-4 py-4 text-center shadow-sm"
              >
                <p className="text-2xl font-extrabold text-lms-primary">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="rounded-3xl border border-white/40 bg-white/85 p-6 pt-16 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8"
        >
          <div className="mb-6 block lg:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-lms-primary">{eyebrow}</p>
            <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
          </div>
          {children}
        </motion.section>
      </div>
    </div>
  );
};

export default AuthShell;
