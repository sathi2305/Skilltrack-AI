import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Sparkles,
  GitFork,
  FolderGit2,
  Code2,
  Briefcase,
  FileSearch,
  MessageSquareCode,
  Award,
  ShieldAlert,
  UserCheck,
  CheckSquare,
  Layers,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingVerificationsCount?: number;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  pendingVerificationsCount = 0,
}: SidebarProps) {
  const { user, profile } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'skill-gap', label: 'Skill Gap Engine', icon: Sparkles, badge: 'Core' },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: GitFork, badge: null },
    { id: 'projects', label: 'Projects & Portfolio', icon: FolderGit2, badge: null },
    { id: 'skills', label: 'My Technical Skills', icon: Code2, badge: null },
    { id: 'careers', label: 'Career Roles Catalog', icon: Briefcase, badge: null },
    { id: 'resume', label: 'Resume Analyzer', icon: FileSearch, badge: 'AI' },
    { id: 'assistant', label: 'AI Career Mentor', icon: MessageSquareCode, badge: 'Live' },
    { id: 'credentials', label: 'Certs & Internships', icon: Award, badge: null },
    { id: 'achievements', label: 'Achievements & XP', icon: Award, badge: null },
    { id: 'profile', label: 'Student Profile', icon: Settings, badge: null },
  ];

  const adminNavItems = [
    { id: 'admin-overview', label: 'Platform Analytics', icon: LayoutDashboard, badge: null },
    { id: 'admin-verifications', label: 'Verification Queue', icon: CheckSquare, badge: pendingVerificationsCount > 0 ? String(pendingVerificationsCount) : null },
    { id: 'admin-students', label: 'Student Directory', icon: UserCheck, badge: null },
    { id: 'admin-careers', label: 'Career Role Manager', icon: Layers, badge: null },
  ];

  const items = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-3">
          {/* Mobile close header */}
          <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User role indicator */}
          <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'ADMINISTRATOR VIEW' : 'STUDENT WORKSPACE'}
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">
              {isAdmin ? 'Academic Faculty Admin' : profile?.targetCareerTitle || 'Career Track'}
            </div>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600 pl-2.5'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.badge === 'Live'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.badge === 'AI' || item.badge === 'Core'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500 leading-relaxed">
            <strong>SkillTrack AI v2.4</strong>
            <br />
            Personalized Engineering Readiness Engine
          </div>
        </div>
      </aside>
    </>
  );
}
