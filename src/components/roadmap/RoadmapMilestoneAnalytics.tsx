import React from 'react';
import { Roadmap, RoadmapTask } from '../../types.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';
import { Award, Clock, Milestone, Target, TrendingUp } from 'lucide-react';

interface RoadmapMilestoneAnalyticsProps {
  roadmap: Roadmap;
}

export function RoadmapMilestoneAnalytics({ roadmap }: RoadmapMilestoneAnalyticsProps) {
  // Aggregate data for each week sprint
  const chartData = roadmap.weeks.map((week) => {
    let plannedHours = 0;
    let completedHours = 0;
    let totalTasks = week.tasks.length;
    let completedTasks = 0;

    week.tasks.forEach((t) => {
      plannedHours += t.estimatedHours;
      if (t.status === 'Completed') {
        completedHours += t.estimatedHours;
        completedTasks++;
      } else if (t.status === 'In Progress') {
        completedHours += Math.round(t.estimatedHours * 0.4); // partial completion estimate
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      sprint: `Sprint ${week.weekNumber}`,
      title: week.title.split('&')[0].trim(),
      plannedHours,
      completedHours,
      completionRate,
      tasks: `${completedTasks}/${totalTasks}`,
    };
  });

  const totalPlannedHours = chartData.reduce((acc, curr) => acc + curr.plannedHours, 0);
  const totalCompletedHours = chartData.reduce((acc, curr) => acc + curr.completedHours, 0);
  const milestoneTasks = roadmap.weeks.flatMap((w) => w.tasks.filter((t) => t.milestone));
  const completedMilestones = milestoneTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-space">
              Sprint Velocity & Milestone Progress
            </h3>
            <p className="text-[11px] text-slate-500">
              Planned vs completed commitment hours across 4 weekly roadmap milestones
            </p>
          </div>
        </div>

        {/* Milestone Quick Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold">{totalCompletedHours} / {totalPlannedHours} hrs logged</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <Milestone className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-semibold">{completedMilestones} of {milestoneTasks.length || 4} Milestones</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="sprint"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="hours"
              orientation="left"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              unit="h"
            />
            <YAxis
              yAxisId="percent"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                      <div className="font-bold text-slate-100 flex items-center justify-between gap-4">
                        <span>{label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-800 text-indigo-200">
                          {data.tasks} Tasks Done
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">{data.title}</div>
                      <div className="pt-1 border-t border-slate-700/80 flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Planned Hours:</span>
                          <span className="font-semibold text-slate-200">{data.plannedHours}h</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Completed Hours:</span>
                          <span className="font-semibold text-emerald-400">{data.completedHours}h</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Completion Rate:</span>
                          <span className="font-semibold text-indigo-300">{data.completionRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Bar
              yAxisId="hours"
              dataKey="plannedHours"
              name="Planned Effort (hrs)"
              fill="#cbd5e1"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              yAxisId="hours"
              dataKey="completedHours"
              name="Completed Effort (hrs)"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              yAxisId="percent"
              type="monotone"
              dataKey="completionRate"
              name="Sprint Completion %"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
