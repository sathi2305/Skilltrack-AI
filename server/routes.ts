import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, BADGE_DEFINITIONS } from './db.js';
import { AuthenticatedRequest, authMiddleware, requireRole, generateToken } from './middleware/auth.js';
import { analyzeSkillGap } from './services/skillGapEngine.js';
import { generatePersonalizedRoadmap } from './services/roadmapService.js';
import { getRecommendedProjects, createStudentProject } from './services/projectService.js';
import { analyzeResumeText } from './services/resumeService.js';
import { askCareerAssistant } from './services/aiAssistantService.js';
import { getAdminPlatformStats, getAllStudentsDetailed, verifyStudentProject, verifyStudentCertification } from './services/adminService.js';
import { User, StudentProfile, StudentSkill } from './types.js';

export const apiRouter = Router();

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
apiRouter.get('/health', (req, res) => {
  res.json({ success: true, status: 'SkillTrack AI Server Running', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// Authentication Routes
// ----------------------------------------------------
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'STUDENT', college, major, graduationYear, targetCareerId } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existing = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'STUDENT';

    const newUser: User = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    let profile: StudentProfile | null = null;
    if (userRole === 'STUDENT') {
      const targetCareer = db.getCareerRoles().find((c) => c.id === targetCareerId) || db.getCareerRoles()[0];
      profile = {
        id: `prof-${Date.now()}`,
        userId,
        name,
        email: email.toLowerCase(),
        college: college || 'University Campus',
        major: major || 'Computer Science',
        graduationYear: graduationYear ? Number(graduationYear) : 2027,
        bio: 'Aspiring software engineer ready to systematically level up technical competencies.',
        targetCareerId: targetCareer?.id || 'career-java-backend',
        targetCareerTitle: targetCareer?.title || 'Java Backend Developer',
        learningHoursPerWeek: 10,
        xp: 50,
        level: 1,
        badges: [],
        updatedAt: new Date().toISOString(),
      };
      db.addProfile(profile);

      db.addNotification({
        id: `notif-${Date.now()}`,
        userId,
        title: 'Welcome to SkillTrack AI!',
        message: 'Your student account is active. Explore your target career role and analyze your skill gaps.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        profile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = db.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    const profile = db.getProfiles().find((p) => p.userId === user.id) || null;
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        profile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: { id: req.user!.id, name: req.user!.name, email: req.user!.email, role: req.user!.role },
      profile: req.studentProfile || null,
    },
  });
});

// ----------------------------------------------------
// Student Profile Routes
// ----------------------------------------------------
apiRouter.get('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }
  res.json({ success: true, data: req.studentProfile });
});

apiRouter.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile not found.' });
    return;
  }

  const { name, college, major, graduationYear, bio, targetCareerId, learningHoursPerWeek } = req.body;
  const updates: Partial<StudentProfile> = {};

  if (name) updates.name = name;
  if (college) updates.college = college;
  if (major) updates.major = major;
  if (graduationYear) updates.graduationYear = Number(graduationYear);
  if (bio !== undefined) updates.bio = bio;
  if (learningHoursPerWeek) updates.learningHoursPerWeek = Number(learningHoursPerWeek);

  if (targetCareerId) {
    const career = db.getCareerRoles().find((c) => c.id === targetCareerId);
    if (career) {
      updates.targetCareerId = career.id;
      updates.targetCareerTitle = career.title;
    }
  }

  const updated = db.updateProfile(req.studentProfile.id, updates);
  res.json({ success: true, message: 'Profile updated successfully', data: updated });
});

// ----------------------------------------------------
// Career Roles Routes
// ----------------------------------------------------
apiRouter.get('/careers', (req, res) => {
  res.json({ success: true, data: db.getCareerRoles() });
});

apiRouter.get('/careers/:id', (req, res) => {
  const career = db.getCareerRoles().find((c) => c.id === req.params.id);
  if (!career) {
    res.status(404).json({ success: false, message: 'Career role not found' });
    return;
  }
  res.json({ success: true, data: career });
});

// Admin add / edit career
apiRouter.post('/careers', authMiddleware, requireRole('ADMIN'), (req, res) => {
  try {
    const { title, category, description, averageSalary, demandLevel, iconName, requiredSkills, minExperienceMonths, overview } = req.body;
    if (!title || !category || !requiredSkills) {
      res.status(400).json({ success: false, message: 'Title, category, and requiredSkills are required.' });
      return;
    }

    const newRole: any = {
      id: `career-${Date.now()}`,
      title,
      category,
      description: description || '',
      averageSalary: averageSalary || '$90,000 - $130,000',
      demandLevel: demandLevel || 'High',
      iconName: iconName || 'Briefcase',
      minExperienceMonths: minExperienceMonths ? Number(minExperienceMonths) : 0,
      overview: overview || description || '',
      requiredSkills: requiredSkills || [],
    };

    db.addCareerRole(newRole);
    res.status(201).json({ success: true, message: 'Career role created', data: newRole });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/careers/:id', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const updated = db.updateCareerRole(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Career role not found' });
    return;
  }
  res.json({ success: true, message: 'Career role updated', data: updated });
});

// ----------------------------------------------------
// Skills Routes
// ----------------------------------------------------
apiRouter.get('/skills/catalog', (req, res) => {
  res.json({ success: true, data: db.getSkills() });
});

apiRouter.get('/skills', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.json({ success: true, data: [] });
    return;
  }
  const skills = db.getStudentSkills(req.studentProfile.id);
  res.json({ success: true, data: skills });
});

apiRouter.post('/skills', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const { skillName, category, level, yearsOfExperience, evidenceUrl, notes, relatedProjects } = req.body;
  if (!skillName || !level) {
    res.status(400).json({ success: false, message: 'Skill name and level are required.' });
    return;
  }

  // Check if student already has this skill
  const existing = db.getStudentSkills(req.studentProfile.id).find(
    (s) => s.skillName.toLowerCase() === skillName.toLowerCase().trim()
  );

  if (existing) {
    // Update existing skill
    const updated = db.updateStudentSkill(existing.id, {
      level,
      yearsOfExperience: yearsOfExperience !== undefined ? Number(yearsOfExperience) : existing.yearsOfExperience,
      evidenceUrl: evidenceUrl || existing.evidenceUrl,
      notes: notes || existing.notes,
      relatedProjects: relatedProjects || existing.relatedProjects,
    });
    res.json({ success: true, message: 'Skill level updated', data: updated });
    return;
  }

  // Find in catalog or assign generic category
  const catalogSkill = db.getSkills().find((s) => s.name.toLowerCase() === skillName.toLowerCase().trim());
  const resolvedCategory = category || catalogSkill?.category || 'Programming Languages';

  const newSkill: StudentSkill = {
    id: `ss-${Date.now()}`,
    studentId: req.studentProfile.id,
    skillId: catalogSkill?.id || `sk-custom-${Date.now()}`,
    skillName: catalogSkill?.name || skillName.trim(),
    category: resolvedCategory,
    level: level || 'Beginner',
    yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 1,
    evidenceUrl: evidenceUrl || '',
    notes: notes || '',
    relatedProjects: Array.isArray(relatedProjects) ? relatedProjects : [],
    lastUpdated: new Date().toISOString(),
  };

  db.addStudentSkill(newSkill);
  db.awardXP(req.studentProfile.id, 10, `Documented skill: ${newSkill.skillName}`);
  db.checkAndAwardBadges(req.studentProfile.id);

  res.status(201).json({ success: true, message: 'Skill added to profile', data: newSkill });
});

apiRouter.put('/skills/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateStudentSkill(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Student skill not found' });
    return;
  }
  res.json({ success: true, message: 'Skill updated', data: updated });
});

apiRouter.delete('/skills/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteStudentSkill(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Skill not found' });
    return;
  }
  res.json({ success: true, message: 'Skill removed' });
});

// ----------------------------------------------------
// Skill Gap Analysis Engine Routes
// ----------------------------------------------------
apiRouter.post('/skill-gap/analyze', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const careerRoleId = req.body.careerRoleId || req.studentProfile.targetCareerId || db.getCareerRoles()[0].id;
  try {
    const analysis = analyzeSkillGap(req.studentProfile.id, careerRoleId);

    // If career role changed, update profile target
    if (req.studentProfile.targetCareerId !== careerRoleId) {
      const career = db.getCareerRoles().find((c) => c.id === careerRoleId);
      if (career) {
        db.updateProfile(req.studentProfile.id, {
          targetCareerId: career.id,
          targetCareerTitle: career.title,
        });
      }
    }

    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/skill-gap', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }
  const careerRoleId = (req.query.careerRoleId as string) || req.studentProfile.targetCareerId || db.getCareerRoles()[0].id;
  try {
    const analysis = analyzeSkillGap(req.studentProfile.id, careerRoleId);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// Roadmaps Routes
// ----------------------------------------------------
apiRouter.post('/roadmaps/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const careerRoleId = req.body.careerRoleId || req.studentProfile.targetCareerId || db.getCareerRoles()[0].id;
  try {
    const roadmap = await generatePersonalizedRoadmap(req.studentProfile.id, careerRoleId);
    res.status(201).json({ success: true, message: 'Personalized roadmap generated', data: roadmap });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/roadmaps/current', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const roadmaps = db.getRoadmaps(req.studentProfile.id);
  const activeRoadmap = roadmaps.find((r) => r.status === 'Active') || roadmaps[0] || null;

  res.json({ success: true, data: activeRoadmap });
});

apiRouter.put('/roadmaps/:id/tasks/:taskId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  if (!status || !['Not Started', 'In Progress', 'Completed'].includes(status)) {
    res.status(400).json({ success: false, message: 'Status must be Not Started, In Progress, or Completed.' });
    return;
  }

  const result = db.updateRoadmapTask(req.params.id, req.params.taskId, status);
  if (!result) {
    res.status(404).json({ success: false, message: 'Roadmap or task not found' });
    return;
  }

  if (result.xpEarned > 0 && req.studentProfile) {
    db.awardXP(req.studentProfile.id, result.xpEarned, `Completed task: ${result.task.title}`);
    db.checkAndAwardBadges(req.studentProfile.id);
  }

  res.json({
    success: true,
    message: `Task updated to ${status}`,
    data: result,
  });
});

// ----------------------------------------------------
// Projects Routes
// ----------------------------------------------------
apiRouter.get('/projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.json({ success: true, data: [] });
    return;
  }
  const projects = db.getProjects(req.studentProfile.id);
  res.json({ success: true, data: projects });
});

apiRouter.post('/projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const { title, description, technologies, repoUrl, liveUrl, status } = req.body;
  if (!title || !description || !technologies) {
    res.status(400).json({ success: false, message: 'Title, description, and technologies are required.' });
    return;
  }

  const project = createStudentProject(req.studentProfile.id, {
    title,
    description,
    technologies: Array.isArray(technologies) ? technologies : technologies.split(',').map((t: string) => t.trim()),
    repoUrl,
    liveUrl,
    status: status || 'Completed',
  });

  res.status(201).json({ success: true, message: 'Project added to portfolio', data: project });
});

apiRouter.get('/projects/recommended', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }
  const careerId = (req.query.careerRoleId as string) || req.studentProfile.targetCareerId || db.getCareerRoles()[0].id;
  const recommended = await getRecommendedProjects(req.studentProfile.id, careerId);
  res.json({ success: true, data: recommended });
});

// ----------------------------------------------------
// Certifications & Internships Routes
// ----------------------------------------------------
apiRouter.get('/certifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.json({ success: true, data: [] });
    return;
  }
  res.json({ success: true, data: db.getCertifications(req.studentProfile.id) });
});

apiRouter.post('/certifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const { title, issuingOrganization, issueDate, credentialUrl, credentialId, skillsCovered } = req.body;
  if (!title || !issuingOrganization) {
    res.status(400).json({ success: false, message: 'Title and issuing organization are required.' });
    return;
  }

  const cert = {
    id: `cert-${Date.now()}`,
    studentId: req.studentProfile.id,
    title,
    issuingOrganization,
    issueDate: issueDate || new Date().toISOString().split('T')[0],
    credentialUrl,
    credentialId,
    skillsCovered: Array.isArray(skillsCovered) ? skillsCovered : (skillsCovered ? skillsCovered.split(',').map((s: string) => s.trim()) : []),
    verified: false,
    createdAt: new Date().toISOString(),
  };

  db.addCertification(cert);
  db.awardXP(req.studentProfile.id, 25, `Added certification: ${cert.title}`);
  db.checkAndAwardBadges(req.studentProfile.id);

  res.status(201).json({ success: true, message: 'Certification submitted for verification', data: cert });
});

apiRouter.get('/internships', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.json({ success: true, data: [] });
    return;
  }
  res.json({ success: true, data: db.getInternships(req.studentProfile.id) });
});

apiRouter.post('/internships', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const { company, role, location, startDate, endDate, isCurrent, description, skillsUsed } = req.body;
  if (!company || !role) {
    res.status(400).json({ success: false, message: 'Company and role are required.' });
    return;
  }

  const internship = {
    id: `intern-${Date.now()}`,
    studentId: req.studentProfile.id,
    company,
    role,
    location: location || 'Remote',
    startDate: startDate || '2026-01-01',
    endDate,
    isCurrent: Boolean(isCurrent),
    description: description || '',
    skillsUsed: Array.isArray(skillsUsed) ? skillsUsed : (skillsUsed ? skillsUsed.split(',').map((s: string) => s.trim()) : []),
    createdAt: new Date().toISOString(),
  };

  db.addInternship(internship);
  db.awardXP(req.studentProfile.id, 50, `Added internship experience at ${company}`);
  res.status(201).json({ success: true, message: 'Internship experience added', data: internship });
});

// ----------------------------------------------------
// Resume Analyzer Route
// ----------------------------------------------------
apiRouter.post('/resume/analyze', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const { resumeText, targetCareerId } = req.body;
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
    res.status(400).json({ success: false, message: 'Please provide resume text content to analyze.' });
    return;
  }

  try {
    const result = await analyzeResumeText(
      req.studentProfile.id,
      resumeText,
      targetCareerId || req.studentProfile.targetCareerId
    );

    // Save resume filename indicator in profile
    db.updateProfile(req.studentProfile.id, {
      resumeFileName: req.body.fileName || 'Parsed_Resume.pdf',
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// AI Career Assistant Route
// ----------------------------------------------------
apiRouter.post('/ai/assistant', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ success: false, message: 'Prompt message is required.' });
    return;
  }

  try {
    const answer = await askCareerAssistant(req.studentProfile, message, history || []);
    res.json({ success: true, data: { answer } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// Complete Student Dashboard Route
// ----------------------------------------------------
apiRouter.get('/dashboard', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.studentProfile) {
    res.status(404).json({ success: false, message: 'Student profile required' });
    return;
  }

  const profile = req.studentProfile;
  const careerId = profile.targetCareerId || db.getCareerRoles()[0].id;
  const career = db.getCareerRoles().find((c) => c.id === careerId) || db.getCareerRoles()[0];
  const gapAnalysis = analyzeSkillGap(profile.id, careerId);
  const skills = db.getStudentSkills(profile.id);
  const projects = db.getProjects(profile.id);
  const certs = db.getCertifications(profile.id);
  const roadmaps = db.getRoadmaps(profile.id);
  const activeRoadmap = roadmaps.find((r) => r.status === 'Active') || roadmaps[0] || null;
  const achievements = db.getAchievements(profile.id);

  // Find today's / active tasks from current roadmap
  const activeTasks: any[] = [];
  if (activeRoadmap) {
    activeRoadmap.weeks.forEach((w) => {
      w.tasks.forEach((t) => {
        if (t.status === 'In Progress' || (t.status === 'Not Started' && activeTasks.length < 3)) {
          activeTasks.push({ ...t, weekTitle: w.title });
        }
      });
    });
  }

  res.json({
    success: true,
    data: {
      profile,
      career,
      careerReadinessScore: gapAnalysis.readinessScore,
      scoreBreakdown: gapAnalysis.scoreBreakdown,
      scoreExplanation: gapAnalysis.scoreExplanation,
      skillsCount: skills.length,
      skillGapSummary: {
        strong: gapAnalysis.strongSkills.length,
        improvable: gapAnalysis.intermediateSkills.length,
        missing: gapAnalysis.missingSkills.length,
        topMissing: gapAnalysis.missingSkills.slice(0, 4),
      },
      currentRoadmap: activeRoadmap,
      todayTasks: activeTasks.slice(0, 4),
      completedProjects: projects.filter((p) => p.status === 'Completed'),
      certifications: certs,
      xp: profile.xp,
      level: profile.level,
      achievements,
      badgeCatalog: BADGE_DEFINITIONS,
    },
  });
});

// ----------------------------------------------------
// Admin Routes
// ----------------------------------------------------
apiRouter.get('/admin/stats', authMiddleware, requireRole('ADMIN'), (req, res) => {
  res.json({ success: true, data: getAdminPlatformStats() });
});

apiRouter.get('/admin/students', authMiddleware, requireRole('ADMIN'), (req, res) => {
  res.json({ success: true, data: getAllStudentsDetailed() });
});

apiRouter.get('/admin/verifications', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const projects = db.getProjects().filter((p) => !p.verified);
  const certs = db.getCertifications().filter((c) => !c.verified);
  res.json({
    success: true,
    data: {
      pendingProjects: projects,
      pendingCertifications: certs,
    },
  });
});

apiRouter.post('/admin/verify-project', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const { projectId, verified, feedback } = req.body;
  if (!projectId || verified === undefined) {
    res.status(400).json({ success: false, message: 'projectId and verified boolean are required.' });
    return;
  }
  const result = verifyStudentProject(projectId, Boolean(verified), feedback);
  if (!result) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }
  res.json({ success: true, message: `Project ${verified ? 'verified' : 'rejected'}`, data: result });
});

apiRouter.post('/admin/verify-certification', authMiddleware, requireRole('ADMIN'), (req, res) => {
  const { certId, verified, feedback } = req.body;
  if (!certId || verified === undefined) {
    res.status(400).json({ success: false, message: 'certId and verified boolean are required.' });
    return;
  }
  const result = verifyStudentCertification(certId, Boolean(verified), feedback);
  if (!result) {
    res.status(404).json({ success: false, message: 'Certification not found' });
    return;
  }
  res.json({ success: true, message: `Certification ${verified ? 'verified' : 'rejected'}`, data: result });
});

// ----------------------------------------------------
// Notifications Routes
// ----------------------------------------------------
apiRouter.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getNotifications(req.user!.id);
  res.json({ success: true, data: notifs });
});

apiRouter.put('/notifications/:id/read', authMiddleware, (req, res) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true, message: 'Notification marked as read' });
});
