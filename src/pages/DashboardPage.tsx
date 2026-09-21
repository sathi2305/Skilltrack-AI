import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { DashboardData, CareerRole } from '../types.js';
import { ReadinessGauge } from '../components/ReadinessGauge.js';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  GitFork,
  Code2,
  FolderGit2,
  Award,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  careers: CareerRole[];
}

export function DashboardPage({ onNavigateTab, careers }: DashboardPageProps) {
  const { user, profile, refreshUserData, loginAsDemoStudent } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [profile?.id, profile?.targetCareerId]);

  const handleCompleteTask = async (roadmapId: string, taskId: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.updateRoadmapTask(roadmapId, taskId, 'Completed');
      await refreshUserData();
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Computing your real-time skill gaps and readiness metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Session Required</h3>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={async () => {
                await loginAsDemoStudent();
                await fetchDashboard();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Sign In as Demo Student (Alex Rivera)
            </button>
            <button
              onClick={() => fetchDashboard()}
              className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              Retry Loading Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile: student, career, careerReadinessScore, scoreBreakdown, skillGapSummary, currentRoadmap, todayTasks } = data;

  return (
    <div id="dashboard-container" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Welcome Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              {student.major} • Class of {student.graduationYear}
            </span>
            <span className="text-xs text-slate-400">at {student.college}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5 font-space">
            Welcome back, {student.name}!
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            You are targeting <strong className="text-slate-900">{career.title}</strong>. Your profile currently matches{' '}
            <strong className="text-indigo-600 font-semibold">{careerReadinessScore}%</strong> of the verified role expectations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="dash-run-gap-analysis-btn"
            onClick={() => onNavigateTab('skill-gap')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Skill Gap
          </button>
          <button
            id="dash-view-roadmap-btn"
            onClick={() => onNavigateTab('roadmap')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <GitFork className="w-3.5 h-3.5 text-slate-500" />
            View Roadmap
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Readiness & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Meter Card (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Career Readiness Score</h2>
              <p className="text-xs text-slate-500">Objective quantitative evaluation for {career.title}</p>
            </div>
            <button
              onClick={() => onNavigateTab('skill-gap')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ReadinessGauge
            score={careerReadinessScore}
            breakdown={scoreBreakdown}
            scoreExplanation={data.scoreExplanation}
            size="lg"
            showDetails={true}
          />
        </div>

        {/* Skill Gap Matrix Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Skill Gap Summary</h2>
                <p className="text-xs text-slate-500">Against {career.requiredSkills.length} required competencies</p>
              </div>
              <button
                onClick={() => onNavigateTab('skills')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-emerald-700">{skillGapSummary.strong}</div>
                <div className="text-[11px] font-medium text-emerald-800 mt-0.5">Strong Match</div>
              </div>
              <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-amber-700">{skillGapSummary.improvable}</div>
                <div className="text-[11px] font-medium text-amber-800 mt-0.5">Improvable</div>
              </div>
              <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-rose-700">{skillGapSummary.missing}</div>
                <div className="text-[11px] font-medium text-rose-800 mt-0.5">Missing Gaps</div>
              </div>
            </div>

            {/* High Priority Missing Skills */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Top Urgent Missing Gaps:</span>
                <span className="text-[10px] text-slate-400">Prerequisites Checked</span>
              </div>
              <div className="space-y-2">
                {skillGapSummary.topMissing.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                    All required technical skills matched!
                  </div>
                ) : (
                  skillGapSummary.topMissing.map((m) => (
                    <div
                      key={m.name}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{m.name}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Target: {m.requiredLevel} • Category: {m.category}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('projects')}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              View Recommended Projects to Close Gaps
            </button>
          </div>
        </div>
      </div>

      {/* Active Roadmap & Current Sprints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roadmap Progress & Active Tasks (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personalized Learning Roadmap</h2>
              <p className="text-xs text-slate-500">
                {currentRoadmap ? currentRoadmap.title : 'No active roadmap created yet'}
              </p>
            </div>
            {currentRoadmap ? (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {currentRoadmap.completedTasks} / {currentRoadmap.totalTasks} Tasks Done
              </span>
            ) : null}
          </div>

          {currentRoadmap ? (
            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Sprint Completion</span>
                  <span className="font-bold text-indigo-600">
                    {Math.round((currentRoadmap.completedTasks / Math.max(1, currentRoadmap.totalTasks)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(currentRoadmap.completedTasks / Math.max(1, currentRoadmap.totalTasks)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-800">Current Sprint Tasks:</div>
                {todayTasks.length === 0 ? (
                  <div className="p-4 bg-emerald-50 rounded-xl text-center text-xs text-emerald-800 font-medium">
                    🎉 All sprint tasks completed! Great work leveling up.
                  </div>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between gap-3 transition-colors shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          id={`complete-task-${task.id}`}
                          disabled={updatingTaskId === task.id}
                          onClick={() => handleCompleteTask(currentRoadmap.id, task.id)}
                          className="mt-0.5 w-5 h-5 rounded border border-slate-300 hover:border-emerald-600 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                          title="Click to complete (+10 XP)"
                        >
                          {task.status === 'Completed' ? (
                            <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-xs" />
                          )}
                        </button>
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{task.title}</div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span>{task.weekTitle || `Week ${task.weekNumber}`}</span>
                            <span>•</span>
                            <span>{task.estimatedHours} hrs</span>
                            <span>•</span>
                            <span className="font-semibold text-indigo-600">+10 XP</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        task.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => onNavigateTab('roadmap')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  Open Full 4-Week Schedule <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GitFork className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-xs text-slate-800">No Roadmap Generated Yet</div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Generate a custom 4-week step-by-step roadmap structured specifically around your missing skills in {career.title}.
              </p>
              <button
                onClick={() => onNavigateTab('roadmap')}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Generate 4-Week Roadmap
              </button>
            </div>
          )}
        </div>

        {/* Portfolio & Verified Proofs (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Portfolio & Evidence</h2>
                <p className="text-xs text-slate-500">Verified credentials contributing to 25% Project Score</p>
              </div>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                All Projects <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {data.completedProjects.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  No completed projects documented yet. Add your portfolio projects to earn up to 25% readiness points.
                </div>
              ) : (
                data.completedProjects.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{p.title}</span>
                      {p.verified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Under Review
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-slate-200 text-slate-600 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-indigo-50/50 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-[11px] text-indigo-950">
                <strong>AI Career Mentor:</strong> Need guidance on what to learn next?
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('assistant')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 ml-2"
            >
              Chat Live →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
