// src/pages/Subscription.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Star, BookOpen, Zap, Crown } from "lucide-react";
import toast from "react-hot-toast";

const Subscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "₹749",
      period: "/mo",
      features: ["Access to 50+ courses", "Community support", "Certificate of completion"],
      icon: BookOpen,
    },
    {
      id: "pro",
      name: "Pro",
      price: "₹1,499",
      period: "/mo",
      features: [
        "Access to all courses",
        "Personal mentor",
        "Priority support",
        "Unlimited certificates",
      ],
      popular: true,
      icon: Zap,
    },
    {
      id: "premium",
      name: "Premium",
      price: "₹2,499",
      period: "/mo",
      features: [
        "Everything in Pro",
        "1-on-1 coaching",
        "Career guidance",
        "Resume review",
      ],
      icon: Crown,
    },
  ];

  const handleSubscribe = (planId, planName) => {
    // Check if user is logged in
    const user = localStorage.getItem("lms_user");
    if (!user) {
      toast.error("Please log in to subscribe.");
      navigate("/login");
      return;
    }

    setLoading(planId);

    // Simulate API call / payment processing
    setTimeout(() => {
      // Save subscription to localStorage
      const subscription = {
        plan: planId,
        planName: planName,
        subscribedAt: new Date().toISOString(),
        status: "active",
      };
      localStorage.setItem("lms_subscription", JSON.stringify(subscription));

      // Dispatch custom event (optional)
      window.dispatchEvent(new Event("subscriptionUpdated"));

      toast.success(`Subscribed to ${planName} plan successfully.`);
      setLoading(null);

      // Redirect to dashboard
      navigate("/student/dashboard");
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] py-12 px-4 transition-colors"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F2ECF1] dark:bg-[#5B3E57]/20 mb-4 text-[#5B3E57] dark:text-[#D1A7CC]">
            <Star className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight mb-2">Institutional Curriculum Tiers</h1>
          <p className="text-sm text-[#635E56] dark:text-[#A8A196] max-w-2xl mx-auto">
            Direct production architecture paths with verifiable engineering credentials. Upgrade or adjust anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border p-6 text-center relative transition-shadow ${
                  plan.popular
                    ? "border-[#5B3E57] dark:border-[#D1A7CC] shadow-md ring-1 ring-[#5B3E57]/30"
                    : "border-[#E3DCD3] dark:border-white/[0.08] shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] text-xs font-semibold px-3 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] flex items-center justify-center mx-auto mb-4 text-[#5B3E57] dark:text-[#D1A7CC]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold font-mono text-[#5B3E57] dark:text-[#D1A7CC]">{plan.price}</span>
                  <span className="text-xs text-[#71717A] ml-1">{plan.period}</span>
                </div>
                <ul className="text-xs text-[#635E56] dark:text-[#A8A196] space-y-2.5 mb-6 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                  disabled={loading === plan.id}
                  className={`w-full py-2.5 rounded-xl font-medium text-xs transition-colors shadow-sm ${
                    plan.popular
                      ? "bg-[#5B3E57] hover:bg-[#4A3246] dark:bg-[#D1A7CC] dark:hover:bg-[#C296BD] text-white dark:text-[#151413]"
                      : "bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] hover:bg-[#EAE4DC] border border-[#E3DCD3] dark:border-white/[0.08]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Activating...</span>
                    </span>
                  ) : (
                    `Enroll in ${plan.name}`
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl border p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-600">
              Secure payments • Cancel anytime • 30-day money-back guarantee
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Already have a plan? <button className="text-purple-600 hover:underline">Manage subscription</button>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Subscription;