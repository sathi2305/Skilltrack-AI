import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ReadinessGaugeProps {
  score: number; // 0 - 100
  breakdown: {
    technicalSkillsScore: number;
    projectsScore: number;
    certificationsScore: number;
    internshipScore: number;
    learningProgressScore: number;
  };
  scoreExplanation?: string[];
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function ReadinessGauge({
  score,
  breakdown,
  scoreExplanation,
  size = 'md',
  showDetails = true,
}: ReadinessGaugeProps) {
  // SVG circle calculations
  const radius = size === 'lg' ? 68 : size === 'md' ? 52 : 36;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 75) return 'text-emerald-600 stroke-emerald-500';
    if (val >= 50) return 'text-indigo-600 stroke-indigo-500';
    if (val >= 30) return 'text-amber-600 stroke-amber-500';
    return 'text-rose-600 stroke-rose-500';
  };

  const getScoreBg = (val: number) => {
    if (val >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (val >= 30) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div id="career-readiness-gauge" className="flex flex-col gap-4">
      <div className="flex items-center gap-5">
        <div className="relative flex items-center justify-center">
          <svg
            className="transform -rotate-90"
            width={(radius + strokeWidth) * 2}
            height={(radius + strokeWidth) * 2}
          >
            {/* Background circle */}
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              className="stroke-slate-100"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className={`font-bold tracking-tight ${
                size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'
              } text-slate-900`}
            >
              {Math.round(score)}%
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Readiness
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getScoreBg(score)}`}>
              {score >= 75 ? 'Strong Fit' : score >= 50 ? 'Intermediate Candidate' : score >= 30 ? 'Developing' : 'Early Stage'}
            </span>
            <span className="text-xs text-slate-400">Score based on 5 criteria</span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {score >= 75
              ? 'Excellent skill alignment with target industry expectations and verified project proof.'
              : score >= 50
              ? 'Solid technical core established. Prioritize high-priority missing frameworks to reach 75%+.'
              : 'Target prerequisites identified. Follow your weekly roadmap tasks to systematically raise score.'}
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-slate-500 text-[11px]">Tech Skills</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {breakdown.technicalSkillsScore.toFixed(1)} <span className="text-slate-400 font-normal">/ 40%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.technicalSkillsScore / 40) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-slate-500 text-[11px]">Projects</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {breakdown.projectsScore.toFixed(1)} <span className="text-slate-400 font-normal">/ 25%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.projectsScore / 25) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-slate-500 text-[11px]">Certifications</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {breakdown.certificationsScore.toFixed(1)} <span className="text-slate-400 font-normal">/ 15%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.certificationsScore / 15) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-slate-500 text-[11px]">Internships</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {breakdown.internshipScore.toFixed(1)} <span className="text-slate-400 font-normal">/ 10%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.internshipScore / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <div className="text-slate-500 text-[11px]">Roadmap Progress</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {breakdown.learningProgressScore.toFixed(1)} <span className="text-slate-400 font-normal">/ 10%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(breakdown.learningProgressScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50/70 p-2 rounded-md border border-slate-100">
            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>
              <strong>Transparency Note:</strong> This score is an objective learning and profile-building indicator based on verified criteria. It does not predict or guarantee employment.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
