import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Achievement, BadgeDefinition, DashboardData } from '../types.js';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  Star,
  Trophy,
} from 'lucide-react';

export function AchievementsPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const currentLevelProgress = Math.min(100, Math.max(0, ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100));

  const earnedBadgeIds = new Set(profile?.badges || []);

  return (
    <div id="achievements-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> Gamified Progression
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Engineering Levels & Achievements
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Earn Experience Points (XP) by mastering technical skills, finishing roadmap tasks, completing portfolio projects, and verifying certifications.
          </p>
        </div>
      </div>

      {/* Level Tier Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Engineering Mastery Tier
              </div>
              <div className="text-2xl font-bold mt-0.5 font-space">Level {level} Architect</div>
              <p className="text-xs text-slate-300 mt-1">
                Total Experience: <strong className="text-amber-400">{xp} XP</strong> accumulated
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-slate-400">Next Milestone</div>
            <div className="text-sm font-bold text-white mt-0.5">
              Level {level + 1} ({xpForNextLevel - xp} XP needed)
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Level {level} Progress</span>
            <span className="font-bold text-amber-400">{Math.round(currentLevelProgress)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Achievement Badges</h2>
            <p className="text-xs text-slate-500">Milestones unlocked throughout your engineering journey</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {profile?.badges.length || 0} of {data?.badgeCatalog.length || 6} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.badgeCatalog || []).map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`border rounded-2xl p-5 shadow-xs transition-all ${
                  isEarned
                    ? 'bg-white border-amber-200 ring-1 ring-amber-100'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      isEarned
                        ? 'bg-amber-100 border border-amber-300'
                        : 'bg-slate-200 border border-slate-300 filter grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900">{badge.title}</span>
                      {isEarned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600 flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{badge.description}</p>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{badge.criteria}</span>
                      <span className="font-bold text-amber-700">+{badge.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Earning Rules Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> XP Earning Activities
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-indigo-700">+10 XP</div>
            <div className="font-semibold text-slate-800 mt-0.5">Roadmap Task</div>
            <div className="text-slate-500 text-[11px] mt-1">Marking a weekly roadmap learning task as Completed.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-indigo-700">+10 XP</div>
            <div className="font-semibold text-slate-800 mt-0.5">Document Skill</div>
            <div className="text-slate-500 text-[11px] mt-1">Recording technical skills with evidence links.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-indigo-700">+25 XP</div>
            <div className="font-semibold text-slate-800 mt-0.5">Generate Roadmap</div>
            <div className="text-slate-500 text-[11px] mt-1">Generating personalized 4-week learning sprints.</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-indigo-700">+50 XP</div>
            <div className="font-semibold text-slate-800 mt-0.5">Complete Project</div>
            <div className="text-slate-500 text-[11px] mt-1">Adding finished portfolio projects with GitHub repos.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
