import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { CareerRole } from '../types.js';
import {
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Layers,
  Search,
} from 'lucide-react';

interface CareerGoalsPageProps {
  careers: CareerRole[];
  onNavigateTab: (tab: string) => void;
  onCareerUpdated: () => void;
}

export function CareerGoalsPage({ careers, onNavigateTab, onCareerUpdated }: CareerGoalsPageProps) {
  const { profile, refreshUserData } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    profile?.targetCareerId || careers[0]?.id || 'career-java-backend'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeRole = careers.find((c) => c.id === selectedRoleId) || careers[0];
  const isCurrentTarget = profile?.targetCareerId === activeRole?.id;

  const handleSetTargetCareer = async (roleId: string) => {
    setIsUpdating(true);
    try {
      await api.updateProfile({ targetCareerId: roleId });
      await refreshUserData();
      onCareerUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCareers = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="career-goals-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Career Track Roles
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Engineering Career Roles & Industry Benchmarks
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Select your dream engineering role to configure your personalized skill gap engine, 4-week roadmap, and portfolio project suggestions.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role Selector List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <input
              type="text"
              placeholder="Search career roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            {filteredCareers.map((c) => {
              const isSelected = c.id === activeRole?.id;
              const isUserGoal = profile?.targetCareerId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedRoleId(c.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{c.title}</h3>
                        {isUserGoal && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Target
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.category}</div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                      {c.demandLevel} Demand
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80 text-[11px]">
                    <span className="font-semibold text-slate-700">{c.averageSalary}</span>
                    <span className="text-slate-400">{c.requiredSkills.length} required skills</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Role Breakdown & Skill Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {activeRole && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {activeRole.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {activeRole.demandLevel} Market Demand
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2 font-space">{activeRole.title}</h2>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Average Compensation: <strong className="text-slate-800">{activeRole.averageSalary}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrentTarget ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Career Target
                    </span>
                  ) : (
                    <button
                      id="set-target-career-btn"
                      disabled={isUpdating}
                      onClick={() => handleSetTargetCareer(activeRole.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? 'Setting...' : 'Set as My Target Role'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Role Overview</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{activeRole.overview}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Required Technical Skills ({activeRole.requiredSkills.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Weighted evaluation matrix</span>
                </div>

                <div className="space-y-2.5">
                  {activeRole.requiredSkills.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{req.skillName}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            req.importance === 'Required'
                              ? 'bg-rose-100 text-rose-800'
                              : req.importance === 'Preferred'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {req.importance}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{req.description}</p>
                        {req.prerequisites.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            Prerequisites: {req.prerequisites.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-slate-800">{req.minLevel} Level</div>
                        <div className="text-[10px] text-slate-400">Weight: {req.weight} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateTab('skill-gap')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Run Skill Gap Analysis For This Role <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
