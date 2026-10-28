// src/pages/student/QuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ChevronLeft, ChevronRight, Award, AlertTriangle, Cpu } from 'lucide-react';
import { useQuizSession } from '../../hooks/useAssessments';
import { quizApi } from '../../api/quizApi';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { quiz, isQuizLoading, saveAnswer, submitQuiz, isSubmittingQuiz } = useQuizSession(quizId);

  const [attemptId, setActiveAttemptId] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState({});
  const [timeLeftMs, setTimeLeftMs] = useState(600000);
  const [totalDurationMs, setTotalDurationMs] = useState(600000);
  const [result, setResult] = useState(null);

  // Initialize live session state context node
  useEffect(() => {
    if (!quizId) return;
    const initSession = async () => {
      try {
        const res = await quizApi.startAttempt(quizId);
        const id = res?.attemptId || res?.data?.attemptId || res?.id || res?.data?.id;
        if (id) setActiveAttemptId(id);
      } catch (err) {
        toast.error('Failed to initialize secure assessment node.');
      }
    };
    initSession();
  }, [quizId]);

  // Synchronize countdown duration parameters
  useEffect(() => {
    if (quiz?.timeLimitMs) {
      setTimeLeftMs(quiz.timeLimitMs);
      setTotalDurationMs(quiz.timeLimitMs);
    }
  }, [quiz]);

  // Continuous millisecond tracking counter
  useEffect(() => {
    if (isQuizLoading || result || timeLeftMs <= 0) return;
    const ticker = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 1000) {
          clearInterval(ticker);
          handleFinalizeCompilation(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [isQuizLoading, result, timeLeftMs]);

  const handleSelectOption = async (optionIdx) => {
    if (result || !attemptId) return;
    setSelections((prev) => ({ ...prev, [currentIdx]: optionIdx }));
    
    const targetQuestion = quiz?.questions?.[currentIdx];
    if (!targetQuestion) return;
    try {
      await saveAnswer({
        attemptId,
        questionId: targetQuestion.id,
        selectedOption: optionIdx,
        quizId,
      });
    } catch (e) {
      console.warn('Network tracing saved option context locally.');
    }
  };

  const handleFinalizeCompilation = async (isForced = false) => {
    if (!attemptId) return;
    if (isForced) toast.error('Temporal allocation expired. Compiling calculations.');
    try {
      const summary = await submitQuiz({ attemptId, quizId });
      setResult(summary);
      toast.success('Matrix evaluation synchronized safely.', { icon: '🚀' });
    } catch (e) {
      toast.error('Failed to resolve database metrics compilation.');
    }
  };

  const formatTimer = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    return `${Math.floor(totalSecs / 60).toString().padStart(2, '0')}:${(totalSecs % 60).toString().padStart(2, '0')}`;
  };

  if (isQuizLoading) {
    return (
      <div className="min-h-screen bg-[#070709] p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentIdx];
  const totalQuestions = quiz?.questions?.length || 0;
  const progressPercent = totalDurationMs > 0 ? (timeLeftMs / totalDurationMs) * 100 : 0;
  const isTimeCritical = timeLeftMs < 60000;

  return (
    <div className="min-h-screen bg-[#070709] text-[#E5E5E7] flex flex-col font-sans select-none relative z-50">
      {/* High-Precision Fluid Telemetry Progress Gauge */}
      <div className="h-1 w-full bg-[#0F0F13] sticky top-0 z-50">
        <motion.div 
          animate={{ width: `${progressPercent}%` }}
          transition={{ ease: 'linear', duration: 1 }}
          className={`h-full shadow-glow ${isTimeCritical ? 'bg-rose-500 shadow-rose-500/20' : 'bg-[#C5A880] shadow-[#C5A880]/20'}`}
        />
      </div>

      {/* Nav Rail Header */}
      <header className="px-6 py-4 border-b border-white/[0.04] bg-[#0F0F13]/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
            <Cpu size={16} />
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-widest text-[#C5A880] font-bold uppercase">Assessment Node</span>
            <h2 className="text-xs font-bold text-[#F5F5F7] truncate max-w-sm">{quiz?.title || 'Knowledge Assessment'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-sm font-bold ${isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-[#C5A880]'}`}>
            {formatTimer(timeLeftMs)}
          </span>
          {!result && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg bg-[#14141A] border border-white/5 text-[#8E8E93] hover:text-[#F5F5F7] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Primary Interaction Workspace */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 flex flex-col justify-center py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#C5A880] font-bold">
                <span>Evaluation Node {currentIdx + 1} of {totalQuestions}</span>
                <div className="h-px flex-1 bg-white/[0.04]" />
              </div>

              <h3 className="text-lg font-bold text-[#F5F5F7] tracking-tight leading-snug">
                {currentQuestion?.text || 'Loading evaluation prompt...'}
              </h3>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {currentQuestion?.options?.map((option, oIdx) => {
                  const isSelected = selections[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs font-medium tracking-wide flex items-center justify-between transition-all duration-200 ${
                        isSelected 
                          ? 'bg-[#C5A880]/5 border-[#C5A880]/40 text-[#C5A880]' 
                          : 'bg-[#0F0F13] border-white/[0.04] text-[#8E8E93] hover:bg-[#14141A] hover:border-white/10'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#C5A880]' : 'border-white/10'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                <Button variant="secondary" size="sm" onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))} disabled={currentIdx === 0}>
                  <ChevronLeft size={14} className="mr-1" /> Back
                </Button>

                {currentIdx < totalQuestions - 1 ? (
                  <Button variant="primary" size="sm" onClick={() => setCurrentIdx((p) => p + 1)} disabled={selections[currentIdx] === undefined}>
                    Next <ChevronRight size={14} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleFinalizeCompilation(false)}
                    disabled={selections[currentIdx] === undefined || isSubmittingQuiz}
                    className="bg-[#C5A880] text-[#070709] hover:bg-[#E5E5E7]"
                  >
                    {isSubmittingQuiz ? 'Processing...' : 'Finalize Matrix'}
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            /* Analysis & Telemetry Matrix Summary Card */
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] text-center space-y-6 shadow-2xl">
              <div className={`w-12 h-16 mx-auto flex items-center justify-center text-xl ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.passed ? <Award size={36} /> : <AlertTriangle size={36} />}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#F5F5F7] tracking-tight">{result.passed ? 'Matrix Evaluation Certified' : 'Threshold Index Deficiency'}</h4>
                <p className="text-[11px] text-[#8E8E93] font-light max-w-xs mx-auto">Calculated telemetry outputs map directly into backend record registries.</p>
              </div>

              <div className="py-4 border-y border-white/[0.04] grid grid-cols-2 gap-4 max-w-sm mx-auto font-mono text-center">
                <div>
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider block mb-1">
                    Accuracy Factor
                  </span>
                  <span className={`text-2xl font-black ${result.passed ? 'text-[#C5A880]' : 'text-rose-400'}`}>
                    {result.percentage}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider block mb-1">
                    Valid Hits
                  </span>
                  <span className="text-2xl font-black text-[#F5F5F7]">
                    {result.score} / {result.totalQuestions}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="primary" size="sm" onClick={() => navigate(-1)} className="px-6">
                  Terminate Node Session
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export { QuizPage };
