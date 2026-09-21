import React from 'react';
import { RoadmapTask } from '../../types.js';
import {
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Award,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  Sparkles,
  Milestone,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: RoadmapTask | null;
  allTasks: RoadmapTask[];
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: 'Not Started' | 'In Progress' | 'Completed') => void;
  isUpdating: boolean;
}

export function TaskDetailModal({
  task,
  allTasks,
  onClose,
  onUpdateStatus,
  isUpdating,
}: TaskDetailModalProps) {
  if (!task) return null;

  // Resolve prerequisites
  const prereqIds = task.dependencies || [];
  const prerequisites = allTasks.filter((t) => prereqIds.includes(t.id));
  const allPrereqsMet = prerequisites.length === 0 || prerequisites.every((p) => p.status === 'Completed');

  // Resolve downstream dependents
  const dependentTasks = allTasks.filter((t) => (t.dependencies || []).includes(task.id));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core Concept':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Framework':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Project':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Testing & QA':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Deployment & DevOps':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                Sprint {task.weekNumber}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
              {task.milestone && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Milestone className="w-3 h-3 text-amber-600" />
                  Milestone
                </span>
              )}
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> {task.estimatedHours} hrs
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
            {task.milestoneName && (
              <p className="text-xs font-semibold text-amber-700 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> {task.milestoneName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-600 flex-1">
          {/* Description */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Task Overview
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
              {task.description}
            </p>
          </div>

          {/* Prerequisite & Dependency Chain Banner */}
          <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                {allPrereqsMet ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Prerequisites Dependency Status</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  allPrereqsMet
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {allPrereqsMet ? 'Dependencies Cleared' : 'Prerequisites Incomplete'}
              </span>
            </div>

            {prerequisites.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] text-slate-500 font-medium">Must be completed before starting:</div>
                <div className="space-y-1">
                  {prerequisites.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-slate-100 text-slate-600">
                          W{p.weekNumber}
                        </span>
                        <span className="font-semibold text-slate-800">{p.title}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                No prior prerequisites. You can begin this task immediately.
              </p>
            )}

            {/* Outgoing unlocks */}
            {dependentTasks.length > 0 && (
              <div className="pt-2 border-t border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-medium mb-1">
                  Completing this task unlocks:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dependentTasks.map((dep) => (
                    <span
                      key={dep.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold"
                    >
                      <ArrowRight className="w-2.5 h-2.5" />
                      {dep.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Items / Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Action Checklist ({task.subtasks.length} items)</span>
                <span className="text-[10px] text-indigo-600 font-semibold">+10 XP upon completion</span>
              </div>
              <ul className="space-y-2">
                {task.subtasks.map((sub, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-150 text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span className="text-xs leading-relaxed">{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Curated Study Resources */}
          {task.resources && task.resources.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-slate-400" />
                <span>Curated Study Resources</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {task.resources.map((res, rIdx) => (
                  <a
                    key={rIdx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                        {res.type ? res.type[0] : 'D'}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{res.type} Reference</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <div className="flex items-center gap-1.5">
              {(['Not Started', 'In Progress', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(task.id, st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                    task.status === st
                      ? st === 'Completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : st === 'In Progress'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
