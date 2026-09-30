import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordCriteria {
  label: string;
  met: boolean;
}

export function evaluatePassword(password: string): {
  score: number;
  label: string;
  colorClass: string;
  bgClass: string;
  criteria: PasswordCriteria[];
} {
  const criteria: PasswordCriteria[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(password) },
    { label: 'At least one special character (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = 0;
  let label = 'Very Weak';
  let colorClass = 'text-rose-500';
  let bgClass = 'bg-rose-500';

  if (password.length === 0) {
    return { score: 0, label: 'None', colorClass: 'text-slate-400', bgClass: 'bg-slate-200', criteria };
  }

  if (metCount <= 2) {
    score = 25;
    label = 'Weak';
    colorClass = 'text-rose-600';
    bgClass = 'bg-rose-500';
  } else if (metCount === 3) {
    score = 50;
    label = 'Fair';
    colorClass = 'text-amber-600';
    bgClass = 'bg-amber-500';
  } else if (metCount === 4) {
    score = 75;
    label = 'Good';
    colorClass = 'text-blue-600';
    bgClass = 'bg-blue-500';
  } else if (metCount === 5) {
    score = 100;
    label = 'Strong';
    colorClass = 'text-emerald-600';
    bgClass = 'bg-emerald-500';
  }

  return { score, label, colorClass, bgClass, criteria };
}

export const PasswordStrengthMeter: React.FC<{ password: string; showCriteria?: boolean }> = ({
  password,
  showCriteria = true,
}) => {
  if (!password) return null;

  const evaluation = evaluatePassword(password);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Password strength</span>
        <span className={`font-semibold ${evaluation.colorClass}`}>{evaluation.label}</span>
      </div>

      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 ${evaluation.bgClass}`}
          style={{ width: `${evaluation.score}%` }}
        />
      </div>

      {showCriteria && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1.5 text-xs text-slate-600">
          {evaluation.criteria.map((c, index) => (
            <div key={index} className="flex items-center gap-1.5">
              {c.met ? (
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </span>
              )}
              <span className={c.met ? 'text-slate-700 font-medium' : 'text-slate-400'}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
