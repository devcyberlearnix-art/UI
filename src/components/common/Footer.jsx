import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Activity, Terminal, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 dark:bg-[#070709] border-t border-slate-200 dark:border-white/[0.04] text-slate-600 dark:text-[#8E8E93] text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          {/* Brand & Manifesto Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#14141A] border border-blue-500/20 dark:border-[#C5A880]/30 flex items-center justify-center text-blue-600 dark:text-[#C5A880] shadow-xs transition-transform group-hover:scale-105">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-[#F5F5F7] group-hover:text-blue-600 dark:group-hover:text-[#C5A880] transition-colors">
                  FD_LMS
                </span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-blue-600 dark:text-[#C5A880] uppercase -mt-0.5">
                  ENTERPRISE PLATFORM
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 dark:text-[#8E8E93] leading-relaxed max-w-sm">
              An enterprise full-stack learning platform. Engineered with Spring Boot microservices, high-concurrency event pipelines, and verifiable master credentials.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0F0F13] border border-slate-200 dark:border-white/[0.04] text-[11px] text-slate-700 dark:text-[#A1A1AA] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Microservices Gateway Operational</span>
              </div>
            </div>
          </div>

          {/* Column 1: Curriculum */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5F7]">
              Curriculum
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/courses" className="hover:text-blue-600 dark:hover:text-[#F5F5F7] transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-blue-600 dark:hover:text-[#F5F5F7] transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-blue-600 dark:hover:text-[#F5F5F7] transition-colors">
                  Practical Labs
                </Link>
              </li>
              <li>
                <Link to="/verify-certificate" className="hover:text-blue-600 dark:hover:text-[#F5F5F7] transition-colors">
                  Verified Credentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5F7]">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/instructor/apply" className="hover:text-blue-600 dark:hover:text-[#C5A880] transition-colors inline-flex items-center gap-1">
                  <span>Instructor Faculty</span>
                  <ArrowUpRight className="w-3 h-3 text-blue-600 dark:text-[#C5A880]" />
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-blue-600 dark:hover:text-[#F5F5F7] transition-colors">
                  Student Workspace
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-blue-600 dark:hover:text-[#F5F5F7] transition-colors">
                  Command Center
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-[#52525B]">REST Telemetry (Port 8080)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5F7]">
              Compliance & Security
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-slate-600 dark:text-[#8E8E93]">RBAC Layer Enforcement</span>
              </li>
              <li>
                <span className="text-slate-600 dark:text-[#8E8E93]">JWT Rotation & Refresh</span>
              </li>
              <li>
                <span className="text-slate-600 dark:text-[#8E8E93]">Zero-CLS Performance</span>
              </li>
              <li>
                <span className="text-slate-600 dark:text-[#8E8E93]">256-Bit Idempotency</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Strict Outer Alignment */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-[#71717A]">
          <div className="flex items-center gap-3">
            <span>&copy; {currentYear} Asivo LMS Platform. All rights reserved.</span>
            <span>&bull;</span>
            <span className="text-slate-600 dark:text-[#A1A1AA]">Light & Clean Enterprise Design</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Terminal className="w-3 h-3 text-blue-600 dark:text-[#C5A880]" />
              <span>v3.0.0-PROD</span>
            </span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">99.98% SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
