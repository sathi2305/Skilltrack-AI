import { db } from '../db.js';
import { getGeminiClient, GEMINI_MODEL } from '../gemini.js';
import { analyzeSkillGap } from './skillGapEngine.js';
import { StudentProfile } from '../types.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askCareerAssistant(
  studentProfile: StudentProfile,
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const careerId = studentProfile.targetCareerId || 'career-java-backend';
  const career = db.getCareerRoles().find((c) => c.id === careerId);
  const gapAnalysis = analyzeSkillGap(studentProfile.id, careerId);
  const currentSkills = db.getStudentSkills(studentProfile.id);
  const currentRoadmap = db.getRoadmaps(studentProfile.id)[0];
  const completedProjects = db.getProjects(studentProfile.id);

  const contextData = {
    studentName: studentProfile.name,
    major: studentProfile.major,
    college: studentProfile.college,
    targetRole: career ? career.title : 'Software Engineer',
    overallReadinessScore: `${gapAnalysis.readinessScore}%`,
    scoreBreakdown: gapAnalysis.scoreBreakdown,
    strongSkills: gapAnalysis.strongSkills.map((s) => `${s.name} (${s.studentLevel})`).join(', ') || 'None',
    improvableSkills: gapAnalysis.intermediateSkills.map((s) => `${s.name} (${s.studentLevel})`).join(', ') || 'None',
    missingSkills: gapAnalysis.missingSkills.map((s) => `${s.name} (Priority: ${s.priority}, Prereqs: ${s.prerequisites.join(', ') || 'none'})`).join(', ') || 'None',
    activeRoadmap: currentRoadmap
      ? `Title: "${currentRoadmap.title}", Completed: ${currentRoadmap.completedTasks}/${currentRoadmap.totalTasks} tasks`
      : 'No active roadmap generated yet',
    projectsCount: completedProjects.length,
    hoursAvailableWeekly: `${studentProfile.learningHoursPerWeek || 10} hrs/week`,
  };

  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      const systemInstruction = `You are the SkillTrack AI Career Mentor, an expert, encouraging, and highly specific technical coach for university engineering students.
Always ground your answers in the student's ACTUAL profile, missing skills, and career gap data provided below:

STUDENT PROFILE CONTEXT:
- Name: ${contextData.studentName}
- College & Major: ${contextData.major} at ${contextData.college}
- Target Career Role: ${contextData.targetRole}
- Career Readiness Score: ${contextData.overallReadinessScore} (Technical: ${contextData.scoreBreakdown.technicalSkillsScore}/40, Projects: ${contextData.scoreBreakdown.projectsScore}/25, Certs: ${contextData.scoreBreakdown.certificationsScore}/15, Internships: ${contextData.scoreBreakdown.internshipScore}/10, Roadmap: ${contextData.scoreBreakdown.learningProgressScore}/10)
- Strong Skills: ${contextData.strongSkills}
- Skills Needing Improvement: ${contextData.improvableSkills}
- Missing Skills (Urgent Gaps): ${contextData.missingSkills}
- Active Roadmap: ${contextData.activeRoadmap}
- Study Availability: ${contextData.hoursAvailableWeekly}

GUIDELINES:
1. Speak directly to ${contextData.studentName}.
2. Never give generic boilerplate advice when profile-specific gap data exists. Reference their actual skills and missing items explicitly.
3. Be structured: use bullet points, bold key terms, concise code snippets or architecture pointers when helpful.
4. Keep gamification secondary and focus on actionable engineering craftsmanship.
5. If they ask "What should I learn next?", guide them through their highest priority missing skill with its prerequisites.
6. Note clearly that readiness scores are learning/progress indicators to build portfolio strength, not job placement guarantees.`;

      const contents = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const responseText = response.text;
      if (responseText) {
        return responseText;
      }
    } catch (err) {
      console.warn('Gemini career assistant error, falling back to deterministic response:', err);
    }
  }

  // High-quality contextual deterministic fallback
  return getContextualFallbackResponse(message, contextData, gapAnalysis);
}

function getContextualFallbackResponse(
  message: string,
  ctx: any,
  gapAnalysis: ReturnType<typeof analyzeSkillGap>
): string {
  const q = message.toLowerCase();

  if (q.includes('learn next') || q.includes('next step') || q.includes('start')) {
    const topMissing = gapAnalysis.missingSkills[0];
    if (topMissing) {
      return `Based on your profile targeting **${ctx.targetRole}**, your highest-priority gap is **${topMissing.name}** (${topMissing.priority} priority).

**Why this comes next:**
- You already possess strong foundations in **${ctx.strongSkills}**, fulfilling the required prerequisites.
- In enterprise ${ctx.targetRole} systems, **${topMissing.name}** is a core requirement for building scalable architectures.

**Recommended 3-Step Action Plan:**
1. Complete the foundational concepts task in your active roadmap.
2. Build a minimal proof-of-concept repository focusing strictly on ${topMissing.name}.
3. Connect it with your existing knowledge of **${gapAnalysis.strongSkills[0]?.name || 'databases'}**.

Would you like me to recommend a hands-on project that incorporates ${topMissing.name}?`;
    }
    return `You have already matched all the primary required technical skills for **${ctx.targetRole}**! Your next priority should be packaging your skills into a verified production-grade project and completing your active roadmap tasks.`;
  }

  if (q.includes('why is spring boot') || (q.includes('why') && q.includes('important'))) {
    return `**Spring Boot** is critical for **Java Backend Developers** because it serves as the industry standard foundation for enterprise microservices worldwide.

**Key Industry Drivers:**
- **Auto-Configuration & Dependency Injection:** Drastically reduces boilerplate configuration compared to raw JEE.
- **Production-Ready Actuator:** Built-in health checks, metrics, and Prometheus endpoints required by cloud container runtimes like Kubernetes and Cloud Run.
- **Ecosystem Synergy:** Seamlessly integrates with Spring Data JPA (for database operations) and Spring Security (for JWT authentication).

In your skill gap analysis, Spring Boot accounts for **20%** of your role's technical evaluation weight. Mastering it will noticeably increase your Career Readiness from **${ctx.overallReadinessScore}**.`;
  }

  if (q.includes('suggest a project') || q.includes('project recommendation') || q.includes('project')) {
    const missingNames = gapAnalysis.missingSkills.slice(0, 3).map((m) => m.name).join(', ') || 'core frameworks';
    return `Based on your missing skills in **${missingNames}**, here is the highest-leverage portfolio project for you:

### 🏆 Recommended Project: Student Management & Enrollment REST API
- **Skills Practiced:** Spring Boot, RESTful APIs, SQL, JUnit 5
- **Problem Statement:** Build a secure RESTful service that manages student cohorts, courses, and transactional enrollments with prerequisite checks.
- **Key Deliverables:**
  1. Multi-tier architecture (*Controller* → *Service* → *Repository*)
  2. Jakarta Bean Validation on all incoming requests
  3. Relational MySQL/PostgreSQL schema with foreign keys
  4. Mockito unit tests verifying business validation logic

Completing and linking this project to your profile will directly boost your **Project Evidence** score (currently **${ctx.scoreBreakdown.projectsScore}/25 pts**)!`;
  }

  if (q.includes('30-day') || q.includes('roadmap') || q.includes('plan')) {
    return `Here is your customized **30-Day Accelerated Sprint** for **${ctx.targetRole}** (${ctx.hoursAvailableWeekly}):

- **Week 1 (Days 1–7):** Core refresh & advanced idioms in **${gapAnalysis.strongSkills[0]?.name || 'Core Language'}** (collections, concurrency, error hierarchy).
- **Week 2 (Days 8–15):** **Spring Boot & RESTful APIs** (controller routing, dependency injection, and JPA repository queries).
- **Week 3 (Days 16–23):** Milestone project synthesis (*Student Management API* with relational database transactions).
- **Week 4 (Days 24–30):** Automated testing with **JUnit/Mockito** and containerization with **Docker**.

You can track every single task in your interactive **Roadmap** tab to earn **+10 XP** per completed milestone!`;
  }

  // Default tailored answer
  return `Hello ${ctx.studentName}! I am analyzing your profile for **${ctx.targetRole}**.

Here is where your career readiness currently stands:
- **Overall Readiness:** **${ctx.overallReadinessScore}**
- **Strong Assets:** ${ctx.strongSkills}
- **Missing Skills to Tackle:** ${ctx.missingSkills}

To elevate your score:
1. Advance your current sprint tasks in the **Roadmap** tab.
2. Build and verify a hands-on project covering your missing skills.
3. Keep your skill levels and evidence links up to date in the **Skills** tab.

What specific area would you like to dive into next? (e.g. learning plans, project ideas, or interview concepts)`;
}
