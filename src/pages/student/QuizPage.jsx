import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trophy,
  Target,
  BookOpen,
  ArrowRight,
  Home,
  RefreshCw,
  Flag,
} from "lucide-react";
import toast from "react-hot-toast";
import { quizApi } from "../../api/quizApi";
import { useAuth } from "../../context/AuthContext";

const QuizPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch quiz and start attempt
  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      // Get quiz with questions
      const quizData = await quizApi.getStudentQuizWithQuestions(quizId);
      if (quizData?.data) {
        setQuiz(quizData.data);
        setTimeRemaining(quizData.data.timeLimit || 0);
      }

      // Start new attempt
      const attemptData = await quizApi.startQuizAttempt(quizId);
      if (attemptData?.data) {
        setAttempt(attemptData.data);
      }
    } catch (err) {
      console.error("[QuizPage] Failed to load quiz", err);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showResults && !loading) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, showResults, loading]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Submit all answers
      for (const [questionId, answer] of Object.entries(answers)) {
        await quizApi.submitAnswer(quizId, attempt?.id, {
          questionId,
          answer,
        });
      }

      // Submit the attempt
      const submitData = await quizApi.submitQuizAttempt(quizId, attempt?.id);
      
      // Get results
      const resultData = await quizApi.getAttemptResult(quizId, attempt?.id);
      if (resultData?.data) {
        setResult(resultData.data);
        setShowResults(true);
        toast.success("Quiz submitted successfully!");
      }
    } catch (err) {
      console.error("[QuizPage] Failed to submit quiz", err);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults && result) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <Trophy size={48} className="text-white" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2">Quiz Completed!</h1>
            <p className="text-slate-500 mb-8">Here's how you performed</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-3xl font-black text-emerald-600">{result.score || 0}</div>
                <div className="text-xs text-slate-600">Score</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-3xl font-black text-blue-600">{result.correctAnswers || 0}</div>
                <div className="text-xs text-slate-600">Correct</div>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <div className="text-3xl font-black text-orange-600">{result.percentage || 0}%</div>
                <div className="text-xs text-slate-600">Percentage</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                <Home size={18} />
                Back to Course
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                  fetchQuiz();
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                <RefreshCw size={18} />
                Retake Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (quiz?.questions?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{quiz?.title || "Quiz"}</h1>
              <p className="text-sm text-slate-500">
                Question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={18} />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
              <button
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="text-slate-500 hover:text-slate-700"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                {currentQuestionIndex + 1}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                {currentQuestion?.questionText || currentQuestion?.question}
              </h2>
            </div>

            {currentQuestion?.questionImage && (
              <img
                src={currentQuestion.questionImage}
                alt="Question"
                className="max-w-full h-auto rounded-xl mb-4"
              />
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options?.map((option, idx) => {
              const isSelected = answers[currentQuestion?.id] === option.id;
              return (
                <button
                  key={option.id || idx}
                  onClick={() => handleAnswer(currentQuestion?.id, option.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    isSelected
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-orange-500 bg-orange-500" : "border-slate-300"
                    }`}>
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className="font-medium text-slate-900">{option.text || option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {currentQuestionIndex === (quiz?.questions?.length || 0) - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:from-emerald-600 hover:to-green-600 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag size={18} />
                    Submit Quiz
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 transition"
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Question Navigator */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {quiz?.questions?.map((_, idx) => {
              const isAnswered = answers[quiz.questions[idx]?.id];
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    isCurrent
                      ? "bg-orange-500 text-white"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
