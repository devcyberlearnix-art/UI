import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "30% off for a limited time",
    description: "Start learning high-demand skills from top instructors.",
    cta: "Start Learning",
    bgImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&auto=format",
    link: "/register",
  },
  {
    id: 2,
    title: "Become an AI Expert",
    description: "Master machine learning and earn a certificate.",
    cta: "Explore AI Courses",
    bgImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&auto=format",
    link: "/courses",
  },
  {
    id: 3,
    title: "Learn from Industry Leaders",
    description: "Join 50,000+ students learning real-world skills.",
    cta: "Browse Courses",
    bgImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1400&auto=format",
    link: "/courses",
  },
];

const BannerSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].bgImage})` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating content card */}
      <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12 lg:px-24">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md shadow-2xl border border-white/30">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {slides[current].title}
          </h2>
          <p className="text-gray-600 mb-6">{slides[current].description}</p>
          <button
            onClick={() => (window.location.href = slides[current].link)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md flex items-center gap-2"
          >
            {slides[current].cta} →
          </button>
        </div>
      </div>

      {/* Slider Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition z-10"
      >
        <ChevronLeft size={28} className="text-gray-800" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition z-10"
      >
        <ChevronRight size={28} className="text-gray-800" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === idx ? "w-6 bg-purple-600" : "bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;