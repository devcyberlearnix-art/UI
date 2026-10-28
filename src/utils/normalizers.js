/**
 * Defensive Payload Normalization Layer
 * 
 * Handles all backend response envelope variations:
 * 1. Raw JSON Entities (e.g. { id: 1, title: "..." })
 * 2. Standard Envelopes ({ success: true, data: T, message: "" })
 * 3. Spring Data Page Envelopes ({ content: T[], totalElements: N, totalPages: M, pageable: {...} })
 * 4. Direct Arrays (e.g. [ ... ])
 * 
 * Ensures safe, immutable, type-consistent models for Ink & Onyx UI views.
 */

// Universal unwrap helper
export const unwrapPayload = (response) => {
  if (response === null || response === undefined) return null;
  // If response has axios response wrapper
  const root = response?.data !== undefined ? response.data : response;
  if (root === null || root === undefined) return null;

  // If envelope has { success: true, data: ... } or { status: 200, data: ... }
  if (typeof root === 'object' && !Array.isArray(root) && 'data' in root && root.data !== undefined) {
    return root.data;
  }
  return root;
};

// Extract array from any paginated or enveloped structure
export const unwrapArray = (response, fallbackKeys = ['content', 'items', 'courses', 'orders', 'users', 'data']) => {
  const unwrapped = unwrapPayload(response);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (!unwrapped || typeof unwrapped !== 'object') return [];

  for (const key of fallbackKeys) {
    if (Array.isArray(unwrapped[key])) {
      return unwrapped[key];
    }
  }
  return [];
};

/**
 * Normalize Course Entity
 */
export const normalizeCourse = (raw, index = 0) => {
  if (!raw) return null;
  const id = raw.id ?? raw.courseId ?? raw._id ?? `course-${index}`;
  const title = raw.title || raw.name || raw.courseName || 'Untitled Course';
  const subtitle = raw.subtitle || raw.shortDescription || '';
  const description = raw.description || raw.summary || 'Comprehensive curriculum engineered by industry practitioners.';
  const category = raw.category || raw.categoryName || 'Distributed Systems';
  const level = raw.level || raw.difficultyLevel || 'Intermediate';
  const language = raw.language || 'English';
  const price = Number(raw.price ?? raw.amount ?? raw.coursePrice ?? 0);
  const originalPrice = raw.originalPrice ? Number(raw.originalPrice) : null;
  const rating = Number(raw.rating ?? raw.avgRating ?? 4.8);
  const totalReviews = Number(raw.totalReviews ?? raw.reviewCount ?? 0);
  const students = Number(raw.students ?? raw.enrollmentCount ?? raw.enrolledStudents ?? 0);
  const duration = raw.duration || raw.estimatedDuration || 'Self-paced';
  const instructor = raw.instructor?.name || raw.instructorName || raw.creator || (typeof raw.instructor === 'string' ? raw.instructor : 'Faculty Lead');
  const instructorId = raw.instructorId || raw.instructor?.id || 'instructor-1';
  const thumbnail = raw.thumbnail || raw.image || raw.imageUrl || raw.banner || 'https://res.cloudinary.com/dmvmvdefr/image/upload/v1791038444/cyberlearnix/course-thumbnails/cyberlearnix/course-thumbnails/course_2.svg';
  const status = (raw.status || 'PUBLISHED').toUpperCase();
  const isPremium = Boolean(raw.premium ?? raw.isPremium ?? false);
  const badge = raw.badge || raw.tag || (rating >= 4.8 ? 'Top Rated' : null);

  return {
    id,
    courseId: id,
    title,
    subtitle,
    description,
    category,
    level,
    language,
    price,
    originalPrice,
    rating,
    totalReviews,
    students,
    duration,
    instructor,
    instructorId,
    thumbnail,
    status,
    isPremium,
    badge,
    sections: Array.isArray(raw.sections) ? raw.sections.map(normalizeSection) : [],
  };
};

/**
 * Normalize Curriculum Section
 */
export const normalizeSection = (section, secIdx = 0) => {
  if (!section) return null;
  const id = section.id ?? section.sectionId ?? `sec-${secIdx}`;
  const title = section.title || section.sectionTitle || section.name || `Module ${secIdx + 1}`;
  const lectures = Array.isArray(section.lectures)
    ? section.lectures.map((l, lIdx) => normalizeLecture(l, lIdx, id))
    : Array.isArray(section.lessons)
    ? section.lessons.map((l, lIdx) => normalizeLecture(l, lIdx, id))
    : [];

  return {
    id,
    title,
    lectures,
    duration: section.duration || `${lectures.length * 15} mins`,
    resources: Array.isArray(section.resources) ? section.resources : [],
    quiz: section.quiz ? normalizeQuiz(section.quiz) : null,
  };
};

/**
 * Normalize Lecture / Lesson
 */
export const normalizeLecture = (lec, idx = 0, sectionId = null) => {
  if (!lec) return null;
  const id = lec.id ?? lec.lectureId ?? lec.lessonId ?? `lec-${idx}`;
  const title = lec.title || lec.lessonName || `Lecture ${idx + 1}`;
  const duration = lec.duration || '15:00';
  const videoUrl = lec.videoUrl || lec.streamUrl || lec.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const completed = Boolean(lec.completed ?? lec.isCompleted ?? false);
  const progressPercent = Number(lec.progressPercent ?? (completed ? 100 : 0));
  const isFree = Boolean(lec.isFree ?? lec.preview ?? false);

  return {
    id,
    sectionId,
    title,
    duration,
    videoUrl,
    completed,
    progressPercent,
    isFree,
    resources: Array.isArray(lec.resources) ? lec.resources : [],
  };
};

/**
 * Normalize Cart Payload
 */
export const normalizeCart = (response) => {
  if (!response) {
    return {
      cartId: null,
      totalCourses: 0,
      courses: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      couponCode: null,
    };
  }

  const data = unwrapPayload(response);
  const rawCourses = unwrapArray(data, ['courses', 'items']);

  const courses = rawCourses.map((c, idx) => ({
    id: String(c.courseId || c.id || `item-${idx}`),
    courseId: String(c.courseId || c.id || `item-${idx}`),
    title: c.title || c.courseName || c.name || 'Curriculum Module',
    price: Number(c.price || c.coursePrice || c.amount || 0),
    originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
    quantity: Number(c.quantity || 1),
    thumbnail: c.thumbnail || c.image || c.imageUrl || 'https://res.cloudinary.com/dmvmvdefr/image/upload/v1791038444/cyberlearnix/course-thumbnails/cyberlearnix/course-thumbnails/course_2.svg',
    instructor: c.instructor?.name || c.instructorName || (typeof c.instructor === 'string' ? c.instructor : 'Faculty Lead'),
  }));

  const subtotal = courses.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const discount = Number(data?.discount || data?.discountAmount || 0);
  const tax = Number(data?.tax || 0);
  const total = Number(data?.totalAmount ?? data?.total ?? Math.max(0, subtotal - discount + tax));

  return {
    cartId: data?.cartId || data?.id || null,
    totalCourses: typeof data?.totalCourses === 'number' ? data.totalCourses : courses.length,
    courses,
    subtotal,
    discount,
    tax,
    total,
    couponCode: data?.couponCode || data?.coupon || null,
  };
};

/**
 * Normalize Order Entity
 */
export const normalizeOrder = (raw, index = 0) => {
  if (!raw) return null;
  const id = raw.orderId || raw.id || raw._id || `ORD-${1000 + index}`;
  const status = (raw.status || raw.orderStatus || 'PENDING').toUpperCase();
  const totalAmount = Number(raw.totalAmount ?? raw.amount ?? raw.total ?? 0);
  const currency = raw.currency || 'USD';
  const createdAt = raw.createdAt || raw.orderDate || raw.date || new Date().toISOString();
  
  // Extract order line items
  let items = [];
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items.map((it, itIdx) => ({
      courseId: it.courseId || it.id || `item-${itIdx}`,
      title: it.courseName || it.title || it.name || `Course #${it.courseId || itIdx + 1}`,
      price: Number(it.price || it.amount || 0),
      quantity: Number(it.quantity || 1),
      thumbnail: it.thumbnail || it.image || null,
    }));
  } else if (Array.isArray(raw.courseIds) && raw.courseIds.length > 0) {
    items = raw.courseIds.map((cid) => ({
      courseId: cid,
      title: `Course #${cid}`,
      price: totalAmount / raw.courseIds.length,
      quantity: 1,
    }));
  } else {
    items = [{
      courseId: raw.courseId || 'item-1',
      title: raw.courseName || raw.courseTitle || 'Curriculum License',
      price: totalAmount,
      quantity: 1,
    }];
  }

  return {
    id,
    orderId: id,
    status,
    totalAmount,
    currency,
    items,
    itemCount: items.length,
    createdAt,
    customerName: raw.customerName || raw.userName || raw.studentName || raw.user?.name || 'Candidate',
    customerEmail: raw.customerEmail || raw.userEmail || raw.user?.email || '',
    paymentMethod: raw.paymentMethod || raw.paymentMode || 'STRIPE',
    txHash: raw.transactionHash || raw.txHash || `0x${id.replace(/-/g, '').slice(0, 16)}`,
  };
};

/**
 * Normalize User Profile & Device Sessions
 */
export const normalizeUserProfile = (raw) => {
  if (!raw) return null;
  const data = unwrapPayload(raw);
  return {
    id: data.id || data.userId || data._id || null,
    firstName: data.firstName || data.name?.split(' ')[0] || '',
    lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
    displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email?.split('@')[0] || 'User',
    email: data.email || '',
    phone: data.phone || data.mobile || '',
    avatar: data.avatar || data.profileImage || null,
    role: (data.role || data.role1 || 'student').toLowerCase(),
    bio: data.bio || data.headline || '',
    city: data.city || data.location || '',
    skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' && data.skills ? data.skills.split(',').map(s => s.trim()) : []),
    emailVerified: Boolean(data.emailVerified ?? data.status === 'ACTIVE'),
    createdAt: data.createdAt || null,
  };
};

export const normalizeSession = (sess, idx = 0) => {
  if (!sess) return null;
  return {
    id: sess.id || sess.sessionId || `sess-${idx}`,
    device: sess.device || sess.deviceType || sess.browser || 'Chrome on Windows 11',
    ip: sess.ip || sess.ipAddress || '127.0.0.1',
    lastActive: sess.lastActive || sess.lastSeen || sess.createdAt || 'Active Now',
    isCurrent: Boolean(sess.isCurrent ?? sess.current ?? (idx === 0)),
  };
};

/**
 * Normalize Assessment & Quiz
 */
export const normalizeQuiz = (raw) => {
  if (!raw) return null;
  const data = unwrapPayload(raw);
  const id = data.id || data.quizId || null;
  const title = data.title || 'Knowledge Check Assessment';
  const durationMinutes = Number(data.durationMinutes || data.timeLimit || 15);
  const passingScore = Number(data.passingScore || data.passingGrade || 70);
  const totalQuestions = Number(data.totalQuestions || (Array.isArray(data.questions) ? data.questions.length : 0));
  
  const questions = Array.isArray(data.questions)
    ? data.questions.map((q, qIdx) => ({
        id: q.id || `q-${qIdx}`,
        text: q.questionText || q.question || q.text || `Question ${qIdx + 1}`,
        type: q.type || 'MULTIPLE_CHOICE',
        points: Number(q.points || 1),
        options: Array.isArray(q.options)
          ? q.options.map((opt, oIdx) => ({
              id: opt.id ?? String.fromCharCode(65 + oIdx),
              text: opt.optionText || opt.text || String(opt),
            }))
          : [],
      }))
    : [];

  return {
    id,
    title,
    durationMinutes,
    timeLimitSeconds: durationMinutes * 60,
    passingScore,
    totalQuestions: totalQuestions || questions.length,
    questions,
  };
};

/**
 * Normalize Assignment
 */
export const normalizeAssignment = (raw, idx = 0) => {
  if (!raw) return null;
  const data = unwrapPayload(raw);
  return {
    id: data.id || data.assignmentId || `asgn-${idx}`,
    title: data.title || data.assignmentTitle || 'Architecture Milestone Lab',
    description: data.description || data.instructions || '',
    courseId: data.courseId || null,
    dueDate: data.dueDate || data.deadline || null,
    maxScore: Number(data.maxScore || data.points || 100),
    status: (data.status || 'PUBLISHED').toUpperCase(),
    submitted: Boolean(data.submitted ?? data.isSubmitted ?? false),
    grade: data.grade !== undefined && data.grade !== null ? Number(data.grade) : null,
    feedback: data.feedback || '',
  };
};

/**
 * Normalize Review
 */
export const normalizeReview = (raw, idx = 0) => {
  if (!raw) return null;
  const data = unwrapPayload(raw);
  return {
    id: data.id || data.reviewId || data.reviewUuid || `rev-${idx}`,
    user: data.user?.name || data.userName || data.author || 'Senior Practitioner',
    rating: Number(data.rating || data.stars || 5),
    comment: data.comment || data.content || data.reviewText || '',
    date: data.createdAt || data.date || new Date().toISOString().split('T')[0],
    courseTitle: data.courseTitle || data.courseName || (data.courseId ? `Course #${data.courseId}` : 'Curriculum'),
    hidden: Boolean(data.hidden ?? data.isHidden ?? false),
  };
};

/**
 * Normalize Notification Entity
 */
export const normalizeNotification = (raw, idx = 0) => {
  if (!raw) return null;
  const data = unwrapPayload(raw);
  const id = data.notificationId || data.id || data.uuid || `notif-${idx}`;
  const title = data.title || 'System Notification';
  const message = data.message || data.content || data.body || '';
  const read = Boolean(data.read ?? (data.status === 'READ') ?? false);
  const status = data.status || (read ? 'READ' : 'UNREAD');
  const priority = (data.priority || 'NORMAL').toUpperCase();
  const createdAt = data.createdAt || data.timestamp || new Date().toISOString();
  const type = data.type || (Array.isArray(data.channels) ? data.channels[0] : 'IN_APP');

  return {
    id,
    notificationId: id,
    title,
    message,
    read,
    status,
    priority,
    createdAt,
    type,
    channels: Array.isArray(data.channels) ? data.channels : ['IN_APP'],
  };
};

/**
 * Normalizes the backend StudentQuizResponse containing the assessment layout
 */
export const normalizeBackendQuiz = (raw) => {
  const q = raw?.data || raw || {};
  const questions = Array.isArray(q.questions) ? q.questions : [];
  
  return {
    id: q.quizId || q.id || null,
    title: q.title || 'Module Evaluation Matrix',
    timeLimitMs: (q.durationMinutes || q.timeLimit || q.timeLimitMinutes || 10) * 60 * 1000,
    questions: questions.map((qn, index) => {
      const options = Array.isArray(qn.options) ? qn.options : [];
      return {
        id: qn.questionId || qn.id || `q-${index}`,
        text: qn.questionText || qn.text || 'Technical Question Prompt',
        options: options.map((o) => (typeof o === 'string' ? o : o.optionText || o.text || ''))
      };
    })
  };
};

/**
 * Normalizes QuizResultResponse following compilation submission
 */
export const normalizeQuizResult = (raw) => {
  const r = raw?.data || raw || {};
  const questions = Array.isArray(r.questions) ? r.questions : (Array.isArray(r.questionResults) ? r.questionResults : []);
  
  return {
    score: r.score ?? r.scoreObtained ?? 0,
    totalQuestions: r.totalQuestions ?? (questions.length > 0 ? questions.length : (r.totalMarks ? r.totalMarks : 0)),
    percentage: r.percentage ?? (r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0),
    passed: r.passed ?? r.isPassed ?? false,
    questions: questions.map((qn, index) => ({
      id: qn.questionId || qn.id || `q-${index}`,
      text: qn.questionText || 'Question Vector',
      selectedOption: qn.selectedOption ?? null,
      correctOption: qn.correctOption ?? null,
      isCorrect: qn.correct ?? qn.isCorrect ?? (qn.selectedOption === qn.correctOption)
    }))
  };
};
