import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { AdminMetrics, StudentProject, Certification } from '../types.js';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Award,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export function AdminPage() {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingProjects, setPendingProjects] = useState<StudentProject[]>([]);
  const [pendingCerts, setPendingCerts] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackInput, setFeedbackInput] = useState<{ [key: string]: string }>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, p, c] = await Promise.all([
        api.getAdminMetrics(),
        api.getPendingProjects(),
        api.getPendingCertifications(),
      ]);
      setMetrics(m);
      setPendingProjects(p);
      setPendingCerts(c);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyProject = async (projectId: string, approved: boolean) => {
    setActionLoadingId(projectId);
    try {
      const feedback = feedbackInput[projectId] || (approved ? 'Verified by Faculty Review' : 'Needs revisions');
      await api.verifyProject(projectId, approved, feedback);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyCert = async (certId: string, approved: boolean) => {
    setActionLoadingId(certId);
    try {
      const feedback = feedbackInput[certId] || (approved ? 'Credential verified with issuer' : 'Invalid credential ID');
      await api.verifyCertification(certId, approved, feedback);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin text-indigo-600 mb-2">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <p className="text-xs text-slate-500 font-medium">Loading faculty administrative console...</p>
      </div>
    );
  }

  return (
    <div id="admin-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Faculty & Academic Administration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Cohort Skill Gap & Verification Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Monitor student career readiness distributions, audit cohort skill bottlenecks, and verify student project and certification submissions.
          </p>
        </div>
      </div>

      {/* Cohort KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-space">{metrics.totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active registered learners</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Cohort Average Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-space">{metrics.averageReadinessScore}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Weighted career alignment</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Low Readiness Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2 font-space">{metrics.lowReadinessAlerts}</div>
          <div className="text-[11px] text-slate-400 mt-1">Students under 40% readiness</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Audits</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-space">
            {pendingProjects.length + pendingCerts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Submissions awaiting review</div>
        </div>
      </div>

      {/* Cohort Skill Gaps & Demand Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Skill Gaps across Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Top Missing Skills Across Cohort</h2>
          <p className="text-xs text-slate-500 mb-4">Technologies with highest shortage relative to student goals</p>

          <div className="space-y-3">
            {metrics.topSkillGaps.map((gap: { skill: string; studentsMissingCount: number }) => (
              <div key={gap.skill} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{gap.skill}</span>
                  <span className="text-rose-600">{gap.studentsMissingCount} students missing</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (gap.studentsMissingCount / Math.max(1, metrics.totalStudents)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Documented Skills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Top Documented Technical Skills</h2>
          <p className="text-xs text-slate-500 mb-4">Core competencies students currently report having</p>

          <div className="space-y-3">
            {metrics.popularSkills.map((sk: { skill: string; studentCount: number }) => (
              <div key={sk.skill} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{sk.skill}</span>
                  <span className="text-indigo-600">{sk.studentCount} students</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (sk.studentCount / Math.max(1, metrics.totalStudents)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Queue: Pending Projects */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Projects Verification Queue ({pendingProjects.length})</h2>
            <p className="text-xs text-slate-500">Review student architecture, code repositories, and verify for Readiness credit</p>
          </div>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No student projects currently awaiting review!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProjects.map((p) => (
              <div
                key={p.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{p.title}</span>
                    <span className="text-slate-400 text-xs ml-2">Status: {p.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        Live Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{p.description}</p>

                <div className="flex flex-wrap gap-1">
                  {p.technologies.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Feedback and Action */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter faculty audit feedback..."
                    value={feedbackInput[p.id] || ''}
                    onChange={(e) =>
                      setFeedbackInput({ ...feedbackInput, [p.id]: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      disabled={actionLoadingId === p.id}
                      onClick={() => handleVerifyProject(p.id, false)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      disabled={actionLoadingId === p.id}
                      onClick={() => handleVerifyProject(p.id, true)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Queue: Pending Certifications */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Student Certifications Verification Queue ({pendingCerts.length})
            </h2>
            <p className="text-xs text-slate-500">Verify external credentials and issue date records</p>
          </div>
        </div>

        {pendingCerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No certifications currently awaiting review!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingCerts.map((c) => (
              <div
                key={c.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{c.title}</span>
                    <span className="text-indigo-600 text-xs ml-2 font-semibold">@ {c.issuingOrganization}</span>
                  </div>

                  {c.credentialUrl && (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      View Credential <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Issued: {new Date(c.issueDate).toLocaleDateString()}</span>
                  {c.credentialId && <span>ID: {c.credentialId}</span>}
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter audit remarks..."
                    value={feedbackInput[c.id] || ''}
                    onChange={(e) =>
                      setFeedbackInput({ ...feedbackInput, [c.id]: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      disabled={actionLoadingId === c.id}
                      onClick={() => handleVerifyCert(c.id, false)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      disabled={actionLoadingId === c.id}
                      onClick={() => handleVerifyCert(c.id, true)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
