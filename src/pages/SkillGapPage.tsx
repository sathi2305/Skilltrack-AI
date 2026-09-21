import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { SkillGapAnalysisResult, CareerRole } from '../types.js';
import { ReadinessGauge } from '../components/ReadinessGauge.js';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  GitFork,
  FolderGit2,
  MessageSquareCode,
  Info,
  ChevronDown,
  Layers,
  Award,
} from 'lucide-react';

interface SkillGapPageProps {
  careers: CareerRole[];
  onNavigateTab: (tab: string) => void;
}

export function SkillGapPage({ careers, onNavigateTab }: SkillGapPageProps) {
  const { profile } = useAuth();
  const [selectedCareerId, setSelectedCareerId] = useState<string>(
    profile?.targetCareerId || careers[0]?.id || 'career-java-backend'
  );
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalysis = async (roleId: string) => {
    setIsLoading(true);
    try {
      const res = await api.analyzeSkillGap(roleId);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedCareerId);
  }, [selectedCareerId]);

  const activeCareer = careers.find((c) => c.id === selectedCareerId) || careers[0];

  return (
    <div id="skill-gap-page" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header & Target Role Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Skill Gap Analysis Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Technical Skill Gap & Prerequisite Evaluation
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Comparing your current technical inventory, projects, certifications, and internships against the verified industry benchmarks for <strong className="text-slate-900">{activeCareer?.title}</strong>.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400 font-medium">Evaluating For Role:</div>
            <div className="text-xs font-bold text-slate-900">{activeCareer?.title}</div>
          </div>
          <select
            id="skill-gap-career-select"
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading || !analysis ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="inline-block animate-spin text-indigo-600 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Running weighted topological prerequisite algorithm...</p>
        </div>
      ) : (
        <>
          {/* Readiness Gauge Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Career Readiness Score: {analysis.readinessScore}%</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weighted breakdown across 5 verified criteria for {analysis.careerTitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="gap-generate-roadmap-btn"
                  onClick={() => onNavigateTab('roadmap')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  Generate 4-Week Roadmap
                </button>
                <button
                  id="gap-recommended-projects-btn"
                  onClick={() => onNavigateTab('projects')}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                  Recommended Projects
                </button>
              </div>
            </div>

            <ReadinessGauge
              score={analysis.readinessScore}
              breakdown={analysis.scoreBreakdown}
              scoreExplanation={analysis.scoreExplanation}
              size="lg"
              showDetails={true}
            />
          </div>

          {/* 3-Column Categorization Layout: Strong, Improvable, Missing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Strong Skills Column */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900">Strong Matches</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {analysis.strongSkills.length} Verified
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Skills where your reported and verified competency meets or exceeds the required benchmark.
              </p>

              <div className="space-y-3 flex-1">
                {analysis.strongSkills.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                    No verified strong matches yet. Add your current skills in the Skills tab.
                  </div>
                ) : (
                  analysis.strongSkills.map((s) => (
                    <div
                      key={s.name}
                      className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {s.studentLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{s.reason}</div>
                      <div className="text-[10px] text-slate-400 pt-1">Target benchmark: {s.requiredLevel}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Intermediate / Improvable Column */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Needs Improvement</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {analysis.intermediateSkills.length} Developing
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Skills where you have initial exposure, but the role demands advanced or production-level proficiency.
              </p>

              <div className="space-y-3 flex-1">
                {analysis.intermediateSkills.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                    No skills currently in the intermediate improvement tier.
                  </div>
                ) : (
                  analysis.intermediateSkills.map((s) => (
                    <div
                      key={s.name}
                      className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <div className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {s.studentLevel} → {s.requiredLevel}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed">{s.improvementPath}</div>
                      <div className="text-[10px] text-slate-400 pt-1">Category: {s.category}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Missing Skills Column */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h3 className="font-bold text-sm text-slate-900">Missing Gaps</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                  {analysis.missingSkills.length} Missing
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Key technologies not yet documented in your profile. Prioritized by prerequisite dependencies.
              </p>

              <div className="space-y-3 flex-1">
                {analysis.missingSkills.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 text-center text-xs text-emerald-800 font-medium">
                    🎉 Outstanding! No missing required skills detected for {analysis.careerTitle}.
                  </div>
                ) : (
                  analysis.missingSkills.map((m) => (
                    <div
                      key={m.name}
                      className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{m.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.priority === 'Critical' ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {m.priority} Priority
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 leading-relaxed">{m.reason}</div>

                      {m.prerequisites.length > 0 && (
                        <div className="text-[10px] text-slate-500 bg-white/80 p-1.5 rounded border border-rose-100/60">
                          <strong>Prerequisites:</strong> {m.prerequisites.join(', ')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>Required Level: {m.requiredLevel}</span>
                        <span>{m.importance}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Career Assistant Guidance Banner */}
          <div className="p-5 rounded-2xl bg-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                <MessageSquareCode className="w-4 h-4 text-indigo-400" />
                <span>AI Career Mentor Recommendation</span>
              </div>
              <p className="text-sm font-semibold mt-1">
                Focus on {analysis.missingSkills[0]?.name || 'Spring Boot'} next to bridge your primary gap and unlock the next readiness tier.
              </p>
              <p className="text-xs text-indigo-200 mt-0.5">
                Our AI coach can answer questions, explain concepts, or tailor a personalized curriculum for you.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('assistant')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shrink-0 transition-colors"
            >
              Ask AI Coach About Gaps →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
