import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, RotateCcw, Lock } from 'lucide-react';
import HeaderNav from '../design-system/layout/HeaderNav';
import Button from '../design-system/primitives/Button';

export const TermsAndPolicies = ({ initialTab = 'terms' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] flex flex-col font-sans antialiased">
      <HeaderNav />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F0F13] border border-white/[0.08] text-[11px] font-bold text-[#C5A880] uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal, Trust & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F7] tracking-tight">
            Platform Policies & Terms
          </h1>
          <p className="text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
            Transparent policies governing course enrollment, account privacy, payments, content licensing, and security guarantees for Asivo.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto scrollbar-none" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terms'}
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-[#C5A880] text-[#070709] shadow-sm'
                : 'bg-[#0F0F13] text-[#A1A1AA] hover:text-white border border-white/[0.04]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-[#C5A880] text-[#070709] shadow-sm'
                : 'bg-[#0F0F13] text-[#A1A1AA] hover:text-white border border-white/[0.04]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'refund'}
            onClick={() => setActiveTab('refund')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'refund'
                ? 'bg-[#C5A880] text-[#070709] shadow-sm'
                : 'bg-[#0F0F13] text-[#A1A1AA] hover:text-white border border-white/[0.04]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>30-Day Refund Policy</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#C5A880] text-[#070709] shadow-sm'
                : 'bg-[#0F0F13] text-[#A1A1AA] hover:text-white border border-white/[0.04]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security Disclosure</span>
          </button>
        </div>

        {/* Content Canvas */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F0F13] border border-white/[0.06] text-xs sm:text-sm text-[#D4D4D8] leading-relaxed space-y-6">
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">1. Information We Collect</h2>
                <p>
                  Asivo collects minimal information necessary to deliver educational courses and manage student certifications. This includes your name, email address, course enrollments, learning progress, and assessment completion records. We do not sell your personal information to third parties.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">2. Data Security & Storage</h2>
                <p>
                  All account credentials are protected using industry-standard cryptographic hashing (BCrypt) and transmitted exclusively over HTTPS. Session tokens are managed securely via JSON Web Tokens with strict expiration boundaries. Sensitive authentication tokens are never stored insecurely.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">3. Communications & Notifications</h2>
                <p>
                  We send essential transactional notifications, including email verification OTPs, password reset codes, and course enrollment confirmations. You may configure learning reminders and announcement preferences directly in your Account Settings.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">4. User Rights & Data Deletion</h2>
                <p>
                  You retain the right to inspect, correct, export, or request deletion of your account data at any time by contacting our privacy officer at <strong className="text-white">privacy@asivo.io</strong>.
                </p>
              </div>
            </div>
          )}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
                <p>
                  By registering an account, purchasing curriculum access, or utilizing FD_LMS / Asivo platforms and microservice sandbox environments, you agree to comply with and be bound by these Terms of Service. These terms apply to all visitors, registered student engineers, and active instructors.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">2. Learning Platform Access & Sandbox Usage</h2>
                <p>
                  Purchasing a course grants lifetime, non-exclusive, non-transferable access to the course lectures, assessments, updates, and associated source code repositories. Access to shared interactive microservice sandbox environments is provided for educational experimentation in accordance with platform rate limits and security policies.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">3. Commercial Transactions & Indian Regulations</h2>
                <p>
                  All payments are processed securely in Indian Rupees (INR) through authorized payment gateways. Prices displayed on course cards and detail pages are inclusive of applicable taxes unless explicitly separated at checkout. Successful payment confirmation issues an immutable order record and triggers immediate enrollment authorization.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">4. Certificate Issuance & Verifiability</h2>
                <p>
                  Certificates of completion are issued upon successful passing of required automated test suites, quizzes, and project capstone criteria. Each issued credential carries a cryptographic unique identifier verifiable on our public portal at /certifications. Any attempt to forge or falsify certificate IDs results in permanent account termination.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">1. 30-Day Money-Back Guarantee</h2>
                <p>
                  We stand behind the engineering quality of our curriculum. If you purchase any self-paced engineering track and determine it does not meet your professional learning goals, you may request a 100% full refund within 30 calendar days of the original purchase timestamp.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">2. Eligibility Conditions</h2>
                <p>
                  To prevent abuse while protecting genuine learners, refund eligibility requires:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-[#A1A1AA]">
                  <li>The refund request is submitted within 30 days of transaction settlement.</li>
                  <li>Less than 30% of the course lectures and video modules have been marked completed.</li>
                  <li>No certificate of completion has been claimed or generated for the course.</li>
                  <li>The payment was settled through an authorized payment channel.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">3. Processing Timelines & Mechanism</h2>
                <p>
                  Refund requests can be submitted directly via your Student Orders dashboard or by emailing <strong className="text-white">support@fdlms.io</strong> with your Order ID. Approved refunds are credited back to the original payment source within 5 to 7 business days per banking and RBI settlement standards.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2">1. Zero-Trust Architecture & Identity Protection</h2>
                <p>
                  FD_LMS employs defense-in-depth principles across its distributed Spring Boot microservices. All student credentials are cryptographically protected using BCrypt hashing with configurable work factors. API communications utilize stateless, signed JSON Web Tokens (JWT) with automated expiration and refresh token rotation.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">2. Role-Based Access Controls (RBAC)</h2>
                <p>
                  Access boundaries between Students, Instructors, and Administrators are enforced at both the API Gateway layer and microservice security filters. Administrative endpoints are strictly segregated from public routes and require privileged multi-tier authorization.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-2">3. Responsible Vulnerability Disclosure</h2>
                <p>
                  We welcome vulnerability reports from security researchers. If you identify a potential security vulnerability within our platform or sandbox environments, please email <strong className="text-white">security@fdlms.io</strong> with reproduction steps. We acknowledge submissions within 48 hours and coordinate remediation before public disclosure.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TermsAndPolicies;

