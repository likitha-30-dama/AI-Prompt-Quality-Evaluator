import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  CheckCircle,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Edit3,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig } from '../firebase';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface Props {
  onOpenHelp: () => void;
}

export const Dashboard: React.FC<Props> = ({ onOpenHelp }) => {
  const {
    user,
    logout,
    triggerEmailVerification,
    updateUserDisplayName,
    changeUserPassword,
    reloadUser,
    authNotice,
    clearNotice
  } = useAuth();

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user?.displayName || '');
  const [photoURLInput, setPhotoURLInput] = useState(user?.photoURL || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Verification & Reload state
  const [sendingVerification, setSendingVerification] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  if (!user) return null;

  const isGoogleUser = user.providerData.some((p) => p.providerId === 'google.com');
  const isPasswordUser = user.providerData.some((p) => p.providerId === 'password');

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateUserDisplayName(displayNameInput, photoURLInput);
      setIsEditingProfile(false);
    } catch {
      // error handled in AuthContext
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.length < 8) {
      setPasswordChangeError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await changeUserPassword(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      await triggerEmailVerification();
    } catch {
      // handled
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRefreshState = async () => {
    setReloading(true);
    await reloadUser();
    setTimeout(() => setReloading(false), 500);
  };

  // Compute initials for avatar fallback
  const getInitials = () => {
    if (user.displayName) {
      const parts = user.displayName.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formattedCreationTime = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Unknown';

  const formattedLastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Active now';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      {authNotice && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start justify-between gap-3 shadow-xs ${
            authNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : authNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {authNotice.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{authNotice.message}</p>
              {authNotice.details && <p className="text-xs opacity-90 mt-0.5">{authNotice.details}</p>}
            </div>
          </div>
          <button
            onClick={clearNotice}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-100/60 to-purple-100/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                />
              ) : (
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20 tracking-wider">
                  {getInitials()}
                </div>
              )}
              {user.emailVerified && (
                <span
                  title="Verified User"
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>

            {/* User Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {user.displayName || 'Welcome, Valued Member!'}
                </h1>
                {isGoogleUser && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Google Account
                  </span>
                )}
                {isPasswordUser && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Email Account
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email || 'No email attached'}</span>
              </p>

              {/* UID */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">UID: {user.uid.substring(0, 14)}...</span>
                <button
                  type="button"
                  onClick={copyUid}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedUid ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy UID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <button
              type="button"
              onClick={handleRefreshState}
              title="Refresh auth state from Firebase"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Email Verification Alert Banner if unverified */}
        {!user.emailVerified && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-amber-950">Email verification pending</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Your email address <span className="font-medium">{user.email}</span> has not been verified yet. Check your inbox for the link.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendVerification}
              disabled={sendingVerification}
              className="py-1.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {sendingVerification ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Resend Verification Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Edit Drawer / Form (Conditional) */}
      {isEditingProfile && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Update Account Profile
            </h3>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Avatar Photo URL (optional)
                </label>
                <input
                  type="url"
                  value={photoURLInput}
                  onChange={(e) => setPhotoURLInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingProfile}
                className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {updatingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Password Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Security & Credentials</h3>
                <p className="text-xs text-slate-400">Password and authentication settings</p>
              </div>
            </div>

            {isPasswordUser && !isChangingPassword && (
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                Change password
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Email Verification</span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unverified
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Authentication Method</span>
              <span className="font-semibold text-slate-800">
                {isGoogleUser && isPasswordUser
                  ? 'Email & Google Linked'
                  : isGoogleUser
                  ? 'Google OAuth 2.0'
                  : 'Email & Password'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Account Created</span>
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedCreationTime}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Last Sign-in</span>
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formattedLastSignIn}
              </span>
            </div>
          </div>

          {/* Change Password Form (Conditional) */}
          {isChangingPassword && isPasswordUser && (
            <form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">New Password</span>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {passwordChangeError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {passwordChangeError}
                </p>
              )}

              <div>
                <input
                  type="password"
                  required
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <PasswordStrengthMeter password={newPassword} showCriteria={false} />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </form>
          )}

          {isGoogleUser && !isPasswordUser && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
              <strong>Google Account Managed:</strong> Password management and 2FA are handled securely directly via your Google Account.
            </div>
          )}
        </div>

        {/* Integration & Firebase Environment Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Connected Firebase</h3>
                <p className="text-xs text-slate-400">Environment and configuration status</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenHelp}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Docs & Guide
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Firebase Project ID</span>
              <span className="font-mono font-medium text-slate-800">{firebaseConfig.projectId}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Auth Domain</span>
              <span className="font-mono font-medium text-slate-800">{firebaseConfig.authDomain}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500">Web App ID</span>
              <span className="font-mono text-slate-600">{firebaseConfig.appId.substring(0, 18)}...</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">SDK Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online & Synchronized
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View User in Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
