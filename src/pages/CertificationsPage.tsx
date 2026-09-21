import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Certification, Internship } from '../types.js';
import {
  Award,
  Briefcase,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';

export function CertificationsPage() {
  const { profile, refreshUserData } = useAuth();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCertModal, setShowCertModal] = useState(false);
  const [showInternModal, setShowInternModal] = useState(false);

  // Cert Form State
  const [certTitle, setCertTitle] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [certId, setCertId] = useState('');
  const [certSkills, setCertSkills] = useState('');

  // Internship Form State
  const [internCompany, setInternCompany] = useState('');
  const [internRole, setInternRole] = useState('');
  const [internLocation, setInternLocation] = useState('Remote');
  const [internStartDate, setInternStartDate] = useState('');
  const [internEndDate, setInternEndDate] = useState('');
  const [internIsCurrent, setInternIsCurrent] = useState(false);
  const [internDesc, setInternDesc] = useState('');
  const [internSkills, setInternSkills] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cList, iList] = await Promise.all([
        api.getCertifications(),
        api.getInternships(),
      ]);
      setCerts(cList);
      setInternships(iList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle || !certOrg) return;

    setIsSubmitting(true);
    try {
      await api.addCertification({
        title: certTitle,
        issuingOrganization: certOrg,
        issueDate: certDate,
        credentialUrl: certUrl,
        credentialId: certId,
        skillsCovered: certSkills,
      });

      setShowCertModal(false);
      setCertTitle('');
      setCertOrg('');
      setCertDate('');
      setCertUrl('');
      setCertId('');
      setCertSkills('');
      await refreshUserData();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internCompany || !internRole) return;

    setIsSubmitting(true);
    try {
      await api.addInternship({
        company: internCompany,
        role: internRole,
        location: internLocation,
        startDate: internStartDate,
        endDate: internEndDate,
        isCurrent: internIsCurrent,
        description: internDesc,
        skillsUsed: internSkills,
      });

      setShowInternModal(false);
      setInternCompany('');
      setInternRole('');
      setInternLocation('Remote');
      setInternStartDate('');
      setInternEndDate('');
      setInternIsCurrent(false);
      setInternDesc('');
      setInternSkills('');
      await refreshUserData();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="certifications-page" className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-indigo-600" /> Professional Credentials
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Certifications & Industry Experience
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Certifications account for <strong className="text-indigo-600 font-semibold">15%</strong> and Internships account for <strong className="text-indigo-600 font-semibold">10%</strong> of your total Career Readiness score.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            Add Certification
          </button>
          <button
            onClick={() => setShowInternModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Internship
          </button>
        </div>
      </div>

      {/* Section 1: Certifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Industry Certifications ({certs.length})</h2>
            <p className="text-xs text-slate-500">Verified credentials from accredited organizations</p>
          </div>
        </div>

        {certs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-semibold text-xs text-slate-800">No Certifications Recorded</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Add AWS, Oracle, Google Cloud, or Meta certifications to boost your readiness.
            </p>
            <button
              onClick={() => setShowCertModal(true)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Add Certification
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certs.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 leading-snug">{c.title}</span>
                    {c.verified ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 shrink-0">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-indigo-700 font-semibold mt-1">{c.issuingOrganization}</div>

                  <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                    <div>Issued: {new Date(c.issueDate).toLocaleDateString()}</div>
                    {c.credentialId && <div>Credential ID: {c.credentialId}</div>}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.skillsCovered.map((sc) => (
                      <span
                        key={sc}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                      >
                        {sc}
                      </span>
                    ))}
                  </div>

                  {c.adminFeedback && (
                    <div className="mt-3 p-2 bg-emerald-50 text-[11px] text-emerald-900 rounded-lg">
                      <strong>Admin note:</strong> {c.adminFeedback}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {c.credentialUrl ? (
                    <a
                      href={c.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                    >
                      Verify Credential <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[11px]">No URL attached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Internships */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Internships & Professional Work ({internships.length})</h2>
            <p className="text-xs text-slate-500">Real-world industry engineering experience</p>
          </div>
        </div>

        {internships.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-semibold text-xs text-slate-800">No Internships Recorded</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Document academic research or industry internships to maximize your profile strength.
            </p>
            <button
              onClick={() => setShowInternModal(true)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Add Internship Experience
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {internships.map((i) => (
              <div
                key={i.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{i.role}</span>
                    <span className="text-xs font-semibold text-indigo-700">@ {i.company}</span>
                    {i.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{i.location}</span>
                    <span>•</span>
                    <span>
                      {i.startDate} - {i.isCurrent ? 'Present' : i.endDate || 'Finished'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-3xl">
                    {i.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {i.skillsUsed.map((su) => (
                      <span
                        key={su}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                      >
                        {su}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-space">Add Certification</h3>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 text-xs font-semibold">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddCert} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Certification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services, Oracle, Coursera"
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credential ID</label>
                  <input
                    type="text"
                    placeholder="AWS-123456"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Credential Verification URL</label>
                <input
                  type="url"
                  placeholder="https://credly.com/your-badge"
                  value={certUrl}
                  onChange={(e) => setCertUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Skills Covered (comma separated)</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, Docker, SQL"
                  value={certSkills}
                  onChange={(e) => setCertSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Internship Modal */}
      {showInternModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-space">Add Internship Experience</h3>
              <button onClick={() => setShowInternModal(false)} className="text-slate-400 text-xs font-semibold">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddInternship} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Software, Campus Research Lab"
                  value={internCompany}
                  onChange={(e) => setInternCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Role / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering Intern"
                  value={internRole}
                  onChange={(e) => setInternRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="month"
                    value={internStartDate}
                    onChange={(e) => setInternStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="month"
                    disabled={internIsCurrent}
                    value={internEndDate}
                    onChange={(e) => setInternEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="intern-current"
                  checked={internIsCurrent}
                  onChange={(e) => setInternIsCurrent(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="intern-current" className="text-slate-700">I am currently working in this role</label>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Achievements</label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities, microservices maintained, bugs fixed..."
                  value={internDesc}
                  onChange={(e) => setInternDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Skills Used (comma separated)</label>
                <input
                  type="text"
                  placeholder="Java, Spring Boot, Git, SQL"
                  value={internSkills}
                  onChange={(e) => setInternSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInternModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  Save Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
