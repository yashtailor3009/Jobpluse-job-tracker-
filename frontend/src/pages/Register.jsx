import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  Inbox,
  ExternalLink,
  X,
} from 'lucide-react';

export const Register = () => {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 = Registration Form, 2 = OTP Verification
  const [step, setStep] = useState(1);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP state (6 digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120); // 2 minutes = 120 seconds
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dev Mailbox Inspector state
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [mailboxData, setMailboxData] = useState(null);
  const [mailboxLoading, setMailboxLoading] = useState(false);

  const otpInputsRef = useRef([]);

  // Timer countdown: 300 seconds (5 minutes)
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP box on entering Step 2
  useEffect(() => {
    if (step === 2 && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Step 1: Submit Registration
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(fullName, email, password);
      if (res?.role) {
        navigate('/');
        return;
      }

      setInfoMessage(res?.message || `A 6-digit verification code has been dispatched to ${email}.`);
      setStep(2);
      setTimer(120); // 2-minute countdown (120 seconds)
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Registration failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste of full 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (timer === 0) {
      setError('This verification code has expired (valid for 2 minutes). Please click "Resend Code" to receive a new one.');
      return;
    }

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(email, otpCode);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Invalid or expired verification code. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resending) return;
    setResending(true);
    setError('');

    try {
      const res = await resendOtp(email);
      setInfoMessage(res?.message || `A fresh 6-digit verification code has been dispatched to ${email}.`);
      setTimer(120); // Reset to 2 minutes
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Open Dev Mailbox modal to inspect dispatched email during local development
  const handleOpenMailbox = async () => {
    setShowMailboxModal(true);
    setMailboxLoading(true);
    try {
      const res = await authApi.inspectMailbox(email);
      setMailboxData(res.data);
    } catch (err) {
      console.error('Failed to load mailbox', err);
    } finally {
      setMailboxLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/20">
            {step === 1 ? <Briefcase className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 1
              ? 'Start organizing applications and tracking interviews like a pro'
              : `A 6-digit verification code has been sent to ${email}`}
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === 1
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                1
              </span>
              <span className={step === 1 ? 'font-semibold text-white' : 'text-slate-400'}>
                Account Details
              </span>
            </div>

            <div className="h-0.5 w-8 bg-slate-800" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === 2
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                2
              </span>
              <span className={step === 2 ? 'font-semibold text-white' : 'text-slate-500'}>
                Email Verification
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Alert */}
          {infoMessage && step === 2 && !error && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSubmitRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending verification email...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Secure OTP Verification Screen */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-3 text-center">
                  Enter the 6-digit code received on your email
                </label>

                {/* 6 Segmented Digit Inputs */}
                <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={timer === 0}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl text-white focus:outline-none transition ${
                        timer === 0
                          ? 'bg-slate-900 border border-rose-500/50 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend Controls */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {timer > 0 ? (
                    <>
                      Expires in: <strong className="text-white font-mono">{formatTime(timer)}</strong>
                    </>
                  ) : (
                    <span className="text-rose-400 font-semibold">Code has expired</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending || (timer > 90 && !canResend)}
                  className={`font-semibold flex items-center gap-1 transition ${
                    timer === 0 || canResend
                      ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer underline'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6 || timer === 0}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Back to Step 1 & Dev Mailbox Link */}
              <div className="space-y-3 pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Wrong email? Change registration details</span>
                </button>

                {/* Dev Mode Mailbox Helper */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleOpenMailbox}
                    className="text-[11px] text-purple-400 hover:text-purple-300 transition flex items-center justify-center gap-1.5 mx-auto font-medium"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Check Sent Email (Dev Mailbox / Server Log)</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Card Footer: Back to Login */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Dev Mailbox Modal (Simulates checking user's email client during development) */}
      {showMailboxModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowMailboxModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Incoming Email Inbox (Dev Preview)</h3>
                <p className="text-[11px] text-slate-400">Simulating recipient mailbox for: {email}</p>
              </div>
            </div>

            {mailboxLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading mailbox...</div>
            ) : mailboxData ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="space-y-1 pb-2 border-b border-slate-800/80">
                  <div className="flex justify-between text-slate-400">
                    <span>From: <strong>JobPulse Security &lt;security@jobpulse.app&gt;</strong></span>
                    <span>{new Date(mailboxData.sentAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 font-semibold">{mailboxData.subject}</div>
                </div>

                <div className="py-2 text-slate-300 leading-relaxed space-y-2">
                  <p>Hello,</p>
                  <p>Your 6-digit JobPulse verification code is:</p>
                  <div className="text-center py-3 bg-slate-900 border border-emerald-500/40 rounded-lg">
                    <span className="font-mono text-2xl font-bold tracking-widest text-emerald-400">
                      {mailboxData.otpCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-400">
                    ⏳ This code expires in 2 minutes (at {new Date(mailboxData.expiresAt).toLocaleTimeString()}).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                No recent emails found for {email}. Please check backend server console log.
              </div>
            )}

            <div className="text-[11px] text-slate-500 text-center">
              💡 In production with real SMTP credentials (e.g. Gmail/Outlook), this email arrives directly in your phone/desktop email app.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
