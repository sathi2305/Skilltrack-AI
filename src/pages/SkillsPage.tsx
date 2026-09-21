import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { StudentSkill, SkillDefinition, SkillCategory, SkillLevel, CareerRole } from '../types.js';
import {
  Code2,
  Plus,
  Trash2,
  Edit2,
  Search,
  ExternalLink,
  CheckCircle2,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SkillsPageProps {
  careers: CareerRole[];
  onNavigateTab: (tab: string) => void;
}

const CATEGORIES: SkillCategory[] = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases & Storage',
  'Cloud & DevOps',
  'Developer Tools',
  'Core Computer Science',
];

export function SkillsPage({ careers, onNavigateTab }: SkillsPageProps) {
  const { profile, refreshUserData } = useAuth();
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [catalog, setCatalog] = useState<SkillDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<StudentSkill | null>(null);

  // Form State
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Programming Languages');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [yearsOfExperience, setYearsOfExperience] = useState(1);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSkillsData = async () => {
    setIsLoading(true);
    try {
      const [userSkills, cat] = await Promise.all([
        api.getStudentSkills(),
        api.getSkillCatalog(),
      ]);
      setSkills(userSkills);
      setCatalog(cat);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const activeCareer = careers.find((c) => c.id === profile?.targetCareerId) || careers[0];
  const requiredSkillNames = new Set((activeCareer?.requiredSkills || []).map((r) => r.skillName.toLowerCase()));

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName) return;

    setIsSubmitting(true);
    try {
      if (editingSkill) {
        await api.updateStudentSkill(editingSkill.id, {
          level,
          yearsOfExperience,
          evidenceUrl,
          notes,
        });
      } else {
        await api.addStudentSkill({
          skillName,
          category,
          level,
          yearsOfExperience,
          evidenceUrl,
          notes,
        });
      }

      setShowAddModal(false);
      setEditingSkill(null);
      resetForm();
      await refreshUserData();
      await fetchSkillsData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await api.deleteStudentSkill(id);
      await refreshUserData();
      await fetchSkillsData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setSkillName('');
    setCategory('Programming Languages');
    setLevel('Intermediate');
    setYearsOfExperience(1);
    setEvidenceUrl('');
    setNotes('');
  };

  const openEditModal = (s: StudentSkill) => {
    setEditingSkill(s);
    setSkillName(s.skillName);
    setCategory(s.category);
    setLevel(s.level);
    setYearsOfExperience(s.yearsOfExperience);
    setEvidenceUrl(s.evidenceUrl || '');
    setNotes(s.notes || '');
    setShowAddModal(true);
  };

  const filteredSkills = skills.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div id="skills-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" /> Technical Skills Inventory
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Documented Technical Skills ({skills.length})
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Record your verified programming languages, frameworks, databases, and tooling proficiencies. Technical skills account for <strong className="text-indigo-600 font-semibold">40%</strong> of your Career Readiness score.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="add-skill-modal-btn"
            onClick={() => {
              resetForm();
              setEditingSkill(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Skill
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="skills-search-input"
            type="text"
            placeholder="Search skills or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({skills.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = skills.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Code2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <div className="font-bold text-sm text-slate-800">No Skills Found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No skills match "${searchQuery}". Clear your search or add a new skill.`
              : 'Add your primary technical skills to start computing your career readiness.'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Add Technical Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((s) => {
            const isRequiredForRole = requiredSkillNames.has(s.skillName.toLowerCase());

            return (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{s.skillName}</span>
                        {isRequiredForRole && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Required for your current target role">
                            Role Target
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.category}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.level === 'Advanced'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.level === 'Intermediate'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.level}
                    </span>
                  </div>

                  <div className="mt-3 text-xs space-y-1.5">
                    <div className="text-slate-600 flex items-center justify-between">
                      <span className="text-slate-400">Experience:</span>
                      <span className="font-semibold text-slate-800">{s.yearsOfExperience} year(s)</span>
                    </div>

                    {s.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed mt-2">
                        {s.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {s.evidenceUrl ? (
                    <a
                      href={s.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Evidence Proof <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400">No link attached</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Skill"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Remove Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 font-space">
                {editingSkill ? 'Edit Technical Skill' : 'Add Technical Skill'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Skill Name *</label>
                <input
                  id="skill-form-name"
                  type="text"
                  required
                  placeholder="e.g. Java, React, Docker, Spring Boot"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SkillCategory)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proficiency Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Beginner">Beginner (Basic)</option>
                    <option value="Intermediate">Intermediate (Comfortable)</option>
                    <option value="Advanced">Advanced (Production)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evidence / Proof URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/my-repo or certificate link"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Context / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Practiced extensively during CS201 course and built multi-threaded chat server."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
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
                  id="skill-form-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingSkill ? 'Update Skill' : 'Save to Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
