import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  Code,
  Copy,
  Check,
  Filter,
  Sparkles,
  Flame,
  User,
  Terminal,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  ThumbsUp,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../api/reviewApi';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

// =========================================================================
// SYNTAX HIGHLIGHTER & MARKDOWN TOKEN RENDERER
// =========================================================================
function formatInlineTokens(text) {
  if (!text) return null;

  // Split by inline code `...`
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-obsidian-950 border border-obsidian-800 text-cyan-300 font-mono text-[11px] font-semibold tracking-wide"
        >
          {code}
        </code>
      );
    }

    // Bold formatting **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={`${index}-${bIdx}`} className="font-bold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

function CodeSnippetBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Snippet copied to clipboard');
    }
  };

  // Colorize tokens for yaml, json, bash, sql, etc.
  const colorizedLines = useMemo(() => {
    return code.split('\n').map((line, lineIdx) => {
      let styled = line;
      // Comments with crisp #8E8E93 contrast
      if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
        return (
          <div key={lineIdx} className="text-[#8E8E93] italic font-mono">
            {line}
          </div>
        );
      }
      // Diff additions
      if (line.startsWith('+')) {
        return (
          <div key={lineIdx} className="text-emerald-400 bg-emerald-950/20 px-1 -mx-1 rounded">
            {line}
          </div>
        );
      }
      // Diff removals
      if (line.startsWith('-')) {
        return (
          <div key={lineIdx} className="text-rose-400 bg-rose-950/20 px-1 -mx-1 rounded">
            {line}
          </div>
        );
      }

      // Keys in YAML or JSON (e.g. `service_name:`, `"id":`)
      const keyMatch = line.match(/^(\s*)([a-zA-Z0-9_\-"']+)(:)/);
      if (keyMatch) {
        const indent = keyMatch[1];
        const key = keyMatch[2];
        const rest = line.slice(keyMatch[0].length);
        return (
          <div key={lineIdx}>
            <span>{indent}</span>
            <span className="text-cyan-400 font-semibold">{key}</span>
            <span className="text-ink-400">:</span>
            <span className="text-amber-300">{rest}</span>
          </div>
        );
      }

      return (
        <div key={lineIdx} className="text-ink-200">
          {line}
        </div>
      );
    });
  }, [code]);

  return (
    <div className="my-2.5 rounded-xl border border-obsidian-800 bg-obsidian-950 overflow-hidden shadow-inner group">
      <div className="px-3.5 py-1.5 bg-obsidian-900/80 border-b border-obsidian-800/80 flex items-center justify-between text-[11px] font-mono text-ink-400">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <Terminal className="w-3.5 h-3.5" />
          {language || 'config'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-obsidian-800/60 hover:bg-obsidian-800 text-ink-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 font-mono text-xs overflow-x-auto leading-relaxed select-text">
        {colorizedLines}
      </div>
    </div>
  );
}

function FormattedMessageBody({ content }) {
  // Regex to match fenced code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      elements.push(
        <p key={lastIndex} className="text-sm text-ink-200 leading-relaxed font-light whitespace-pre-wrap">
          {formatInlineTokens(textBefore)}
        </p>
      );
    }

    const language = match[1] || 'text';
    const code = match[2];
    elements.push(
      <CodeSnippetBlock key={match.index} language={language} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.substring(lastIndex);
  if (remaining.trim()) {
    elements.push(
      <p key={lastIndex} className="text-sm text-ink-200 leading-relaxed font-light whitespace-pre-wrap">
        {formatInlineTokens(remaining)}
      </p>
    );
  }

  return <div className="space-y-1.5">{elements.length > 0 ? elements : <p className="text-sm">{content}</p>}</div>;
}

// Initial Telemetry Seed Feed
const SEED_DISCUSSIONS = [
  {
    id: 'disc-1',
    author: 'Marcus Vance',
    role: 'Staff Infrastructure Architect',
    avatar: 'M',
    time: '2 hours ago',
    type: 'qa', // 'qa' | 'stream'
    isSolved: true,
    upvotes: 14,
    content: `Does the Envoy circuit breaker handle transient gRPC deadline exceeded exceptions out of the box, or must we declare consecutive 5xx thresholds in the filter chamber?

\`\`\`yaml
circuit_breakers:
  thresholds:
    - priority: DEFAULT
      max_connections: 1024
      max_pending_requests: 128
      max_requests: 2048
      consecutive_5xx: 3
\`\`\``,
    replies: [
      {
        id: 'rep-1',
        author: 'Elena Rostova',
        role: 'Principal Systems Engineer',
        avatar: 'E',
        time: '1 hour ago',
        isInstructorVerified: true,
        content: `You must configure **consecutive_gateway_errors** alongside 5xx. If your gRPC headers emit \`grpc-status: 4\` (DEADLINE_EXCEEDED), Envoy maps this to HTTP status \`504 Gateway Timeout\`. Make sure the cluster's \`retry_policy\` includes \`deadline-exceeded\`.`,
      },
    ],
  },
  {
    id: 'disc-2',
    author: 'Devon Shaw',
    role: 'Senior Cloud Engineer',
    avatar: 'D',
    time: '45 mins ago',
    type: 'qa',
    isSolved: false,
    upvotes: 6,
    content: `How can we prevent Kafka consumer partition rebalancing thrashing when deploying rolling container updates with Kubernetes?`,
    replies: [
      {
        id: 'rep-2',
        author: 'Marcus Vance',
        role: 'Staff Infrastructure Architect',
        avatar: 'M',
        time: '30 mins ago',
        isInstructorVerified: false,
        content: `Enable **Static Membership** using \`group.instance.id\`. The coordinator will retain partition assignments during pod restarts until \`session.timeout.ms\` expires.`,
      },
    ],
  },
  {
    id: 'stream-1',
    author: 'Sora Chen',
    role: 'Distributed Systems Fellow',
    avatar: 'S',
    time: '4 mins ago',
    type: 'stream',
    upvotes: 2,
    content: `Verified idempotency keys on node cluster 03. Total write latency plummeted from 42ms down to **6.4ms**! 🚀`,
    replies: [],
  },
  {
    id: 'stream-2',
    author: 'Liam Novak',
    role: 'Platform Engineer',
    avatar: 'L',
    time: 'Just now',
    type: 'stream',
    upvotes: 1,
    content: `Watching lecture 1.2 on Kafka offsets. The sliding window ring buffer visualization makes consensus so intuitive.`,
    replies: [],
  },
];

export const LiveDiscussionHub = ({ courseId = '1', lectureTitle = 'Current Lecture' }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters: 'all' | 'qa' | 'stream' | 'solved'
  const [filterMode, setFilterMode] = useState('all');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [postType, setPostType] = useState('qa'); // 'qa' or 'stream'
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);

  const scrollContainerRef = useRef(null);
  const socketRef = useRef(null);

  // TanStack Query: Fetch Discussion Feed for Course
  const { data: messages = SEED_DISCUSSIONS, isLoading } = useQuery({
    queryKey: ['classroom-discussion', courseId],
    queryFn: async () => {
      try {
        const res = await reviewApi.getCourseReviews(courseId || '1');
        const rawList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.content)
          ? res.content
          : Array.isArray(res)
          ? res
          : [];

        if (rawList.length > 0) {
          return rawList.map((r, idx) => ({
            id: r.id || r.reviewId || `rev-${idx}`,
            author: r.userName || r.user?.name || 'Practitioner Node',
            role: r.user?.role || 'Systems Fellow',
            avatar: (r.userName || r.user?.name || 'P')[0].toUpperCase(),
            timestamp: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
            content: r.reviewText || r.comment || 'Technical discussion entry',
            type: 'stream',
            upvotes: Number(r.rating || 5),
            isSolved: false,
            replies: [],
          }));
        }
      } catch (err) {
        console.warn('[LiveDiscussionHub] reviewApi.getCourseReviews fallback to cache');
      }

      // Check local storage sync cache first
      const cached = localStorage.getItem(`lms_classroom_chat_${courseId}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // fallback
        }
      }
      return SEED_DISCUSSIONS;
    },
    staleTime: 1000 * 15,
  });

  // Keep local storage synchronized
  useEffect(() => {
    if (messages && messages.length > 0) {
      localStorage.setItem(`lms_classroom_chat_${courseId}`, JSON.stringify(messages));
    }
  }, [messages, courseId]);

  // Zero-CLS Scroll Guard
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollPrompt(!isNearBottom);
  };

  const scrollToBottom = (smooth = true) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setShowScrollPrompt(false);
  };

  // Real-time Event-Driven Telemetry Socket Simulation
  useEffect(() => {
    let ws = null;
    let fallbackInterval = null;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/classroom/${courseId}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsLiveConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.type === 'DISCUSSION_MESSAGE') {
            queryClient.setQueryData(['classroom-discussion', courseId], (prev = []) => [
              ...prev,
              payload.message,
            ]);
            toast('Live technical transmission received', { icon: '📡' });
          }
        } catch (e) {
          // non-critical
        }
      };

      ws.onerror = () => {
        setIsLiveConnected(false);
      };

      socketRef.current = ws;
    } catch {
      setIsLiveConnected(false);
    }

    // Fallback intermittent telemetry simulation every 45s (keeps session feeling alive)
    fallbackInterval = setInterval(() => {
      const livePulse = {
        id: `stream_${Date.now()}`,
        author: 'Telemetry Node Echo',
        role: 'Mesh Daemon',
        avatar: 'T',
        time: 'Just now',
        type: 'stream',
        upvotes: 0,
        content: `Heartbeat acknowledged: \`200 OK\`. Latency variance standard deviation: \`±1.2ms\` on stream channel.`,
        replies: [],
      };

      queryClient.setQueryData(['classroom-discussion', courseId], (prev = []) => {
        // Prevent excessive growth
        if (prev.length > 25) return prev;
        return [...prev, livePulse];
      });
    }, 45000);

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [courseId, queryClient]);

  // TanStack Query Mutation: Add New Message Optimistically
  const postMessageMutation = useMutation({
    mutationFn: async (newMessage) => {
      // Broadcast to live backend review/discussion endpoint
      try {
        await reviewApi.addReview({
          courseId: courseId || '1',
          reviewText: newMessage.content || newMessage.reviewText || '',
          rating: 5,
        });
      } catch (e) {
        console.warn('[LiveDiscussionHub] addReview network dispatch saved locally:', e?.message);
      }

      // If WebSockets is connected, emit through socket
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'NEW_MESSAGE', payload: newMessage }));
      }
      return newMessage;
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['classroom-discussion', courseId] });
      const previousData = queryClient.getQueryData(['classroom-discussion', courseId]) || [];

      queryClient.setQueryData(['classroom-discussion', courseId], (old = []) => [
        ...old,
        newMessage,
      ]);

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['classroom-discussion', courseId], context.previousData);
      }
      toast.error('Failed to broadcast transmission.');
    },
    onSuccess: () => {
      setTimeout(() => scrollToBottom(true), 100);
      toast.success('Query registered into session log.', { icon: '🚀' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-discussion', courseId] });
    },
  });

  // Upvote Mutation
  const upvoteMutation = useMutation({
    mutationFn: async (messageId) => messageId,
    onMutate: async (messageId) => {
      queryClient.setQueryData(['classroom-discussion', courseId], (old = []) =>
        old.map((m) => (m.id === messageId ? { ...m, upvotes: m.upvotes + 1 } : m))
      );
    },
  });

  // Mark Solved Mutation
  const toggleSolvedMutation = useMutation({
    mutationFn: async (messageId) => messageId,
    onMutate: async (messageId) => {
      queryClient.setQueryData(['classroom-discussion', courseId], (old = []) =>
        old.map((m) => (m.id === messageId ? { ...m, isSolved: !m.isSolved } : m))
      );
      toast.success('Architectural inquiry status mutated.');
    },
  });

  // Add Reply
  const addReply = (parentMessageId) => {
    if (!replyInput.trim()) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      author: user?.name || 'Senior Architect',
      role: user?.role === 'instructor' ? 'Course Instructor' : 'Systems Fellow',
      avatar: (user?.name || 'S')[0].toUpperCase(),
      time: 'Just now',
      isInstructorVerified: user?.role === 'instructor' || user?.role === 'admin',
      content: replyInput.trim(),
    };

    queryClient.setQueryData(['classroom-discussion', courseId], (old = []) =>
      old.map((m) =>
        m.id === parentMessageId ? { ...m, replies: [...(m.replies || []), newReply] } : m
      )
    );

    setReplyInput('');
    setReplyingToId(null);
    toast.success('Reply submitted.');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newEntry = {
      id: `disc_${Date.now()}`,
      author: user?.name || 'Senior Architect',
      role: user?.role === 'instructor' ? 'Course Instructor' : 'Systems Fellow',
      avatar: (user?.name || 'S')[0].toUpperCase(),
      time: 'Just now',
      type: postType,
      isSolved: false,
      upvotes: 0,
      content: messageInput.trim(),
      replies: [],
    };

    postMessageMutation.mutate(newEntry);
    setMessageInput('');
  };

  const insertCodeTemplate = () => {
    const template = `\n\`\`\`yaml\n# Configuration Invariant Spec\nservice: "order-stream-processor"\nconcurrency: 64\nretry_backoff: 1.5\n\`\`\`\n`;
    setMessageInput((prev) => prev + template);
  };

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filterMode === 'all') return true;
      if (filterMode === 'qa') return m.type === 'qa';
      if (filterMode === 'stream') return m.type === 'stream';
      if (filterMode === 'solved') return m.type === 'qa' && m.isSolved;
      return true;
    });
  }, [messages, filterMode]);

  return (
    <div className="flex flex-col h-full bg-obsidian-950/60 rounded-2xl border border-obsidian-800/80 overflow-hidden shadow-2xl relative">
      {/* ===================================================================
          1. TOP FILTER CONTROLS & TELEMETRY STATUS BAR
          =================================================================== */}
      <div className="p-4 bg-obsidian-900/60 border-b border-obsidian-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Dual Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs select-none">
          {[
            { id: 'all', label: 'All Transmissions' },
            { id: 'qa', label: 'Architectural Q&A' },
            { id: 'solved', label: 'Solved Only' },
            { id: 'stream', label: 'Live Commentary' },
          ].map((tab) => {
            const active = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-glow shadow-cyan-500/10'
                    : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Live Channel Heartbeat Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-400">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveConnected ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveConnected ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
            />
          </span>
          <span className="font-semibold text-ink-300">
            {isLiveConnected ? 'Mesh Stream Sync: ACTIVE' : 'Local Telemetry Ingest'}
          </span>
        </div>
      </div>

      {/* ===================================================================
          2. OPTIMISTIC ZERO-CLS SCROLLING FEED CONTAINER
          =================================================================== */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[520px] custom-scrollbar scroll-smooth"
      >
        {filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-ink-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-obsidian-700" />
            <p className="text-sm font-mono">No matching telemetry transmissions logged.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className={`p-4 rounded-xl border transition-all ${
                msg.isSolved
                  ? 'bg-emerald-950/10 border-emerald-500/30'
                  : 'bg-transparent border-white/[0.04]'
              }`}
            >
              {/* Header: Author + Meta */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {msg.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-100">{msg.author}</span>
                      {msg.type === 'qa' && (
                        <Badge
                          variant={msg.isSolved ? 'success' : 'secondary'}
                          className="text-[10px] font-mono py-0"
                        >
                          {msg.isSolved ? 'SOLVED' : 'QUESTION'}
                        </Badge>
                      )}
                      {msg.type === 'stream' && (
                        <Badge variant="cyan" className="text-[10px] font-mono py-0">
                          LIVE STREAM
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-ink-500 font-mono">
                      {msg.role} • {msg.time}
                    </span>
                  </div>
                </div>

                {/* Upvotes & Status Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => upvoteMutation.mutate(msg.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-obsidian-950 border border-obsidian-800 text-ink-400 hover:text-cyan-300 text-xs font-mono transition-colors"
                    title="Upvote transmission"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{msg.upvotes}</span>
                  </button>

                  {msg.type === 'qa' && (
                    <button
                      onClick={() => toggleSolvedMutation.mutate(msg.id)}
                      className={`p-1 rounded-lg border transition-colors ${
                        msg.isSolved
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-obsidian-950 border-obsidian-800 text-ink-500 hover:text-emerald-400'
                      }`}
                      title={msg.isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content with Markdown & Code Token Parsing */}
              <div className="pl-11 pr-2">
                <FormattedMessageBody content={msg.content} />

                {/* Replies Thread */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-obsidian-800/60 space-y-3">
                    {msg.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="p-3 rounded-lg bg-obsidian-950/80 border border-obsidian-850 flex items-start gap-3 text-xs"
                      >
                        <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {reply.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-ink-200">{reply.author}</span>
                            {reply.isInstructorVerified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" /> VERIFIED SOLUTION
                              </span>
                            )}
                            <span className="text-[10px] text-ink-500 font-mono">{reply.time}</span>
                          </div>
                          <div className="text-ink-300 leading-relaxed font-light">
                            {formatInlineTokens(reply.content)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Trigger Input */}
                <div className="mt-3 pt-2 flex items-center justify-between">
                  {replyingToId === msg.id ? (
                    <div className="flex items-center gap-2 w-full pt-1">
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addReply(msg.id)}
                        placeholder="Write verified architectural response..."
                        className="flex-1 px-3 py-1.5 bg-obsidian-950 border border-obsidian-800 rounded-lg text-xs text-ink-200 focus:outline-none focus:border-cyan-500/50"
                        autoFocus
                      />
                      <Button variant="secondary" size="sm" onClick={() => addReply(msg.id)}>
                        Post
                      </Button>
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="text-xs text-ink-500 hover:text-ink-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingToId(msg.id)}
                      className="text-xs text-ink-400 hover:text-cyan-400 flex items-center gap-1.5 font-mono transition-colors"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" /> Reply to thread ({msg.replies?.length || 0})
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Auto-Scroll Prompt Pill */}
      <AnimatePresence>
        {showScrollPrompt && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-[#C5A880] text-[#070709] font-mono text-xs font-bold shadow-lg shadow-black/50 flex items-center gap-1.5 z-20 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            New transmissions below
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===================================================================
          3. ADVANCED COMPOSER DOCK (CODE INSERTER + MARKDOWN READY)
          =================================================================== */}
      <form onSubmit={handleSendMessage} className="p-4 bg-obsidian-900/80 border-t border-obsidian-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          {/* Post Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-ink-500 uppercase font-semibold">Transmission Mode:</span>
            <div className="inline-flex rounded-lg bg-obsidian-950 p-0.5 border border-obsidian-800 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setPostType('qa')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  postType === 'qa'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                Inquiry / Question
              </button>
              <button
                type="button"
                onClick={() => setPostType('stream')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  postType === 'stream'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                Commentary Stream
              </button>
            </div>
          </div>

          {/* Quick Syntax Inserter */}
          <button
            type="button"
            onClick={insertCodeTemplate}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-obsidian-950 border border-obsidian-800 text-ink-400 hover:text-cyan-300 font-mono text-[11px] transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            + Code Template
          </button>
        </div>

        {/* Input Textarea Dock */}
        <div className="relative">
          <textarea
            rows={2}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSendMessage(e);
              }
            }}
            placeholder={
              postType === 'qa'
                ? 'Pose a technical architectural query (Supports Markdown & ```yaml ``` blocks)...'
                : 'Stream immediate telemetry or observations into current classroom session...'
            }
            className="w-full p-3.5 pr-24 bg-obsidian-950 border border-obsidian-800 rounded-xl text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:border-cyan-500/50 resize-none font-light tracking-wide transition-all"
          />

          <div className="absolute right-2.5 bottom-3.5 flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!messageInput.trim()}
              isLoading={postMessageMutation.isPending}
              rightIcon={Send}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-glow shadow-cyan-500/20"
            >
              Broadcast
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-ink-600">
          <span>Tip: Press Ctrl+Enter or Cmd+Enter to dispatch</span>
          <span>Dual filter: Answered vs Live</span>
        </div>
      </form>
    </div>
  );
};

export default LiveDiscussionHub;
