import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ResumeAnalysisResult, CareerRole } from '../types.js';
import {
  FileSearch,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  FileText,
  Copy,
  Plus,
  Info,
} from 'lucide-react';

interface ResumeAnalyzerPageProps {
  careers: CareerRole[];
  onNavigateTab: (tab: string) => void;
}

const SAMPLE_RESUME = `Alex Rivera
alex.rivera@cs.university.edu | (555) 234-5678 | github.com/alexrivera-dev | linkedin.com/in/alexrivera-cs

EDUCATION
Bachelor of Science in Computer Science | State University of Technology
Expected Graduation: May 2027 | GPA: 3.82/4.00
Relevant Coursework: Data Structures & Algorithms, Object-Oriented Programming (Java), Database Systems (SQL), Operating Systems, Web Engineering.

TECHNICAL SKILLS
Languages: Java (Advanced, Java 17/21), Python, SQL (PostgreSQL, MySQL), HTML5, CSS3, JavaScript.
Developer Tools & Systems: Git, GitHub, VS Code, IntelliJ IDEA, Linux/Bash, Maven.
Concepts: Object-Oriented Design (OOP), REST Architecture Principles, Relational Schema Normalization, Multithreading Basics.

PROJECTS
Student Task & Course Manager | Java, JavaFX, SQLite
- Built an offline desktop management tool enabling students to organize course assignments, calculate weighted GPA, and schedule deadlines.
- Implemented robust MVC architectural pattern with custom DAO database layers using raw JDBC queries.
- Utilized Git for version control across 40+ atomic commits with unit test coverage.

Algorithmic Trading Backtester | Python, Pandas
- Developed an event-driven backtesting engine analyzing historical moving-average crossover indicators across S&P 500 equities.
- Cleaned missing financial time-series records using Pandas and visualized Sharpe ratios.

WORK & LEADERSHIP EXPERIENCE
Undergraduate Computer Science Peer Tutor | University CS Department (Sept 2025 - Present)
- Conduct 8 weekly mentoring office hours helping 40+ lower-division engineering students master Java syntax, recursion, and pointer memory concepts.`;

export function ResumeAnalyzerPage({ careers, onNavigateTab }: ResumeAnalyzerPageProps) {
  const { profile, refreshUserData } = useAuth();
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [targetCareerId, setTargetCareerId] = useState<string>(
    profile?.targetCareerId || careers[0]?.id || 'career-java-backend'
  );
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const activeCareer = careers.find((c) => c.id === targetCareerId) || careers[0];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    setImportMessage(null);
    try {
      const data = await api.analyzeResume(resumeText, targetCareerId, 'Resume_Submission.pdf');
      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportSkills = async () => {
    if (!result || result.detectedSkills.length === 0) return;
    setIsImporting(true);
    try {
      let importedCount = 0;
      for (const ds of result.detectedSkills) {
        try {
          await api.addStudentSkill({
            skillName: ds.name,
            category: ds.category || 'Programming Languages',
            level: 'Intermediate',
            yearsOfExperience: 1,
            notes: `Extracted from resume analysis: "${ds.extractedFrom || 'Resume Parser'}"`,
          });
          importedCount++;
        } catch (e) {
          // ignore duplicates
        }
      }
      await refreshUserData();
      setImportMessage(`Successfully imported ${importedCount} skills to your technical inventory!`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div id="resume-analyzer-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 uppercase tracking-wider">
              <FileSearch className="w-3.5 h-3.5 text-indigo-600" /> AI Resume & Gap Parser
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-space">
            Resume Skill Extraction & Career Alignment
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Extract skills, projects, certifications, and experience from your resume. Compare extracted skills against <strong className="text-slate-900">{activeCareer?.title}</strong> without hallucinating unlisted qualifications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={targetCareerId}
            onChange={(e) => setTargetCareerId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Resume Plain Text / Markdown:
          </label>

          <button
            onClick={() => setResumeText(SAMPLE_RESUME)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Reset to Sample CS Student Resume
          </button>
        </div>

        <textarea
          id="resume-text-input"
          rows={8}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste plain text content from your PDF or DOCX resume here..."
          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400">
            Parsed with strict factual grounding against target role benchmarks.
          </div>

          <button
            id="run-resume-analysis-btn"
            disabled={isAnalyzing || !resumeText.trim()}
            onClick={handleAnalyze}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Resume with AI...' : 'Analyze Resume'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {importMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importMessage}</span>
            </div>
          )}

          {/* Quick Import Action Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Extraction Complete: {result.detectedSkills.length} Technical Skills Found
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically populate your profile with all detected skills with 1 click.
              </p>
            </div>

            <button
              id="import-detected-skills-btn"
              disabled={isImporting}
              onClick={handleImportSkills}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import Detected Skills to Profile'}
            </button>
          </div>

          {/* 4-Column Grid: Detected Skills, Missing For Career, Duplicates, Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Detected Skills */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Detected Skills</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {result.detectedSkills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
                {result.detectedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100"
                    title={s.extractedFrom}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing for Role */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Missing for {activeCareer.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {result.missingSkillsForCareer.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {result.missingSkillsForCareer.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-[11px] font-semibold text-rose-800"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Possible Duplicate Skills */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Duplicate Variations</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {result.possibleDuplicateSkills.length}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {result.possibleDuplicateSkills.length === 0 ? (
                  <p className="text-slate-400 text-[11px] py-4 text-center">No redundant variations detected</p>
                ) : (
                  result.possibleDuplicateSkills.map((d, idx) => (
                    <div key={idx} className="p-2 bg-amber-50/60 border border-amber-100 rounded-lg text-[11px]">
                      <div className="font-bold text-amber-900">Canonical: {d.canonical}</div>
                      <div className="text-amber-700 text-[10px]">
                        Variations: {d.detectedVariations.join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Resume Recommendations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Optimization Advice</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
