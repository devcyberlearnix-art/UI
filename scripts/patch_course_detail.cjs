const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/CourseDetail.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix materials & faqs setters
const oldFaqs = `      const materialsData = await courseApi.getCourseMaterials(courseId);
      if (materialsData?.data) {
        setMaterials(materialsData);
      }

      const faqsData = await courseApi.getCourseFAQs(courseId);
      if (faqsData?.data) {
        setFaqs(faqsData);
      }`;

const newFaqs = `      const materialsData = await courseApi.getCourseMaterials(courseId);
      setMaterials(Array.isArray(materialsData?.data) ? materialsData.data : (Array.isArray(materialsData) ? materialsData : []));

      const faqsData = await courseApi.getCourseFAQs(courseId);
      setFaqs(Array.isArray(faqsData?.data) ? faqsData.data : (Array.isArray(faqsData) ? faqsData : []));`;

// 2. Fix sections & lectures mapping in curriculum tab
const oldCurriculum = `                <div className="space-y-3">
                  {curriculum?.sections && curriculum.sections.length > 0 ? (
                    curriculum.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="rounded-xl bg-[#14141A]/70 border border-white/[0.04] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#C5A880] flex items-center justify-center text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#F5F5F7] truncate">
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-[#71717A] font-mono">
                              {section.lectures?.length || 0} lessons
                            </span>
                            {expandedSections[section.id] ? (
                              <ChevronUp className="w-4 h-4 text-[#71717A]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#71717A]" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedSections[section.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-white/[0.04] divide-y divide-white/[0.04]"
                            >
                              {section.lectures?.map((lecture) => (
                                <div
                                  key={lecture.id}
                                  className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-white/[0.01]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Play className="w-3.5 h-3.5 text-[#C5A880]" />
                                    <span className="text-[#E5E5E7]">{lecture.title}</span>
                                  </div>
                                  <span className="text-[11px] font-mono text-[#71717A]">
                                    {lecture.durationMinutes || 12}m
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))`;

const newCurriculum = `                <div className="space-y-3">
                  {curriculum?.sections && curriculum.sections.length > 0 ? (
                    curriculum.sections.map((section, idx) => {
                      const sectionKey = section.id ?? section.sectionId ?? \`section-\${idx}\`;
                      return (
                        <div
                          key={sectionKey}
                          className="rounded-xl bg-[#14141A]/70 border border-white/[0.04] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSection(sectionKey)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#C5A880] flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-[#F5F5F7] truncate">
                                {section.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] text-[#71717A] font-mono">
                                {section.lectures?.length || 0} lessons
                              </span>
                              {expandedSections[sectionKey] ? (
                                <ChevronUp className="w-4 h-4 text-[#71717A]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#71717A]" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSections[sectionKey] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-white/[0.04] divide-y divide-white/[0.04]"
                              >
                                {section.lectures?.map((lecture, lIdx) => {
                                  const lectureKey = lecture.id ?? lecture.lectureId ?? \`lecture-\${lIdx}\`;
                                  return (
                                    <div
                                      key={lectureKey}
                                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-white/[0.01]"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <Play className="w-3.5 h-3.5 text-[#C5A880]" />
                                        <span className="text-[#E5E5E7]">{lecture.title}</span>
                                      </div>
                                      <span className="text-[11px] font-mono text-[#71717A]">
                                        {lecture.durationMinutes || lecture.duration || 12}m
                                      </span>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })`;

// 3. Fix reviews key
const oldReviews = `                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-[#14141A]/70 border border-white/[0.04] space-y-2"
                      >`;

const newReviews = `                  {reviews.length > 0 ? (
                    reviews.map((rev, revIdx) => (
                      <div
                        key={rev.id ?? rev.reviewId ?? \`rev-\${revIdx}-\${rev.createdAt || ''}\`}
                        className="p-4 rounded-xl bg-[#14141A]/70 border border-white/[0.04] space-y-2"
                      >`;

// 4. Fix faqs key
const oldFaqsMap = `                {faqs.length > 0 ? (
                  faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-xl bg-[#14141A]/70 border border-white/[0.04] p-4 space-y-1.5 text-xs"
                    >`;

const newFaqsMap = `                {faqs.length > 0 ? (
                  faqs.map((faq, faqIdx) => (
                    <div
                      key={faq.id ?? faq.faqId ?? \`faq-\${faqIdx}\`}
                      className="rounded-xl bg-[#14141A]/70 border border-white/[0.04] p-4 space-y-1.5 text-xs"
                    >`;

// 5. Fix outcomes key
const oldOutcomes = `                  {outcomes.length > 0 ? (
                    outcomes.map((outcome) => (
                      <div
                        key={outcome.id || outcome}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141A]/70 border border-white/[0.04]"
                      >`;

const newOutcomes = `                  {outcomes.length > 0 ? (
                    outcomes.map((outcome, oIdx) => (
                      <div
                        key={outcome.id ?? outcome.outcomeId ?? (typeof outcome === 'string' ? \`outcome-\${outcome}-\${oIdx}\` : \`outcome-\${oIdx}\`)}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141A]/70 border border-white/[0.04]"
                      >`;

function replaceNormalized(str, oldPart, newPart) {
  const normStr = str.replace(/\r\n/g, '\n');
  const normOld = oldPart.replace(/\r\n/g, '\n');
  const normNew = newPart.replace(/\r\n/g, '\n');
  if (!normStr.includes(normOld)) {
    console.error('Target not found for replace!');
    return str;
  }
  const replaced = normStr.replace(normOld, normNew);
  return replaced.replace(/\n/g, '\r\n');
}

content = replaceNormalized(content, oldFaqs, newFaqs);
content = replaceNormalized(content, oldCurriculum, newCurriculum);
content = replaceNormalized(content, oldReviews, newReviews);
content = replaceNormalized(content, oldFaqsMap, newFaqsMap);
content = replaceNormalized(content, oldOutcomes, newOutcomes);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CourseDetail.jsx patched successfully');

