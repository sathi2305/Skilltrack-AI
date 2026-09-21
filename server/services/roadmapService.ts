import { db } from '../db.js';
import { getGeminiClient, GEMINI_MODEL } from '../gemini.js';
import { analyzeSkillGap } from './skillGapEngine.js';
import {
  Roadmap,
  RoadmapWeek,
  RoadmapTask,
  StudentProfile,
  CareerRole,
} from '../types.js';

export async function generatePersonalizedRoadmap(studentId: string, careerRoleId: string): Promise<Roadmap> {
  const profile = db.getProfiles().find((p) => p.id === studentId);
  const career = db.getCareerRoles().find((c) => c.id === careerRoleId);

  if (!profile || !career) {
    throw new Error('Student profile or Career role not found');
  }

  const gapAnalysis = analyzeSkillGap(studentId, careerRoleId);
  const hoursPerWeek = profile.learningHoursPerWeek || 10;

  // Try AI-powered roadmap generation first
  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      const prompt = `You are an elite software engineering career architect.
Create a structured 4-week personalized learning roadmap for a student targeting the role of "${career.title}".
Student's Current Strong Skills: ${gapAnalysis.strongSkills.map((s) => s.name).join(', ') || 'None'}
Student's Improvable Skills: ${gapAnalysis.intermediateSkills.map((s) => s.name).join(', ') || 'None'}
Missing High-Priority Skills: ${gapAnalysis.missingSkills.map((s) => `${s.name} (Prereqs: ${s.prerequisites.join(', ') || 'none'})`).join(', ')}
Student can study: ${hoursPerWeek} hours/week.

Requirements:
- Structure strictly into 4 weeks.
- Week 1: Foundational core & prerequisites refresher or advanced idiom mastery.
- Week 2: Primary missing framework & architectural patterns.
- Week 3: Hands-on milestone portfolio project synthesis.
- Week 4: Automated testing, quality assurance & containerized deployment.
- Output JSON strictly following this schema:
{
  "title": "Roadmap Title",
  "summary": "1-2 sentence overview",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week Title",
      "objective": "Objective",
      "tasks": [
        {
          "title": "Task title",
          "description": "Clear actionable description",
          "category": "Core Concept | Framework | Project | Testing & QA | Deployment & DevOps",
          "skillName": "Specific skill name",
          "estimatedHours": 4,
          "subtasks": ["subtask 1", "subtask 2", "subtask 3"],
          "resources": [
            { "title": "Resource title", "url": "https://example.com", "type": "Documentation" }
          ]
        }
      ]
    }
  ]
}`;

      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.weeks && Array.isArray(parsed.weeks) && parsed.weeks.length > 0) {
          const roadmapId = `rd-${studentId}-${Date.now()}`;
          let totalTasks = 0;

          const weeks: RoadmapWeek[] = parsed.weeks.map((w: any, wIdx: number) => {
            const weekNumber = w.weekNumber || wIdx + 1;
            const tasks: RoadmapTask[] = (w.tasks || []).map((t: any, tIdx: number) => {
              totalTasks++;
              return {
                id: `task-${roadmapId}-${weekNumber}-${tIdx + 1}`,
                roadmapId,
                weekNumber,
                title: t.title || 'Learning Task',
                description: t.description || '',
                category: t.category || 'Framework',
                skillName: t.skillName || career.requiredSkills[0]?.skillName || 'General',
                estimatedHours: Number(t.estimatedHours) || 4,
                status: 'Not Started',
                subtasks: Array.isArray(t.subtasks) ? t.subtasks : ['Study concepts', 'Write code', 'Verify knowledge'],
                resources: Array.isArray(t.resources) && t.resources.length > 0 ? t.resources : [
                  { title: 'Official Documentation & Guides', url: 'https://devdocs.io', type: 'Documentation' }
                ],
              };
            });

            return {
              weekNumber,
              title: w.title || `Week ${weekNumber}`,
              objective: w.objective || 'Complete technical milestones for this sprint.',
              tasks,
            };
          });

          const roadmap: Roadmap = {
            id: roadmapId,
            studentId,
            careerRoleId,
            careerRoleTitle: career.title,
            title: parsed.title || `Target Mastery: ${career.title} in 4 Weeks`,
            summary: parsed.summary || `Personalized learning sequence designed for ${profile.name} targeting ${career.title}.`,
            durationWeeks: weeks.length,
            totalTasks,
            completedTasks: 0,
            status: 'Active',
            weeks,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          db.addRoadmap(roadmap);
          db.awardXP(studentId, 25, 'Generated personalized career roadmap');
          db.checkAndAwardBadges(studentId);
          return roadmap;
        }
      }
    } catch (err) {
      console.warn('Gemini roadmap generation error, falling back to deterministic algorithm:', err);
    }
  }

  // Deterministic fallback based on career role and missing skills
  return generateDeterministicRoadmap(profile, career, gapAnalysis);
}

function generateDeterministicRoadmap(
  profile: StudentProfile,
  career: CareerRole,
  gapAnalysis: ReturnType<typeof analyzeSkillGap>
): Roadmap {
  const roadmapId = `rd-${profile.id}-${Date.now()}`;
  const missing = gapAnalysis.missingSkills;
  const intermediate = gapAnalysis.intermediateSkills;

  const topMissing = missing.slice(0, 4).map((m) => m.name);
  const primaryFocus = topMissing[0] || (career.requiredSkills[1]?.skillName || 'Backend Engineering');
  const secondaryFocus = topMissing[1] || (career.requiredSkills[2]?.skillName || 'RESTful APIs');

  const week1Tasks: RoadmapTask[] = [
    {
      id: `task-${roadmapId}-1-1`,
      roadmapId,
      weekNumber: 1,
      title: `${intermediate[0]?.name || career.requiredSkills[0].skillName} Mastery & Fundamentals`,
      description: `Solidify core programming principles, memory management, and asynchronous idioms needed as prerequisites.`,
      category: 'Core Concept',
      skillName: intermediate[0]?.name || career.requiredSkills[0].skillName,
      estimatedHours: 4,
      status: 'Not Started',
      dependencies: [],
      subtasks: [
        'Review language syntax edge-cases and data structure implementations',
        'Solve 3 algorithmic challenges practicing clean code and error handling',
        'Inspect architectural patterns and clean code conventions'
      ],
      resources: [
        { title: 'Core Language Specification & Docs', url: 'https://devdocs.io', type: 'Documentation' },
      ],
    },
    {
      id: `task-${roadmapId}-1-2`,
      roadmapId,
      weekNumber: 1,
      title: 'Environment Setup & Tooling Configuration',
      description: 'Configure clean local development environment, linters, debuggers, and Git workflow.',
      category: 'Core Concept',
      skillName: 'Git & GitHub',
      estimatedHours: 3,
      status: 'Not Started',
      dependencies: [`task-${roadmapId}-1-1`],
      milestone: true,
      milestoneName: 'Sprint 1 Milestone: Foundations & Environment Ready',
      subtasks: [
        'Configure Git SSH keys and project directory layout',
        'Set up build tools and package management',
        'Initialize local repository with standard .gitignore and README'
      ],
      resources: [
        { title: 'Git & GitHub Workflow Best Practices', url: 'https://git-scm.com/doc', type: 'Documentation' },
      ],
    },
  ];

  const week2Tasks: RoadmapTask[] = [
    {
      id: `task-${roadmapId}-2-1`,
      roadmapId,
      weekNumber: 2,
      title: `${primaryFocus} Architecture & Core Patterns`,
      description: `Understand the core framework lifecycle, dependency injection, and request pipeline for ${primaryFocus}.`,
      category: 'Framework',
      skillName: primaryFocus,
      estimatedHours: 5,
      status: 'Not Started',
      dependencies: [`task-${roadmapId}-1-1`, `task-${roadmapId}-1-2`],
      subtasks: [
        `Scaffold first ${primaryFocus} project boilerplate`,
        'Implement modular controller and service separation',
        'Configure application environment variables and logging'
      ],
      resources: [
        { title: `${primaryFocus} Official Quickstart`, url: 'https://devdocs.io', type: 'Interactive' },
      ],
    },
    {
      id: `task-${roadmapId}-2-2`,
      roadmapId,
      weekNumber: 2,
      title: `${secondaryFocus} & Data Persistence Integration`,
      description: `Design RESTful endpoints, database schemas, and structured JSON payloads.`,
      category: 'Framework',
      skillName: secondaryFocus,
      estimatedHours: 5,
      status: 'Not Started',
      dependencies: [`task-${roadmapId}-2-1`],
      milestone: true,
      milestoneName: 'Sprint 2 Milestone: Framework & API Architecture',
      subtasks: [
        'Define relational database tables and foreign key constraints',
        'Implement CRUD routes with status codes (200, 201, 400, 404)',
        'Add input validation DTOs with descriptive error messages'
      ],
      resources: [
        { title: 'REST API Design Guide', url: 'https://restfulapi.net/', type: 'Documentation' },
      ],
    },
  ];

  const week3Tasks: RoadmapTask[] = [
    {
      id: `task-${roadmapId}-3-1`,
      roadmapId,
      weekNumber: 3,
      title: `Capstone Project Milestone: Build a Production Service`,
      description: `Construct an end-to-end full-lifecycle project that applies ${primaryFocus} and ${secondaryFocus}.`,
      category: 'Project',
      skillName: primaryFocus,
      estimatedHours: 8,
      status: 'Not Started',
      dependencies: [`task-${roadmapId}-2-1`, `task-${roadmapId}-2-2`],
      milestone: true,
      milestoneName: 'Sprint 3 Key Milestone: Alpha Project Synthesis',
      subtasks: [
        'Architect multi-tier application (Controller -> Service -> Repository)',
        'Integrate database transactions, indexing, and error handling',
        'Implement pagination, search filtering, and sorting parameters'
      ],
      resources: [
        { title: 'Clean Architecture in Practice', url: 'https://github.com', type: 'Project Spec' },
      ],
    },
  ];

  const week4Tasks: RoadmapTask[] = [
    {
      id: `task-${roadmapId}-4-1`,
      roadmapId,
      weekNumber: 4,
      title: 'Automated Unit & Integration Testing',
      description: 'Write comprehensive automated test suites to ensure zero regressions.',
      category: 'Testing & QA',
      skillName: 'JUnit & Mockito',
      estimatedHours: 4,
      status: 'Not Started',
      dependencies: [`task-${roadmapId}-3-1`],
      subtasks: [
        'Write unit tests mocking database and external dependencies',
        'Test validation failures and edge-case exception paths',
        'Verify test code coverage reaches at least 80%'
      ],
      resources: [
        { title: 'Testing Guide & Mocking Patterns', url: 'https://devdocs.io', type: 'Documentation' },
      ],
    },
    {
      id: `task-${roadmapId}-4-2`,
      roadmapId,
      weekNumber: 4,
      title: 'Containerization & Production Deployment',
      description: 'Package the application into an optimized Docker container and prepare cloud deploy specs.',
      category: 'Deployment & DevOps',
      skillName: 'Docker',
      estimatedHours: 4,
      status: 'Not Started',
      dependencies: [`task-${roadmapId}-3-1`, `task-${roadmapId}-4-1`],
      milestone: true,
      milestoneName: 'Sprint 4 Final Milestone: Production Verified Release',
      subtasks: [
        'Write multi-stage Dockerfile for minimized image size',
        'Configure docker-compose with database container and health checks',
        'Write comprehensive README with API docs and run instructions'
      ],
      resources: [
        { title: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started/', type: 'Documentation' },
      ],
    },
  ];

  const weeks: RoadmapWeek[] = [
    { weekNumber: 1, title: 'Prerequisites & Core Language Foundations', objective: 'Master language idioms, OOP principles, and development workflows.', tasks: week1Tasks },
    { weekNumber: 2, title: `${primaryFocus} & API Architecture`, objective: `Build robust web services and database persistence layers.`, tasks: week2Tasks },
    { weekNumber: 3, title: 'Portfolio Project Development Sprint', objective: 'Synthesize missing skills into a standalone, verifiable project.', tasks: week3Tasks },
    { weekNumber: 4, title: 'Quality Assurance, Testing & Deployment', objective: 'Automate unit tests, Dockerize the project, and publish clean documentation.', tasks: week4Tasks },
  ];

  let totalTasks = 0;
  weeks.forEach((w) => { totalTasks += w.tasks.length; });

  const roadmap: Roadmap = {
    id: roadmapId,
    studentId: profile.id,
    careerRoleId: career.id,
    careerRoleTitle: career.title,
    title: `Target Mastery: ${career.title} in 4 Weeks`,
    summary: `Structured 4-week roadmap closing key gaps in ${topMissing.slice(0, 3).join(', ')} for ${profile.name}.`,
    durationWeeks: 4,
    totalTasks,
    completedTasks: 0,
    status: 'Active',
    weeks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addRoadmap(roadmap);
  db.awardXP(profile.id, 25, 'Generated personalized career roadmap');
  db.checkAndAwardBadges(profile.id);

  return roadmap;
}
