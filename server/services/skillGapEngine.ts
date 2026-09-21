import { db } from '../db.js';
import {
  SkillGapAnalysisResult,
  SkillLevel,
  StudentSkill,
  CareerRole,
} from '../types.js';

const LEVEL_WEIGHTS: Record<SkillLevel, number> = {
  Beginner: 0.5,
  Intermediate: 0.8,
  Advanced: 1.0,
};

export function analyzeSkillGap(studentId: string, careerRoleId: string): SkillGapAnalysisResult {
  const career = db.getCareerRoles().find((c) => c.id === careerRoleId);
  if (!career) {
    throw new Error(`Career role with ID ${careerRoleId} not found`);
  }

  const studentSkills = db.getStudentSkills(studentId);
  const studentProjects = db.getProjects(studentId);
  const studentCerts = db.getCertifications(studentId);
  const studentInternships = db.getInternships(studentId);
  const activeRoadmaps = db.getRoadmaps(studentId).filter((r) => r.careerRoleId === careerRoleId);

  // Map of student skill names lowercase for fuzzy matching
  const studentSkillMap = new Map<string, StudentSkill>();
  studentSkills.forEach((s) => {
    studentSkillMap.set(s.skillName.toLowerCase().trim(), s);
  });

  // Track skills practiced in projects
  const projectTechSet = new Set<string>();
  studentProjects.forEach((p) => {
    p.technologies.forEach((t) => projectTechSet.add(t.toLowerCase().trim()));
  });

  // Track skills covered in certifications
  const certSkillSet = new Set<string>();
  studentCerts.forEach((c) => {
    c.skillsCovered.forEach((s) => certSkillSet.add(s.toLowerCase().trim()));
  });

  // Track skills practiced in internships
  const internshipSkillSet = new Set<string>();
  studentInternships.forEach((i) => {
    i.skillsUsed.forEach((s) => internshipSkillSet.add(s.toLowerCase().trim()));
  });

  const strongSkills: SkillGapAnalysisResult['strongSkills'] = [];
  const intermediateSkills: SkillGapAnalysisResult['intermediateSkills'] = [];
  const missingSkills: SkillGapAnalysisResult['missingSkills'] = [];

  let totalTechnicalWeight = 0;
  let earnedTechnicalWeight = 0;

  for (const req of career.requiredSkills) {
    const key = req.skillName.toLowerCase().trim();
    const studentSkill = studentSkillMap.get(key);
    totalTechnicalWeight += req.weight;

    const reqLevelWeight = LEVEL_WEIGHTS[req.minLevel];

    if (studentSkill) {
      const studentLevelWeight = LEVEL_WEIGHTS[studentSkill.level];

      if (studentLevelWeight >= reqLevelWeight) {
        // Strong match
        earnedTechnicalWeight += req.weight;
        strongSkills.push({
          name: req.skillName,
          studentLevel: studentSkill.level,
          requiredLevel: req.minLevel,
          category: req.category,
          reason: `Meets or exceeds target level (${studentSkill.level} >= ${req.minLevel}). Verified through ${studentSkill.yearsOfExperience} yrs experience.`,
        });
      } else {
        // Intermediate / Needs Improvement
        const ratio = studentLevelWeight / reqLevelWeight;
        earnedTechnicalWeight += req.weight * ratio;
        intermediateSkills.push({
          name: req.skillName,
          studentLevel: studentSkill.level,
          requiredLevel: req.minLevel,
          category: req.category,
          improvementPath: `Current level is ${studentSkill.level}; role targets ${req.minLevel}. Focus on advanced idioms, production patterns, and architecture.`,
        });
      }
    } else {
      // Check if practiced in project, cert, or internship (gives partial credit)
      let partialMultiplier = 0;
      const reasons: string[] = [];

      if (projectTechSet.has(key)) {
        partialMultiplier += 0.25;
        reasons.push('practiced in personal project');
      }
      if (certSkillSet.has(key)) {
        partialMultiplier += 0.25;
        reasons.push('covered in certification');
      }
      if (internshipSkillSet.has(key)) {
        partialMultiplier += 0.25;
        reasons.push('used in internship');
      }

      if (partialMultiplier > 0) {
        earnedTechnicalWeight += req.weight * partialMultiplier;
      }

      // Check prerequisites status
      const unfulfilledPrereqs = req.prerequisites.filter((p) => !studentSkillMap.has(p.toLowerCase().trim()));

      missingSkills.push({
        name: req.skillName,
        requiredLevel: req.minLevel,
        importance: req.importance,
        category: req.category,
        prerequisites: req.prerequisites,
        priority: req.importance === 'Required' ? (unfulfilledPrereqs.length === 0 ? 'Critical' : 'High') : 'Medium',
        reason:
          unfulfilledPrereqs.length > 0
            ? `Missing required prerequisites: ${unfulfilledPrereqs.join(', ')}. Complete prerequisites first.`
            : `Prerequisites met. Ready to begin learning ${req.skillName} at ${req.minLevel} level.`,
      });
    }
  }

  // Calculate Breakdown Scores:
  // 1. Technical Skills Score (Max 40%)
  const rawTechPercent = totalTechnicalWeight > 0 ? (earnedTechnicalWeight / totalTechnicalWeight) : 0;
  const technicalSkillsScore = Math.round(rawTechPercent * 40 * 10) / 10;

  // 2. Projects Score (Max 25%)
  // Relevant completed projects matching career technologies
  let projectPoints = 0;
  studentProjects.forEach((proj) => {
    if (proj.status === 'Completed') {
      const relevantMatches = proj.technologies.filter((tech) =>
        career.requiredSkills.some((req) => req.skillName.toLowerCase().trim() === tech.toLowerCase().trim())
      );
      if (relevantMatches.length > 0) {
        projectPoints += proj.verified ? 12 : 8;
      } else {
        projectPoints += 4;
      }
    } else if (proj.status === 'In Progress') {
      projectPoints += 3;
    }
  });
  const projectsScore = Math.min(25, Math.round(projectPoints * 10) / 10);

  // 3. Certifications Score (Max 15%)
  let certPoints = 0;
  studentCerts.forEach((cert) => {
    const relevant = cert.skillsCovered.some((sc) =>
      career.requiredSkills.some((req) => req.skillName.toLowerCase().trim() === sc.toLowerCase().trim())
    );
    if (relevant) {
      certPoints += cert.verified ? 10 : 6;
    } else {
      certPoints += 4;
    }
  });
  const certificationsScore = Math.min(15, Math.round(certPoints * 10) / 10);

  // 4. Internship Experience Score (Max 10%)
  let internPoints = 0;
  studentInternships.forEach((intern) => {
    const relevant = intern.skillsUsed.some((su) =>
      career.requiredSkills.some((req) => req.skillName.toLowerCase().trim() === su.toLowerCase().trim())
    );
    internPoints += relevant ? 10 : 6;
  });
  const internshipScore = Math.min(10, Math.round(internPoints * 10) / 10);

  // 5. Learning Progress Score (Max 10%)
  let learningScore = 0;
  if (activeRoadmaps.length > 0) {
    const rm = activeRoadmaps[0];
    if (rm.totalTasks > 0) {
      const ratio = rm.completedTasks / rm.totalTasks;
      learningScore = Math.round(ratio * 10 * 10) / 10;
    }
  }

  const readinessScore = Math.min(100, Math.round(technicalSkillsScore + projectsScore + certificationsScore + internshipScore + learningScore));

  const scoreExplanation: string[] = [
    `Technical Skills: ${technicalSkillsScore.toFixed(1)} / 40.0 pts (${Math.round((technicalSkillsScore / 40) * 100)}% of required stack mastered).`,
    `Project Evidence: ${projectsScore.toFixed(1)} / 25.0 pts (${studentProjects.filter((p) => p.status === 'Completed').length} completed project(s) applying domain stack).`,
    `Industry Certifications: ${certificationsScore.toFixed(1)} / 15.0 pts (${studentCerts.length} verified/active credential(s)).`,
    `Internship Experience: ${internshipScore.toFixed(1)} / 10.0 pts (${studentInternships.length} practical industry work experience(s)).`,
    `Roadmap Learning Progress: ${learningScore.toFixed(1)} / 10.0 pts (${activeRoadmaps[0]?.completedTasks || 0} tasks completed in current career roadmap).`,
  ];

  const result: SkillGapAnalysisResult = {
    id: `gap-${studentId}-${careerRoleId}`,
    studentId,
    careerRoleId,
    careerTitle: career.title,
    readinessScore,
    scoreBreakdown: {
      technicalSkillsScore,
      projectsScore,
      certificationsScore,
      internshipScore,
      learningProgressScore: learningScore,
    },
    scoreExplanation,
    strongSkills,
    intermediateSkills,
    missingSkills,
    totalRequired: career.requiredSkills.length,
    matchedCount: strongSkills.length + intermediateSkills.length,
    missingCount: missingSkills.length,
    analyzedAt: new Date().toISOString(),
  };

  return result;
}
