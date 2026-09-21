import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { CareerRole } from '../types.js';
import {
  User,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle2,
  Save,
  Award,
} from 'lucide-react';

interface ProfilePageProps {
  careers: CareerRole[];
}

export function ProfilePage({ careers }: ProfilePageProps) {
  const { profile, refreshUserData } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || 2027);
  const [bio, setBio] = useState(profile?.bio || '');
  const [learningHours, setLearningHours] = useState(profile?.learningHoursPerWeek || 10);
  const [targetCareerId, setTargetCareerId] = useState(profile?.targetCareerId || careers[0]?.id || 'career-java-backend');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(false);
    try {
      await api.updateProfile({
        name,
        college,
        major,
        graduationYear: Number(graduationYear),
        bio,
        learningHoursPerWeek: Number(learningHours),
        targetCareerId,
      });

      await refreshUserData();
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile-page" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 font-space">
          Student Profile & Study Parameters
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Keep your academic status and target role updated to ensure roadmap and gap recommendations stay strictly accurate.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile successfully updated! Your readiness calculations and roadmap have been refreshed.</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">University / College</label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Major / Degree</label>
            <input
              type="text"
              required
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Expected Graduation Year</label>
            <input
              type="number"
              min="2024"
              max="2032"
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Career Role Goal</label>
            <select
              value={targetCareerId}
              onChange={(e) => setTargetCareerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Available Weekly Learning Hours: <span className="text-indigo-600">{learningHours} hrs/week</span>
            </label>
            <input
              type="range"
              min="4"
              max="40"
              step="2"
              value={learningHours}
              onChange={(e) => setLearningHours(Number(e.target.value))}
              className="w-full cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Light (4 hrs)</span>
              <span>Standard (10-15 hrs)</span>
              <span>Intensive (40 hrs)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="font-bold text-slate-700 block mb-1">Bio & Career Statement</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
