/**
 * Standard curriculum subjects mapping per school class
 * Automatically populates subject slots when generating exam routines
 */
export const DEFAULT_CLASS_SUBJECTS: Record<string, string[]> = {
  'Playgroup': [
    'Bangla Oral & Rhymes',
    'English Alphabet & Rhymes',
    'Basic Numbers & Counting',
    'Drawing & Color Recognition',
  ],
  'Nursery': [
    'Bangla Oral & Written',
    'English Oral & Written',
    'Elementary Mathematics',
    'General Knowledge & Rhymes',
    'Drawing & Craft',
  ],
  'Kindergarten (KG)': [
    'Amar Bangla Boi',
    'English for Today',
    'Elementary Mathematics',
    'Science & Environment',
    'Drawing & Handwriting',
  ],
  'Class 1': [
    'Amar Bangla Boi',
    'English For Today',
    'Elementary Mathematics',
    'Environmental Studies',
    'Drawing',
  ],
  'Class 2': [
    'Amar Bangla Boi',
    'English For Today',
    'Elementary Mathematics',
    'Environmental Studies',
    'Drawing & Handwriting',
  ],
  'Class 3': [
    'Bangla',
    'English',
    'Elementary Mathematics',
    'Primary Science',
    'Bangladesh and Global Studies',
    'Islam / Hindu Religion',
  ],
  'Class 4': [
    'Bangla',
    'English',
    'Elementary Mathematics',
    'Primary Science',
    'Bangladesh and Global Studies',
    'Islam / Hindu Religion',
  ],
  'Class 5': [
    'Bangla',
    'English',
    'Elementary Mathematics',
    'Primary Science',
    'Bangladesh and Global Studies',
    'Religious & Moral Education',
  ],
  'Class 6': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'Mathematics',
    'General Science',
    'Bangladesh and Global Studies',
    'ICT',
    'Religious Studies',
  ],
  'Class 7': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'Mathematics',
    'General Science',
    'Bangladesh and Global Studies',
    'ICT',
    'Religious Studies',
  ],
  'Class 8': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'General Mathematics',
    'General Science',
    'Bangladesh and Global Studies',
    'Information & Communication Technology (ICT)',
    'Religious Studies',
  ],
  'Class 9 (Science)': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'General Mathematics',
    'Higher Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'ICT',
  ],
  'Class 9 (Business)': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'General Mathematics',
    'Accounting',
    'Finance & Banking',
    'Business Organization',
    'General Science',
    'ICT',
  ],
  'Class 9 (Humanities)': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'General Mathematics',
    'Geography & Environment',
    'History of Bangladesh & World Civ',
    'Civics & Citizenship',
    'Economics',
    'ICT',
  ],
  'Class 10 (SSC Batch)': [
    'Bangla 1st Paper',
    'Bangla 2nd Paper',
    'English 1st Paper',
    'English 2nd Paper',
    'General Mathematics',
    'Higher Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Information & Communication Technology (ICT)',
  ],
};

/**
 * Fallback subjects for custom or dynamically created classes
 */
export const GENERIC_SUBJECT_LIST = [
  'Bangla',
  'English',
  'General Mathematics',
  'General Science',
  'Social Studies / BGS',
  'Religious Studies',
  'ICT',
];

/**
 * Helper to get default subject array for a given class name
 */
export const getSubjectsForClass = (className: string): string[] => {
  // Direct match
  if (DEFAULT_CLASS_SUBJECTS[className]) {
    return [...DEFAULT_CLASS_SUBJECTS[className]];
  }

  // Fuzzy match (e.g. "Class 10" matches "Class 10 (SSC Batch)", "Class 9" matches "Class 9 (Science)")
  const lower = className.toLowerCase();
  for (const [key, subjects] of Object.entries(DEFAULT_CLASS_SUBJECTS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return [...subjects];
    }
  }

  if (lower.includes('play')) return [...DEFAULT_CLASS_SUBJECTS['Playgroup']];
  if (lower.includes('nur')) return [...DEFAULT_CLASS_SUBJECTS['Nursery']];
  if (lower.includes('kg') || lower.includes('kinder')) return [...DEFAULT_CLASS_SUBJECTS['Kindergarten (KG)']];
  if (lower.includes('10') || lower.includes('ssc')) return [...DEFAULT_CLASS_SUBJECTS['Class 10 (SSC Batch)']];
  if (lower.includes('9') && lower.includes('sci')) return [...DEFAULT_CLASS_SUBJECTS['Class 9 (Science)']];
  if (lower.includes('9') && lower.includes('bus')) return [...DEFAULT_CLASS_SUBJECTS['Class 9 (Business)']];
  if (lower.includes('8') || lower.includes('jsc')) return [...DEFAULT_CLASS_SUBJECTS['Class 8']];
  if (lower.includes('5') || lower.includes('psc')) return [...DEFAULT_CLASS_SUBJECTS['Class 5']];
  if (lower.includes('2')) return [...DEFAULT_CLASS_SUBJECTS['Class 2']];
  if (lower.includes('1')) return [...DEFAULT_CLASS_SUBJECTS['Class 1']];

  return [...GENERIC_SUBJECT_LIST];
};
