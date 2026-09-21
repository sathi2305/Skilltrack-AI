import { db } from '../db.js';
import { analyzeSkillGap } from './skillGapEngine.js';
import { CareerRole, StudentProfile, StudentProject, Certification } from '../types.js';

export interface AdminPlatformStats {
  totalStudents: number;
  averageReadinessScore: number;
  totalProjects: number;
  totalCertifications: number;
  pendingVerifications: number;
  topCareerRoles: {
    roleId: string;
    title: string;
    studentCount: number;
    avgReadiness: number;
  }[];
  topMissingSkillsAcrossPlatform: {
    skillName: string;
    count: number;
  }[];
}

export function getAdminPlatformStats(): AdminPlatformStats {
  const profiles = db.getProfiles();
  const projects = db.getProjects();
  const certs = db.getCertifications();
  const careers = db.getCareerRoles();

  let totalReadinessSum = 0;
  const missingSkillFrequency: Record<string, number> = {};
  const careerStudentMap: Record<string, { title: string; count: number; readinessSum: number }> = {};

  careers.forEach((c) => {
    careerStudentMap[c.id] = { title: c.title, count: 0, readinessSum: 0 };
  });

  profiles.forEach((profile) => {
    const careerId = profile.targetCareerId || careers[0]?.id;
    if (careerId) {
      try {
        const gap = analyzeSkillGap(profile.id, careerId);
        totalReadinessSum += gap.readinessScore;

        if (careerStudentMap[careerId]) {
          careerStudentMap[careerId].count++;
          careerStudentMap[careerId].readinessSum += gap.readinessScore;
        }

        gap.missingSkills.forEach((m) => {
          missingSkillFrequency[m.name] = (missingSkillFrequency[m.name] || 0) + 1;
        });
      } catch (e) {
        // ignore
      }
    }
  });

  const averageReadinessScore = profiles.length > 0 ? Math.round(totalReadinessSum / profiles.length) : 0;

  const topCareerRoles = Object.entries(careerStudentMap)
    .map(([roleId, data]) => ({
      roleId,
      title: data.title,
      studentCount: data.count,
      avgReadiness: data.count > 0 ? Math.round(data.readinessSum / data.count) : 0,
    }))
    .sort((a, b) => b.studentCount - a.studentCount);

  const topMissingSkillsAcrossPlatform = Object.entries(missingSkillFrequency)
    .map(([skillName, count]) => ({ skillName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const pendingProjects = projects.filter((p) => !p.verified).length;
  const pendingCerts = certs.filter((c) => !c.verified).length;

  return {
    totalStudents: profiles.length,
    averageReadinessScore,
    totalProjects: projects.length,
    totalCertifications: certs.length,
    pendingVerifications: pendingProjects + pendingCerts,
    topCareerRoles,
    topMissingSkillsAcrossPlatform,
  };
}

export function getAllStudentsDetailed() {
  const profiles = db.getProfiles();
  const users = db.getUsers();

  return profiles.map((p) => {
    const user = users.find((u) => u.id === p.userId);
    const skills = db.getStudentSkills(p.id);
    const projects = db.getProjects(p.id);
    const certs = db.getCertifications(p.id);
    const career = db.getCareerRoles().find((c) => c.id === p.targetCareerId);

    let readinessScore = 0;
    if (p.targetCareerId) {
      try {
        const gap = analyzeSkillGap(p.id, p.targetCareerId);
        readinessScore = gap.readinessScore;
      } catch (e) {
        // ignore
      }
    }

    return {
      profile: p,
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        createdAt: user?.createdAt,
      },
      skillsCount: skills.length,
      projectsCount: projects.length,
      certsCount: certs.length,
      targetCareerTitle: career ? career.title : 'Not set',
      readinessScore,
    };
  });
}

export function verifyStudentProject(projectId: string, verified: boolean, feedback?: string): StudentProject | null {
  const proj = db.updateProject(projectId, {
    verified,
    adminFeedback: feedback,
  });

  if (proj && verified) {
    db.awardXP(proj.studentId, 25, `Project verified by faculty admin: "${proj.title}" (+25 XP)`);
    db.checkAndAwardBadges(proj.studentId);
  }

  return proj;
}

export function verifyStudentCertification(certId: string, verified: boolean, feedback?: string): Certification | null {
  const cert = db.updateCertification(certId, {
    verified,
    adminFeedback: feedback,
  });

  if (cert && verified) {
    db.awardXP(cert.studentId, 25, `Certificate verified by faculty admin: "${cert.title}" (+25 XP)`);
    db.checkAndAwardBadges(cert.studentId);
  }

  return cert;
}
