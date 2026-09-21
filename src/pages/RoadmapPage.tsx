import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Roadmap, CareerRole } from '../types.js';
import { RoadmapVisualTimeline } from '../components/roadmap/RoadmapVisualTimeline.js';
import {
  GitFork,
  Sparkles,
  RefreshCw,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface RoadmapPageProps {
  careers: CareerRole[];
  onNavigateTab: (tab: string) => void;
}

export function RoadmapPage({ careers, onNavigateTab }: RoadmapPageProps) {
  const { profile, refreshUserData } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const targetCareerId = profile?.targetCareerId || careers[0]?.id || 'career-java-backend';
  const targetCareer = careers.find((c) => c.id === targetCareerId) || careers[0];

  const fetchRoadmap = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCurrentRoadmap();
      if (!res) {
        // Auto-generate if none exists
        const generated = await api.generateRoadmap(targetCareerId);
        setRoadmap(generated);
      } else {
        setRoadmap(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [targetCareerId]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const generated = await api.generateRoadmap(targetCareerId);
      setRoadmap(generated);
      await refreshUserData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: 'Not Started' | 'In Progress' | 'Completed') => {
    if (!roadmap) return;
    setUpdatingTaskId(taskId);
    try {
      const res = await api.updateRoadmapTask(roadmap.id, taskId, status);
      setRoadmap(res.roadmap);
      await refreshUserData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (isLoading || !roadmap) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Assembling your 4-week step-by-step engineering curriculum...</p>
        </div>
      </div>
    );
  }

  const completionPercent = Math.round((roadmap.completedTasks / Math.max(1, roadmap.totalTasks)) * 100);

  return (
    <div id="roadmap-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5 text-indigo-600" /> Personalized Roadmap Engine
            </span>
            <span className="text-xs text-slate-400">Targeting {roadmap.careerRoleTitle}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            {roadmap.title}
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {roadmap.summary} Structured for {profile?.learningHoursPerWeek || 10} hours of deliberate practice per week.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="regenerate-roadmap-btn"
            disabled={isRegenerating}
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate Roadmap
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-800">
              Curriculum Progress: {roadmap.completedTasks} of {roadmap.totalTasks} Tasks Completed
            </span>
            <span className="font-extrabold text-indigo-600">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
          <div className="text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Total Duration</div>
            <div className="font-bold text-slate-900 mt-0.5">4 Sprints (1 Month)</div>
          </div>
          <div className="text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Weekly Commitment</div>
            <div className="font-bold text-slate-900 mt-0.5">{profile?.learningHoursPerWeek || 10} hrs/wk</div>
          </div>
        </div>
      </div>

      {/* Visual Timeline & Dependency Graph Component */}
      <RoadmapVisualTimeline
        roadmap={roadmap}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        updatingTaskId={updatingTaskId}
      />
    </div>
  );
}
