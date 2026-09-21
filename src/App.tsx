import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { api } from './services/api.js';
import { CareerRole } from './types.js';

// Layout Components
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { AuthModal } from './components/AuthModal.js';

// Page Components
import { DashboardPage } from './pages/DashboardPage.js';
import { SkillGapPage } from './pages/SkillGapPage.js';
import { RoadmapPage } from './pages/RoadmapPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { SkillsPage } from './pages/SkillsPage.js';
import { CareerGoalsPage } from './pages/CareerGoalsPage.js';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage.js';
import { AIAssistantPage } from './pages/AIAssistantPage.js';
import { CertificationsPage } from './pages/CertificationsPage.js';
import { AchievementsPage } from './pages/AchievementsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminPage } from './pages/AdminPage.js';

function SkillTrackMain() {
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [careersLoading, setCareersLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchCareers = async () => {
    try {
      const data = await api.getCareerRoles();
      setCareers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCareersLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  // When user is ADMIN, if they log in, allow viewing Admin tab
  useEffect(() => {
    if (user?.role === 'ADMIN' && activeTab === 'dashboard') {
      // Keep on dashboard or admin based on preference
    }
  }, [user]);

  if (isLoading || careersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg animate-pulse shadow-md">
            ST
          </div>
          <div className="text-xs font-semibold text-slate-500 tracking-wide">
            Initializing SkillTrack AI Engine...
          </div>
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'skill-gap':
        return <SkillGapPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'roadmap':
        return <RoadmapPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'projects':
        return <ProjectsPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'skills':
        return <SkillsPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'careers':
        return (
          <CareerGoalsPage
            careers={careers}
            onNavigateTab={setActiveTab}
            onCareerUpdated={fetchCareers}
          />
        );
      case 'resume':
        return <ResumeAnalyzerPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'assistant':
        return <AIAssistantPage careers={careers} onNavigateTab={setActiveTab} />;
      case 'certifications':
        return <CertificationsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'profile':
        return <ProfilePage careers={careers} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage careers={careers} onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onNavigateTab={setActiveTab}
        careers={careers}
        currentCareerId={profile?.targetCareerId}
        onSelectCareer={async (careerId) => {
          await api.updateProfile({ targetCareerId: careerId });
          await fetchCareers();
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{renderActivePage()}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
              ST
            </span>
            <span className="font-semibold text-slate-700">SkillTrack AI</span>
            <span>— Intelligent Student Skill Gap & Career Roadmap Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Production Full-Stack Architecture</span>
            <span>•</span>
            <span>Strict Weighted Readiness Math</span>
            <span>•</span>
            <span>Prerequisite Dependency Graphs</span>
          </div>
        </div>
      </footer>

      {/* Auth / Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SkillTrackMain />
    </AuthProvider>
  );
}
