import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Bell,
  Sparkles,
  Award,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { CareerRole } from '../types.js';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigateTab: (tab: string) => void;
  careers: CareerRole[];
  currentCareerId?: string;
  onSelectCareer?: (careerId: string) => void;
}

export function Navbar({
  onToggleSidebar,
  onNavigateTab,
  careers,
  currentCareerId,
  onSelectCareer,
}: NavbarProps) {
  const { user, profile, logout, notifications, unreadNotificationCount, markNotificationAsRead, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);

  const activeCareer = careers.find((c) => c.id === currentCareerId) || careers[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigateTab('dashboard')}
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base font-space">
                SkillTrack<span className="text-indigo-600"> AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 tracking-wide">
                STUDENT PLATFORM
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Current Career Role Selector for Students */}
        {user?.role === 'STUDENT' && (
          <div className="relative">
            <button
              id="navbar-career-dropdown-btn"
              onClick={() => setShowCareerDropdown(!showCareerDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline text-slate-500">Target:</span>
              <span className="font-semibold text-slate-900 max-w-[150px] truncate">
                {activeCareer?.title || 'Select Career'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showCareerDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Career Role
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {careers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCareer?.(c.id);
                        setShowCareerDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        c.id === currentCareerId ? 'bg-indigo-50/70 text-indigo-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{c.title}</div>
                        <div className="text-[10px] text-slate-400">{c.category}</div>
                      </div>
                      {c.id === currentCareerId && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-1 px-3">
                  <button
                    onClick={() => {
                      onNavigateTab('careers');
                      setShowCareerDropdown(false);
                    }}
                    className="w-full text-center py-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Browse All Roles & Requirements →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Student Gamification Badge: Level & XP */}
        {user?.role === 'STUDENT' && profile && (
          <div
            onClick={() => onNavigateTab('achievements')}
            className="cursor-pointer hidden sm:flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-lg hover:bg-amber-100/70 transition-colors"
            title="Click to view Achievements & XP Breakdown"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <div className="text-xs">
              <span className="font-bold text-amber-900">Lvl {profile.level || 1}</span>
              <span className="mx-1 text-amber-400">•</span>
              <span className="text-amber-700 font-medium">{profile.xp || 0} XP</span>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] text-slate-400">{notifications.length} updates</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role switcher demo pills */}
        <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-3">
          {user?.role === 'STUDENT' ? (
            <button
              onClick={loginAsDemoAdmin}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
              title="Switch to Faculty Admin View to review verifications"
            >
              <Shield className="w-3 h-3 text-slate-500" />
              Switch to Admin
            </button>
          ) : (
            <button
              onClick={loginAsDemoStudent}
              className="text-[11px] px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors flex items-center gap-1"
              title="Switch back to Student Dashboard"
            >
              <User className="w-3 h-3 text-indigo-600" />
              Switch to Student
            </button>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            id="navbar-user-avatar-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-900 truncate max-w-[100px]">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-xs text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                <div className="mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                    {user?.role} ACCOUNT
                  </span>
                </div>
              </div>

              {user?.role === 'STUDENT' ? (
                <>
                  <button
                    onClick={() => {
                      onNavigateTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Student Profile
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('achievements');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Achievements & XP
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoAdmin();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Demo: Switch to Admin
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onNavigateTab('admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemoStudent();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Demo: Switch to Student
                  </button>
                </>
              )}

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
