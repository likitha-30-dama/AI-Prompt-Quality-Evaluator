import React from 'react';
import { X, ExternalLink, ShieldCheck, AlertTriangle, KeyRound, Globe, Copy, Check } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseHelperModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const consoleProvidersUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
  const consoleSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Firebase Auth Setup & Troubleshooting</h3>
              <p className="text-xs text-slate-500">Project: <span className="font-mono font-medium text-slate-700">{firebaseConfig.projectId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-600">
          {/* Section 1: Sign-in providers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <h4>1. Ensure Auth Providers are Enabled in Firebase</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              For Email/Password and Google sign-in to function without errors (like <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">auth/operation-not-allowed</code>), you must toggle them on in your Firebase console:
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Open <strong>Authentication &gt; Sign-in method</strong> in Firebase Console.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Click <strong>Email/Password</strong> and toggle "Enable" (Passwordless is optional).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Click <strong>Google</strong> and toggle "Enable" (select your project support email).</span>
              </div>
            </div>
            <a
              href={consoleProvidersUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              Open Firebase Sign-in Providers <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Section 2: Authorized domains */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h4>2. Add Authorized Domain (for Google Popup Login)</h4>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Firebase blocks Google Sign-in popups on unregistered domains (<code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">auth/unauthorized-domain</code>). If prompted, add your current host:
            </p>
            <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              <span className="font-mono text-xs text-slate-800 flex-1 truncate">{currentHostname}</span>
              <button
                onClick={() => copyToClipboard(currentHostname, 'hostname')}
                className="text-xs font-medium px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'hostname' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <a
              href={consoleSettingsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              Open Firebase Authorized Domains Settings <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Section 3: Active Config Summary */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Firebase App Config</h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              <pre>{JSON.stringify({
                projectId: firebaseConfig.projectId,
                authDomain: firebaseConfig.authDomain,
                storageBucket: firebaseConfig.storageBucket,
                appId: firebaseConfig.appId,
                apiKey: `${firebaseConfig.apiKey.substring(0, 8)}...`
              }, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Live Firebase Authentication Integration</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
