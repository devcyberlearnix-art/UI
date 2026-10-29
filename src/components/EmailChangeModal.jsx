// src/components/EmailChangeModal.jsx
import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2, X, RefreshCw, AlertCircle } from 'lucide-react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

export const EmailChangeModal = ({ isOpen, onClose, currentEmail, onEmailUpdated }) => {
  const [step, setStep] = useState(1); // 1: Request, 2: Verify Old, 3: Verify New, 4: Complete
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldOtp, setOldOtp] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  if (!isOpen) return null;

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please provide a valid new email address');
      return;
    }
    if (!password) {
      setError('Current password is required to verify your identity');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.requestEmailChange({ newEmail: newEmail.trim(), password });
      const sid = res.sessionId || res.data?.sessionId;
      if (!sid) throw new Error(res.message || 'Session ID not returned');
      setSessionId(sid);
      setStep(2);
      toast.success('Verification code dispatched to your current email');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request email change');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOld = async (e) => {
    e.preventDefault();
    if (!oldOtp || oldOtp.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.verifyOldEmail(sessionId, oldOtp.trim());
      setStep(3);
      toast.success('Current email verified! Verification code dispatched to new email');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNew = async (e) => {
    e.preventDefault();
    if (!newOtp || newOtp.length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.verifyNewEmail(sessionId, newOtp.trim());
      setStep(4);
      toast.success('Email updated successfully!');
      if (onEmailUpdated) onEmailUpdated(newEmail.trim());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (target) => {
    setResending(true);
    try {
      await authApi.resendEmailChangeOtp(sessionId, target);
      toast.success(`New code sent to ${target === 'OLD' ? 'current' : 'new'} email`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-[#0E0E12] border border-white/[0.08] rounded-2xl shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C5A880]/10 text-[#C5A880]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F7]">Change Primary Email</h3>
              <p className="text-[11px] font-mono text-[#8E8E93]">3-Step Zero-Trust Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8E8E93] hover:text-[#F5F5F7] rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between px-2 text-[10px] font-mono text-[#8E8E93]">
          <span className={step >= 1 ? 'text-[#C5A880] font-bold' : ''}>1. Request</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-[#C5A880] font-bold' : ''}>2. Old Email</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-[#C5A880] font-bold' : ''}>3. New Email</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Request */}
        {step === 1 && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E93] uppercase mb-1">Current Email</label>
              <input
                type="text"
                disabled
                value={currentEmail}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.04] text-xs text-[#8E8E93] font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E93] uppercase mb-1">New Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" size={14} />
                <input
                  type="email"
                  required
                  placeholder="new.email@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#8E8E93] uppercase mb-1">Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" size={14} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Continue to Step 2'} <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Step 2: Verify Old Email */}
        {step === 2 && (
          <form onSubmit={handleVerifyOld} className="space-y-4">
            <p className="text-xs text-[#D4D4D8]">
              Enter the 6-digit code dispatched to <span className="text-[#C5A880] font-mono">{currentEmail}</span>:
            </p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" size={14} />
              <input
                type="text"
                maxLength={6}
                required
                placeholder="6-digit code"
                value={oldOtp}
                onChange={(e) => setOldOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-center font-mono tracking-widest text-[#F5F5F7] outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleResend('OLD')}
                disabled={resending}
                className="flex-1 py-2 rounded-xl bg-[#14141A] border border-white/[0.06] text-[11px] text-[#8E8E93] hover:text-[#F5F5F7] flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} /> Resend Code
              </button>
              <button
                type="submit"
                disabled={loading || oldOtp.length < 6}
                className="flex-1 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709] font-bold text-xs disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Old Email'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Verify New Email */}
        {step === 3 && (
          <form onSubmit={handleVerifyNew} className="space-y-4">
            <p className="text-xs text-[#D4D4D8]">
              Almost done! Enter the 6-digit code dispatched to <span className="text-[#C5A880] font-mono">{newEmail}</span>:
            </p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" size={14} />
              <input
                type="text"
                maxLength={6}
                required
                placeholder="6-digit code"
                value={newOtp}
                onChange={(e) => setNewOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-center font-mono tracking-widest text-[#F5F5F7] outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleResend('NEW')}
                disabled={resending}
                className="flex-1 py-2 rounded-xl bg-[#14141A] border border-white/[0.06] text-[11px] text-[#8E8E93] hover:text-[#F5F5F7] flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} className={resending ? 'animate-spin' : ''} /> Resend Code
              </button>
              <button
                type="submit"
                disabled={loading || newOtp.length < 6}
                className="flex-1 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709] font-bold text-xs disabled:opacity-50"
              >
                {loading ? 'Finalizing...' : 'Complete Change'}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
            <h4 className="text-sm font-bold text-[#F5F5F7]">Email Successfully Changed</h4>
            <p className="text-xs text-[#8E8E93]">Your login identity and system notifications are now bound to {newEmail}.</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#C5A880] text-[#070709] font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailChangeModal;
