export type AppLanguage = 'en' | 'bn' | 'hi';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US / UK)',
    flag: '🇬🇧',
    description: 'Clean English across all modules, forms, reports, and ID cards.',
  },
  {
    code: 'hi',
    name: 'Hindi (India)',
    nativeName: 'Hindi (India)',
    flag: '🇮🇳',
    description: 'Interface and reports in Hindi.',
  },
];

export interface TimezoneOption {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  label: string;
  offset: string;
  flag: string;
}

export const SUPPORTED_TIMEZONES: TimezoneOption[] = [
  {
    id: 'Asia/Dhaka',
    country: 'Bangladesh',
    countryCode: 'BD',
    city: 'Dhaka',
    label: 'Bangladesh Standard Time (BST) — Dhaka',
    offset: 'GMT+6:00',
    flag: '🇧🇩',
  },
  {
    id: 'Asia/Kolkata',
    country: 'India',
    countryCode: 'IN',
    city: 'New Delhi / Kolkata / Mumbai',
    label: 'India Standard Time (IST) — New Delhi, Mumbai, Kolkata',
    offset: 'GMT+5:30',
    flag: '🇮🇳',
  },
  {
    id: 'Asia/Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    city: 'Dubai / Abu Dhabi',
    label: 'Gulf Standard Time (GST) — Dubai, Abu Dhabi',
    offset: 'GMT+4:00',
    flag: '🇦🇪',
  },
  {
    id: 'Asia/Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    city: 'Riyadh / Jeddah / Makkah',
    label: 'Arabia Standard Time (AST) — Riyadh, Makkah',
    offset: 'GMT+3:00',
    flag: '🇸🇦',
  },
  {
    id: 'Asia/Qatar',
    country: 'Qatar',
    countryCode: 'QA',
    city: 'Doha',
    label: 'Arabia Standard Time (AST) — Doha',
    offset: 'GMT+3:00',
    flag: '🇶🇦',
  },
  {
    id: 'Asia/Kuwait',
    country: 'Kuwait',
    countryCode: 'KW',
    city: 'Kuwait City',
    label: 'Arabia Standard Time (AST) — Kuwait City',
    offset: 'GMT+3:00',
    flag: '🇰🇼',
  },
  {
    id: 'Asia/Muscat',
    country: 'Oman',
    countryCode: 'OM',
    city: 'Muscat',
    label: 'Gulf Standard Time (GST) — Muscat',
    offset: 'GMT+4:00',
    flag: '🇴🇲',
  },
  {
    id: 'Europe/London',
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    label: 'Greenwich Mean Time / BST — London',
    offset: 'GMT+0:00 / GMT+1:00',
    flag: '🇬🇧',
  },
  {
    id: 'America/New_York',
    country: 'United States',
    countryCode: 'US',
    city: 'New York (Eastern)',
    label: 'Eastern Time (ET) — New York, Washington D.C.',
    offset: 'GMT-5:00 / GMT-4:00',
    flag: '🇺🇸',
  },
  {
    id: 'America/Chicago',
    country: 'United States',
    countryCode: 'US',
    city: 'Chicago (Central)',
    label: 'Central Time (CT) — Chicago, Dallas',
    offset: 'GMT-6:00 / GMT-5:00',
    flag: '🇺🇸',
  },
  {
    id: 'America/Los_Angeles',
    country: 'United States',
    countryCode: 'US',
    city: 'Los Angeles (Pacific)',
    label: 'Pacific Time (PT) — Los Angeles, San Francisco',
    offset: 'GMT-8:00 / GMT-7:00',
    flag: '🇺🇸',
  },
  {
    id: 'America/Toronto',
    country: 'Canada',
    countryCode: 'CA',
    city: 'Toronto',
    label: 'Eastern Time (ET) — Toronto, Montreal',
    offset: 'GMT-5:00',
    flag: '🇨🇦',
  },
  {
    id: 'Asia/Singapore',
    country: 'Singapore / Malaysia',
    countryCode: 'SG',
    city: 'Singapore / Kuala Lumpur',
    label: 'Singapore Time (SGT) — Singapore, Kuala Lumpur',
    offset: 'GMT+8:00',
    flag: '🇸🇬',
  },
  {
    id: 'Asia/Karachi',
    country: 'Pakistan',
    countryCode: 'PK',
    city: 'Islamabad / Karachi',
    label: 'Pakistan Standard Time (PKT) — Karachi, Islamabad',
    offset: 'GMT+5:00',
    flag: '🇵🇰',
  },
  {
    id: 'Asia/Kathmandu',
    country: 'Nepal',
    countryCode: 'NP',
    city: 'Kathmandu',
    label: 'Nepal Time (NPT) — Kathmandu',
    offset: 'GMT+5:45',
    flag: '🇳🇵',
  },
  {
    id: 'Australia/Sydney',
    country: 'Australia',
    countryCode: 'AU',
    city: 'Sydney / Melbourne',
    label: 'Australian Eastern Time (AEST) — Sydney, Melbourne',
    offset: 'GMT+10:00 / GMT+11:00',
    flag: '🇦🇺',
  },
  {
    id: 'Europe/Berlin',
    country: 'Germany / EU',
    countryCode: 'DE',
    city: 'Berlin / Paris',
    label: 'Central European Time (CET) — Berlin, Paris',
    offset: 'GMT+1:00 / GMT+2:00',
    flag: '🇩🇪',
  },
  {
    id: 'Asia/Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    city: 'Tokyo',
    label: 'Japan Standard Time (JST) — Tokyo',
    offset: 'GMT+9:00',
    flag: '🇯🇵',
  },
];

const enTranslations: Record<string, string> = {
    // Navigation Parents
    'nav.dashboard': 'Dashboard',
    'nav.shareholders': 'Shareholders',
    'nav.attendance': 'Attendance',
    'nav.staff': 'Staff Management',
    'nav.class': 'Class & Department',
    'nav.routine': 'Routine',
    'nav.subject': 'Subject',
    'nav.academic': 'Academic',
    'nav.diary': 'Daily Diary',
    'nav.student': 'Students',
    'nav.exam': 'Exam & Results',
    'nav.finances': 'Finances & Accounts',
    'nav.notices': 'Notices & Circulars',

    // Navigation Subitems
    'dashboard-overview': 'Dashboard Overview',
    'shareholder-add': 'Add Shareholder',
    'shareholder-list': 'Shareholder Directory',
    'attendance-staff': 'Staff Attendance',
    'attendance-student': 'Student Attendance',
    'attendance-qr': 'QR Code Attendance',
    'staff-add': 'Add Staff Member',
    'staff-list': 'Staff Directory',
    'class-add': 'Add Class',
    'class-list': 'Class List',
    'class-routine-add': 'Add Class Routine',
    'class-routine-list': 'Routine List',
    'subject-add': 'Add Subject',
    'subject-list': 'Subject List',
    'class-department': 'Department Management',
    'academic-calendar': 'Academic Calendar',
    'diary-add': 'Add Daily Diary',
    'diary-list': 'Diary Log',
    'student-add': 'Add Student',
    'student-list': 'Student Directory',
    'student-admit-card': 'Admit Card Generator',
    'exam-routine': 'Exam Routine',
    'exam-manage': 'Manage Exams',
    'exam-results': 'Exam Results & Marks',
    'finance-fund-transfer': 'Fund Transfer',
    'finance-salary': 'Teacher & Staff Salary',
    'finance-exam-fee': 'Exam Fee',
    'finance-monthly-fee': 'Monthly Tuition Fee',
    'finance-donation': 'Donations & Grants',
    'finance-daycare-fee': 'Day Care Fee',
    'finance-others': 'Other Income & Expenses',
    'notice-new': 'Publish Notice',
    'notice-board': 'Notice Board',

    // Common Actions
    'action.save': 'Save Changes',
    'action.cancel': 'Cancel',
    'action.create': 'Create',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.back': 'Back',
    'action.print': 'Print',
    'action.export': 'Export',
    'action.filter': 'Filter',
    'action.search': 'Search',
    'action.reset': 'Reset',
    'action.close': 'Close',
    'action.submit': 'Submit',
    'action.view': 'View',
    'action.actions': 'Actions',
    'action.status': 'Status',
    'action.details': 'Details',
    'action.refresh': 'Refresh',

    // Statuses
    'status.all': 'All',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.present': 'Present',
    'status.absent': 'Absent',
    'status.late': 'Late',
    'status.leave': 'Leave',
    'status.completed': 'Completed',
    'status.pending': 'Pending',
    'status.paid': 'Paid',
    'status.unpaid': 'Unpaid',

    // Header & Profile
    'header.search_placeholder': 'Search students, faculty, classes, notices...',
    'header.ctrl_k': 'Ctrl K',
    'header.notifications': 'Notifications',
    'header.my_profile': 'My Profile',
    'header.settings': 'System & Account Settings',
    'header.change_password': 'Change Password',
    'header.logout': 'Sign Out',
    'header.language': 'Language',
    'header.timezone': 'Timezone',
    'header.quick_switch_lang': 'Switch Language',

    // Settings Modal
    'settings.title': 'Institution & System Settings',
    'settings.tab_identity': 'Identity & Logo',
    'settings.tab_contact': 'Address & Contact',
    'settings.tab_session': 'Session & Defaults',
    'settings.tab_language': 'Language & Timezone',
    'settings.lang_heading': 'Interface Language',
    'settings.lang_subheading': 'Choose the display language for menus, labels, forms, and statements.',
    'settings.tz_heading': 'Country & Timezone System',
    'settings.tz_subheading': 'Select your country and regional timezone to sync live clocks, timestamps, and reports.',
    'settings.preview_time': 'Current Time in Selected Timezone:',
    'settings.school_name': 'School / College Display Name',
    'settings.institution_name': 'Institution Full Legal Name',
    'settings.institution_type': 'Institution Type',
    'settings.tagline': 'Motto / Tagline',
    'settings.estd_year': 'Established Year',
    'settings.eiin': 'EIIN / Registration Code',
    'settings.currency': 'Currency Symbol',
    'settings.save_btn': 'Save All Settings',

    // Department Module
    'dept.title': 'Department Management',
    'dept.subtitle': 'Manage subject-wise academic departments, assign faculty heads, and track staff distribution across school disciplines.',
    'dept.create_btn': 'Create Department',
    'dept.total_count': 'Total Departments',
    'dept.academic_count': 'Subject Departments',
    'dept.faculty_assigned': 'Assigned Faculty',
    'dept.admin_count': 'Admin & Support Units',
    'dept.search_placeholder': 'Search department name, code, or HOD...',
    'dept.cat_all': 'All',
    'dept.cat_academic': 'Academic Subjects',
    'dept.cat_administrative': 'Administrative',
    'dept.cat_support': 'Support & Facilities',
    'dept.cat_vocational': 'Vocational & Activities',
    'dept.name_label': 'Department Name (Primary)',
    'dept.bengali_name_label': 'Department Name (Secondary / Alternate)',
    'dept.code_label': 'Department Code',
    'dept.category_label': 'Category',
    'dept.hod_label': 'Head of Department',
    'dept.email_label': 'Contact Email',
    'dept.description_label': 'Description',
    'dept.status_label': 'Status',
    'dept.save_create': 'Create Department',
    'dept.save_edit': 'Save Changes',

    // Exam Results & Filters
    'exam.title': 'Student Examination Results & Transcripts',
    'exam.subtitle': 'Automated GPA calculation, letter grading, pass/fail status & official report cards',
    'exam.enter_marks': 'Enter Student Marks',
    'exam.search_placeholder': 'Search student name, roll number, ID, or remarks...',
    'exam.filter_all_students': 'All Students',
    'exam.filter_all_terms': 'All Exam Terms',
    'exam.filter_all_results': 'All Result Statuses',
    'exam.filter_passed': 'Passed Only',
    'exam.filter_failed': 'Failed / Retake',
    'exam.filter_all_classes': 'All Classes',
    'exam.filter_all_grades': 'All Grades',
    'exam.filter_reset': 'Reset Filters',
    'exam.stat_total_results': 'Total Results Evaluated',
    'exam.stat_passed': 'Passed Candidates',
    'exam.stat_failed': 'Failed / Retake Needed',
    'exam.stat_avg_gpa': 'Average Term GPA',
    'exam.quick_all': 'All Results',
    'exam.quick_passed': 'Passed',
    'exam.quick_failed': 'Failed',
    'exam.quick_golden': 'Golden A+ (GPA 5.0)',
    'exam.showing_count': 'Showing {filtered} of {total} exam records',
};

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: enTranslations,
  bn: enTranslations,

  hi: {
    // Navigation Parents
    'nav.dashboard': 'डैशबोर्ड',
    'nav.shareholders': 'शेयरधारक',
    'nav.attendance': 'उपस्थिति',
    'nav.staff': 'स्टाफ प्रबंधन',
    'nav.class': 'कक्षा एवं विभाग',
    'nav.routine': 'रूटीन',
    'nav.subject': 'विषय',
    'nav.academic': 'अकादमिक',
    'nav.diary': 'दैनिक डायरी',
    'nav.student': 'छात्र',
    'nav.exam': 'परीक्षा एवं परिणाम',
    'nav.finances': 'वित्त एवं लेखा',
    'nav.notices': 'सूचनाएं एवं परिपत्र',

    // Navigation Subitems
    'dashboard-overview': 'डैशबोर्ड अवलोकन',
    'shareholder-add': 'शेयरधारक जोड़ें',
    'shareholder-list': 'शेयरधारक सूची',
    'attendance-staff': 'स्टाफ उपस्थिति',
    'attendance-student': 'छात्र उपस्थिति',
    'attendance-qr': 'क्यूआर कोड उपस्थिति',
    'staff-add': 'स्टाफ जोड़ें',
    'staff-list': 'स्टाफ निर्देशिका',
    'class-add': 'कक्षा जोड़ें',
    'class-list': 'कक्षा सूची',
    'class-routine-add': 'कक्षा समय-सारणी जोड़ें',
    'class-routine-list': 'समय-सारणी सूची',
    'subject-add': 'विषय जोड़ें (Add Subject)',
    'subject-list': 'विषय एवं पुस्तक सूची (Subject List)',
    'class-department': 'विभाग प्रबंधन (Department)',
    'academic-calendar': 'अकादमिक कैलेंडर',
    'diary-add': 'दैनिक डायरी प्रविष्टि',
    'diary-list': 'डायरी लॉग',
    'student-add': 'छात्र प्रवेश',
    'student-list': 'छात्र निर्देशिका',
    'student-admit-card': 'प्रवेश पत्र (Admit Card)',
    'exam-routine': 'परीक्षा समय-सारणी',
    'exam-manage': 'परीक्षा प्रबंधन',
    'exam-results': 'परीक्षा परिणाम एवं अंक',
    'finance-fund-transfer': 'फंड ट्रांसफर (Fund Transfer)',
    'finance-salary': 'शिक्षक एवं स्टाफ वेतन',
    'finance-exam-fee': 'परीक्षा शुल्क',
    'finance-monthly-fee': 'मासिक शिक्षण शुल्क',
    'finance-donation': 'दान एवं अनुदान',
    'finance-daycare-fee': 'डे केयर शुल्क',
    'finance-others': 'अन्य आय एवं व्यय',
    'notice-new': 'नई सूचना प्रकाशित करें',
    'notice-board': 'सूचना पट्ट',

    // Common Actions
    'action.save': 'परिवर्तन सहेजें',
    'action.cancel': 'रद्द करें',
    'action.create': 'बनाएं',
    'action.edit': 'संपादित करें',
    'action.delete': 'हटाएं',
    'action.back': 'वापस जाएं',
    'action.print': 'प्रिंट करें',
    'action.export': 'निर्यात करें',
    'action.filter': 'फ़िल्टर करें',
    'action.search': 'खोजें',
    'action.reset': 'रीसेट',
    'action.close': 'बंद करें',
    'action.submit': 'जमा करें',
    'action.view': 'विवरण देखें',
    'action.actions': 'कार्रवाई',
    'action.status': 'स्थिति',
    'action.details': 'विवरण',
    'action.refresh': 'ताज़ा करें',

    // Statuses
    'status.all': 'सभी',
    'status.active': 'सक्रिय',
    'status.inactive': 'निष्क्रिय',
    'status.present': 'उपस्थित',
    'status.absent': 'अनुपस्थित',
    'status.late': 'विलंब',
    'status.leave': 'अवकाश',
    'status.completed': 'पूर्ण / भुगतान किया',
    'status.pending': 'लंबित',
    'status.paid': 'भुगतान किया',
    'status.unpaid': 'बकाया',

    // Header & Profile
    'header.search_placeholder': 'छात्र, शिक्षक, कक्षा या सूचना खोजें...',
    'header.ctrl_k': 'Ctrl K',
    'header.notifications': 'सूचनाएं',
    'header.my_profile': 'मेरी प्रोफ़ाइल',
    'header.settings': 'सिस्टम एवं खाता सेटिंग्स',
    'header.change_password': 'पासवर्ड बदलें',
    'header.logout': 'लॉग आउट',
    'header.language': 'भाषा',
    'header.timezone': 'समय क्षेत्र (Timezone)',
    'header.quick_switch_lang': 'भाषा बदलें',

    // Settings Modal
    'settings.title': 'संस्थान एवं सिस्टम सेटिंग्स',
    'settings.tab_identity': 'पहचान एवं लोगो',
    'settings.tab_contact': 'पता एवं संपर्क',
    'settings.tab_session': 'सत्र एवं डिफ़ॉल्ट',
    'settings.tab_language': 'भाषा एवं समय क्षेत्र',
    'settings.lang_heading': 'इंटरफ़ेस भाषा चुनें',
    'settings.lang_subheading': 'मेन्यू, लेबल, फॉर्म और विवरण पत्रों के लिए प्रदर्शन भाषा चुनें।',
    'settings.tz_heading': 'देश एवं क्षेत्रीय समय क्षेत्र (Timezone)',
    'settings.tz_subheading': 'घड़ी, उपस्थिति और रिपोर्ट को सिंक्रनाइज़ करने के लिए अपना देश और समय क्षेत्र चुनें।',
    'settings.preview_time': 'चयनित समय क्षेत्र में वर्तमान समय:',
    'settings.school_name': 'विद्यालय / कॉलेज का संक्षिप्त नाम',
    'settings.institution_name': 'संस्थान का पूर्ण कानूनी नाम',
    'settings.institution_type': 'संस्थान का प्रकार',
    'settings.tagline': 'आदर्श वाक्य / ध्येय',
    'settings.estd_year': 'स्थापना वर्ष',
    'settings.eiin': 'पंजीकरण / EIIN कोड',
    'settings.currency': 'मुद्रा प्रतीक',
    'settings.save_btn': 'सभी सेटिंग्स सहेजें',

    // Department Module
    'dept.title': 'विभाग प्रबंधन (Department Management)',
    'dept.subtitle': 'विषयवार अकादमिक विभाग बनाएं, विभागाध्यक्ष नियुक्त करें और संकाय वितरण ट्रैक करें।',
    'dept.create_btn': 'नया विभाग बनाएं',
    'dept.total_count': 'कुल विभाग',
    'dept.academic_count': 'विषय विभाग',
    'dept.faculty_assigned': 'नियुक्त संकाय',
    'dept.admin_count': 'प्रशासनिक इकाइयाँ',
    'dept.search_placeholder': 'विभाग का नाम, कोड या अध्यक्ष खोजें...',
    'dept.cat_all': 'सभी',
    'dept.cat_academic': 'अकादमिक विषय',
    'dept.cat_administrative': 'प्रशासनिक',
    'dept.cat_support': 'सहायता एवं सुविधाएं',
    'dept.cat_vocational': 'व्यावसायिक एवं गतिविधियाँ',
    'dept.name_label': 'विभाग का नाम (English)',
    'dept.bengali_name_label': 'विभाग का नाम (स्थानीय)',
    'dept.code_label': 'विभाग कोड',
    'dept.category_label': 'श्रेणी',
    'dept.hod_label': 'विभागाध्यक्ष (HOD)',
    'dept.email_label': 'संपर्क ईमेल',
    'dept.description_label': 'विवरण',
    'dept.status_label': 'स्थिति',
    'dept.save_create': 'विभाग बनाएं',
    'dept.save_edit': 'परिवर्तन सहेजें',

    // Exam Results & Filters
    'exam.title': 'छात्र परीक्षा परिणाम एवं अंकतालिका',
    'exam.subtitle': 'स्वचालित जीपीए गणना, लेटर ग्रेडिंग, उत्तीर्ण/अनुत्तीर्ण स्थिति एवं मार्कशीट',
    'exam.enter_marks': 'छात्र अंक दर्ज करें',
    'exam.search_placeholder': 'छात्र का नाम, रोल नंबर, आईडी या टिप्पणी खोजें...',
    'exam.filter_all_students': 'सभी छात्र',
    'exam.filter_all_terms': 'सभी परीक्षा सत्र',
    'exam.filter_all_results': 'सभी परिणाम',
    'exam.filter_passed': 'केवल उत्तीर्ण (Passed)',
    'exam.filter_failed': 'अनुत्तीर्ण / पुन: परीक्षा (Failed)',
    'exam.filter_all_classes': 'सभी कक्षाएं',
    'exam.filter_all_grades': 'सभी ग्रेड',
    'exam.filter_reset': 'फ़िल्टर रीसेट करें',
    'exam.stat_total_results': 'कुल मूल्यांकित परिणाम',
    'exam.stat_passed': 'उत्तीर्ण छात्र',
    'exam.stat_failed': 'अनुत्तीर्ण / विशेष ध्यान आवश्यक',
    'exam.stat_avg_gpa': 'औसत जीपीए',
    'exam.quick_all': 'सभी परिणाम',
    'exam.quick_passed': 'उत्तीर्ण',
    'exam.quick_failed': 'अनुत्तीर्ण',
    'exam.quick_golden': 'गोल्डन ए+ (GPA 5.0)',
    'exam.showing_count': 'कुल {total} में से {filtered} रिकॉर्ड प्रदर्शित',
  },
};

/**
 * Helper to fetch translation with fallback
 */
export const translate = (key: string, lang: AppLanguage = 'en', fallback?: string): string => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (dict[key]) return dict[key];
  if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
  return fallback !== undefined ? fallback : key;
};

/**
 * Format a Date or ISO string according to the selected Timezone and Language
 */
export const formatZonedDate = (
  dateInput: Date | string | number = new Date(),
  timezone: string = 'Asia/Dhaka',
  lang: AppLanguage = 'en',
  options?: Intl.DateTimeFormatOptions
): string => {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const locale = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch (err) {
    return new Date(dateInput).toLocaleDateString();
  }
};

/**
 * Format live clock time with Timezone
 */
export const formatZonedTime = (
  dateInput: Date | string | number = new Date(),
  timezone: string = 'Asia/Dhaka',
  lang: AppLanguage = 'en',
  includeSeconds: boolean = false
): string => {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';

    const locale = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true,
    }).format(d);
  } catch (err) {
    return new Date(dateInput).toLocaleTimeString();
  }
};
