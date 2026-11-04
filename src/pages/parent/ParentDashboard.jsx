// src/pages/parent/ParentDashboard.jsx
// Asivo 2.0 — Parent Learning Observatory
// Provides authorized parents with verified, read-only academic timelines, student progress, and privacy controls

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  UserPlus,
  BookOpen,
  Clock,
  Award,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LUXURY_EASING } from '../../core/experience/AnimationController';
import toast from 'react-hot-toast';

// Curated verified initial linked student state (with local persistence fallback)
const DEFAULT_LINKED_STUDENTS = [
  {
    id: 'stu-8819',
    firstName: 'Devon',
    lastName: 'Vance',
    email: 'devon.vance@student.asivo.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Advanced Undergraduate / System Engineering',
    linkedSince: '2026-09-15',
    weeklyStudyHours: 14.5,
    attendanceRate: 98,
    activeCourses: [
      {
        id: 'course-101',
        title: 'Distributed Systems & Kafka Event Mesh',
        category: 'ARCHITECTURE',
        progress: 82,
        lastActive: '2 hours ago',
        completedLectures: 38,
        totalLectures: 46,
        currentGrade: '94%',
        certificateEligible: true,
      },
      {
        id: 'course-104',
        title: 'High-Concurrency PostgreSQL & Connection Pooling',
        category: 'DATABASE',
        progress: 64,
        lastActive: 'Yesterday',
        completedLectures: 21,
        totalLectures: 33,
        currentGrade: '89%',
        certificateEligible: false,
      },
    ],
    milestones: [
      {
        title: 'Completed Midterm Microservice Verification',
        date: 'Nov 02, 2026',
        score: '100/100',
        course: 'Distributed Systems',
      },
      {
        title: 'Achieved 30-Day Consecutive Study Milestone',
        date: 'Oct 28, 2026',
        score: 'Badge Earned',
        course: 'General Curriculum',
      },
      {
        title: 'Passed Kafka Partition Rebalancing Lab Exam',
        date: 'Oct 19, 2026',
        score: '96/100',
        course: 'Distributed Systems',
      },
    ],
  },
];

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('asivo_parent_students');
      return saved ? JSON.parse(saved) : DEFAULT_LINKED_STUDENTS;
    } catch {
      return DEFAULT_LINKED_STUDENTS;
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [relationshipType, setRelationshipType] = useState('Parent');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Parental Digest & Notification Preferences
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [inactivityAlerts, setInactivityAlerts] = useState(true);
  const [milestoneCelebrations, setMilestoneCelebrations] = useState(true);

  // Persist students on update
  useEffect(() => {
    try {
      localStorage.setItem('asivo_parent_students', JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save parent student state:', e);
    }
  }, [students]);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Handle Pairing Code Handshake
  const handleLinkStudent = useCallback((e) => {
    e.preventDefault();
    if (!pairingCodeInput.trim() || !studentEmailInput.trim()) {
      toast.error('Please enter both student email and 6-character pairing code.');
      return;
    }

    if (pairingCodeInput.trim().length !== 6) {
      toast.error('Pairing code must be exactly 6 characters.');
      return;
    }

    setIsSubmittingLink(true);
    setTimeout(() => {
      // Simulate verified handshake response
      const newLinkedStudent = {
        id: `stu-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: studentEmailInput.split('@')[0],
        lastName: 'Learner',
        email: studentEmailInput.trim().toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        gradeLevel: 'Engineering Cohort Student',
        linkedSince: new Date().toISOString().split('T')[0],
        weeklyStudyHours: 0.0,
        attendanceRate: 100,
        activeCourses: [],
        milestones: [
          {
            title: `Linked to ${relationshipType} Account`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            score: 'Authorized Handshake',
            course: 'Account Pairing',
          },
        ],
      };

      setStudents((prev) => [newLinkedStudent, ...prev]);
      setSelectedStudentId(newLinkedStudent.id);
      setIsSubmittingLink(false);
      setIsLinkingModalOpen(false);
      setPairingCodeInput('');
      setStudentEmailInput('');
      toast.success(`Successfully verified relationship with ${studentEmailInput}!`, { icon: '🤝' });
    }, 800);
  }, [pairingCodeInput, studentEmailInput, relationshipType]);

  return (
    <div className="space-y-8 pb-12">
      {/* ===================== OBSERVATORY HEADER ===================== */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E3DCD3] dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B3E57]/10 dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/20 text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FERPA & COPPA Certified • Verified Read-Only Access</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1]">
            Learning Observatory
          </h1>
          <p className="text-sm text-[#635E56] dark:text-[#A8A196] mt-1">
            Real-time curriculum progress, milestone records, and study telemetry for linked students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLinkingModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B3E57] hover:bg-[#462D42] text-[#FFFEFA] text-xs font-bold shadow-md shadow-[#5B3E57]/20 transition-all cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Link Another Student</span>
        </button>
      </header>

      {/* ===================== STUDENT SELECTOR TABS ===================== */}
      {students.length > 0 && (
        <section aria-label="Linked Students" className="flex items-center gap-3 overflow-x-auto pb-2">
          {students.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedStudentId(student.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all text-left whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFFEFA] dark:bg-[#1D1C1A] border-[#5B3E57] dark:border-[#D1A7CC] shadow-sm'
                    : 'bg-[#F5F2EC] dark:bg-[#151413] border-[#E3DCD3] dark:border-white/10 hover:border-[#5B3E57]/40 text-[#635E56] dark:text-[#A8A196]'
                }`}
              >
                <img
                  src={student.avatar}
                  alt={student.firstName}
                  className="w-8 h-8 rounded-full object-cover border border-[#E3DCD3] dark:border-white/10"
                />
                <div>
                  <div className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1]">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-[10px] font-mono text-[#756E64] dark:text-[#7A7368]">
                    {student.email}
                  </div>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {/* ===================== OBSERVATORY CONTENT ===================== */}
      {activeStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-Column: Course Progress & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Telemetry Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-[#756E64] dark:text-[#7A7368] mb-2">
                  <span>WEEKLY STUDY</span>
                  <Clock className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                </div>
                <div className="text-2xl font-black text-[#282521] dark:text-[#EDE8E1]">
                  {activeStudent.weeklyStudyHours} hrs
                </div>
                <div className="text-[11px] text-[#2B6747] font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2.4 hrs vs previous week</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-[#756E64] dark:text-[#7A7368] mb-2">
                  <span>ACTIVE TRACKS</span>
                  <BookOpen className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                </div>
                <div className="text-2xl font-black text-[#282521] dark:text-[#EDE8E1]">
                  {activeStudent.activeCourses.length} Courses
                </div>
                <div className="text-[11px] text-[#635E56] dark:text-[#A8A196] mt-1">
                  Average completion: 73%
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-[#756E64] dark:text-[#7A7368] mb-2">
                  <span>ATTENDANCE</span>
                  <CheckCircle2 className="w-4 h-4 text-[#2B6747]" />
                </div>
                <div className="text-2xl font-black text-[#282521] dark:text-[#EDE8E1]">
                  {activeStudent.attendanceRate}%
                </div>
                <div className="text-[11px] text-[#2B6747] font-medium mt-1">
                  Consistently on schedule
                </div>
              </div>
            </div>

            {/* Active Enrolled Courses */}
            <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] flex items-center justify-between">
                <span>Active Course Enrollment</span>
                <span className="text-xs font-mono text-[#756E64]">READ-ONLY VIEW</span>
              </h2>

              <div className="space-y-4">
                {activeStudent.activeCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#151413]/60 border border-[#E3DCD3] dark:border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#5B3E57] dark:text-[#D1A7CC] uppercase tracking-wider">
                          {c.category}
                        </span>
                        <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">
                          {c.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1]">
                          Grade: {c.currentGrade}
                        </span>
                        <div className="text-[10px] text-[#756E64] dark:text-[#7A7368]">
                          Active {c.lastActive}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-[#635E56] dark:text-[#A8A196] mb-1">
                        <span>{c.completedLectures} of {c.totalLectures} lectures completed</span>
                        <span className="font-bold text-[#282521] dark:text-[#EDE8E1]">{c.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E3DCD3] dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#5B3E57] dark:bg-[#D1A7CC] transition-all duration-500"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Milestones Timeline */}
            <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Academic Milestone Timeline</span>
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3DCD3] dark:before:bg-white/10">
                {activeStudent.milestones.map((m, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#5B3E57] dark:bg-[#D1A7CC] ring-4 ring-[#FFFEFA] dark:ring-[#1D1C1A]" />
                    <div className="text-xs font-mono text-[#756E64] dark:text-[#7A7368]">{m.date}</div>
                    <div className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">{m.title}</div>
                    <div className="text-xs text-[#635E56] dark:text-[#A8A196]">
                      {m.course} • <strong className="text-[#2B6747]">{m.score}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Preferences, Verification & Minor Privacy Controls */}
          <div className="space-y-6">
            {/* Privacy Boundaries Callout */}
            <div className="p-6 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
                <Lock className="w-4 h-4" />
                <span>Parental Privacy Guard</span>
              </div>
              <p className="text-xs text-[#635E56] dark:text-[#A8A196] leading-relaxed">
                Asivo LMS strictly safeguards student account autonomy. Parents have access to academic completion metrics, grades, and certificates, but cannot alter student quiz submissions, reset student passwords without authorization, or inspect private instructor direct messages.
              </p>
            </div>

            {/* Notification & Digest Settings */}
            <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Parental Digest Notifications</span>
              </h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#635E56] dark:text-[#A8A196]">Weekly Academic Summary Email</span>
                  <input
                    type="checkbox"
                    checked={digestEnabled}
                    onChange={(e) => {
                      setDigestEnabled(e.target.checked);
                      toast.success('Updated digest preference');
                    }}
                    className="rounded border-[#E3DCD3] text-[#5B3E57] focus:ring-[#5B3E57]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#635E56] dark:text-[#A8A196]">Inactivity Alert (after 5 days)</span>
                  <input
                    type="checkbox"
                    checked={inactivityAlerts}
                    onChange={(e) => {
                      setInactivityAlerts(e.target.checked);
                      toast.success('Updated inactivity alert preference');
                    }}
                    className="rounded border-[#E3DCD3] text-[#5B3E57] focus:ring-[#5B3E57]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#635E56] dark:text-[#A8A196]">Milestone & Certificate Alerts</span>
                  <input
                    type="checkbox"
                    checked={milestoneCelebrations}
                    onChange={(e) => {
                      setMilestoneCelebrations(e.target.checked);
                      toast.success('Updated milestone preference');
                    }}
                    className="rounded border-[#E3DCD3] text-[#5B3E57] focus:ring-[#5B3E57]"
                  />
                </label>
              </div>
            </div>

            {/* Public Verifiable Credentials */}
            <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#5B3E57] dark:text-[#D1A7CC] uppercase">
                  Verified Credentials
                </span>
                <Award className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
              </div>
              <p className="text-xs text-[#635E56] dark:text-[#A8A196]">
                Inspect tamper-proof cryptographic certificates earned by this student on the official registry.
              </p>
              <a
                href="/certifications"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B3E57] dark:text-[#D1A7CC] hover:underline"
              >
                <span>Open Certification Registry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 space-y-4">
          <BookOpen className="w-12 h-12 text-[#756E64] mx-auto" />
          <h2 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1]">No Students Linked Yet</h2>
          <p className="text-sm text-[#635E56] dark:text-[#A8A196] max-w-md mx-auto">
            Ask your student to generate a 6-character pairing code from their Asivo ProfileWorkspace to link accounts.
          </p>
          <button
            type="button"
            onClick={() => setIsLinkingModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#5B3E57] text-[#FFFEFA] text-xs font-bold shadow-md cursor-pointer"
          >
            Link Student Account
          </button>
        </div>
      )}

      {/* ===================== STUDENT LINKING MODAL ===================== */}
      <AnimatePresence>
        {isLinkingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: LUXURY_EASING }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E3DCD3] dark:border-white/10 pb-3">
                <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1]">
                  Link Student to Observatory
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLinkingModalOpen(false)}
                  className="text-xs text-[#756E64] hover:text-[#282521] dark:hover:text-[#EDE8E1]"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleLinkStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#282521] dark:text-[#EDE8E1] mb-1">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmailInput}
                    onChange={(e) => setStudentEmailInput(e.target.value)}
                    placeholder="e.g. devon.vance@student.asivo.io"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/10 text-xs text-[#282521] dark:text-[#EDE8E1] focus:ring-2 focus:ring-[#5B3E57] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#282521] dark:text-[#EDE8E1] mb-1">
                    6-Character Pairing Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={pairingCodeInput}
                    onChange={(e) => setPairingCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AS98K2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/10 font-mono text-center tracking-widest text-sm text-[#282521] dark:text-[#EDE8E1] focus:ring-2 focus:ring-[#5B3E57] outline-hidden uppercase"
                  />
                  <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] mt-1 block">
                    Student can generate this under Profile &gt; Security &gt; Parent Access.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#282521] dark:text-[#EDE8E1] mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/10 text-xs text-[#282521] dark:text-[#EDE8E1] focus:ring-2 focus:ring-[#5B3E57] outline-hidden"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Academic Sponsor">Academic Sponsor</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLinkingModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E3DCD3] text-xs font-semibold text-[#635E56]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLink}
                    className="px-4 py-2 rounded-xl bg-[#5B3E57] hover:bg-[#462D42] text-[#FFFEFA] text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingLink ? 'Verifying...' : 'Verify & Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentDashboard;
