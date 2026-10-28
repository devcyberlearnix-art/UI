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
  Sliders,
} from "lucide-react";
import { useNotificationPreferences } from "../../hooks/useNotifications";
import Button from "../../design-system/primitives/Button";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const ToggleSwitch = ({ checked, onChange, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#C5A880] ${
      checked ? "bg-[#C5A880]" : "bg-[#14141A] border border-white/10"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
        checked ? "translate-x-5 bg-[#070709]" : "translate-x-0 bg-[#8E8E93]"
      }`}
    />
  </button>
);

const PreferenceRow = ({ icon: Icon, title, description, value, onChange, id }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-white/[0.04] last:border-b-0">
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center flex-shrink-0 text-[#C5A880]">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs sm:text-sm font-semibold text-[#F5F5F7]">{title}</p>
        <p className="text-[11px] sm:text-xs text-[#8E8E93] mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
    <ToggleSwitch checked={Boolean(value)} onChange={onChange} id={id} />
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

export const NotificationPreferences = () => {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    if (preferences && typeof preferences === "object") {
      setPrefs((prev) => ({ ...prev, ...preferences }));
    }
  }, [preferences]);

  const toggle = (key) => (val) => setPrefs((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    updatePreferences(prefs);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#070709]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880] mx-auto" />
          <p className="text-xs text-[#8E8E93] font-mono">Syncing alert preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="rounded-3xl bg-[#0F0F13] border border-white/[0.04] p-6 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#C5A880]">
              <Sliders size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
                Notification Stream Governance
              </h1>
              <p className="text-xs text-[#8E8E93] font-mono mt-0.5">
                Configure delivery channels and telemetry alert sensitivity
              </p>
            </div>
          </div>
        </motion.div>

        {/* Channel Preferences */}
        <div className="bg-[#0F0F13] rounded-3xl border border-white/[0.04] shadow-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F7] mb-1 font-mono">
            Delivery Channels
          </h2>
          <p className="text-xs text-[#8E8E93] mb-4">
            Select the communication transports to receive live events through.
          </p>
          <div>
            <PreferenceRow
              id="pref-email"
              icon={Mail}
              title="Email Transports"
              description="Receive critical receipts and announcements via SMTP/SES"
              value={prefs.emailNotifications}
              onChange={toggle("emailNotifications")}
            />
            <PreferenceRow
              id="pref-push"
              icon={Smartphone}
              title="Browser Push Notifications"
              description="Real-time WebSocket & Push notification popups"
              value={prefs.pushNotifications}
              onChange={toggle("pushNotifications")}
            />
            <PreferenceRow
              id="pref-inapp"
              icon={Bell}
              title="In-App Telemetry Banner"
              description="Live notifications in the upper workspace navigation bar"
              value={prefs.inAppNotifications}
              onChange={toggle("inAppNotifications")}
            />
          </div>
        </div>

        {/* Content Subscriptions */}
        <div className="bg-[#0F0F13] rounded-3xl border border-white/[0.04] shadow-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F7] mb-1 font-mono">
            Event Topics & Alerts
          </h2>
          <p className="text-xs text-[#8E8E93] mb-4">
            Filter the specific platform events you wish to be alerted about.
          </p>
          <div>
            <PreferenceRow
              id="pref-course"
              icon={Volume2}
              title="Course Updates & Milestones"
              description="New lecture releases, curriculum edits, and mentor broadcasts"
              value={prefs.courseUpdates}
              onChange={toggle("courseUpdates")}
            />
            <PreferenceRow
              id="pref-enrollment"
              icon={CheckCircle2}
              title="Enrollment & License Signals"
              description="Registration receipts, invoice access, and workspace verification"
              value={prefs.enrollmentAlerts}
              onChange={toggle("enrollmentAlerts")}
            />
            <PreferenceRow
              id="pref-assignment"
              icon={RefreshCw}
              title="Lab & Assessment Reminders"
              description="Countdown deadlines, submission confirmations, and evaluation results"
              value={prefs.assignmentReminders}
              onChange={toggle("assignmentReminders")}
            />
            <PreferenceRow
              id="pref-review"
              icon={Bell}
              title="Review & Feedback Signals"
              description="Instructor responses to your questions and code critiques"
              value={prefs.reviewAlerts}
              onChange={toggle("reviewAlerts")}
            />
            <PreferenceRow
              id="pref-marketing"
              icon={Mail}
              title="Ecosystem Announcements"
              description="Quarterly masterclass releases and architectural briefs"
              value={prefs.marketingEmails}
              onChange={toggle("marketingEmails")}
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            disabled={isUpdating}
            id="save-notification-preferences"
            onClick={handleSave}
          >
            {isUpdating ? (
              <>
                <Loader2 size={15} className="animate-spin mr-2" />
                <span>Committing Preferences...</span>
              </>
            ) : (
              <>
                <Save size={15} className="mr-2" />
                <span>Save Telemetry Configuration</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
