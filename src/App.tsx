import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { FirebaseHelperModal } from './components/FirebaseHelperModal';
import { ShieldCheck, Lock, Sparkles, CheckCircle2, KeyRound, ExternalLink, HelpCircle } from 'lucide-react';
import { firebaseConfig } from './firebase';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState('');

  const openForgotPassword = (email: string) => {
    setPrefillEmail(email);
    setIsForgotModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-pulse mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">Initializing SecureAuth...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to Firebase Auth services</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 flex flex-col text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenHelp={() => setIsHelpModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {user ? (
          <Dashboard onOpenHelp={() => setIsHelpModalOpen(true)} />
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
            {/* Left Promotional / Information Column */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Firebase v11 Authentication
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Seamless access to your secure workspace.
                </h1>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Enter your credentials or register for an account using Firebase Authentication. Features real-time password strength validation, Google Single Sign-On, and instant profile management.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Real-time password criteria & strength checking</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span>Google Sign-In popup with automatic credential linking</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span>Automated verification email & password reset workflow</span>
                </div>
              </div>

              {/* Project Info Pill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white/60 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Target Project: <strong className="text-slate-800 font-mono">{firebaseConfig.projectId}</strong></span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Right Card Column: Login & Registration Tabs */}
            <div className="lg:col-span-7 w-full max-w-md mx-auto">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden">
                {/* Tab Switcher Header */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200/70 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className={`py-2.5 rounded-2xl transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className={`py-2.5 rounded-2xl transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeTab === 'login'
                        ? 'Enter your credentials to access your account portal.'
                        : 'Fill in your details below to get started immediately.'}
                    </p>
                  </div>

                  {activeTab === 'login' ? (
                    <LoginForm
                      onSwitchToRegister={() => setActiveTab('register')}
                      onOpenForgotPassword={openForgotPassword}
                      onOpenHelp={() => setIsHelpModalOpen(true)}
                    />
                  ) : (
                    <RegisterForm
                      onSwitchToLogin={() => setActiveTab('login')}
                      onOpenHelp={() => setIsHelpModalOpen(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/70 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          SecureAuth Portal &copy; {new Date().getFullYear()} &bull; Built with Firebase Auth SDK &amp; React.
        </p>
      </footer>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={prefillEmail}
      />
      <FirebaseHelperModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
