import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../api/adminApi";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("platform");
  
  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({
    siteName: "",
    maintenanceMode: false,
    maxUsers: 1000,
  });
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformError, setPlatformError] = useState("");
  const [platformSuccess, setPlatformSuccess] = useState("");
  
  // Payment gateway state (unchanged)
  const [paymentSettings, setPaymentSettings] = useState({
    paymentGateway: "Stripe",
    currency: "INR",
    taxPercentage: 18,
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Notifications state (unchanged)
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushNotifications: true,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [notifSuccess, setNotifSuccess] = useState("");

  // Load platform settings
  useEffect(() => {
    const loadPlatformSettings = async () => {
      setPlatformLoading(true);
      try {
        const data = await adminApi.getPlatformSettings();
        setPlatformSettings({
          siteName: data.siteName || "",
          maintenanceMode: data.maintenanceMode ?? false,
          maxUsers: data.maxUsers ?? 1000,
        });
      } catch (err) {
        console.error(err);
        setPlatformError("Failed to load platform settings");
      } finally {
        setPlatformLoading(false);
      }
    };
    loadPlatformSettings();
  }, []);

  const handleSavePlatform = async () => {
    setPlatformSaving(true);
    setPlatformError("");
    setPlatformSuccess("");
    try {
      await adminApi.savePlatformSettings({
        siteName: platformSettings.siteName,
        maintenanceMode: platformSettings.maintenanceMode,
        maxUsers: platformSettings.maxUsers,
      });
      setPlatformSuccess("Platform settings saved successfully!");
      setTimeout(() => setPlatformSuccess(""), 3000);
    } catch (err) {
      setPlatformError(err.message || "Failed to save settings");
    } finally {
      setPlatformSaving(false);
    }
  };

  // Load payment settings (unchanged)
  useEffect(() => {
    const loadPaymentSettings = async () => {
      setPaymentLoading(true);
      try {
        const data = await adminApi.getPaymentSettings();
        setPaymentSettings({
          paymentGateway: data.paymentGateway || "Stripe",
          currency: data.currency || "INR",
          taxPercentage: data.taxPercentage || 18,
        });
      } catch (err) {
        console.error(err);
        setPaymentError("Failed to load payment settings");
      } finally {
        setPaymentLoading(false);
      }
    };
    loadPaymentSettings();
  }, []);

  const handleSavePayment = async () => {
    setPaymentSaving(true);
    setPaymentError("");
    setPaymentSuccess("");
    try {
      await adminApi.savePaymentSettings({
        paymentGateway: paymentSettings.paymentGateway,
        currency: paymentSettings.currency,
        taxPercentage: paymentSettings.taxPercentage,
      });
      setPaymentSuccess("Payment settings saved successfully!");
      setTimeout(() => setPaymentSuccess(""), 3000);
    } catch (err) {
      setPaymentError(err.message || "Failed to save settings");
    } finally {
      setPaymentSaving(false);
    }
  };

  // Load notification settings (unchanged)
  useEffect(() => {
    const loadNotifSettings = async () => {
      setNotifLoading(true);
      try {
        const data = await adminApi.getNotificationSettings();
        setNotifications({
          emailEnabled: data.emailEnabled ?? true,
          smsEnabled: data.smsEnabled ?? false,
          pushNotifications: data.pushNotifications ?? true,
        });
      } catch (err) {
        console.error(err);
        setNotifError("Failed to load notification settings");
      } finally {
        setNotifLoading(false);
      }
    };
    loadNotifSettings();
  }, []);

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    setNotifError("");
    setNotifSuccess("");
    try {
      await adminApi.saveNotificationSettings({
        emailEnabled: notifications.emailEnabled,
        smsEnabled: notifications.smsEnabled,
        pushNotifications: notifications.pushNotifications,
      });
      setNotifSuccess("Notification settings saved successfully!");
      setTimeout(() => setNotifSuccess(""), 3000);
    } catch (err) {
      setNotifError(err.message || "Failed to save settings");
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex gap-4 border-b pb-2">
        {["platform", "payment_gateways", "notifications"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"}`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {activeTab === "platform" && (
          <div className="space-y-4">
            {platformLoading ? (
              <div className="text-center py-4">Loading platform settings...</div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Site Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2"
                    value={platformSettings.siteName}
                    onChange={e => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={e => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                    />
                    Maintenance Mode
                  </label>
                  <p className="text-xs text-gray-500 mt-1">When enabled, only admins can access the site.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Users</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    value={platformSettings.maxUsers}
                    onChange={e => setPlatformSettings({...platformSettings, maxUsers: parseInt(e.target.value) || 0})}
                  />
                </div>
                {platformError && <p className="text-red-500 text-sm">{platformError}</p>}
                {platformSuccess && <p className="text-green-500 text-sm">{platformSuccess}</p>}
                <button
                  onClick={handleSavePlatform}
                  disabled={platformSaving}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {platformSaving ? "Saving..." : "Save Platform Settings"}
                </button>
              </>
            )}
          </div>
        )}
        {activeTab === "payment_gateways" && (
          <div className="space-y-4">
            {paymentLoading ? (
              <div className="text-center py-4">Loading payment settings...</div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Gateway</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={paymentSettings.paymentGateway}
                    onChange={e => setPaymentSettings({...paymentSettings, paymentGateway: e.target.value})}
                  >
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Razorpay">Razorpay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={paymentSettings.currency}
                    onChange={e => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                  >
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border rounded-lg p-2"
                    value={paymentSettings.taxPercentage}
                    onChange={e => setPaymentSettings({...paymentSettings, taxPercentage: parseFloat(e.target.value)})}
                  />
                </div>
                {paymentError && <p className="text-red-500 text-sm">{paymentError}</p>}
                {paymentSuccess && <p className="text-green-500 text-sm">{paymentSuccess}</p>}
                <button
                  onClick={handleSavePayment}
                  disabled={paymentSaving}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {paymentSaving ? "Saving..." : "Save Payment Settings"}
                </button>
              </>
            )}
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="space-y-3">
            {notifLoading ? (
              <div className="text-center py-4">Loading settings...</div>
            ) : (
              <>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={notifications.emailEnabled} onChange={e => setNotifications({...notifications, emailEnabled: e.target.checked})} />
                  Email Notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={notifications.smsEnabled} onChange={e => setNotifications({...notifications, smsEnabled: e.target.checked})} />
                  SMS Notifications
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={notifications.pushNotifications} onChange={e => setNotifications({...notifications, pushNotifications: e.target.checked})} />
                  Push Notifications
                </label>
                {notifError && <p className="text-red-500 text-sm">{notifError}</p>}
                {notifSuccess && <p className="text-green-500 text-sm">{notifSuccess}</p>}
                <button
                  onClick={handleSaveNotifications}
                  disabled={notifSaving}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {notifSaving ? "Saving..." : "Save Notification Settings"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;