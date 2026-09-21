import React, { useState, useMemo, useRef } from 'react';
import { Roadmap, RoadmapTask, RoadmapWeek } from '../../types.js';
import { TaskDetailModal } from './TaskDetailModal.js';
import { RoadmapMilestoneAnalytics } from './RoadmapMilestoneAnalytics.js';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  Milestone,
  GitBranch,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Filter,
  BarChart3,
  Layers,
  ArrowRight,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';

interface RoadmapVisualTimelineProps {
  roadmap: Roadmap;
  onUpdateTaskStatus: (taskId: string, status: 'Not Started' | 'In Progress' | 'Completed') => Promise<void>;
  updatingTaskId: string | null;
}

export function RoadmapVisualTimeline({
  roadmap,
  onUpdateTaskStatus,
  updatingTaskId,
}: RoadmapVisualTimelineProps) {
  const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'linear'>('graph');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterMilestonesOnly, setFilterMilestonesOnly] = useState(false);

  // Flatten all tasks
  const allTasks = useMemo(() => {
    return roadmap.weeks.flatMap((w) => w.tasks);
  }, [roadmap]);

  // Derive task dependencies if not explicitly present in legacy objects
  const enrichedTasks = useMemo(() => {
    const taskMap = new Map<string, RoadmapTask>();
    allTasks.forEach((t) => taskMap.set(t.id, t));

    return allTasks.map((t) => {
      let deps = t.dependencies || [];
      // If no dependencies specified, establish sensible natural progression
      if (deps.length === 0) {
        if (t.weekNumber === 1 && t.id.endsWith('-2')) {
          // 2nd task in week 1 depends on 1st task in week 1
          const prevInWeek = allTasks.find((other) => other.weekNumber === 1 && other.id !== t.id);
          if (prevInWeek) deps = [prevInWeek.id];
        } else if (t.weekNumber === 2) {
          const w1Tasks = allTasks.filter((other) => other.weekNumber === 1);
          if (t.id.endsWith('-1')) {
            deps = w1Tasks.map((w) => w.id);
          } else {
            const prevInW2 = allTasks.find((other) => other.weekNumber === 2 && other.id !== t.id);
            if (prevInW2) deps = [prevInW2.id];
          }
        } else if (t.weekNumber === 3) {
          const w2Tasks = allTasks.filter((other) => other.weekNumber === 2);
          if (t.id.endsWith('-1')) {
            deps = w2Tasks.map((w) => w.id);
          } else {
            const prevInW3 = allTasks.find((other) => other.weekNumber === 3 && other.id !== t.id);
            deps = prevInW3 ? [prevInW3.id] : w2Tasks.map((w) => w.id);
          }
        } else if (t.weekNumber === 4) {
          const w3Tasks = allTasks.filter((other) => other.weekNumber === 3);
          const capstone = w3Tasks[w3Tasks.length - 1] || w3Tasks[0];
          if (t.id.endsWith('-1')) {
            deps = capstone ? [capstone.id] : [];
          } else {
            const t41 = allTasks.find((other) => other.weekNumber === 4 && other.id !== t.id);
            deps = t41 && capstone ? [capstone.id, t41.id] : (capstone ? [capstone.id] : []);
          }
        }
      }

      // Infer milestone flag if not explicitly defined
      let isMilestone = t.milestone;
      let milestoneName = t.milestoneName;
      if (isMilestone === undefined) {
        if (t.weekNumber === 1 && t.id.endsWith('-2')) {
          isMilestone = true;
          milestoneName = 'Sprint 1: Core Idioms Verified';
        } else if (t.weekNumber === 2 && t.id.endsWith('-2')) {
          isMilestone = true;
          milestoneName = 'Sprint 2: Architecture Milestone';
        } else if (t.weekNumber === 3) {
          isMilestone = true;
          milestoneName = 'Sprint 3: Alpha Capstone Milestone';
        } else if (t.weekNumber === 4 && t.id.endsWith('-2')) {
          isMilestone = true;
          milestoneName = 'Sprint 4: Production Release';
        }
      }

      return {
        ...t,
        dependencies: deps,
        milestone: isMilestone,
        milestoneName: milestoneName || (isMilestone ? `Sprint ${t.weekNumber} Milestone` : undefined),
      };
    });
  }, [allTasks]);

  // Quick lookup map
  const enrichedMap = useMemo(() => {
    const map = new Map<string, (typeof enrichedTasks)[0]>();
    enrichedTasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [enrichedTasks]);

  // Filter tasks based on selections
  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter((t) => {
      if (filterMilestonesOnly && !t.milestone) return false;
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      return true;
    });
  }, [enrichedTasks, filterMilestonesOnly, selectedCategory]);

  // Dependency graph connections
  const dependencyLinks = useMemo(() => {
    const links: { sourceId: string; targetId: string; status: 'completed' | 'active' | 'pending' }[] = [];
    enrichedTasks.forEach((target) => {
      (target.dependencies || []).forEach((sourceId) => {
        const source = enrichedMap.get(sourceId);
        if (source) {
          let status: 'completed' | 'active' | 'pending' = 'pending';
          if (source.status === 'Completed' && target.status === 'Completed') {
            status = 'completed';
          } else if (source.status === 'Completed') {
            status = 'active';
          }
          links.push({
            sourceId,
            targetId: target.id,
            status,
          });
        }
      });
    });
    return links;
  }, [enrichedTasks, enrichedMap]);

  // Highlighting: check if a link or node is related to the hovered task
  const isLinkHighlighted = (sourceId: string, targetId: string) => {
    if (!hoveredTaskId) return false;
    return sourceId === hoveredTaskId || targetId === hoveredTaskId;
  };

  const isNodeRelated = (taskId: string) => {
    if (!hoveredTaskId) return true;
    if (taskId === hoveredTaskId) return true;
    const hovered = enrichedMap.get(hoveredTaskId);
    if (!hovered) return false;
    // Is upstream prerequisite?
    if ((hovered.dependencies || []).includes(taskId)) return true;
    // Is downstream dependent?
    const thisTask = enrichedMap.get(taskId);
    if (thisTask && (thisTask.dependencies || []).includes(hoveredTaskId)) return true;
    return false;
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Core Concept':
        return { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case 'Framework':
        return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' };
      case 'Project':
        return { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
      case 'Testing & QA':
        return { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'Deployment & DevOps':
        return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      default:
        return { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500' };
    }
  };

  // Milestone Stages calculation
  const milestoneWeeks = [1, 2, 3, 4];
  const milestoneProgress = milestoneWeeks.map((weekNum) => {
    const tasksInWeek = enrichedTasks.filter((t) => t.weekNumber === weekNum);
    const completedCount = tasksInWeek.filter((t) => t.status === 'Completed').length;
    const isCompleted = tasksInWeek.length > 0 && completedCount === tasksInWeek.length;
    const hasMilestoneTask = tasksInWeek.some((t) => t.milestone);
    const milestoneTask = tasksInWeek.find((t) => t.milestone) || tasksInWeek[tasksInWeek.length - 1];

    return {
      weekNum,
      title: roadmap.weeks.find((w) => w.weekNumber === weekNum)?.title || `Sprint ${weekNum}`,
      totalTasks: tasksInWeek.length,
      completedCount,
      isCompleted,
      milestoneName: milestoneTask?.milestoneName || `Sprint ${weekNum} Ready`,
    };
  });

  return (
    <div className="space-y-6">
      {/* Visual Timeline Milestones Progress Bar (Top Ribbon) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-space">
              <Milestone className="w-4 h-4 text-indigo-600" />
              Roadmap Progress Milestones
            </h2>
            <p className="text-xs text-slate-500">
              Synchronized 4-Sprint trajectory towards {roadmap.careerRoleTitle} readiness
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              {roadmap.completedTasks} of {roadmap.totalTasks} Tasks Completed
            </span>
          </div>
        </div>

        {/* Milestone Steps Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {milestoneProgress.map((m, idx) => {
            const isCurrentSprint = !m.isCompleted && (idx === 0 || milestoneProgress[idx - 1].isCompleted);

            return (
              <div
                key={m.weekNum}
                className={`relative rounded-xl p-3.5 border transition-all ${
                  m.isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isCurrentSprint
                    ? 'bg-indigo-50/40 border-indigo-200 shadow-xs ring-1 ring-indigo-500/20'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                        m.isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrentSprint
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {m.weekNum}
                    </span>
                    Sprint {m.weekNum}
                  </span>

                  {m.isCompleted ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Passed
                    </span>
                  ) : isCurrentSprint ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Pending
                    </span>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-xs truncate" title={m.title}>
                  {m.title}
                </div>

                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span className="truncate max-w-[140px]" title={m.milestoneName}>
                    {m.milestoneName}
                  </span>
                  <span className="font-semibold text-slate-700 shrink-0">
                    {m.completedCount}/{m.totalTasks}
                  </span>
                </div>

                {/* Micro Progress Line */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{
                      width: `${Math.round((m.completedCount / Math.max(1, m.totalTasks)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar & Filter Switchers */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* View Mode & Analytics Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'graph'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Dependency Graph Timeline
            </button>
            <button
              onClick={() => setViewMode('linear')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'linear'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Linear Milestone Stream
            </button>
          </div>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              showAnalytics
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showAnalytics ? 'Hide Sprint Velocity Chart' : 'Show Sprint Velocity (Recharts)'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Milestone Only Checkbox */}
          <button
            onClick={() => setFilterMilestonesOnly(!filterMilestonesOnly)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterMilestonesOnly
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Milestone className="w-3.5 h-3.5 text-amber-600" />
            <span>Milestones Only</span>
          </button>

          {/* Category Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              <option value="Core Concept">Core Concepts</option>
              <option value="Framework">Frameworks & APIs</option>
              <option value="Project">Portfolio Projects</option>
              <option value="Testing & QA">Testing & QA</option>
              <option value="Deployment & DevOps">DevOps & Cloud</option>
            </select>
          </div>
        </div>
      </div>

      {/* Optional Recharts Sprint Velocity & Milestone Progress */}
      {showAnalytics && (
        <div className="transition-all animate-in fade-in duration-200">
          <RoadmapMilestoneAnalytics roadmap={roadmap} />
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 1: VISUAL SVG DEPENDENCY GRAPH TIMELINE              */}
      {/* ========================================================= */}
      {viewMode === 'graph' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 overflow-hidden">
          {/* Graph Legend & Tip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] pb-4 border-b border-slate-100 text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-slate-700">Dependency Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed Task
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                Not Started
              </span>
              <span className="flex items-center gap-1.5">
                <Milestone className="w-3.5 h-3.5 text-amber-500" />
                Key Milestone
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Hover on any card to trace upstream prerequisites & downstream dependents</span>
            </div>
          </div>

          {/* SVG Dependency Canvas + Columns Container */}
          <div className="relative min-h-[580px] overflow-x-auto pb-4">
            {/* Multi-Sprint Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[900px] relative z-10">
              {[1, 2, 3, 4].map((weekNum) => {
                const week = roadmap.weeks.find((w) => w.weekNumber === weekNum);
                const tasksInThisWeek = filteredTasks.filter((t) => t.weekNumber === weekNum);
                const allWeekTasks = enrichedTasks.filter((t) => t.weekNumber === weekNum);
                const isWeekAllComplete = allWeekTasks.every((t) => t.status === 'Completed');

                return (
                  <div
                    key={weekNum}
                    className={`flex flex-col rounded-2xl p-4 border transition-all ${
                      isWeekAllComplete
                        ? 'bg-emerald-50/20 border-emerald-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    {/* Column Sprint Header */}
                    <div className="pb-3 mb-4 border-b border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isWeekAllComplete
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          Sprint {weekNum}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {allWeekTasks.filter((t) => t.status === 'Completed').length} / {allWeekTasks.length} Done
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                        {week?.title || `Sprint ${weekNum}`}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {week?.objective || 'Curriculum milestone objectives'}
                      </p>
                    </div>

                    {/* Task Node Cards in Column */}
                    <div className="space-y-4 flex-1">
                      {tasksInThisWeek.map((task) => {
                        const isHovered = hoveredTaskId === task.id;
                        const isDimmed = hoveredTaskId !== null && !isNodeRelated(task.id);
                        const isUpdating = updatingTaskId === task.id;
                        const theme = getCategoryTheme(task.category);

                        // Prerequisite completeness check
                        const prereqs = (task.dependencies || [])
                          .map((id) => enrichedMap.get(id))
                          .filter(Boolean) as (typeof enrichedTasks)[0][];
                        const prereqsDone = prereqs.length === 0 || prereqs.every((p) => p.status === 'Completed');

                        return (
                          <div
                            key={task.id}
                            id={`roadmap-node-${task.id}`}
                            onMouseEnter={() => setHoveredTaskId(task.id)}
                            onMouseLeave={() => setHoveredTaskId(null)}
                            onClick={() => setSelectedTask(task)}
                            className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                              isDimmed ? 'opacity-30 blur-[0.2px]' : 'opacity-100'
                            } ${
                              task.status === 'Completed'
                                ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400 shadow-xs'
                                : task.status === 'In Progress'
                                ? 'bg-indigo-50/40 border-indigo-300 hover:border-indigo-400 shadow-xs ring-1 ring-indigo-500/20'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            } ${
                              isHovered ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''
                            }`}
                          >
                            {/* Milestone Indicator Banner */}
                            {task.milestone && (
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                  <Milestone className="w-2.5 h-2.5 text-amber-600" />
                                  Key Milestone
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 truncate max-w-[120px]">
                                  {task.milestoneName}
                                </span>
                              </div>
                            )}

                            {/* Card Header & Fast Completion Check */}
                            <div className="flex items-start gap-2.5 justify-between">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateTaskStatus(
                                    task.id,
                                    task.status === 'Completed' ? 'Not Started' : 'Completed'
                                  );
                                }}
                                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                  task.status === 'Completed'
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 hover:border-indigo-600 bg-white text-transparent hover:text-indigo-600'
                                }`}
                                title={task.status === 'Completed' ? 'Mark Incomplete' : 'Complete task (+10 XP)'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${theme.badge}`}>
                                    {task.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> {task.estimatedHours}h
                                  </span>
                                </div>
                                <h4
                                  className={`text-xs font-bold leading-snug line-clamp-2 ${
                                    task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                              </div>
                            </div>

                            {/* Dependencies Tag & Status */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              {/* Prerequisites badge */}
                              {prereqs.length > 0 ? (
                                <span
                                  className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
                                    prereqsDone
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                  }`}
                                  title={
                                    prereqsDone
                                      ? 'All prerequisites completed'
                                      : `Prerequisites pending: ${prereqs.filter((p) => p.status !== 'Completed').map((p) => p.title).join(', ')}`
                                  }
                                >
                                  {prereqsDone ? (
                                    <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                                  ) : (
                                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                                  )}
                                  <span>{prereqs.length} prereq{prereqs.length > 1 ? 's' : ''}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">Ready</span>
                              )}

                              <span
                                className={`font-semibold px-2 py-0.5 rounded ${
                                  task.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : task.status === 'In Progress'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>

                            {/* Action items counter pill */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                                <span>{task.subtasks.length} action items</span>
                                <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5">
                                  Details <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {tasksInThisWeek.length === 0 && (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                          No tasks match selected filter.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: LINEAR MILESTONE STREAM                           */}
      {/* ========================================================= */}
      {viewMode === 'linear' && (
        <div className="space-y-6">
          {roadmap.weeks.map((week) => {
            const weekTasks = filteredTasks.filter((t) => t.weekNumber === week.weekNumber);
            if (weekTasks.length === 0) return null;

            const completedInWeek = weekTasks.filter((t) => t.status === 'Completed').length;
            const isWeekComplete = completedInWeek === weekTasks.length && weekTasks.length > 0;

            return (
              <div
                key={week.weekNumber}
                className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs transition-all ${
                  isWeekComplete ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                {/* Milestone Sprint Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isWeekComplete ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                      }`}
                    >
                      W{week.weekNumber}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{week.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{week.objective}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        isWeekComplete
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {completedInWeek} / {weekTasks.length} Completed
                    </span>
                  </div>
                </div>

                {/* Vertical Timeline Nodes */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 ml-4 space-y-4 my-2">
                  {weekTasks.map((task) => {
                    const prereqs = (task.dependencies || [])
                      .map((id) => enrichedMap.get(id))
                      .filter(Boolean) as (typeof enrichedTasks)[0][];
                    const prereqsDone = prereqs.length === 0 || prereqs.every((p) => p.status === 'Completed');

                    return (
                      <div key={task.id} className="relative group">
                        {/* Timeline Node Icon on spine */}
                        <div
                          className={`absolute -left-[33px] sm:-left-[41px] top-4 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-colors ${
                            task.status === 'Completed'
                              ? 'border-emerald-600 text-emerald-600'
                              : task.status === 'In Progress'
                              ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-50'
                              : 'border-slate-300 text-slate-400'
                          }`}
                        >
                          {task.status === 'Completed' ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>

                        {/* Node Card */}
                        <div
                          onClick={() => setSelectedTask(task)}
                          className={`border rounded-xl p-4 transition-all cursor-pointer ${
                            task.status === 'Completed'
                              ? 'border-emerald-200 bg-emerald-50/30'
                              : task.status === 'In Progress'
                              ? 'border-indigo-200 bg-indigo-50/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Fast complete button */}
                              <button
                                type="button"
                                disabled={updatingTaskId === task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateTaskStatus(
                                    task.id,
                                    task.status === 'Completed' ? 'Not Started' : 'Completed'
                                  );
                                }}
                                className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                                  task.status === 'Completed'
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 hover:border-emerald-600 text-transparent hover:text-emerald-400'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span
                                    className={`text-xs font-bold ${
                                      task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {task.milestone && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                      <Milestone className="w-3 h-3 text-amber-600" />
                                      {task.milestoneName || 'Milestone'}
                                    </span>
                                  )}

                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {task.category}
                                  </span>

                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {task.estimatedHours} hrs
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {task.description}
                                </p>

                                {/* Dependencies trail */}
                                {prereqs.length > 0 && (
                                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                                    <span className="font-semibold text-slate-600">Prerequisites:</span>
                                    {prereqs.map((p) => (
                                      <span
                                        key={p.id}
                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${
                                          p.status === 'Completed'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}
                                      >
                                        {p.status === 'Completed' ? '✓' : '⚠'} {p.title}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Select & Details Action */}
                            <div
                              className="flex items-center gap-2 self-end sm:self-center shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={task.status}
                                disabled={updatingTaskId === task.id}
                                onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold cursor-pointer focus:outline-hidden ${
                                  task.status === 'Completed'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : task.status === 'In Progress'
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>

                              <button
                                onClick={() => setSelectedTask(task)}
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Inspector Modal */}
      <TaskDetailModal
        task={selectedTask}
        allTasks={enrichedTasks}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={async (taskId, status) => {
          await onUpdateTaskStatus(taskId, status);
          if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask({ ...selectedTask, status });
          }
        }}
        isUpdating={updatingTaskId !== null}
      />
    </div>
  );
}
