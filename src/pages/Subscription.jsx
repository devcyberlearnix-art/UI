// src/pages/Subscription.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Sparkles } from "lucide-react";

const Subscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$9",
      period: "/mo",
      features: ["Access to 50+ courses", "Community support", "Certificate of completion"],
      icon: "⭐",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      period: "/mo",
      features: [
        "Access to all courses",
        "Personal mentor",
        "Priority support",
        "Unlimited certificates",
      ],
      popular: true,
      icon: "🚀",
    },
    {
      id: "premium",
      name: "Premium",
      price: "$29",
      period: "/mo",
      features: [
        "Everything in Pro",
        "1-on-1 coaching",
        "Career guidance",
        "Resume review",
      ],
      icon: "👑",
    },
  ];

  const handleSubscribe = (planId, planName) => {
    // Check if user is logged in
    const user = localStorage.getItem("lms_user");
    if (!user) {
      alert("Please log in to subscribe.");
      navigate("/login");
      return;
    }

    // Confirm subscription
    if (!window.confirm(`Are you sure you want to subscribe to the ${planName} plan?`)) {
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

      alert(`🎉 Subscribed to ${planName} plan successfully!`);
      setLoading(null);

      // Redirect to dashboard
      navigate("/student/dashboard");
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-12 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock your full learning potential with our subscription plans.
            Upgrade anytime – cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`bg-white rounded-xl shadow-sm border p-6 text-center relative ${
                plan.popular
                  ? "border-purple-500 shadow-lg ring-2 ring-purple-500/20"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="text-4xl mb-3">{plan.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-600">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 justify-center">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id, plan.name)}
                disabled={loading === plan.id}
                className={`w-full py-2.5 rounded-lg font-semibold transition ${
                  plan.popular
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
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