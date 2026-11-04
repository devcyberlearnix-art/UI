// src/components/ui/SocialAuthButtons.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";

// Vector brand SVGs
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current text-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const SocialAuthButtons = ({ mode = "signin" }) => {
  const [redirecting, setRedirecting] = useState(false);

  const actionText = mode === "signup" ? "Sign up" : "Sign in";

  const handleGoogleAuth = () => {
    setRedirecting(true);
    // Real OAuth redirection through API Gateway OAuth2 authorization route
    // The Gateway proxies /oauth2/** directly to user-service:8091
    window.location.href = "/oauth2/authorization/google";
  };

  const handleUnconfiguredAuth = (providerName) => {
    toast.error(
      `${providerName} OAuth credentials are not configured in this environment. Please sign in with Google or Email.`,
      { duration: 4000 }
    );
  };

  return (
    <div className="w-full space-y-3 pt-2">
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[#E3DCD3] dark:border-white/[0.06]" />
        <span className="absolute bg-[#FFFEFA] dark:bg-[#1D1C1A] px-3 text-[10px] uppercase font-mono tracking-wider text-[#756E64] dark:text-[#7A7368]">
          Or continue with
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
        {/* Google — Configured Provider */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={redirecting}
          title={`${actionText} with Google`}
          aria-label={`${actionText} with Google`}
          className="group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-[#E3DCD3] dark:border-white/[0.08] bg-[#F5F2EC] dark:bg-[#151413]/80 py-2.5 px-2 sm:px-3 text-xs font-medium text-[#D4D4D8] transition-all duration-200 hover:bg-[#EAE5DC] dark:bg-[#1D1C1A] hover:border-[#4285F4]/50 hover:text-[#282521] dark:text-[#EDE8E1] hover:shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B3E57] dark:focus-visible:ring-[#D1A7CC] focus-visible:ring-offset-1 focus-visible:ring-offset-[#FFFEFA] dark:focus-visible:ring-offset-[#1D1C1A]"
        >
          {redirecting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5B3E57] dark:border-[#D1A7CC] border-t-transparent" />
          ) : (
            <>
              <GoogleIcon />
              <span className="font-sans font-medium text-[11px] sm:text-xs">Google</span>
            </>
          )}
        </button>

        {/* GitHub — Unconfigured in this environment (Marked Unavailable) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="GitHub authentication is unavailable in this environment"
          aria-label={`${actionText} with GitHub (Unavailable)`}
          className="group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-dashed border-[#E3DCD3] dark:border-white/[0.06] bg-[#F5F2EC] dark:bg-[#151413]/30 py-2.5 px-2 sm:px-3 text-xs font-medium text-[#756E64] dark:text-[#7A7368] opacity-50 cursor-not-allowed"
        >
          <GitHubIcon />
          <span className="font-sans text-[11px] sm:text-xs text-[#756E64] dark:text-[#7A7368]">GitHub</span>
          <span className="sr-only">(Unavailable)</span>
        </button>

        {/* LinkedIn — Unconfigured in this environment (Marked Unavailable) */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="LinkedIn authentication is unavailable in this environment"
          aria-label={`${actionText} with LinkedIn (Unavailable)`}
          className="group relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-dashed border-[#E3DCD3] dark:border-white/[0.06] bg-[#F5F2EC] dark:bg-[#151413]/30 py-2.5 px-2 sm:px-3 text-xs font-medium text-[#756E64] dark:text-[#7A7368] opacity-50 cursor-not-allowed"
        >
          <LinkedInIcon />
          <span className="font-sans text-[11px] sm:text-xs text-[#756E64] dark:text-[#7A7368]">LinkedIn</span>
          <span className="sr-only">(Unavailable)</span>
        </button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
