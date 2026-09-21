import {
  User,
  StudentProfile,
  CareerRole,
  StudentSkill,
  SkillDefinition,
  SkillGapAnalysisResult,
  Roadmap,
  RecommendedProject,
  StudentProject,
  Certification,
  Internship,
  ResumeAnalysisResult,
  DashboardData,
  NotificationItem,
  AdminMetrics,
} from '../types.js';

const TOKEN_KEY = 'skilltrack_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  register: (body: any) => request<{ token: string; user: User; profile: StudentProfile | null }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ token: string; user: User; profile: StudentProfile | null }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ user: User; profile: StudentProfile | null }>('/api/auth/me'),

  // Profile
  getProfile: () => request<StudentProfile>('/api/profile'),
  updateProfile: (updates: Partial<StudentProfile>) => request<StudentProfile>('/api/profile', { method: 'PUT', body: JSON.stringify(updates) }),

  // Dashboard
  getDashboard: () => request<DashboardData>('/api/dashboard'),

  // Careers
  getCareers: () => request<CareerRole[]>('/api/careers'),
  getCareerRoles: () => request<CareerRole[]>('/api/careers'),
  getCareer: (id: string) => request<CareerRole>(`/api/careers/${id}`),
  createCareer: (data: any) => request<CareerRole>('/api/careers', { method: 'POST', body: JSON.stringify(data) }),
  updateCareer: (id: string, data: any) => request<CareerRole>(`/api/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Skills
  getSkillCatalog: () => request<SkillDefinition[]>('/api/skills/catalog'),
  getStudentSkills: () => request<StudentSkill[]>('/api/skills'),
  addStudentSkill: (skill: any) => request<StudentSkill>('/api/skills', { method: 'POST', body: JSON.stringify(skill) }),
  updateStudentSkill: (id: string, updates: any) => request<StudentSkill>(`/api/skills/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteStudentSkill: (id: string) => request<{ success: boolean }>(`/api/skills/${id}`, { method: 'DELETE' }),

  // Skill Gap
  analyzeSkillGap: (careerRoleId?: string) => request<SkillGapAnalysisResult>('/api/skill-gap/analyze', { method: 'POST', body: JSON.stringify({ careerRoleId }) }),
  getSkillGap: (careerRoleId?: string) => request<SkillGapAnalysisResult>(`/api/skill-gap${careerRoleId ? `?careerRoleId=${careerRoleId}` : ''}`),

  // Roadmaps
  generateRoadmap: (careerRoleId?: string) => request<Roadmap>('/api/roadmaps/generate', { method: 'POST', body: JSON.stringify({ careerRoleId }) }),
  getCurrentRoadmap: () => request<Roadmap | null>('/api/roadmaps/current'),
  updateRoadmapTask: (roadmapId: string, taskId: string, status: string) => request<{ roadmap: Roadmap; task: any; xpEarned: number }>(`/api/roadmaps/${roadmapId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Projects
  getStudentProjects: () => request<StudentProject[]>('/api/projects'),
  createStudentProject: (data: any) => request<StudentProject>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  getRecommendedProjects: (careerRoleId?: string) => request<RecommendedProject[]>(`/api/projects/recommended${careerRoleId ? `?careerRoleId=${careerRoleId}` : ''}`),

  // Certifications & Internships
  getCertifications: () => request<Certification[]>('/api/certifications'),
  addCertification: (data: any) => request<Certification>('/api/certifications', { method: 'POST', body: JSON.stringify(data) }),
  getInternships: () => request<Internship[]>('/api/internships'),
  addInternship: (data: any) => request<Internship>('/api/internships', { method: 'POST', body: JSON.stringify(data) }),

  // Resume
  analyzeResume: (resumeText: string, targetCareerId?: string, fileName?: string) => request<ResumeAnalysisResult>('/api/resume/analyze', { method: 'POST', body: JSON.stringify({ resumeText, targetCareerId, fileName }) }),

  // AI Assistant
  askAssistant: (message: string, history: { role: 'user' | 'assistant'; content: string }[]) => request<{ answer: string }>('/api/ai/assistant', { method: 'POST', body: JSON.stringify({ message, history }) }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: string) => request<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),

  // Admin
  getAdminStats: () => request<any>('/api/admin/stats'),
  getAdminMetrics: () => request<AdminMetrics>('/api/admin/stats'),
  getAdminStudents: () => request<any[]>('/api/admin/students'),
  getAdminVerifications: () => request<{ pendingProjects: StudentProject[]; pendingCertifications: Certification[] }>('/api/admin/verifications'),
  getPendingProjects: async () => {
    const res = await request<{ pendingProjects: StudentProject[]; pendingCertifications: Certification[] }>('/api/admin/verifications');
    return res.pendingProjects;
  },
  getPendingCertifications: async () => {
    const res = await request<{ pendingProjects: StudentProject[]; pendingCertifications: Certification[] }>('/api/admin/verifications');
    return res.pendingCertifications;
  },
  verifyProject: (projectId: string, verified: boolean, feedback?: string) => request<StudentProject>('/api/admin/verify-project', { method: 'POST', body: JSON.stringify({ projectId, verified, feedback }) }),
  verifyCertification: (certId: string, verified: boolean, feedback?: string) => request<Certification>('/api/admin/verify-certification', { method: 'POST', body: JSON.stringify({ certId, verified, feedback }) }),
};
