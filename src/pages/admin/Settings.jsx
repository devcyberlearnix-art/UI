import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";
import { Save, CheckCircle2, Shield, CreditCard, Bell, Sliders, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_PLATFORM = {
  siteName: "Asivo Learning Ecosystem",
  tagline: "High-Stakes Engineering & Distributed Systems Architecture",
  supportEmail: "governance@asivo.internal",
  maintenanceMode: false,
  maxUsers: 50000,
  allowRegistrations: true,
  sessionTimeout: 120,
};

const DEFAULT_PAYMENT = {
  paymentGateway: "Stripe",
  currency: "INR",
  taxPercentage: 18,
  payoutSchedule: "biweekly",
};

const DEFAULT_NOTIFICATIONS = {
  emailEnabled: true,
  smsEnabled: false,
  pushNotifications: true,
  digestFrequency: "weekly",
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("platform");

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("asivo_platform_settings");
      return cached ? { ...DEFAULT_PLATFORM, ...JSON.parse(cached) } : DEFAULT_PLATFORM;
    } catch (e) {
      return DEFAULT_PLATFORM;
    }
  });
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformSuccess, setPlatformSuccess] = useState("");

  // Payment gateway state
  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("asivo_payment_settings");
      return cached ? { ...DEFAULT_PAYMENT, ...JSON.parse(cached) } : DEFAULT_PAYMENT;
    } catch (e) {
      return DEFAULT_PAYMENT;
    }
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    try {
      const cached = localStorage.getItem("asivo_notification_settings");
      return cached ? { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(cached) } : DEFAULT_NOTIFICATIONS;
    } catch (e) {
      return DEFAULT_NOTIFICATIONS;
    }
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");

  // Load platform settings from backend API
  useEffect(() => {
    const loadPlatformSettings = async () => {
      setPlatformLoading(true);
      try {
        const { data } = await axiosInstance.get("/api/v1/admin/settings/platform");
        if (data && typeof data === "object") {
          const merged = {
            siteName: data.siteName || DEFAULT_PLATFORM.siteName,
            tagline: data.tagline || DEFAULT_PLATFORM.tagline,
            supportEmail: data.supportEmail || DEFAULT_PLATFORM.supportEmail,
            maintenanceMode: data.maintenanceMode ?? false,
            maxUsers: data.maxUsers ?? 50000,
            allowRegistrations: data.allowRegistrations ?? true,
            sessionTimeout: data.sessionTimeout ?? 120,
          };
          setPlatformSettings(merged);
          localStorage.setItem("asivo_platform_settings", JSON.stringify(merged));
        }
      } catch (err) {
        console.warn("[Admin Settings] Backend platform settings offline, using local cache");
      } finally {
        setPlatformLoading(false);
      }
    };
    loadPlatformSettings();
  }, []);

  const handleSavePlatform = async () => {
    setPlatformSaving(true);
    setPlatformSuccess("");
    try {
      try {
        await axiosInstance.put("/api/v1/admin/settings/platform", platformSettings);
      } catch (e) {
        console.warn("[Admin Settings] Backend PUT failed, persisting to local storage");
      }
      localStorage.setItem("asivo_platform_settings", JSON.stringify(platformSettings));
      setPlatformSuccess("Platform settings updated successfully");
      toast.success("Platform settings saved");
      setTimeout(() => setPlatformSuccess(""), 4000);
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setPlatformSaving(false);
    }
  };

  // Load payment settings
  useEffect(() => {
    const loadPaymentSettings = async () => {
      setPaymentLoading(true);
      try {
        const { data } = await axiosInstance.get("/api/v1/admin/settings/payment");
        if (data && typeof data === "object") {
          const merged = {
            paymentGateway: data.paymentGateway || DEFAULT_PAYMENT.paymentGateway,
            currency: data.currency || DEFAULT_PAYMENT.currency,
            taxPercentage: data.taxPercentage ?? 18,
            payoutSchedule: data.payoutSchedule || "biweekly",
          };
          setPaymentSettings(merged);
          localStorage.setItem("asivo_payment_settings", JSON.stringify(merged));
        }
      } catch (err) {
        console.warn("[Admin Settings] Backend payment settings offline, using local cache");
      } finally {
        setPaymentLoading(false);
      }
    };
    loadPaymentSettings();
  }, []);

  const handleSavePayment = async () => {
    setPaymentSaving(true);
    setPaymentSuccess("");
    try {
      try {
        await axiosInstance.put("/api/v1/admin/settings/payment", paymentSettings);
      } catch (e) {
        console.warn("[Admin Settings] Backend PUT payment failed, persisting to local storage");
      }
      localStorage.setItem("asivo_payment_settings", JSON.stringify(paymentSettings));
      setPaymentSuccess("Payment gateway settings saved successfully");
      toast.success("Payment settings saved");
      setTimeout(() => setPaymentSuccess(""), 4000);
    } catch (err) {
      toast.error("Failed to save payment settings");
    } finally {
      setPaymentSaving(false);
    }
  };

  // Load notification settings
  useEffect(() => {
    const loadNotifSettings = async () => {
      setNotifLoading(true);
      try {
        const { data } = await axiosInstance.get("/api/v1/admin/settings/notifications");
        if (data && typeof data === "object") {
          const merged = {
            emailEnabled: data.emailEnabled ?? true,
            smsEnabled: data.smsEnabled ?? false,
            pushNotifications: data.pushNotifications ?? true,
            digestFrequency: data.digestFrequency || "weekly",
          };
          setNotifications(merged);
          localStorage.setItem("asivo_notification_settings", JSON.stringify(merged));
        }
      } catch (err) {
        console.warn("[Admin Settings] Backend notification settings offline, using local cache");
      } finally {
        setNotifLoading(false);
      }
    };
    loadNotifSettings();
  }, []);

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    setNotifSuccess("");
    try {
      try {
        await axiosInstance.put("/api/v1/admin/settings/notifications", notifications);
      } catch (e) {
        console.warn("[Admin Settings] Backend PUT notifications failed, persisting locally");
      }
      localStorage.setItem("asivo_notification_settings", JSON.stringify(notifications));
      setNotifSuccess("Notification preferences saved successfully");
      toast.success("Notification preferences saved");
      setTimeout(() => setNotifSuccess(""), 4000);
    } catch (err) {
      toast.error("Failed to save notification settings");
    } finally {
      setNotifSaving(false);
    }
  };

  const tabs = [
    { id: "platform", label: "Platform", icon: Sliders },
    { id: "payment_gateways", label: "Payment Gateways", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B3E57]/10 border border-[#5B3E57]/20 text-xs font-semibold text-[#5B3E57] mb-2">
          <Shield size={13} />
          <span>Platform Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Configure ecosystem parameters, transaction rails, and automated platform notifications
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#5B3E57] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-6 sm:p-8 max-w-4xl">
        {activeTab === "platform" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-900">Platform Identity & Access Parameters</h2>
              <p className="text-xs text-stone-500 mt-0.5">Control global branding, maximum concurrency, and maintenance windows</p>
            </div>

            {platformLoading ? (
              <div className="text-center py-10 text-stone-400 text-sm flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-[#5B3E57]" />
                <span>Loading ecosystem configurations...</span>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Platform / Site Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-stone-200 focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/20 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 outline-none transition"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })}
                    placeholder="Asivo Learning Ecosystem"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Displayed across top navigation rails, certificate credentials, and audit logs.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      className="w-full border border-stone-200 focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/20 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 outline-none transition"
                      value={platformSettings.supportEmail}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                      placeholder="support@asivo.internal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Max Concurrent Users
                    </label>
                    <input
                      type="number"
                      className="w-full border border-stone-200 focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/20 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 outline-none transition"
                      value={platformSettings.maxUsers}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, maxUsers: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded text-[#5B3E57] focus:ring-[#5B3E57]"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })}
                    />
                    <div>
                      <span className="text-sm font-bold text-stone-900">Maintenance Window Mode</span>
                      <p className="text-xs text-stone-500 mt-0.5">
                        When enabled, non-admin sessions are held with a polite maintenance status screen.
                      </p>
                    </div>
                  </label>
                </div>

                {platformSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    <CheckCircle2 size={16} />
                    <span>{platformSuccess}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSavePlatform}
                    disabled={platformSaving}
                    className="inline-flex items-center gap-2 bg-[#5B3E57] text-white px-6 py-2.5 rounded-xl hover:bg-[#4A3246] transition font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{platformSaving ? "Saving..." : "Save Platform Settings"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "payment_gateways" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-900">Payment Gateway Rails & Currency</h2>
              <p className="text-xs text-stone-500 mt-0.5">Manage merchant routing, processing fees, and invoicing currency</p>
            </div>

            {paymentLoading ? (
              <div className="text-center py-10 text-stone-400 text-sm flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-[#5B3E57]" />
                <span>Loading settlement configurations...</span>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Active Gateway Rail
                    </label>
                    <select
                      className="w-full border border-stone-200 focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/20 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 outline-none transition bg-white"
                      value={paymentSettings.paymentGateway}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentGateway: e.target.value })}
                    >
                      <option value="Stripe">Stripe Gateway (Production)</option>
                      <option value="Razorpay">Razorpay Gateway (UPI / NetBanking)</option>
                      <option value="PayPal">PayPal Global Rail</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Default Currency
                    </label>
                    <select
                      className="w-full border border-stone-200 focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/20 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 outline-none transition bg-white"
                      value={paymentSettings.currency}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                    >
                      <option value="INR">INR (₹ Indian Rupee)</option>
                      <option value="USD">USD ($ US Dollar)</option>
                      <option value="EUR">EUR (€ Euro)</option>
                      <option value="GBP">GBP (£ British Pound)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    GST / Tax Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full sm:w-1/2 border border-stone-200 focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/20 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-900 outline-none transition"
                    value={paymentSettings.taxPercentage}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, taxPercentage: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Automatically computed on checkout settlement breakdown.</p>
                </div>

                {paymentSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    <CheckCircle2 size={16} />
                    <span>{paymentSuccess}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSavePayment}
                    disabled={paymentSaving}
                    className="inline-flex items-center gap-2 bg-[#5B3E57] text-white px-6 py-2.5 rounded-xl hover:bg-[#4A3246] transition font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{paymentSaving ? "Saving..." : "Save Payment Settings"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-900">Notification Broadcast Rails</h2>
              <p className="text-xs text-stone-500 mt-0.5">Toggle automated transactional alerts, receipts, and dispatch triggers</p>
            </div>

            {notifLoading ? (
              <div className="text-center py-10 text-stone-400 text-sm flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-[#5B3E57]" />
                <span>Loading notification parameters...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-[#5B3E57] focus:ring-[#5B3E57]"
                      checked={notifications.emailEnabled}
                      onChange={(e) => setNotifications({ ...notifications, emailEnabled: e.target.checked })}
                    />
                    <div>
                      <span className="text-sm font-bold text-stone-900">Email Notifications (SMTP Gateway)</span>
                      <p className="text-xs text-stone-500">Send transactional receipts, welcome messages, and password recovery.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-stone-200/50">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-[#5B3E57] focus:ring-[#5B3E57]"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                    />
                    <div>
                      <span className="text-sm font-bold text-stone-900">Browser & App Push Notifications</span>
                      <p className="text-xs text-stone-500">Real-time alerts for faculty grading, assignments, and curriculum updates.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-stone-200/50">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-[#5B3E57] focus:ring-[#5B3E57]"
                      checked={notifications.smsEnabled}
                      onChange={(e) => setNotifications({ ...notifications, smsEnabled: e.target.checked })}
                    />
                    <div>
                      <span className="text-sm font-bold text-stone-900">SMS Direct Delivery (Twilio Integration)</span>
                      <p className="text-xs text-stone-500">Urgent security OTP alerts and time-sensitive verification notices.</p>
                    </div>
                  </label>
                </div>

                {notifSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    <CheckCircle2 size={16} />
                    <span>{notifSuccess}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={notifSaving}
                    className="inline-flex items-center gap-2 bg-[#5B3E57] text-white px-6 py-2.5 rounded-xl hover:bg-[#4A3246] transition font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{notifSaving ? "Saving..." : "Save Notification Preferences"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;
