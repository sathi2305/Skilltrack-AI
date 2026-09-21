import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { RecommendedProject, StudentProject, CareerRole } from '../types.js';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ProjectsPageProps {
  careers: CareerRole[];
  onNavigateTab: (tab: string) => void;
}

export function ProjectsPage({ careers, onNavigateTab }: ProjectsPageProps) {
  const { profile, refreshUserData } = useAuth();
  const [recommended, setRecommended] = useState<RecommendedProject[]>([]);
  const [myProjects, setMyProjects] = useState<StudentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

  // New project form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [status, setStatus] = useState<'Completed' | 'In Progress' | 'Planned'>('Completed');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const [recs, mine] = await Promise.all([
        api.getRecommendedProjects(profile?.targetCareerId),
        api.getStudentProjects(),
      ]);
      setRecommended(recs);
      setMyProjects(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [profile?.targetCareerId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !technologies) return;

    setIsSubmitting(true);
    try {
      await api.createStudentProject({
        title,
        description,
        technologies,
        repoUrl,
        liveUrl,
        status,
      });

      setTitle('');
      setDescription('');
      setTechnologies('');
      setRepoUrl('');
      setLiveUrl('');
      setShowAddModal(false);

      await refreshUserData();
      await fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRecExpand = (id: string) => {
    setExpandedRecId(expandedRecId === id ? null : id);
  };

  return (
    <div id="projects-page" className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" /> Project Recommendation Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Portfolio Projects & Practical Proof
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Completed, verified projects account for <strong className="text-indigo-600 font-semibold">25%</strong> of your Career Readiness score. Build projects that systematically cover your missing skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="add-project-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project to Portfolio
          </button>
        </div>
      </div>

      {/* Section 1: Recommended Projects to Close Skill Gaps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Projects for Your Gaps</h2>
            <p className="text-xs text-slate-500">
              Curated by architectural relevance to your target role ({profile?.targetCareerTitle || 'Career Track'})
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            {recommended.length} Suggestions Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommended.map((proj) => {
            const isExpanded = expandedRecId === proj.id;

            return (
              <div
                key={proj.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 leading-snug">{proj.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      proj.difficulty === 'Advanced'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {proj.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {proj.problemStatement}
                  </p>

                  {/* Skills Practiced */}
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Skills Practiced:
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {proj.skillsPracticed.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Estimated Effort</span>
                      <div className="font-semibold text-slate-800">{proj.estimatedDuration}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Portfolio Value</span>
                      <div className="font-semibold text-slate-800">{proj.portfolioValue}</div>
                    </div>
                  </div>

                  {/* Expanded Key Deliverables */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2 bg-slate-50 p-3 rounded-xl">
                      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Key Architectural Deliverables:
                      </div>
                      <ul className="space-y-1">
                        {proj.keyFeatures.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 text-[11px] text-slate-700">
                        <strong>Expected Outcome:</strong> {proj.expectedOutcome}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleRecExpand(proj.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    {isExpanded ? 'Hide Architecture' : 'View Architecture Spec'}{' '}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setTitle(proj.title);
                      setDescription(proj.problemStatement);
                      setTechnologies(proj.requiredTechnologies.join(', '));
                      setStatus('In Progress');
                      setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    Adopt to Portfolio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Student's Own Portfolio Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Portfolio Projects ({myProjects.length})</h2>
            <p className="text-xs text-slate-500">Documented projects that demonstrate your practical competency</p>
          </div>
        </div>

        {myProjects.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-800">No Projects Added Yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your completed GitHub repositories or live web services to prove your technical capabilities and elevate your Readiness Score.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Add First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900">{p.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.status}
                      </span>
                      {p.verified ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {p.adminFeedback && (
                    <div className="mt-3 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                      <strong>Faculty Feedback:</strong> {p.adminFeedback}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" /> Repository
                      </a>
                    )}
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Added {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-space">Add Portfolio Project</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Project Title *</label>
                <input
                  id="modal-proj-title"
                  type="text"
                  required
                  placeholder="e.g. Student Management REST API"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Architecture *</label>
                <textarea
                  id="modal-proj-desc"
                  required
                  rows={3}
                  placeholder="Describe the architectural patterns, database integration, or problems solved..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technologies Used (comma separated) *</label>
                <input
                  id="modal-proj-tech"
                  type="text"
                  required
                  placeholder="Java, Spring Boot, MySQL, Docker, JUnit"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Live URL / Demo</label>
                  <input
                    type="url"
                    placeholder="https://my-app.example.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Completed">Completed (+50 XP)</option>
                  <option value="In Progress">In Progress (+15 XP)</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="modal-proj-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
