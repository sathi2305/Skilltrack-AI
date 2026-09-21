import { db } from '../db.js';
import { getGeminiClient, GEMINI_MODEL } from '../gemini.js';
import { analyzeSkillGap } from './skillGapEngine.js';
import { RecommendedProject, StudentProject } from '../types.js';

export const CURATED_PROJECT_CATALOG: RecommendedProject[] = [
  {
    id: 'rec-student-mgmt-api',
    title: 'Student Management & Enrollment REST API',
    problemStatement: 'Educational institutions need a reliable, high-throughput backend service to register students, assign course enrollments, track credit hours, and enforce prerequisites.',
    skillsPracticed: ['Spring Boot', 'RESTful APIs', 'SQL', 'JUnit & Mockito'],
    targetMissingSkills: ['Spring Boot', 'RESTful APIs', 'JUnit & Mockito'],
    difficulty: 'Intermediate',
    estimatedDuration: '12 - 16 hours',
    requiredTechnologies: ['Java 17+', 'Spring Boot 3.x', 'Spring Data JPA', 'MySQL/PostgreSQL', 'JUnit 5'],
    expectedOutcome: 'A production-grade REST API with JWT security, Jakarta validation, pagination, custom exception advisor, and 80%+ unit test coverage.',
    portfolioValue: 'High: Demonstrates standard enterprise backend pattern used in banking, SaaS, and higher-ed tech.',
    keyFeatures: [
      'Relational student-course enrollment database modeling with Hibernate JPA',
      'Global exception handling using @ControllerAdvice returning structured error responses',
      'Unit test suite mocking repositories using Mockito.when()',
      'Pageable sorting and search filters for large student cohorts',
    ],
  },
  {
    id: 'rec-ecommerce-microservice',
    title: 'Distributed Inventory & Order Service',
    problemStatement: 'An e-commerce storefront requires decoupled inventory deduction, idempotent checkout orders, and transactional safety under concurrent traffic.',
    skillsPracticed: ['Spring Boot', 'RESTful APIs', 'Docker', 'SQL'],
    targetMissingSkills: ['Spring Boot', 'Docker', 'RESTful APIs'],
    difficulty: 'Advanced',
    estimatedDuration: '20 - 25 hours',
    requiredTechnologies: ['Java', 'Spring Boot', 'Docker & Docker Compose', 'PostgreSQL', 'Redis'],
    expectedOutcome: 'Containerized multi-service application with Docker Compose running API, Redis cache, and PostgreSQL database.',
    portfolioValue: 'Very High: Proves understanding of containerization, caching strategies, and race-condition safety.',
    keyFeatures: [
      'Multi-stage Dockerfile packaging the JAR with lightweight Alpine runtime',
      'Redis cache layer for hot inventory reads',
      'ACID database transactions with pessimistic/optimistic locking',
      'Postman collection documentation with environment variables',
    ],
  },
  {
    id: 'rec-fullstack-kanban',
    title: 'Real-Time Collaborative Kanban Board',
    problemStatement: 'Remote engineering teams require agile task management boards with drag-and-drop column reorganization, label filtering, and instant status updates.',
    skillsPracticed: ['React', 'Node.js & Express', 'TypeScript', 'SQL'],
    targetMissingSkills: ['React', 'Node.js & Express', 'TypeScript'],
    difficulty: 'Intermediate',
    estimatedDuration: '14 - 18 hours',
    requiredTechnologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Node.js/Express', 'PostgreSQL'],
    expectedOutcome: 'A responsive full-stack Kanban app featuring drag-and-drop state, optimistic UI updates, and RESTful CRUD persistence.',
    portfolioValue: 'High: Shows full stack capability from intuitive interactive UX down to relational database joins.',
    keyFeatures: [
      'Fluid drag-and-drop card movements between columns',
      'Optimistic state updates with server rollback on network error',
      'TypeScript end-to-end interface contracts between client and server',
      'Search filtering by assignee, priority tags, and due date',
    ],
  },
  {
    id: 'rec-analytics-dashboard',
    title: 'Customer Churn & Retention Analytics Platform',
    problemStatement: 'Subscription businesses suffer silent customer churn. Business stakeholders need interactive visual cohorts, retention funnels, and feature correlation insights.',
    skillsPracticed: ['Python', 'SQL', 'Pandas & NumPy', 'Tableau / Power BI'],
    targetMissingSkills: ['SQL', 'Pandas & NumPy', 'Tableau / Power BI'],
    difficulty: 'Intermediate',
    estimatedDuration: '10 - 15 hours',
    requiredTechnologies: ['Python 3.11', 'Pandas', 'NumPy', 'PostgreSQL', 'Tableau / Plotly'],
    expectedOutcome: 'An end-to-end business intelligence pipeline extracting warehouse records, computing cohorts, and displaying visual executive KPIs.',
    portfolioValue: 'High: Shows quantitative business sense and visual reporting capability.',
    keyFeatures: [
      'Complex SQL CTE queries calculating monthly active users and retention cohorts',
      'Data cleaning pipeline imputing missing values and normalizing dates',
      'Executive dashboard summarizing churn risk factors and lifetime value',
      'Statistical correlation matrix between product usage metrics and churn',
    ],
  },
  {
    id: 'rec-predictive-ml-pipeline',
    title: 'End-to-End Predictive ML Service',
    problemStatement: 'Credit lending teams need automated risk scoring models that ingest historical applicant data, evaluate default probabilities, and expose low-latency prediction endpoints.',
    skillsPracticed: ['Python', 'Scikit-Learn', 'RESTful APIs', 'Docker'],
    targetMissingSkills: ['Scikit-Learn', 'RESTful APIs', 'Docker'],
    difficulty: 'Advanced',
    estimatedDuration: '18 - 22 hours',
    requiredTechnologies: ['Python', 'Scikit-Learn', 'FastAPI', 'Docker', 'Pandas'],
    expectedOutcome: 'Trained classification model serialized and served via FastAPI in a Docker container with swagger documentation.',
    portfolioValue: 'Very High: Demonstrates transition from exploratory Jupyter notebooks to production machine learning engineering.',
    keyFeatures: [
      'Feature engineering and cross-validated hyperparameter tuning with GridSearchCV',
      'Model serialization via Joblib with pipeline transformers',
      'Containerized FastAPI endpoint returning predictions with confidence scores',
      'Input schema validation with Pydantic preventing malformed inference requests',
    ],
  },
  {
    id: 'rec-frontend-design-system',
    title: 'Accessible SaaS Design System & UI Library',
    problemStatement: 'Growing tech companies struggle with UI inconsistency across products. A unified, accessible component library is needed for cards, modals, forms, and data tables.',
    skillsPracticed: ['React', 'TypeScript', 'HTML & CSS'],
    targetMissingSkills: ['React', 'TypeScript', 'HTML & CSS'],
    difficulty: 'Intermediate',
    estimatedDuration: '10 - 14 hours',
    requiredTechnologies: ['React', 'TypeScript', 'Tailwind CSS', 'Radix Primitives', 'Storybook / Vite'],
    expectedOutcome: 'An accessible, keyboard-navigable component library documented with usage examples and theme tokens.',
    portfolioValue: 'High: Shows deep respect for web accessibility (WCAG), CSS ergonomics, and design consistency.',
    keyFeatures: [
      'Full keyboard navigation and ARIA attribute compliance',
      'Polymorphic components supporting "as" prop and strict TypeScript props',
      'Responsive dark/light theme switching with CSS variables',
      'Data table component with sortable headers and responsive mobile card view',
    ],
  },
];

export async function getRecommendedProjects(studentId: string, careerRoleId: string): Promise<RecommendedProject[]> {
  const gapAnalysis = analyzeSkillGap(studentId, careerRoleId);
  const missingNames = gapAnalysis.missingSkills.map((m) => m.name.toLowerCase());
  const improvableNames = gapAnalysis.intermediateSkills.map((m) => m.name.toLowerCase());

  // Score each curated project based on how many missing/improvable skills it addresses
  const scored = CURATED_PROJECT_CATALOG.map((proj) => {
    let matchScore = 0;
    proj.skillsPracticed.forEach((skill) => {
      const s = skill.toLowerCase();
      if (missingNames.includes(s)) matchScore += 3;
      else if (improvableNames.includes(s)) matchScore += 1.5;
    });
    return { proj, matchScore };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.map((s) => s.proj);
}

export function createStudentProject(studentId: string, projectData: {
  title: string;
  description: string;
  technologies: string[];
  repoUrl?: string;
  liveUrl?: string;
  status: 'Completed' | 'In Progress' | 'Planned';
}): StudentProject {
  const project: StudentProject = {
    id: `proj-${Date.now()}`,
    studentId,
    title: projectData.title,
    description: projectData.description,
    technologies: projectData.technologies,
    repoUrl: projectData.repoUrl,
    liveUrl: projectData.liveUrl,
    status: projectData.status,
    verified: false,
    createdAt: new Date().toISOString(),
    completedAt: projectData.status === 'Completed' ? new Date().toISOString() : undefined,
  };

  db.addProject(project);

  if (projectData.status === 'Completed') {
    db.awardXP(studentId, 50, `Completed technical project: ${projectData.title}`);
  } else {
    db.awardXP(studentId, 15, `Started new project: ${projectData.title}`);
  }

  db.checkAndAwardBadges(studentId);
  return project;
}
