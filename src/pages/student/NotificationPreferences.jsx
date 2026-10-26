import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Mail,
  Smartphone,
  Volume2,
  RefreshCw,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { notificationApi } from "../../api/notificationApi";

const ToggleSwitch = ({ checked, onChange, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={"relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none " + (checked ? "bg-orange-500" : "bg-slate-300")}
  >
    <span className={"pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out " + (checked ? "translate-x-5" : "translate-x-0")} />
  </button>
);

const PreferenceRow = ({ icon: Icon, title, description, value, onChange, id }) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-orange-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    <ToggleSwitch checked={!!value} onChange={onChange} id={id} />
  </div>
);

const DEFAULT_PREFS = {
  emailNotifications: true,
  pushNotifications: false,
  inAppNotifications: true,
  courseUpdates: true,
  enrollmentAlerts: true,
  assignmentReminders: true,
  reviewAlerts: false,
  marketingEmails: false,
};

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await notificationApi.getPreferences();
        const data = res?.data || res;
        if (data && typeof data === "object") {
          setPrefs(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // No preferences set yet, use defaults
        } else {
          setError("Failed to load preferences. Showing defaults.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await notificationApi.updatePreferences(prefs);
      setSaved(true);
      toast.success("Notification preferences saved!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save preferences";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => (val) => setPrefs(prev => ({ ...prev, [key]: val }));

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell size={24} /> Notification Preferences</h1>
          <p className="text-orange-50 text-sm mt-1">Control how and when you receive notifications from ASIVO LMS.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
            <AlertCircle size={16} /><p className="text-sm">{error}</p>
          </div>
        )}

        {/* Channel Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Notification Channels</h2>
          <p className="text-xs text-slate-500 mb-2">Choose which channels you receive notifications through.</p>
          <div className="divide-y divide-slate-100">
            <PreferenceRow id="pref-email" icon={Mail} title="Email Notifications" description="Receive notifications via email" value={prefs.emailNotifications} onChange={toggle("emailNotifications")} />
            <PreferenceRow id="pref-push" icon={Smartphone} title="Push Notifications" description="Browser push notifications (requires permission)" value={prefs.pushNotifications} onChange={toggle("pushNotifications")} />
            <PreferenceRow id="pref-inapp" icon={Bell} title="In-App Notifications" description="Notifications within the platform" value={prefs.inAppNotifications} onChange={toggle("inAppNotifications")} />
          </div>
        </div>

        {/* Content Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-1">What to Notify You About</h2>
          <p className="text-xs text-slate-500 mb-2">Select the types of updates you want to be notified about.</p>
          <div className="divide-y divide-slate-100">
            <PreferenceRow id="pref-course" icon={Volume2} title="Course Updates" description="New lectures, content changes, announcements" value={prefs.courseUpdates} onChange={toggle("courseUpdates")} />
            <PreferenceRow id="pref-enrollment" icon={CheckCircle2} title="Enrollment Alerts" description="Enrollment confirmations and access updates" value={prefs.enrollmentAlerts} onChange={toggle("enrollmentAlerts")} />
            <PreferenceRow id="pref-assignment" icon={RefreshCw} title="Assignment Reminders" description="Due date reminders and grading updates" value={prefs.assignmentReminders} onChange={toggle("assignmentReminders")} />
            <PreferenceRow id="pref-review" icon={Bell} title="Review Alerts" description="Responses to your reviews and ratings" value={prefs.reviewAlerts} onChange={toggle("reviewAlerts")} />
            <PreferenceRow id="pref-marketing" icon={Mail} title="Marketing Emails" description="Promotions, offers, and product updates" value={prefs.marketingEmails} onChange={toggle("marketingEmails")} />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-emerald-600 text-sm flex items-center gap-1">
              <CheckCircle2 size={15} /> Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            id="save-notification-preferences"
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 transition disabled:opacity-60"
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Preferences</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationPreferences;
