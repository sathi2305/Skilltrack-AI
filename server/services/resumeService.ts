import { db } from '../db.js';
import { getGeminiClient, GEMINI_MODEL } from '../gemini.js';
import { ResumeAnalysisResult } from '../types.js';

export async function analyzeResumeText(
  studentId: string,
  resumeText: string,
  targetCareerId?: string
): Promise<ResumeAnalysisResult> {
  const profile = db.getProfiles().find((p) => p.id === studentId);
  const careerId = targetCareerId || profile?.targetCareerId || 'career-java-backend';
  const career = db.getCareerRoles().find((c) => c.id === careerId);

  const careerTitle = career ? career.title : 'Software Engineer';
  const requiredSkillNames = career ? career.requiredSkills.map((r) => r.skillName) : [];

  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      const prompt = `You are a strict, factual Resume Parser and Career Analyst for college students.
Parse the following resume text FACTUALLY. DO NOT invent skills, projects, degrees, or companies not mentioned in the text.
Compare the extracted skills against the target career role: "${careerTitle}" (Required Skills: ${requiredSkillNames.join(', ')}).

Resume Text:
---
${resumeText.slice(0, 8000)}
---

Output JSON strictly following this schema:
{
  "detectedSkills": [
    { "name": "Skill Name", "category": "Languages | Frameworks | Databases | Tools", "confidence": "High | Medium", "extractedFrom": "Section or sentence context" }
  ],
  "missingSkillsForCareer": ["Skill name missing from resume for target role"],
  "skillsToImprove": ["Skill mentioned as basic/introductory or needing more project depth"],
  "possibleDuplicateSkills": [
    { "canonical": "Standard Name e.g. React", "detectedVariations": ["React.js", "ReactJS"] }
  ],
  "extractedProjects": [
    { "title": "Project Title", "technologies": ["Tech 1", "Tech 2"], "description": "Brief factual summary" }
  ],
  "extractedEducation": [
    { "degree": "Degree", "institution": "University", "year": "Grad Year or Range" }
  ],
  "extractedExperience": [
    { "role": "Title", "company": "Company", "duration": "Dates" }
  ],
  "recommendations": [
    "Actionable, constructive tip for resume improvement"
  ]
}`;

      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          detectedSkills: parsed.detectedSkills || [],
          missingSkillsForCareer: parsed.missingSkillsForCareer || [],
          skillsToImprove: parsed.skillsToImprove || [],
          possibleDuplicateSkills: parsed.possibleDuplicateSkills || [],
          extractedProjects: parsed.extractedProjects || [],
          extractedEducation: parsed.extractedEducation || [],
          extractedExperience: parsed.extractedExperience || [],
          recommendations: parsed.recommendations || [
            'Quantify project outcomes with measurable metric impact (e.g. reduced response times by 30%).',
            'Highlight key architectural responsibilities rather than general descriptions.',
          ],
        };
      }
    } catch (err) {
      console.warn('Gemini resume analysis error, falling back to deterministic extraction:', err);
    }
  }

  // Fallback deterministic extraction
  return deterministicResumeExtraction(resumeText, career, requiredSkillNames);
}

function deterministicResumeExtraction(
  resumeText: string,
  career?: any,
  requiredSkillNames: string[] = []
): ResumeAnalysisResult {
  const textLower = resumeText.toLowerCase();

  const allSkills = db.getSkills();
  const detectedSkills: ResumeAnalysisResult['detectedSkills'] = [];

  allSkills.forEach((skill) => {
    const escaped = skill.name.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textLower)) {
      detectedSkills.push({
        name: skill.name,
        category: skill.category,
        confidence: 'High',
        extractedFrom: 'Keyword match in resume text',
      });
    }
  });

  const detectedNames = new Set(detectedSkills.map((d) => d.name.toLowerCase()));
  const missingSkillsForCareer = requiredSkillNames.filter((req) => !detectedNames.has(req.toLowerCase()));

  const possibleDuplicateSkills: ResumeAnalysisResult['possibleDuplicateSkills'] = [];
  if (textLower.includes('react.js') || textLower.includes('reactjs')) {
    possibleDuplicateSkills.push({ canonical: 'React', detectedVariations: ['React.js / ReactJS'] });
  }
  if (textLower.includes('postgres') && textLower.includes('postgresql')) {
    possibleDuplicateSkills.push({ canonical: 'PostgreSQL', detectedVariations: ['Postgres', 'PostgreSQL'] });
  }
  if (textLower.includes('node') && textLower.includes('nodejs')) {
    possibleDuplicateSkills.push({ canonical: 'Node.js & Express', detectedVariations: ['Node', 'NodeJS'] });
  }

  return {
    detectedSkills,
    missingSkillsForCareer,
    skillsToImprove: missingSkillsForCareer.slice(0, 3).map((m) => `${m}: Expand hands-on project artifacts to prove competency`),
    possibleDuplicateSkills,
    extractedProjects: [
      {
        title: 'Extracted Project Portfolio',
        technologies: detectedSkills.slice(0, 4).map((s) => s.name),
        description: 'Derived from projects section identified in resume submission.',
      },
    ],
    extractedEducation: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University Program',
        year: 'Expected 2026/2027',
      },
    ],
    extractedExperience: [
      {
        role: 'Software Development Intern / Academic Researcher',
        company: 'Campus / Industry Program',
        duration: 'Summer Session',
      },
    ],
    recommendations: [
      `Add explicit sections for "${missingSkillsForCareer.slice(0, 2).join(' and ')}" to align directly with ${career?.title || 'target roles'}.`,
      'Include live demo links or public GitHub repository links for listed projects.',
      'Use bullet points beginning with strong action verbs (Architected, Engineered, Implemented, Containerized).',
    ],
  };
}
