export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillCategory = 'Programming Languages' | 'Frameworks & Libraries' | 'Databases & Storage' | 'Cloud & DevOps' | 'Developer Tools' | 'Core Computer Science';

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  defaultDifficulty: SkillLevel;
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience: number;
  evidenceUrl?: string;
  notes?: string;
  relatedProjects?: string[];
  lastUpdated: string;
}

export type SkillImportance = 'Required' | 'Preferred' | 'Bonus';

export interface CareerSkillRequirement {
  id: string;
  skillId: string;
  skillName: string;
  category: SkillCategory;
  importance: SkillImportance;
  weight: number; // e.g. 10 to 30
  minLevel: SkillLevel;
  prerequisites: string[]; // names or IDs of prerequisite skills
  description: string;
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  averageSalary: string;
  demandLevel: 'Very High' | 'High' | 'Moderate';
  iconName: string;
  requiredSkills: CareerSkillRequirement[];
  minExperienceMonths: number;
  overview: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  college: string;
  major: string;
  graduationYear: number;
  bio: string;
  targetCareerId?: string;
  targetCareerTitle?: string;
  learningHoursPerWeek: number;
  xp: number;
  level: number;
  badges: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  updatedAt: string;
}

export interface StudentProject {
  id: string;
  studentId: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  repoUrl?: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  verified: boolean;
  adminFeedback?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Certification {
  id: string;
  studentId: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  credentialUrl?: string;
  credentialId?: string;
  skillsCovered: string[];
  verified: boolean;
  adminFeedback?: string;
  createdAt: string;
}

export interface Internship {
  id: string;
  studentId: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skillsUsed: string[];
  createdAt: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface RoadmapTaskResource {
  title: string;
  url: string;
  type: 'Documentation' | 'Interactive' | 'Video' | 'Project Spec';
}

export interface RoadmapTask {
  id: string;
  roadmapId: string;
  weekNumber: number;
  title: string;
  description: string;
  category: 'Core Concept' | 'Framework' | 'Project' | 'Testing & QA' | 'Deployment & DevOps';
  skillName: string;
  estimatedHours: number;
  status: TaskStatus;
  subtasks: string[];
  resources: RoadmapTaskResource[];
  dependencies?: string[];
  milestone?: boolean;
  milestoneName?: string;
  completedAt?: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  title: string;
  objective: string;
  tasks: RoadmapTask[];
}

export interface Roadmap {
  id: string;
  studentId: string;
  careerRoleId: string;
  careerRoleTitle: string;
  title: string;
  summary: string;
  durationWeeks: number;
  totalTasks: number;
  completedTasks: number;
  status: 'Active' | 'Completed' | 'Archived';
  weeks: RoadmapWeek[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillGapAnalysisResult {
  id: string;
  studentId: string;
  careerRoleId: string;
  careerTitle: string;
  readinessScore: number; // 0 - 100
  scoreBreakdown: {
    technicalSkillsScore: number; // out of 40%
    projectsScore: number; // out of 25%
    certificationsScore: number; // out of 15%
    internshipScore: number; // out of 10%
    learningProgressScore: number; // out of 10%
  };
  scoreExplanation: string[];
  strongSkills: {
    name: string;
    studentLevel: SkillLevel;
    requiredLevel: SkillLevel;
    category: SkillCategory;
    reason: string;
  }[];
  intermediateSkills: {
    name: string;
    studentLevel: SkillLevel;
    requiredLevel: SkillLevel;
    category: SkillCategory;
    improvementPath: string;
  }[];
  missingSkills: {
    name: string;
    requiredLevel: SkillLevel;
    importance: SkillImportance;
    category: SkillCategory;
    prerequisites: string[];
    priority: 'Critical' | 'High' | 'Medium';
    reason: string;
  }[];
  totalRequired: number;
  matchedCount: number;
  missingCount: number;
  analyzedAt: string;
}

export interface RecommendedProject {
  id: string;
  title: string;
  problemStatement: string;
  skillsPracticed: string[];
  targetMissingSkills: string[];
  difficulty: SkillLevel;
  estimatedDuration: string;
  requiredTechnologies: string[];
  expectedOutcome: string;
  portfolioValue: string;
  keyFeatures: string[];
}

export interface ResumeAnalysisResult {
  detectedSkills: {
    name: string;
    category: string;
    confidence: 'High' | 'Medium';
    extractedFrom: string;
  }[];
  missingSkillsForCareer: string[];
  skillsToImprove: string[];
  possibleDuplicateSkills: {
    canonical: string;
    detectedVariations: string[];
  }[];
  extractedProjects: {
    title: string;
    technologies: string[];
    description: string;
  }[];
  extractedEducation: {
    degree: string;
    institution: string;
    year?: string;
  }[];
  extractedExperience: {
    role: string;
    company: string;
    duration?: string;
  }[];
  recommendations: string[];
}

export interface Achievement {
  id: string;
  studentId: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  xpAwarded: number;
  earnedAt: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  criteria: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'award';
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  profile: StudentProfile | null;
}
