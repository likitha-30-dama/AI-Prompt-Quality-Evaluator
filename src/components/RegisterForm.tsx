import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordStrengthMeter, evaluatePassword } from './PasswordStrengthMeter';

interface Props {
  onSwitchToLogin: () => void;
  onOpenHelp: () => void;
}

export const RegisterForm: React.FC<Props> = ({ onSwitchToLogin, onOpenHelp }) => {
  const { registerWithEmail, signInWithGoogle, authNotice, clearNotice } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const passwordEvaluation = evaluatePassword(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearNotice();

    if (!displayName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (!agreeTerms) {
      setValidationError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName);
    } catch {
      // Handled by AuthContext and shown via authNotice
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setValidationError(null);
    clearNotice();
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled by AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Notice/Error Banner */}
      {authNotice && authNotice.type !== 'success' && (
        <div className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
          authNotice.type === 'error'
            ? 'bg-rose-50/90 border-rose-200 text-rose-800'
            : 'bg-amber-50/90 border-amber-200 text-amber-800'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-current" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">{authNotice.message}</p>
            {authNotice.details && (
              <p className="text-[11px] opacity-90 leading-relaxed">{authNotice.details}</p>
            )}
            {authNotice.message.includes('not enabled') && (
              <button
                type="button"
                onClick={onOpenHelp}
                className="mt-1 inline-flex items-center gap-1 font-semibold underline hover:no-underline cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                View Firebase Setup Guide
              </button>
            )}
          </div>
        </div>
      )}

      {validationError && (
        <div className="mb-5 p-3.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder-slate-400 bg-white transition-all"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder-slate-400 bg-white transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Create Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder-slate-400 bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Interactive Password Strength Meter */}
          <PasswordStrengthMeter password={password} showCriteria={password.length > 0} />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 bg-white transition-all ${
                passwordsMismatch
                  ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                  : passwordsMatch
                  ? 'border-emerald-400 focus:ring-emerald-500 focus:border-emerald-500'
                  : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {passwordsMatch && (
                <span title="Passwords match" className="text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
              {passwordsMismatch && (
                <span title="Passwords do not match" className="text-rose-500 text-xs font-medium">
                  Mismatch
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
            />
            <span className="leading-snug">
              I agree to the <span className="text-indigo-600 font-medium">Terms of Service</span> and acknowledge the <span className="text-indigo-600 font-medium">Privacy Policy</span>.
            </span>
          </label>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </>
          )}
        </button>

        {/* Social / Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">
            or sign up with
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || googleLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-3 shadow-xs hover:border-slate-400 cursor-pointer disabled:opacity-60"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              <span>Connecting Google Auth...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign up with Google</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Sign in
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </p>
      </div>
    </div>
  );
};
