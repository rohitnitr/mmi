// Catalog structure and dummy mock data for MatchMyInterview JEE.
// Formulated & prepared by NITian mentors (NIT Rourkela) for upcoming NITians & IITians.

export type CatalogMockItem = {
  id: string
  title: string
  kind: 'full' | 'part' | 'sectional' | 'chapter'
  category: 'full_level' | 'class' | 'subject' | 'topic' | 'pyq'
  subCategory: string
  topic?: string
  classLevel?: number
  durationMinutes: number
  questionCount: number
  marks: number
  pricePaise: number
  isFree?: boolean
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Shift'
  badge?: string
  description: string
  highlights: string[]
  displayOrder: number
}

// 1. NITian Curated 3-Level Full Mocks
export const NITIAN_FULL_MOCKS: CatalogMockItem[] = [
  {
    id: 'nitian-full-level-1',
    title: 'Full Syllabus Mock Test — Selected by NITian (Level 1: Beginner)',
    kind: 'full',
    category: 'full_level',
    subCategory: 'beginner',
    durationMinutes: 180,
    questionCount: 75,
    marks: 300,
    pricePaise: 1100,
    difficulty: 'Beginner',
    badge: 'Level 1 · High Yield',
    description: 'Foundational difficulty full mock curated by NITians. Ideal for building exam confidence, formula recall, and timing strategy across all 75 questions.',
    highlights: ['Standard NTA pattern & marking scheme', 'Direct formula application & NCERT-aligned', 'Boosts accuracy & removes exam anxiety'],
    displayOrder: 1,
  },
  {
    id: 'nitian-full-level-2',
    title: 'Full Syllabus Mock Test — Selected by NITian (Level 2: Intermediate)',
    kind: 'full',
    category: 'full_level',
    subCategory: 'intermediate',
    durationMinutes: 180,
    questionCount: 75,
    marks: 300,
    pricePaise: 1100,
    difficulty: 'Intermediate',
    badge: 'Level 2 · Most Popular',
    description: 'Exact JEE Main NTA benchmark test. Multi-concept questions balancing speed and accuracy, formulated by top percentile NITian mentors.',
    highlights: ['Exact difficulty match for JEE Main morning/evening shifts', 'Mix of speed breakers and scoring sections', 'Pinpoints calculation traps & time wasters'],
    displayOrder: 2,
  },
  {
    id: 'nitian-full-level-3',
    title: 'Full Syllabus Mock Test — Selected by NITian (Level 3: Advanced)',
    kind: 'full',
    category: 'full_level',
    subCategory: 'advanced',
    durationMinutes: 180,
    questionCount: 75,
    marks: 300,
    pricePaise: 1100,
    difficulty: 'Advanced',
    badge: 'Level 3 · 99+ Percentile Challenge',
    description: 'Tougher-than-average full mock crafted to prepare candidates for worst-case difficult shifts. Emphasizes twisted numericals and deep multi-step concepts.',
    highlights: ['Sharpens question selection under pressure', 'Challenging section B numericals with tight tolerances', 'Built for aspirants targeting 99%ile and top NITs/IITs'],
    displayOrder: 3,
  },
]

// 2. Class-Wise Special Mocks
export const CLASS_WISE_MOCKS: CatalogMockItem[] = [
  {
    id: 'mock-class-11-special',
    title: 'Class 11 Special Mock Test',
    kind: 'part',
    category: 'class',
    subCategory: 'class11',
    classLevel: 11,
    durationMinutes: 180,
    questionCount: 75,
    marks: 300,
    pricePaise: 1100,
    difficulty: 'Intermediate',
    badge: 'Class 11 Focus',
    description: 'Comprehensive 75-question test covering entire Class 11 syllabus: Mechanics, GOC, Chemical Bonding, Calculus Foundations & Coordinate Geometry.',
    highlights: ['Fortifies the foundational 45% weightage of JEE', 'Identifies Class 11 backlogs before starting 12th', 'Detailed chapter-by-chapter scoring breakdown'],
    displayOrder: 10,
  },
  {
    id: 'mock-class-12-special',
    title: 'Class 12th Special Mock Test',
    kind: 'part',
    category: 'class',
    subCategory: 'class12',
    classLevel: 12,
    durationMinutes: 180,
    questionCount: 75,
    marks: 300,
    pricePaise: 1100,
    difficulty: 'Intermediate',
    badge: 'Class 12 Board + JEE',
    description: 'Covers entire Class 12 syllabus: Electrodynamics, Optics, Modern Physics, Calculus, Vectors/3D, Organic Reactions & Coordination Compounds.',
    highlights: ['Synchronized with board exam & JEE Main patterns', 'High concentration of 12th high-scoring units', 'Time management practice for 3-hour marathon'],
    displayOrder: 11,
  },
  {
    id: 'mock-dropper-special',
    title: 'Dropper Special Mock Test',
    kind: 'full',
    category: 'class',
    subCategory: 'dropper',
    durationMinutes: 180,
    questionCount: 75,
    marks: 300,
    pricePaise: 1100,
    difficulty: 'Advanced',
    badge: 'Droppers / Repeaters',
    description: 'Tailored for repeaters aiming for a massive percentile jump. Intense time pressure, high-speed problem selection, and rigorous negative marking trap detection.',
    highlights: ['Focuses on recurring repeat patterns and tricky question wordings', 'Tests stamina and mistake recovery', 'Full performance & percentile benchmarking'],
    displayOrder: 12,
  },
]

// 3. Subject-Wise Mocks (Physics Only, Chemistry Only, Mathematics Only)
export const SUBJECT_WISE_MOCKS: CatalogMockItem[] = [
  {
    id: 'mock-subject-physics',
    title: 'Physics Only — Sectional Mock Test',
    kind: 'sectional',
    category: 'subject',
    subCategory: 'physics',
    durationMinutes: 60,
    questionCount: 25,
    marks: 100,
    pricePaise: 1100,
    difficulty: 'Intermediate',
    badge: 'Physics Only',
    description: '25 high-probability Physics questions (20 MCQs + 5 Numericals) covering Mechanics, Electromagnetism, Optics and Modern Physics in 60 minutes.',
    highlights: ['Strict 60-minute single-subject speed test', 'Formula precision and unit dimension checks', 'Instant Physics subject rank & percentile'],
    displayOrder: 20,
  },
  {
    id: 'mock-subject-chemistry',
    title: 'Chemistry Only — Sectional Mock Test',
    kind: 'sectional',
    category: 'subject',
    subCategory: 'chemistry',
    durationMinutes: 60,
    questionCount: 25,
    marks: 100,
    pricePaise: 1100,
    difficulty: 'Intermediate',
    badge: 'Chemistry Only',
    description: '25 questions designed to test Physical calculations, Inorganic NCERT memory, and Organic reaction mechanisms under strict 60-minute timing.',
    highlights: ['Balanced Physical, Inorganic & Organic mix', 'Quick 40-50 minute finishing speed practice', 'Spot memory lapses in trend orders and catalysts'],
    displayOrder: 21,
  },
  {
    id: 'mock-subject-mathematics',
    title: 'Mathematics Only — Sectional Mock Test',
    kind: 'sectional',
    category: 'subject',
    subCategory: 'math',
    durationMinutes: 60,
    questionCount: 25,
    marks: 100,
    pricePaise: 1100,
    difficulty: 'Advanced',
    badge: 'Mathematics Only',
    description: '25 rigorous Math questions focusing on Calculus, 3D Geometry, Vectors, and Algebra. Teaches which 15-18 questions to grab and which to skip.',
    highlights: ['Calculus & 3D coordinate geometry dominance', 'Lengthy calculation shortcut techniques', 'Conquer the most score-differentiating section'],
    displayOrder: 22,
  },
]

// 4. Topic-Wise Mock Tree Structure (Layered)
export type TopicNode = {
  id: string
  title: string
  subject: 'Physics' | 'Chemistry' | 'Mathematics'
  questionCount: number
  durationMinutes: number
  pricePaise: number
  badge: string
  description: string
}

export const TOPIC_TREE: Record<'Physics' | 'Chemistry' | 'Mathematics', TopicNode[]> = {
  Physics: [
    {
      id: 'topic-phy-kinematics-mechanics',
      title: 'Kinematics, Laws of Motion & Work-Energy',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Mechanics',
      description: 'Projectiles, relative motion, friction, pulley systems, circular motion & conservation of energy.',
    },
    {
      id: 'topic-phy-rotational-gravitation',
      title: 'Center of Mass, Rotational Dynamics & Gravitation',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Rotation',
      description: 'Moment of inertia, torque, rolling motion, angular momentum conservation & planetary orbits.',
    },
    {
      id: 'topic-phy-thermo-ktg-fluids',
      title: 'Thermodynamics, KTG & Fluid Mechanics',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Thermal',
      description: 'First & Second laws, Carnot cycle, Bernoulli equation, surface tension & viscosity.',
    },
    {
      id: 'topic-phy-electrostatics-current',
      title: 'Electrostatics, Gauss Law & Current Electricity',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Electro',
      description: 'Coulomb law, dipole, electric flux, capacitors, Kirchhoff circuit analysis & meter bridges.',
    },
    {
      id: 'topic-phy-magnetism-emi-ac',
      title: 'Magnetism, EMI & Alternating Currents',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Magnetism',
      description: 'Biot-Savart law, Ampere law, Faraday induction, Lenz law, LCR resonant circuits & transformers.',
    },
    {
      id: 'topic-phy-optics-waves',
      title: 'Ray Optics, Wave Optics & Simple Harmonic Motion',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Optics',
      description: 'Lenses, prisms, mirrors, YDSE interference, diffraction, Doppler effect & damped oscillations.',
    },
    {
      id: 'topic-phy-modern-physics',
      title: 'Modern Physics, Nuclear Physics & Semiconductors',
      subject: 'Physics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Modern Physics',
      description: 'Photoelectric effect, de Broglie wavelength, Bohr model, radioactivity & logic gates/diodes.',
    },
  ],
  Chemistry: [
    {
      id: 'topic-chem-bonding-atomic',
      title: 'Chemical Bonding, Molecular Structure & Atomic Theory',
      subject: 'Chemistry',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Inorganic',
      description: 'VSEPR theory, hybridization, MOT diagrams, dipole moments & Bohr-Sommerfeld quantization.',
    },
    {
      id: 'topic-chem-equilibrium-thermo',
      title: 'Thermodynamics & Chemical/Ionic Equilibrium',
      subject: 'Chemistry',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Physical',
      description: 'Enthalpy, entropy, Gibbs free energy, Le Chatelier principle, pH of buffers & solubility products.',
    },
    {
      id: 'topic-chem-goc-hydrocarbons',
      title: 'General Organic Chemistry (GOC) & Hydrocarbons',
      subject: 'Chemistry',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Organic',
      description: 'Inductive/resonance effects, aromaticity, carbocation stability, Markovnikov addition & ozonolysis.',
    },
    {
      id: 'topic-chem-oxygen-nitrogen',
      title: 'Organic Compounds with Oxygen & Nitrogen',
      subject: 'Chemistry',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Organic',
      description: 'Aldol condensation, Cannizzaro, Grignard reagents, Diazonium coupling & Gabriel phthalimide.',
    },
    {
      id: 'topic-chem-coordination-dblock',
      title: 'Coordination Compounds & d- and f-Block Elements',
      subject: 'Chemistry',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Inorganic',
      description: 'Crystal field splitting, IUPAC nomenclature, isomerism, magnetic moments & lanthanoid contraction.',
    },
    {
      id: 'topic-chem-solutions-electrochem',
      title: 'Solutions, Colligative Properties & Electrochemistry',
      subject: 'Chemistry',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Physical',
      description: 'Raoult law, van\u2019t Hoff factor, Nernst equation, conductance, Kohlrausch law & battery cells.',
    },
  ],
  Mathematics: [
    {
      id: 'topic-math-calculus-diff',
      title: 'Differential Calculus & Application of Derivatives',
      subject: 'Mathematics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Calculus',
      description: 'Limits, continuity, differentiability, tangents/normals, maxima/minima & Rolle/Lagrange theorems.',
    },
    {
      id: 'topic-math-calculus-integral',
      title: 'Integral Calculus & Differential Equations',
      subject: 'Mathematics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Calculus',
      description: 'Definite integrals with properties, area under curves, exact differential forms & linear ODEs.',
    },
    {
      id: 'topic-math-algebra-matrices',
      title: 'Matrices, Determinants & Quadratic Equations',
      subject: 'Mathematics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Algebra',
      description: 'Inverse of matrices, system of linear equations, Cramer rule, roots of quadratics & transformations.',
    },
    {
      id: 'topic-math-vectors-3d',
      title: 'Vector Algebra & 3-Dimensional Geometry',
      subject: 'Mathematics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Vectors & 3D',
      description: 'Dot/cross products, scalar triple product, shortest distance between skew lines & coplanarity.',
    },
    {
      id: 'topic-math-coordinate-geometry',
      title: 'Coordinate Geometry (Lines, Circles & Conic Sections)',
      subject: 'Mathematics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Geometry',
      description: 'Family of straight lines, orthogonal circles, tangents to parabola, ellipse and hyperbola.',
    },
    {
      id: 'topic-math-pnc-probability',
      title: 'Permutations, Combinations & Probability',
      subject: 'Mathematics',
      questionCount: 15,
      durationMinutes: 45,
      pricePaise: 1100,
      badge: 'Probability',
      description: 'Arrangements, derangements, multinomial theorem, Bayes theorem & conditional probability distributions.',
    },
  ],
}

// 5. Free Previous Year Questions (PYQs 2020 - 2026) Tree Data
export type PyqShift = {
  shiftNumber: 1 | 2
  shiftName: string
  timeSlot: string
  testId: string
  title: string
}

export type PyqDateGroup = {
  dateKey: string
  displayDate: string
  shifts: PyqShift[]
}

export type PyqYearGroup = {
  year: number
  totalPapers: number
  dates: PyqDateGroup[]
}

export const PYQ_YEAR_DATA: PyqYearGroup[] = [
  {
    year: 2026,
    totalPapers: 10,
    dates: [
      {
        dateKey: '2026-01-24',
        displayDate: '24 January 2026',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2026-01-24-s1', title: 'JEE Main 2026 — 24 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2026-01-24-s2', title: 'JEE Main 2026 — 24 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2026-01-27',
        displayDate: '27 January 2026',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2026-01-27-s1', title: 'JEE Main 2026 — 27 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2026-01-27-s2', title: 'JEE Main 2026 — 27 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2026-01-29',
        displayDate: '29 January 2026',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2026-01-29-s1', title: 'JEE Main 2026 — 29 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2026-01-29-s2', title: 'JEE Main 2026 — 29 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2026-01-31',
        displayDate: '31 January 2026',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2026-01-31-s1', title: 'JEE Main 2026 — 31 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2026-01-31-s2', title: 'JEE Main 2026 — 31 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2026-02-01',
        displayDate: '01 February 2026',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2026-02-01-s1', title: 'JEE Main 2026 — 01 Feb Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2026-02-01-s2', title: 'JEE Main 2026 — 01 Feb Shift 2' },
        ],
      },
    ],
  },
  {
    year: 2025,
    totalPapers: 12,
    dates: [
      {
        dateKey: '2025-01-27',
        displayDate: '27 January 2025 (Session 1)',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2025-01-27-s1', title: 'JEE Main 2025 — 27 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2025-01-27-s2', title: 'JEE Main 2025 — 27 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2025-01-29',
        displayDate: '29 January 2025 (Session 1)',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2025-01-29-s1', title: 'JEE Main 2025 — 29 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2025-01-29-s2', title: 'JEE Main 2025 — 29 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2025-01-31',
        displayDate: '31 January 2025 (Session 1)',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2025-01-31-s1', title: 'JEE Main 2025 — 31 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2025-01-31-s2', title: 'JEE Main 2025 — 31 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2025-04-04',
        displayDate: '04 April 2025 (Session 2)',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2025-04-04-s1', title: 'JEE Main 2025 — 04 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2025-04-04-s2', title: 'JEE Main 2025 — 04 Apr Shift 2' },
        ],
      },
      {
        dateKey: '2025-04-06',
        displayDate: '06 April 2025 (Session 2)',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2025-04-06-s1', title: 'JEE Main 2025 — 06 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2025-04-06-s2', title: 'JEE Main 2025 — 06 Apr Shift 2' },
        ],
      },
      {
        dateKey: '2025-04-08',
        displayDate: '08 April 2025 (Session 2)',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2025-04-08-s1', title: 'JEE Main 2025 — 08 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2025-04-08-s2', title: 'JEE Main 2025 — 08 Apr Shift 2' },
        ],
      },
    ],
  },
  {
    year: 2024,
    totalPapers: 10,
    dates: [
      {
        dateKey: '2024-01-27',
        displayDate: '27 January 2024',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2024-01-27-s1', title: 'JEE Main 2024 — 27 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2024-01-27-s2', title: 'JEE Main 2024 — 27 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2024-01-29',
        displayDate: '29 January 2024',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2024-01-29-s1', title: 'JEE Main 2024 — 29 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2024-01-29-s2', title: 'JEE Main 2024 — 29 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2024-01-31',
        displayDate: '31 January 2024',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2024-01-31-s1', title: 'JEE Main 2024 — 31 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2024-01-31-s2', title: 'JEE Main 2024 — 31 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2024-04-05',
        displayDate: '05 April 2024',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2024-04-05-s1', title: 'JEE Main 2024 — 05 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2024-04-05-s2', title: 'JEE Main 2024 — 05 Apr Shift 2' },
        ],
      },
      {
        dateKey: '2024-04-08',
        displayDate: '08 April 2024',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2024-04-08-s1', title: 'JEE Main 2024 — 08 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2024-04-08-s2', title: 'JEE Main 2024 — 08 Apr Shift 2' },
        ],
      },
    ],
  },
  {
    year: 2023,
    totalPapers: 8,
    dates: [
      {
        dateKey: '2023-01-24',
        displayDate: '24 January 2023',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2023-01-24-s1', title: 'JEE Main 2023 — 24 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2023-01-24-s2', title: 'JEE Main 2023 — 24 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2023-01-29',
        displayDate: '29 January 2023',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2023-01-29-s1', title: 'JEE Main 2023 — 29 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2023-01-29-s2', title: 'JEE Main 2023 — 29 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2023-04-08',
        displayDate: '08 April 2023',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2023-04-08-s1', title: 'JEE Main 2023 — 08 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2023-04-08-s2', title: 'JEE Main 2023 — 08 Apr Shift 2' },
        ],
      },
      {
        dateKey: '2023-04-11',
        displayDate: '11 April 2023',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2023-04-11-s1', title: 'JEE Main 2023 — 11 Apr Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2023-04-11-s2', title: 'JEE Main 2023 — 11 Apr Shift 2' },
        ],
      },
    ],
  },
  {
    year: 2022,
    totalPapers: 6,
    dates: [
      {
        dateKey: '2022-06-25',
        displayDate: '25 June 2022',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2022-06-25-s1', title: 'JEE Main 2022 — 25 Jun Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2022-06-25-s2', title: 'JEE Main 2022 — 25 Jun Shift 2' },
        ],
      },
      {
        dateKey: '2022-06-27',
        displayDate: '27 June 2022',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2022-06-27-s1', title: 'JEE Main 2022 — 27 Jun Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2022-06-27-s2', title: 'JEE Main 2022 — 27 Jun Shift 2' },
        ],
      },
      {
        dateKey: '2022-07-26',
        displayDate: '26 July 2022',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2022-07-26-s1', title: 'JEE Main 2022 — 26 Jul Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2022-07-26-s2', title: 'JEE Main 2022 — 26 Jul Shift 2' },
        ],
      },
    ],
  },
  {
    year: 2021,
    totalPapers: 6,
    dates: [
      {
        dateKey: '2021-02-24',
        displayDate: '24 February 2021',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2021-02-24-s1', title: 'JEE Main 2021 — 24 Feb Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2021-02-24-s2', title: 'JEE Main 2021 — 24 Feb Shift 2' },
        ],
      },
      {
        dateKey: '2021-03-16',
        displayDate: '16 March 2021',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2021-03-16-s1', title: 'JEE Main 2021 — 16 Mar Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2021-03-16-s2', title: 'JEE Main 2021 — 16 Mar Shift 2' },
        ],
      },
      {
        dateKey: '2021-07-22',
        displayDate: '22 July 2021',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2021-07-22-s1', title: 'JEE Main 2021 — 22 Jul Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2021-07-22-s2', title: 'JEE Main 2021 — 22 Jul Shift 2' },
        ],
      },
    ],
  },
  {
    year: 2020,
    totalPapers: 4,
    dates: [
      {
        dateKey: '2020-01-08',
        displayDate: '08 January 2020',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2020-01-08-s1', title: 'JEE Main 2020 — 08 Jan Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2020-01-08-s2', title: 'JEE Main 2020 — 08 Jan Shift 2' },
        ],
      },
      {
        dateKey: '2020-09-03',
        displayDate: '03 September 2020',
        shifts: [
          { shiftNumber: 1, shiftName: 'Shift 1', timeSlot: '09:00 AM – 12:00 PM', testId: 'pyq-2020-09-03-s1', title: 'JEE Main 2020 — 03 Sep Shift 1' },
          { shiftNumber: 2, shiftName: 'Shift 2', timeSlot: '03:00 PM – 06:00 PM', testId: 'pyq-2020-09-03-s2', title: 'JEE Main 2020 — 03 Sep Shift 2' },
        ],
      },
    ],
  },
]
