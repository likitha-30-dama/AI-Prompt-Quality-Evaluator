import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  AuthError,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  authNotice: { type: 'info' | 'warning' | 'error' | 'success'; message: string; details?: string } | null;
  clearError: () => void;
  clearNotice: () => void;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  triggerEmailVerification: () => Promise<void>;
  updateUserDisplayName: (name: string, photoURL?: string) => Promise<void>;
  changeUserPassword: (newPassword: string) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Human-friendly Firebase Auth error messages with helpful resolution hints
export function formatAuthError(error: unknown): { message: string; details?: string; type: 'error' | 'warning' } {
  if (!error) return { message: 'An unknown error occurred.', type: 'error' };

  const authErr = error as AuthError;
  const code = authErr.code || '';
  const rawMessage = authErr.message || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return {
        message: 'Invalid email or password.',
        details: 'Please double-check your credentials and try again, or use the "Forgot Password" link.',
        type: 'error'
      };
    case 'auth/user-not-found':
      return {
        message: 'Account not found.',
        details: 'There is no existing account matching this email address. Please register for a new account.',
        type: 'error'
      };
    case 'auth/email-already-in-use':
      return {
        message: 'Email is already registered.',
        details: 'An account already exists with this email address. Try signing in or reset your password.',
        type: 'error'
      };
    case 'auth/weak-password':
      return {
        message: 'Password is too weak.',
        details: 'Please choose a stronger password with at least 8 characters including uppercase, lowercase, numbers, and symbols.',
        type: 'error'
      };
    case 'auth/invalid-email':
      return {
        message: 'Invalid email format.',
        details: 'Please provide a properly formatted email address (e.g., name@example.com).',
        type: 'error'
      };
    case 'auth/operation-not-allowed':
      return {
        message: 'Sign-in provider not enabled in Firebase Console.',
        details: 'This authentication provider (e.g. Email/Password or Google) must be enabled in the Firebase Console under Authentication > Sign-in method.',
        type: 'warning'
      };
    case 'auth/popup-closed-by-user':
      return {
        message: 'Google Sign-in was cancelled.',
        details: 'The sign-in popup window was closed before completing authentication. Please try again.',
        type: 'warning'
      };
    case 'auth/popup-blocked':
      return {
        message: 'Sign-in popup blocked.',
        details: 'Your browser blocked the Google authentication popup. Please allow popups for this site.',
        type: 'warning'
      };
    case 'auth/unauthorized-domain':
      return {
        message: 'Domain not authorized in Firebase.',
        details: `This web domain (${window.location.hostname}) must be added to your Firebase project's Authorized Domains list in the Firebase Console (Authentication > Settings > Authorized domains).`,
        type: 'warning'
      };
    case 'auth/too-many-requests':
      return {
        message: 'Access temporarily blocked.',
        details: 'Too many unsuccessful attempts. Access to this account has been temporarily restricted. Please try again in a few minutes or reset your password.',
        type: 'error'
      };
    case 'auth/network-request-failed':
      return {
        message: 'Network connection failed.',
        details: 'Please check your internet connection and verify that Firebase servers are reachable.',
        type: 'error'
      };
    case 'auth/requires-recent-login':
      return {
        message: 'Security verification required.',
        details: 'This sensitive action requires recent authentication. Please sign out and sign back in to continue.',
        type: 'warning'
      };
    default:
      return {
        message: rawMessage.replace(/^Firebase:\s*/, '') || 'Authentication operation failed.',
        type: 'error'
      };
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<{ type: 'info' | 'warning' | 'error' | 'success'; message: string; details?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);
  const clearNotice = () => setAuthNotice(null);

  const signInWithEmail = async (email: string, password: string, rememberMe = true) => {
    setError(null);
    setAuthNotice(null);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      setAuthNotice({
        type: formatted.type,
        message: formatted.message,
        details: formatted.details
      });
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    setError(null);
    setAuthNotice(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName.trim()) {
        await updateProfile(cred.user, {
          displayName: displayName.trim()
        });
      }
      // Send verification email automatically
      try {
        await sendEmailVerification(cred.user);
        setAuthNotice({
          type: 'success',
          message: 'Account created successfully!',
          details: 'We sent a verification link to your email address.'
        });
      } catch {
        // Verification email send failure should not block account creation
        setAuthNotice({
          type: 'success',
          message: 'Account created successfully!',
          details: 'You can now manage your profile.'
        });
      }
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      setAuthNotice({
        type: formatted.type,
        message: formatted.message,
        details: formatted.details
      });
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setAuthNotice(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      setAuthNotice({
        type: formatted.type,
        message: formatted.message,
        details: formatted.details
      });
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    setAuthNotice(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      throw err;
    }
  };

  const requestPasswordReset = async (email: string) => {
    setError(null);
    setAuthNotice(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthNotice({
        type: 'success',
        message: 'Password reset link sent!',
        details: `If an account exists for ${email}, a password reset link has been dispatched to your inbox.`
      });
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      setAuthNotice({
        type: formatted.type,
        message: formatted.message,
        details: formatted.details
      });
      throw err;
    }
  };

  const triggerEmailVerification = async () => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    setError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setAuthNotice({
        type: 'success',
        message: 'Verification email resent!',
        details: `Check your inbox at ${auth.currentUser.email} for the verification link.`
      });
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      setAuthNotice({
        type: formatted.type,
        message: formatted.message,
        details: formatted.details
      });
      throw err;
    }
  };

  const updateUserDisplayName = async (name: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    setError(null);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        photoURL: photoURL?.trim() || undefined
      });
      // Force trigger state update
      setUser({ ...auth.currentUser });
      setAuthNotice({
        type: 'success',
        message: 'Profile updated!',
        details: 'Your profile information has been saved.'
      });
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      throw err;
    }
  };

  const changeUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    setError(null);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setAuthNotice({
        type: 'success',
        message: 'Password changed successfully!',
        details: 'Your new password is now active.'
      });
    } catch (err: unknown) {
      const formatted = formatAuthError(err);
      setError(formatted.message);
      setAuthNotice({
        type: formatted.type,
        message: formatted.message,
        details: formatted.details
      });
      throw err;
    }
  };

  const reloadUser = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    } catch (err) {
      console.warn('Could not reload user data', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        authNotice,
        clearError,
        clearNotice,
        signInWithEmail,
        registerWithEmail,
        signInWithGoogle,
        logout,
        requestPasswordReset,
        triggerEmailVerification,
        updateUserDisplayName,
        changeUserPassword,
        reloadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
