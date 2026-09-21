import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  SkillDefinition,
  StudentSkill,
  CareerRole,
  StudentProject,
  Certification,
  Internship,
  Roadmap,
  SkillGapAnalysisResult,
  Achievement,
  BadgeDefinition,
  NotificationItem,
} from './types.js';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge-first-skill',
    title: 'First Skill Added',
    description: 'Documented your first technical skill on SkillTrack AI',
    icon: 'Sparkles',
    xp: 25,
    criteria: 'Add at least 1 verified or self-assessed skill',
  },
  {
    id: 'badge-roadmap-starter',
    title: 'Roadmap Starter',
    description: 'Generated your first personalized career gap roadmap',
    icon: 'Compass',
    xp: 50,
    criteria: 'Generate a personalized career roadmap',
  },
  {
    id: 'badge-first-project',
    title: 'Project Builder',
    description: 'Showcased your first hands-on technical project',
    icon: 'FolderGit2',
    xp: 75,
    criteria: 'Add a project with repo or live URL',
  },
  {
    id: 'badge-skill-builder',
    title: 'Skill Builder',
    description: 'Acquired 5 or more technical skills in your profile',
    icon: 'Layers',
    xp: 100,
    criteria: 'Have 5 or more active skills',
  },
  {
    id: 'badge-task-master',
    title: 'Task Finisher',
    description: 'Completed 5 roadmap learning milestones',
    icon: 'CheckCircle2',
    xp: 100,
    criteria: 'Complete 5 learning tasks in roadmaps',
  },
  {
    id: 'badge-certified-pro',
    title: 'Certified Talent',
    description: 'Submitted an industry certification for career verification',
    icon: 'Award',
    xp: 75,
    criteria: 'Add an industry certification',
  },
  {
    id: 'badge-career-ready',
    title: 'Career Ready Vanguard',
    description: 'Attained a career readiness score above 70%',
    icon: 'Trophy',
    xp: 150,
    criteria: 'Reach 70%+ readiness score',
  },
];

export const INITIAL_SKILLS: SkillDefinition[] = [
  { id: 'sk-java', name: 'Java', category: 'Programming Languages', description: 'Core OOP, Collections, Concurrency, JVM internals', defaultDifficulty: 'Intermediate' },
  { id: 'sk-python', name: 'Python', category: 'Programming Languages', description: 'Data structures, standard library, scripting, decorators', defaultDifficulty: 'Beginner' },
  { id: 'sk-js', name: 'JavaScript', category: 'Programming Languages', description: 'ES6+, async/await, DOM, closures, prototypes', defaultDifficulty: 'Beginner' },
  { id: 'sk-ts', name: 'TypeScript', category: 'Programming Languages', description: 'Static typing, interfaces, generics, type guards', defaultDifficulty: 'Intermediate' },
  { id: 'sk-sql', name: 'SQL', category: 'Databases & Storage', description: 'Relational queries, JOINs, indexing, grouping, transactions', defaultDifficulty: 'Beginner' },
  { id: 'sk-html-css', name: 'HTML & CSS', category: 'Programming Languages', description: 'Semantic markup, modern layout (Flexbox/Grid), responsive design', defaultDifficulty: 'Beginner' },
  { id: 'sk-spring-boot', name: 'Spring Boot', category: 'Frameworks & Libraries', description: 'Dependency Injection, Spring MVC, Spring Data JPA, Actuator', defaultDifficulty: 'Intermediate' },
  { id: 'sk-rest-api', name: 'RESTful APIs', category: 'Frameworks & Libraries', description: 'HTTP verbs, status codes, JSON serialization, API design principles', defaultDifficulty: 'Intermediate' },
  { id: 'sk-junit', name: 'JUnit & Mockito', category: 'Developer Tools', description: 'Unit testing, mocking dependencies, test coverage, assertions', defaultDifficulty: 'Beginner' },
  { id: 'sk-docker', name: 'Docker', category: 'Cloud & DevOps', description: 'Containerization, Dockerfiles, docker-compose, volume mapping', defaultDifficulty: 'Intermediate' },
  { id: 'sk-git', name: 'Git & GitHub', category: 'Developer Tools', description: 'Branching, PRs, merge conflicts, version control workflows', defaultDifficulty: 'Beginner' },
  { id: 'sk-react', name: 'React', category: 'Frameworks & Libraries', description: 'Components, hooks, state management, virtual DOM', defaultDifficulty: 'Intermediate' },
  { id: 'sk-nodejs', name: 'Node.js & Express', category: 'Frameworks & Libraries', description: 'Event loop, middleware, REST routing, npm ecosystem', defaultDifficulty: 'Intermediate' },
  { id: 'sk-postgres', name: 'PostgreSQL', category: 'Databases & Storage', description: 'ACID compliance, complex queries, JSONB, schema design', defaultDifficulty: 'Intermediate' },
  { id: 'sk-mongodb', name: 'MongoDB', category: 'Databases & Storage', description: 'Document schema design, aggregation pipelines, Mongoose', defaultDifficulty: 'Beginner' },
  { id: 'sk-redis', name: 'Redis', category: 'Databases & Storage', description: 'In-memory caching, key-value stores, pub/sub', defaultDifficulty: 'Intermediate' },
  { id: 'sk-pandas', name: 'Pandas & NumPy', category: 'Frameworks & Libraries', description: 'Data wrangling, matrix manipulation, series operations', defaultDifficulty: 'Intermediate' },
  { id: 'sk-tableau', name: 'Tableau / Power BI', category: 'Developer Tools', description: 'Business dashboards, KPI metrics, interactive reports', defaultDifficulty: 'Beginner' },
  { id: 'sk-scikit', name: 'Scikit-Learn', category: 'Frameworks & Libraries', description: 'Supervised & unsupervised ML, model evaluation, cross-validation', defaultDifficulty: 'Intermediate' },
  { id: 'sk-pytorch', name: 'PyTorch', category: 'Frameworks & Libraries', description: 'Tensors, autograd, neural network layers, training loops', defaultDifficulty: 'Advanced' },
  { id: 'sk-microservices', name: 'Microservices Architecture', category: 'Core Computer Science', description: 'Service discovery, API gateways, decoupled services', defaultDifficulty: 'Advanced' },
  { id: 'sk-dsa', name: 'Data Structures & Algorithms', category: 'Core Computer Science', description: 'Trees, graphs, dynamic programming, time/space complexity', defaultDifficulty: 'Intermediate' },
];

export const INITIAL_CAREER_ROLES: CareerRole[] = [
  {
    id: 'career-java-backend',
    title: 'Java Backend Developer',
    category: 'Backend Engineering',
    description: 'Build enterprise-grade server-side microservices, high-throughput APIs, and secure database persistence using modern Java and Spring ecosystem.',
    overview: 'Java Backend Developers architect and maintain scalable enterprise applications. They design RESTful services, configure database connections, ensure high availability, and write automated tests.',
    averageSalary: '$95,000 - $135,000',
    demandLevel: 'Very High',
    iconName: 'Server',
    minExperienceMonths: 0,
    requiredSkills: [
      { id: 'req-1', skillId: 'sk-java', skillName: 'Java', category: 'Programming Languages', importance: 'Required', weight: 25, minLevel: 'Advanced', prerequisites: [], description: 'Core OOP, Collections, Concurrency, Java 17+ features' },
      { id: 'req-2', skillId: 'sk-spring-boot', skillName: 'Spring Boot', category: 'Frameworks & Libraries', importance: 'Required', weight: 20, minLevel: 'Intermediate', prerequisites: ['Java'], description: 'Spring MVC, Spring Data JPA, Dependency Injection' },
      { id: 'req-3', skillId: 'sk-sql', skillName: 'SQL', category: 'Databases & Storage', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: [], description: 'Relational database querying, transactions, index optimization' },
      { id: 'req-4', skillId: 'sk-rest-api', skillName: 'RESTful APIs', category: 'Frameworks & Libraries', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: ['Java'], description: 'Designing REST endpoints, JSON payloads, HTTP status codes' },
      { id: 'req-5', skillId: 'sk-junit', skillName: 'JUnit & Mockito', category: 'Developer Tools', importance: 'Required', weight: 10, minLevel: 'Intermediate', prerequisites: ['Java'], description: 'Automated unit testing, mock repositories and services' },
      { id: 'req-6', skillId: 'sk-docker', skillName: 'Docker', category: 'Cloud & DevOps', importance: 'Preferred', weight: 8, minLevel: 'Beginner', prerequisites: [], description: 'Containerizing Spring Boot apps into reproducible images' },
      { id: 'req-7', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Developer Tools', importance: 'Required', weight: 7, minLevel: 'Beginner', prerequisites: [], description: 'Git version control, branches, Pull Requests' },
    ],
  },
  {
    id: 'career-fullstack',
    title: 'Full Stack Developer',
    category: 'Full Stack Web Development',
    description: 'Develop responsive client-side interfaces and scalable backend server APIs seamlessly connecting UI to databases.',
    overview: 'Full Stack Developers bridge the gap between front-of-house user experience and back-of-house data persistence and cloud deployment.',
    averageSalary: '$90,000 - $130,000',
    demandLevel: 'Very High',
    iconName: 'Code2',
    minExperienceMonths: 0,
    requiredSkills: [
      { id: 'req-fs-1', skillId: 'sk-js', skillName: 'JavaScript', category: 'Programming Languages', importance: 'Required', weight: 20, minLevel: 'Advanced', prerequisites: [], description: 'Modern JavaScript ESNext, async patterns' },
      { id: 'req-fs-2', skillId: 'sk-react', skillName: 'React', category: 'Frameworks & Libraries', importance: 'Required', weight: 20, minLevel: 'Intermediate', prerequisites: ['JavaScript', 'HTML & CSS'], description: 'Hooks, component architecture, state management' },
      { id: 'req-fs-3', skillId: 'sk-nodejs', skillName: 'Node.js & Express', category: 'Frameworks & Libraries', importance: 'Required', weight: 20, minLevel: 'Intermediate', prerequisites: ['JavaScript'], description: 'Server-side API routes, middleware, auth flow' },
      { id: 'req-fs-4', skillId: 'sk-sql', skillName: 'SQL', category: 'Databases & Storage', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: [], description: 'Relational databases and schema modeling' },
      { id: 'req-fs-5', skillId: 'sk-html-css', skillName: 'HTML & CSS', category: 'Programming Languages', importance: 'Required', weight: 10, minLevel: 'Intermediate', prerequisites: [], description: 'Responsive layouts, Tailwind, flexbox/grid' },
      { id: 'req-fs-6', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Developer Tools', importance: 'Required', weight: 8, minLevel: 'Beginner', prerequisites: [], description: 'Source control and team collaboration' },
      { id: 'req-fs-7', skillId: 'sk-docker', skillName: 'Docker', category: 'Cloud & DevOps', importance: 'Preferred', weight: 7, minLevel: 'Beginner', prerequisites: [], description: 'Containerization for consistent deployment' },
    ],
  },
  {
    id: 'career-data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    description: 'Transform raw enterprise datasets into actionable visual insights, interactive business dashboards, and statistical models.',
    overview: 'Data Analysts query large data warehouses, write complex SQL aggregations, build executive dashboards in BI tools, and explain metrics to cross-functional leaders.',
    averageSalary: '$75,000 - $105,000',
    demandLevel: 'High',
    iconName: 'BarChart3',
    minExperienceMonths: 0,
    requiredSkills: [
      { id: 'req-da-1', skillId: 'sk-sql', skillName: 'SQL', category: 'Databases & Storage', importance: 'Required', weight: 30, minLevel: 'Advanced', prerequisites: [], description: 'Advanced SQL, Window functions, CTEs, complex queries' },
      { id: 'req-da-2', skillId: 'sk-python', skillName: 'Python', category: 'Programming Languages', importance: 'Required', weight: 25, minLevel: 'Intermediate', prerequisites: [], description: 'Python for data manipulation and scripting' },
      { id: 'req-da-3', skillId: 'sk-pandas', skillName: 'Pandas & NumPy', category: 'Frameworks & Libraries', importance: 'Required', weight: 20, minLevel: 'Intermediate', prerequisites: ['Python'], description: 'Data wrangling, cleaning missing values, aggregations' },
      { id: 'req-da-4', skillId: 'sk-tableau', skillName: 'Tableau / Power BI', category: 'Developer Tools', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: [], description: 'Interactive visual reports and storytelling dashboards' },
      { id: 'req-da-5', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Developer Tools', importance: 'Preferred', weight: 10, minLevel: 'Beginner', prerequisites: [], description: 'Version controlling analysis scripts' },
    ],
  },
  {
    id: 'career-data-scientist',
    title: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Apply statistical methods, machine learning algorithms, and predictive modeling to extract high-value intelligence from complex datasets.',
    overview: 'Data Scientists combine mathematics, programming, and domain knowledge to formulate hypotheses, train predictive models, and validate experimental conclusions.',
    averageSalary: '$105,000 - $150,000',
    demandLevel: 'Very High',
    iconName: 'Cpu',
    minExperienceMonths: 0,
    requiredSkills: [
      { id: 'req-ds-1', skillId: 'sk-python', skillName: 'Python', category: 'Programming Languages', importance: 'Required', weight: 25, minLevel: 'Advanced', prerequisites: [], description: 'Python data science stack and mathematical computing' },
      { id: 'req-ds-2', skillId: 'sk-pandas', skillName: 'Pandas & NumPy', category: 'Frameworks & Libraries', importance: 'Required', weight: 20, minLevel: 'Advanced', prerequisites: ['Python'], description: 'High-performance vector operations and feature engineering' },
      { id: 'req-ds-3', skillId: 'sk-scikit', skillName: 'Scikit-Learn', category: 'Frameworks & Libraries', importance: 'Required', weight: 20, minLevel: 'Intermediate', prerequisites: ['Python', 'Pandas & NumPy'], description: 'Classification, regression, clustering, hyperparameter tuning' },
      { id: 'req-ds-4', skillId: 'sk-sql', skillName: 'SQL', category: 'Databases & Storage', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: [], description: 'Extracting and joining transactional datasets' },
      { id: 'req-ds-5', skillId: 'sk-dsa', skillName: 'Data Structures & Algorithms', category: 'Core Computer Science', importance: 'Preferred', weight: 10, minLevel: 'Intermediate', prerequisites: [], description: 'Computational efficiency and algorithm design' },
      { id: 'req-ds-6', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Developer Tools', importance: 'Required', weight: 10, minLevel: 'Beginner', prerequisites: [], description: 'Reproducible science and code tracking' },
    ],
  },
  {
    id: 'career-aiml-engineer',
    title: 'AI/ML Engineer',
    category: 'Artificial Intelligence',
    description: 'Architect deep neural networks, fine-tune generative AI models, build inference pipelines, and deploy production ML systems.',
    overview: 'AI/ML Engineers operationalize AI research into high-throughput production services, managing model serving, vector stores, and GPU deployment.',
    averageSalary: '$120,000 - $175,000',
    demandLevel: 'Very High',
    iconName: 'BrainCircuit',
    minExperienceMonths: 0,
    requiredSkills: [
      { id: 'req-ml-1', skillId: 'sk-python', skillName: 'Python', category: 'Programming Languages', importance: 'Required', weight: 20, minLevel: 'Advanced', prerequisites: [], description: 'Python systems programming, async pipelines' },
      { id: 'req-ml-2', skillId: 'sk-pytorch', skillName: 'PyTorch', category: 'Frameworks & Libraries', importance: 'Required', weight: 25, minLevel: 'Intermediate', prerequisites: ['Python'], description: 'Deep learning architectures, GPU acceleration, backpropagation' },
      { id: 'req-ml-3', skillId: 'sk-scikit', skillName: 'Scikit-Learn', category: 'Frameworks & Libraries', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: ['Python'], description: 'Baseline modeling, evaluation metrics, pipeline transformers' },
      { id: 'req-ml-4', skillId: 'sk-docker', skillName: 'Docker', category: 'Cloud & DevOps', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: [], description: 'Containerizing inference servers and CUDA environments' },
      { id: 'req-ml-5', skillId: 'sk-rest-api', skillName: 'RESTful APIs', category: 'Frameworks & Libraries', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: ['Python'], description: 'Serving model endpoints with FastAPI or Flask' },
      { id: 'req-ml-6', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Developer Tools', importance: 'Required', weight: 10, minLevel: 'Beginner', prerequisites: [], description: 'Version control and model versioning' },
    ],
  },
  {
    id: 'career-frontend-dev',
    title: 'Frontend Developer',
    category: 'Frontend Engineering',
    description: 'Design and engineer pixel-perfect, accessible, and fast web user interfaces with React, modern CSS, and component systems.',
    overview: 'Frontend Developers craft the visible software experience. They specialize in UI state synchronization, accessibility, performance optimization, and responsive design.',
    averageSalary: '$85,000 - $125,000',
    demandLevel: 'High',
    iconName: 'Layout',
    minExperienceMonths: 0,
    requiredSkills: [
      { id: 'req-fe-1', skillId: 'sk-html-css', skillName: 'HTML & CSS', category: 'Programming Languages', importance: 'Required', weight: 20, minLevel: 'Advanced', prerequisites: [], description: 'Semantic HTML5, CSS Grid/Flexbox, Tailwind CSS, accessibility' },
      { id: 'req-fe-2', skillId: 'sk-js', skillName: 'JavaScript', category: 'Programming Languages', importance: 'Required', weight: 25, minLevel: 'Advanced', prerequisites: ['HTML & CSS'], description: 'Modern JavaScript, async handling, DOM manipulation' },
      { id: 'req-fe-3', skillId: 'sk-ts', skillName: 'TypeScript', category: 'Programming Languages', importance: 'Required', weight: 15, minLevel: 'Intermediate', prerequisites: ['JavaScript'], description: 'Typed components, generic hooks, strict mode' },
      { id: 'req-fe-4', skillId: 'sk-react', skillName: 'React', category: 'Frameworks & Libraries', importance: 'Required', weight: 25, minLevel: 'Intermediate', prerequisites: ['JavaScript', 'HTML & CSS'], description: 'State management, custom hooks, component composition' },
      { id: 'req-fe-5', skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Developer Tools', importance: 'Required', weight: 10, minLevel: 'Beginner', prerequisites: [], description: 'Collaborative development and pull request reviews' },
      { id: 'req-fe-6', skillId: 'sk-rest-api', skillName: 'RESTful APIs', category: 'Frameworks & Libraries', importance: 'Preferred', weight: 5, minLevel: 'Beginner', prerequisites: ['JavaScript'], description: 'Fetching and synchronizing data via JSON REST endpoints' },
    ],
  },
];

interface DatabaseData {
  users: User[];
  profiles: StudentProfile[];
  skills: SkillDefinition[];
  studentSkills: StudentSkill[];
  careerRoles: CareerRole[];
  projects: StudentProject[];
  certifications: Certification[];
  internships: Internship[];
  roadmaps: Roadmap[];
  skillGaps: Record<string, SkillGapAnalysisResult>; // key: `${studentId}_${careerRoleId}`
  achievements: Achievement[];
  notifications: NotificationItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseData {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse db.json, re-initializing seed data', err);
      }
    }

    const seeded = this.createSeedData();
    this.saveData(seeded);
    return seeded;
  }

  private createSeedData(): DatabaseData {
    const studentPasswordHash = bcrypt.hashSync('password123', 10);
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);

    const studentUser: User = {
      id: 'usr-student-1',
      name: 'Alex Rivera',
      email: 'student@skilltrack.ai',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      createdAt: new Date('2026-08-15T10:00:00Z').toISOString(),
    };

    const adminUser: User = {
      id: 'usr-admin-1',
      name: 'Dr. Marcus Chen',
      email: 'admin@skilltrack.ai',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      createdAt: new Date('2026-08-01T08:00:00Z').toISOString(),
    };

    const studentProfile: StudentProfile = {
      id: 'prof-alex',
      userId: studentUser.id,
      name: 'Alex Rivera',
      email: 'student@skilltrack.ai',
      college: 'Pacific State University',
      major: 'Computer Science & Software Engineering',
      graduationYear: 2027,
      bio: 'Junior CS student passionate about backend systems, distributed architectures, and clean API design.',
      targetCareerId: 'career-java-backend',
      targetCareerTitle: 'Java Backend Developer',
      learningHoursPerWeek: 12,
      xp: 340,
      level: 3,
      badges: ['badge-first-skill', 'badge-first-project', 'badge-roadmap-starter', 'badge-certified-pro'],
      updatedAt: new Date().toISOString(),
    };

    // Pre-seeded skills for Alex matching the example in user request:
    // Current skills: Java (Advanced), SQL (Intermediate), HTML & CSS (Intermediate), Git (Beginner)
    const alexSkills: StudentSkill[] = [
      {
        id: 'ss-1',
        studentId: studentProfile.id,
        skillId: 'sk-java',
        skillName: 'Java',
        category: 'Programming Languages',
        level: 'Advanced',
        yearsOfExperience: 2.5,
        evidenceUrl: 'https://github.com/alexrivera/java-core-exercises',
        notes: 'Proficient in OOP design patterns, Multithreading, Streams, and JVM memory model.',
        relatedProjects: ['Personal Blog API'],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ss-2',
        studentId: studentProfile.id,
        skillId: 'sk-sql',
        skillName: 'SQL',
        category: 'Databases & Storage',
        level: 'Intermediate',
        yearsOfExperience: 1.5,
        evidenceUrl: 'https://github.com/alexrivera/ecommerce-database-schema',
        notes: 'Comfortable writing multi-table JOINs, group-by aggregations, and subqueries.',
        relatedProjects: ['Personal Blog API'],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ss-3',
        studentId: studentProfile.id,
        skillId: 'sk-html-css',
        skillName: 'HTML & CSS',
        category: 'Programming Languages',
        level: 'Intermediate',
        yearsOfExperience: 2,
        notes: 'Built accessible responsive UI pages with flexbox and grid.',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'ss-4',
        studentId: studentProfile.id,
        skillId: 'sk-git',
        skillName: 'Git & GitHub',
        category: 'Developer Tools',
        level: 'Beginner',
        yearsOfExperience: 1.5,
        notes: 'Daily git commits, branching, rebasing basics.',
        lastUpdated: new Date().toISOString(),
      },
    ];

    const alexProjects: StudentProject[] = [
      {
        id: 'proj-1',
        studentId: studentProfile.id,
        title: 'Personal Blog Engine API',
        description: 'A modular Java-based backend servicing article publishing, user comments, and relational database schema persistence.',
        technologies: ['Java', 'SQL', 'Git'],
        repoUrl: 'https://github.com/alexrivera/blog-engine-api',
        liveUrl: 'https://blog-api-preview.demo',
        status: 'Completed',
        verified: true,
        adminFeedback: 'Well-structured clean OOP code with decent separation of concerns.',
        createdAt: new Date('2026-08-20T12:00:00Z').toISOString(),
        completedAt: new Date('2026-09-02T14:30:00Z').toISOString(),
      },
    ];

    const alexCerts: Certification[] = [
      {
        id: 'cert-1',
        studentId: studentProfile.id,
        title: 'Oracle Certified Associate: Java SE 17 Developer',
        issuingOrganization: 'Oracle University',
        issueDate: '2026-06-15',
        credentialId: 'ORCL-9842104-SE',
        credentialUrl: 'https://catalog-education.oracle.com/pls/certview',
        skillsCovered: ['Java', 'Object-Oriented Programming'],
        verified: true,
        adminFeedback: 'Credential verified with Oracle certification register.',
        createdAt: new Date('2026-08-16T11:00:00Z').toISOString(),
      },
    ];

    const alexInternships: Internship[] = [
      {
        id: 'intern-1',
        studentId: studentProfile.id,
        company: 'NovaTech Solutions',
        role: 'Junior Backend Intern',
        location: 'San Jose, CA (Hybrid)',
        startDate: '2026-06-01',
        endDate: '2026-08-15',
        isCurrent: false,
        description: 'Assisted in writing SQL queries, diagnosing database bottleneck queries, and writing backend Java unit checks.',
        skillsUsed: ['Java', 'SQL', 'Git'],
        createdAt: new Date('2026-08-16T12:00:00Z').toISOString(),
      },
    ];

    const alexRoadmap: Roadmap = {
      id: 'rd-alex-java',
      studentId: studentProfile.id,
      careerRoleId: 'career-java-backend',
      careerRoleTitle: 'Java Backend Developer',
      title: 'Target Mastery: Java Backend Developer in 4 Weeks',
      summary: 'Targeted learning sequence closing high-priority skill gaps: Spring Boot, REST APIs, JUnit & Mockito, and Docker containerization.',
      durationWeeks: 4,
      totalTasks: 8,
      completedTasks: 3,
      status: 'Active',
      createdAt: new Date('2026-08-22T09:00:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
      weeks: [
        {
          weekNumber: 1,
          title: 'Advanced Java & Modern Architecture',
          objective: 'Solidify Java Streams, functional programming, and thread safety before diving into Spring framework.',
          tasks: [
            {
              id: 'task-1-1',
              roadmapId: 'rd-alex-java',
              weekNumber: 1,
              title: 'Java 17+ Collections & Streams Deep Dive',
              description: 'Practice complex map-filter-reduce operations, custom collectors, and parallel streams.',
              category: 'Core Concept',
              skillName: 'Java',
              estimatedHours: 4,
              status: 'Completed',
              dependencies: [],
              subtasks: ['Review List, Set, Map implementation trade-offs', 'Write 5 stream pipeline transformations', 'Benchmark stream vs traditional loop performance'],
              resources: [{ title: 'Modern Java In Action Guide', url: 'https://dev.java/learn/', type: 'Documentation' }],
              completedAt: new Date('2026-08-25T15:00:00Z').toISOString(),
            },
            {
              id: 'task-1-2',
              roadmapId: 'rd-alex-java',
              weekNumber: 1,
              title: 'Robust Exception Handling & Custom Hierarchies',
              description: 'Build enterprise checked vs unchecked exception trees with error response wrappers.',
              category: 'Core Concept',
              skillName: 'Java',
              estimatedHours: 3,
              status: 'Completed',
              dependencies: ['task-1-1'],
              milestone: true,
              milestoneName: 'Sprint 1 Milestone: Java Core Mastery',
              subtasks: ['Design base ApiException class', 'Map error codes to HTTP status conventions', 'Implement clean try-with-resources'],
              resources: [{ title: 'Oracle Java Exception Handling Guide', url: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/', type: 'Documentation' }],
              completedAt: new Date('2026-08-28T16:20:00Z').toISOString(),
            },
          ],
        },
        {
          weekNumber: 2,
          title: 'Spring Boot Foundations & REST APIs',
          objective: 'Master Spring Dependency Injection, Inversion of Control, and clean RESTful endpoint controller architecture.',
          tasks: [
            {
              id: 'task-2-1',
              roadmapId: 'rd-alex-java',
              weekNumber: 2,
              title: 'Spring Core DI & Application Context',
              description: 'Configure @Component, @Service, @Autowired, and understand bean lifecycle management.',
              category: 'Framework',
              skillName: 'Spring Boot',
              estimatedHours: 5,
              status: 'Completed',
              dependencies: ['task-1-1', 'task-1-2'],
              subtasks: ['Create Spring Boot starter project with Spring Initializr', 'Configure profile-based application.properties', 'Test constructor injection over field injection'],
              resources: [{ title: 'Spring Guides: Building a RESTful Web Service', url: 'https://spring.io/guides/gs/rest-service/', type: 'Interactive' }],
              completedAt: new Date('2026-09-05T18:00:00Z').toISOString(),
            },
            {
              id: 'task-2-2',
              roadmapId: 'rd-alex-java',
              weekNumber: 2,
              title: 'RESTful API Controllers & Validation',
              description: 'Build REST endpoints with @RestController, @PathVariable, @RequestBody, and Jakarta Bean Validation (@NotNull, @Email).',
              category: 'Framework',
              skillName: 'RESTful APIs',
              estimatedHours: 6,
              status: 'In Progress',
              dependencies: ['task-2-1'],
              milestone: true,
              milestoneName: 'Sprint 2 Milestone: RESTful Backend Architecture',
              subtasks: ['Implement GET/POST/PUT/DELETE for resource endpoints', 'Apply @Valid with MethodArgumentNotValidException handlers', 'Structure consistent JSON ApiResponse DTOs'],
              resources: [{ title: 'Spring REST Controller Specification', url: 'https://spring.io/guides/tutorials/rest/', type: 'Documentation' }],
            },
          ],
        },
        {
          weekNumber: 3,
          title: 'Database Integration & Project Development',
          objective: 'Connect Spring Data JPA with MySQL/PostgreSQL and build an end-to-end portfolio project.',
          tasks: [
            {
              id: 'task-3-1',
              roadmapId: 'rd-alex-java',
              weekNumber: 3,
              title: 'Spring Data JPA & Entity Relationships',
              description: 'Model @Entity, @Table, @OneToMany, and create CrudRepository / JpaRepository interfaces.',
              category: 'Framework',
              skillName: 'Spring Boot',
              estimatedHours: 6,
              status: 'Not Started',
              dependencies: ['task-2-1', 'task-2-2'],
              subtasks: ['Configure DataSource connection pool (HikariCP)', 'Define Student and Course relational entities', 'Implement custom derived query methods'],
              resources: [{ title: 'Accessing Data with JPA in Spring', url: 'https://spring.io/guides/gs/accessing-data-jpa/', type: 'Documentation' }],
            },
            {
              id: 'task-3-2',
              roadmapId: 'rd-alex-java',
              weekNumber: 3,
              title: 'Hands-on Project: Student Management REST API',
              description: 'Build an enterprise Student Management REST API practicing Spring Boot, Hibernate JPA, and MySQL.',
              category: 'Project',
              skillName: 'Spring Boot',
              estimatedHours: 8,
              status: 'Not Started',
              dependencies: ['task-3-1'],
              milestone: true,
              milestoneName: 'Sprint 3 Key Milestone: Alpha Portfolio Project',
              subtasks: ['Scaffold multi-layer project (Controller -> Service -> Repo)', 'Implement pagination and sorting via Pageable', 'Publish repository with README and Postman collection'],
              resources: [{ title: 'Full Stack Project Spec', url: 'https://spring.io', type: 'Project Spec' }],
            },
          ],
        },
        {
          weekNumber: 4,
          title: 'Automated Testing & Containerization',
          objective: 'Write comprehensive JUnit 5 & Mockito test suites and containerize the application with Docker.',
          tasks: [
            {
              id: 'task-4-1',
              roadmapId: 'rd-alex-java',
              weekNumber: 4,
              title: 'Automated Testing with JUnit 5 & Mockito',
              description: 'Write unit tests mocking repository dependencies with @Mock, @InjectMocks, and @SpringBootTest.',
              category: 'Testing & QA',
              skillName: 'JUnit & Mockito',
              estimatedHours: 5,
              status: 'Not Started',
              dependencies: ['task-3-2'],
              subtasks: ['Write unit tests for business calculation services', 'Mock database queries with Mockito.when()', 'Verify branch test coverage exceeds 75%'],
              resources: [{ title: 'Testing the Web Layer with Spring Boot', url: 'https://spring.io/guides/gs/testing-web/', type: 'Documentation' }],
            },
            {
              id: 'task-4-2',
              roadmapId: 'rd-alex-java',
              weekNumber: 4,
              title: 'Dockerizing Spring Boot & Multi-stage Builds',
              description: 'Write an optimized multi-stage Dockerfile packaging the JAR with JRE alpine image.',
              category: 'Deployment & DevOps',
              skillName: 'Docker',
              estimatedHours: 4,
              status: 'Not Started',
              dependencies: ['task-3-2', 'task-4-1'],
              milestone: true,
              milestoneName: 'Sprint 4 Final Milestone: Production Release',
              subtasks: ['Write multi-stage Dockerfile (build stage + runtime stage)', 'Compose multi-container app with docker-compose (App + MySQL)', 'Verify container healthcheck endpoints'],
              resources: [{ title: 'Spring Boot Docker Official Guide', url: 'https://spring.io/guides/topicals/spring-boot-docker/', type: 'Documentation' }],
            },
          ],
        },
      ],
    };

    const achievements: Achievement[] = [
      {
        id: 'ach-1',
        studentId: studentProfile.id,
        badgeId: 'badge-first-skill',
        title: 'First Skill Added',
        description: 'Documented your first technical skill on SkillTrack AI',
        icon: 'Sparkles',
        xpAwarded: 25,
        earnedAt: new Date('2026-08-15T10:30:00Z').toISOString(),
      },
      {
        id: 'ach-2',
        studentId: studentProfile.id,
        badgeId: 'badge-first-project',
        title: 'Project Builder',
        description: 'Showcased your first hands-on technical project',
        icon: 'FolderGit2',
        xpAwarded: 75,
        earnedAt: new Date('2026-08-20T12:00:00Z').toISOString(),
      },
      {
        id: 'ach-3',
        studentId: studentProfile.id,
        badgeId: 'badge-roadmap-starter',
        title: 'Roadmap Starter',
        description: 'Generated your first personalized career gap roadmap',
        icon: 'Compass',
        xpAwarded: 50,
        earnedAt: new Date('2026-08-22T09:05:00Z').toISOString(),
      },
      {
        id: 'ach-4',
        studentId: studentProfile.id,
        badgeId: 'badge-certified-pro',
        title: 'Certified Talent',
        description: 'Submitted an industry certification for career verification',
        icon: 'Award',
        xpAwarded: 75,
        earnedAt: new Date('2026-08-23T14:00:00Z').toISOString(),
      },
    ];

    const notifications: NotificationItem[] = [
      {
        id: 'notif-1',
        userId: studentUser.id,
        title: 'Welcome to SkillTrack AI!',
        message: 'Your profile has been created. Target career set to Java Backend Developer.',
        type: 'info',
        read: true,
        createdAt: new Date('2026-08-15T10:00:00Z').toISOString(),
      },
      {
        id: 'notif-2',
        userId: studentUser.id,
        title: 'Certification Verified',
        message: 'Admin verified your "Oracle Certified Associate: Java SE 17 Developer" credential (+25 XP).',
        type: 'success',
        read: false,
        createdAt: new Date('2026-08-24T10:00:00Z').toISOString(),
      },
      {
        id: 'notif-3',
        userId: studentUser.id,
        title: 'Roadmap Task Completed',
        message: 'You completed "Spring Core DI & Application Context" (+10 XP). Keep it up!',
        type: 'award',
        read: false,
        createdAt: new Date('2026-09-05T18:00:00Z').toISOString(),
      },
    ];

    return {
      users: [studentUser, adminUser],
      profiles: [studentProfile],
      skills: INITIAL_SKILLS,
      studentSkills: alexSkills,
      careerRoles: INITIAL_CAREER_ROLES,
      projects: alexProjects,
      certifications: alexCerts,
      internships: alexInternships,
      roadmaps: [alexRoadmap],
      skillGaps: {},
      achievements: achievements,
      notifications: notifications,
    };
  }

  public saveData(dataToSave?: DatabaseData): void {
    const data = dataToSave || this.data;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // Getters & Collections
  public getUsers(): User[] { return this.data.users; }
  public getProfiles(): StudentProfile[] { return this.data.profiles; }
  public getSkills(): SkillDefinition[] { return this.data.skills; }
  public getStudentSkills(studentId?: string): StudentSkill[] {
    if (!studentId) return this.data.studentSkills;
    return this.data.studentSkills.filter((s) => s.studentId === studentId);
  }
  public getCareerRoles(): CareerRole[] { return this.data.careerRoles; }
  public getProjects(studentId?: string): StudentProject[] {
    if (!studentId) return this.data.projects;
    return this.data.projects.filter((p) => p.studentId === studentId);
  }
  public getCertifications(studentId?: string): Certification[] {
    if (!studentId) return this.data.certifications;
    return this.data.certifications.filter((c) => c.studentId === studentId);
  }
  public getInternships(studentId?: string): Internship[] {
    if (!studentId) return this.data.internships;
    return this.data.internships.filter((i) => i.studentId === studentId);
  }
  public getRoadmaps(studentId?: string): Roadmap[] {
    if (!studentId) return this.data.roadmaps;
    return this.data.roadmaps.filter((r) => r.studentId === studentId);
  }
  public getAchievements(studentId?: string): Achievement[] {
    if (!studentId) return this.data.achievements;
    return this.data.achievements.filter((a) => a.studentId === studentId);
  }
  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  // Mutators with auto-save
  public addUser(user: User): void {
    this.data.users.push(user);
    this.saveData();
  }

  public addProfile(profile: StudentProfile): void {
    this.data.profiles.push(profile);
    this.saveData();
  }

  public updateProfile(profileId: string, updates: Partial<StudentProfile>): StudentProfile | null {
    const idx = this.data.profiles.findIndex((p) => p.id === profileId);
    if (idx === -1) return null;
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.profiles[idx];
  }

  public addStudentSkill(skill: StudentSkill): void {
    this.data.studentSkills.push(skill);
    this.saveData();
  }

  public updateStudentSkill(id: string, updates: Partial<StudentSkill>): StudentSkill | null {
    const idx = this.data.studentSkills.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.studentSkills[idx] = {
      ...this.data.studentSkills[idx],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData();
    return this.data.studentSkills[idx];
  }

  public deleteStudentSkill(id: string): boolean {
    const initialLen = this.data.studentSkills.length;
    this.data.studentSkills = this.data.studentSkills.filter((s) => s.id !== id);
    if (this.data.studentSkills.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  public addProject(project: StudentProject): void {
    this.data.projects.push(project);
    this.saveData();
  }

  public updateProject(id: string, updates: Partial<StudentProject>): StudentProject | null {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = { ...this.data.projects[idx], ...updates };
    this.saveData();
    return this.data.projects[idx];
  }

  public addCertification(cert: Certification): void {
    this.data.certifications.push(cert);
    this.saveData();
  }

  public updateCertification(id: string, updates: Partial<Certification>): Certification | null {
    const idx = this.data.certifications.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.certifications[idx] = { ...this.data.certifications[idx], ...updates };
    this.saveData();
    return this.data.certifications[idx];
  }

  public addInternship(internship: Internship): void {
    this.data.internships.push(internship);
    this.saveData();
  }

  public addRoadmap(roadmap: Roadmap): void {
    // archive other active roadmaps for this student & role
    this.data.roadmaps.forEach((r) => {
      if (r.studentId === roadmap.studentId && r.careerRoleId === roadmap.careerRoleId && r.status === 'Active') {
        r.status = 'Archived';
      }
    });
    this.data.roadmaps.unshift(roadmap);
    this.saveData();
  }

  public updateRoadmapTask(roadmapId: string, taskId: string, status: 'Not Started' | 'In Progress' | 'Completed'): { roadmap: Roadmap; task: any; xpEarned: number } | null {
    const roadmap = this.data.roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return null;

    let targetTask: any = null;
    let xpEarned = 0;

    for (const week of roadmap.weeks) {
      for (const task of week.tasks) {
        if (task.id === taskId) {
          const wasCompleted = task.status === 'Completed';
          task.status = status;
          if (status === 'Completed' && !wasCompleted) {
            task.completedAt = new Date().toISOString();
            xpEarned = 10;
          } else if (status !== 'Completed' && wasCompleted) {
            task.completedAt = undefined;
          }
          targetTask = task;
          break;
        }
      }
      if (targetTask) break;
    }

    if (!targetTask) return null;

    // Recalculate completed count
    let completedCount = 0;
    let totalCount = 0;
    for (const week of roadmap.weeks) {
      for (const t of week.tasks) {
        totalCount++;
        if (t.status === 'Completed') completedCount++;
      }
    }
    roadmap.completedTasks = completedCount;
    roadmap.totalTasks = totalCount;
    roadmap.updatedAt = new Date().toISOString();
    if (completedCount === totalCount && totalCount > 0) {
      roadmap.status = 'Completed';
      xpEarned += 100; // Roadmap completion bonus!
    }

    this.saveData();
    return { roadmap, task: targetTask, xpEarned };
  }

  public addCareerRole(role: CareerRole): void {
    this.data.careerRoles.push(role);
    this.saveData();
  }

  public updateCareerRole(id: string, updates: Partial<CareerRole>): CareerRole | null {
    const idx = this.data.careerRoles.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.careerRoles[idx] = { ...this.data.careerRoles[idx], ...updates };
    this.saveData();
    return this.data.careerRoles[idx];
  }

  public addAchievement(achievement: Achievement): void {
    this.data.achievements.push(achievement);
    this.saveData();
  }

  public addNotification(notification: NotificationItem): void {
    this.data.notifications.unshift(notification);
    this.saveData();
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
    }
  }

  public awardXP(studentProfileId: string, amount: number, reason: string): { newXP: number; newLevel: number; leveledUp: boolean } | null {
    const profile = this.data.profiles.find((p) => p.id === studentProfileId);
    if (!profile) return null;

    profile.xp += amount;
    const currentLevel = profile.level;
    const newLevel = Math.max(1, Math.floor(profile.xp / 100) + 1);
    const leveledUp = newLevel > currentLevel;
    profile.level = newLevel;

    if (amount > 0) {
      this.addNotification({
        id: `notif-xp-${Date.now()}`,
        userId: profile.userId,
        title: `+${amount} XP Earned!`,
        message: reason,
        type: 'award',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return { newXP: profile.xp, newLevel, leveledUp };
  }

  public checkAndAwardBadges(studentProfileId: string): Achievement[] {
    const profile = this.data.profiles.find((p) => p.id === studentProfileId);
    if (!profile) return [];

    const existingBadgeIds = new Set(this.data.achievements.filter((a) => a.studentId === studentProfileId).map((a) => a.badgeId));
    const newlyAwarded: Achievement[] = [];

    const skills = this.getStudentSkills(studentProfileId);
    const projects = this.getProjects(studentProfileId);
    const roadmaps = this.getRoadmaps(studentProfileId);
    const certs = this.getCertifications(studentProfileId);

    // First skill
    if (skills.length >= 1 && !existingBadgeIds.has('badge-first-skill')) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === 'badge-first-skill')!;
      const ach: Achievement = {
        id: `ach-${Date.now()}-1`,
        studentId: studentProfileId,
        badgeId: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        xpAwarded: def.xp,
        earnedAt: new Date().toISOString(),
      };
      this.addAchievement(ach);
      newlyAwarded.push(ach);
      this.awardXP(studentProfileId, def.xp, `Badge Unlocked: ${def.title}`);
    }

    // First project
    if (projects.length >= 1 && !existingBadgeIds.has('badge-first-project')) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === 'badge-first-project')!;
      const ach: Achievement = {
        id: `ach-${Date.now()}-2`,
        studentId: studentProfileId,
        badgeId: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        xpAwarded: def.xp,
        earnedAt: new Date().toISOString(),
      };
      this.addAchievement(ach);
      newlyAwarded.push(ach);
      this.awardXP(studentProfileId, def.xp, `Badge Unlocked: ${def.title}`);
    }

    // Roadmap starter
    if (roadmaps.length >= 1 && !existingBadgeIds.has('badge-roadmap-starter')) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === 'badge-roadmap-starter')!;
      const ach: Achievement = {
        id: `ach-${Date.now()}-3`,
        studentId: studentProfileId,
        badgeId: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        xpAwarded: def.xp,
        earnedAt: new Date().toISOString(),
      };
      this.addAchievement(ach);
      newlyAwarded.push(ach);
      this.awardXP(studentProfileId, def.xp, `Badge Unlocked: ${def.title}`);
    }

    // Skill builder (5+ skills)
    if (skills.length >= 5 && !existingBadgeIds.has('badge-skill-builder')) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === 'badge-skill-builder')!;
      const ach: Achievement = {
        id: `ach-${Date.now()}-4`,
        studentId: studentProfileId,
        badgeId: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        xpAwarded: def.xp,
        earnedAt: new Date().toISOString(),
      };
      this.addAchievement(ach);
      newlyAwarded.push(ach);
      this.awardXP(studentProfileId, def.xp, `Badge Unlocked: ${def.title}`);
    }

    // Certified pro
    if (certs.length >= 1 && !existingBadgeIds.has('badge-certified-pro')) {
      const def = BADGE_DEFINITIONS.find((b) => b.id === 'badge-certified-pro')!;
      const ach: Achievement = {
        id: `ach-${Date.now()}-5`,
        studentId: studentProfileId,
        badgeId: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        xpAwarded: def.xp,
        earnedAt: new Date().toISOString(),
      };
      this.addAchievement(ach);
      newlyAwarded.push(ach);
      this.awardXP(studentProfileId, def.xp, `Badge Unlocked: ${def.title}`);
    }

    return newlyAwarded;
  }
}

export const db = new Database();
