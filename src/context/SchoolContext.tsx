import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Shareholder,
  StaffMember,
  SchoolClass,
  Student,
  StaffAttendanceRecord,
  StudentAttendanceRecord,
  QRAttendanceLog,
  AcademicEvent,
  DiaryEntry,
  Exam,
  ExamRoutineItem,
  StudentExamResult,
  FinancialTransaction,
  Notice,
  ActivityLog,
  ToastMessage,
  AttendanceStatus,
  InstitutionSettings,
  TeacherSalaryRecord,
  AdvanceSalaryRecord,
  FundTransferRecord,
  DepartmentItem,
  AppLanguage,
  SubjectItem,
  ClassRoutineItem,
  SystemNotification,
} from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants/school';
import { translate } from '../i18n/translations';
import {
  initialUserProfile,
  initialClasses,
  initialShareholders,
  initialStaff,
  initialStudents,
  initialStaffAttendance,
  initialStudentAttendance,
  initialQRLogs,
  initialAcademicEvents,
  initialDiaryEntries,
  initialExams,
  initialExamRoutines,
  initialExamResults,
  initialTransactions,
  initialNotices,
  initialActivityLogs,
  initialTeacherSalaries,
  initialAdvanceSalaries,
  initialFundTransfers,
  initialDepartments,
  initialSubjects,
  initialClassRoutines,
  initialNotifications,
} from '../data/initialData';

interface SchoolContextType {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (v: boolean) => void;

  userProfile: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  schoolSettings: InstitutionSettings;
  updateSchoolSettings: (settings: Partial<InstitutionSettings>) => void;
  resetSchoolSettings: () => void;

  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  t: (key: string, fallback?: string) => string;

  classes: SchoolClass[];
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, cls: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;

  departments: DepartmentItem[];
  addDepartment: (dept: Omit<DepartmentItem, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<DepartmentItem>) => void;
  deleteDepartment: (id: string) => void;

  subjects: SubjectItem[];
  addSubject: (sub: Omit<SubjectItem, 'id'>) => void;
  updateSubject: (id: string, sub: Partial<SubjectItem>) => void;
  deleteSubject: (id: string) => void;
  getSubjectsForClassAndGroup: (classIdOrName: string, group?: string) => SubjectItem[];

  classRoutines: ClassRoutineItem[];
  addClassRoutine: (rtn: Omit<ClassRoutineItem, 'id'>) => void;
  addClassRoutinesBatch: (items: Omit<ClassRoutineItem, 'id'>[]) => void;
  updateClassRoutine: (id: string, rtn: Partial<ClassRoutineItem>) => void;
  deleteClassRoutine: (id: string) => void;
  deleteClassRoutinesBatch: (ids: string[]) => void;

  shareholders: Shareholder[];
  addShareholder: (sh: Omit<Shareholder, 'id'>) => void;
  updateShareholder: (id: string, sh: Partial<Shareholder>) => void;
  deleteShareholder: (id: string) => void;

  staff: StaffMember[];
  addStaff: (s: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, s: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  students: Student[];
  addStudent: (std: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, std: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  staffAttendance: StaffAttendanceRecord[];
  markStaffAttendance: (records: Array<{ staffId: string; status: AttendanceStatus; notes?: string }>, date?: string) => void;

  studentAttendance: StudentAttendanceRecord[];
  markStudentAttendance: (records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>, date?: string) => void;

  qrLogs: QRAttendanceLog[];
  recordQRScan: (identifier: string) => { success: boolean; message: string; target?: { name: string; type: string } };

  academicEvents: AcademicEvent[];
  addAcademicEvent: (evt: Omit<AcademicEvent, 'id'>) => void;
  updateAcademicEvent: (id: string, evt: Partial<AcademicEvent>) => void;
  deleteAcademicEvent: (id: string) => void;

  diaryEntries: DiaryEntry[];
  addDiaryEntry: (diary: Omit<DiaryEntry, 'id'>) => void;
  updateDiaryEntry: (id: string, diary: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  exams: Exam[];
  addExam: (ex: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, ex: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  examRoutines: ExamRoutineItem[];
  addExamRoutine: (rtn: Omit<ExamRoutineItem, 'id'>) => void;
  addExamRoutinesBatch: (items: Omit<ExamRoutineItem, 'id'>[]) => void;
  updateExamRoutine: (id: string, rtn: Partial<ExamRoutineItem>) => void;
  deleteExamRoutine: (id: string) => void;
  deleteExamRoutinesBatch: (ids: string[]) => void;

  examResults: StudentExamResult[];
  saveExamResult: (result: Omit<StudentExamResult, 'id'> | StudentExamResult) => void;
  deleteExamResult: (id: string) => void;

  transactions: FinancialTransaction[];
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'receiptNumber'>) => void;
  updateTransaction: (id: string, tx: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;

  notices: Notice[];
  addNotice: (not: Omit<Notice, 'id'>) => void;
  updateNotice: (id: string, not: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  togglePinNotice: (id: string) => void;

  // Teacher Salary & Advance System
  teacherSalaries: TeacherSalaryRecord[];
  advanceSalaries: AdvanceSalaryRecord[];
  payTeacherSalary: (
    salaryId: string,
    paymentDetails: {
      bonus: number;
      bonusReason?: string;
      allowances: number;
      advanceDeduction: number;
      paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque';
      paymentDate: string;
      notes?: string;
    }
  ) => void;
  disburseAdvanceSalary: (
    data: Omit<AdvanceSalaryRecord, 'id' | 'recoveredAmount' | 'remainingBalance' | 'status'>
  ) => void;
  createMonthlySalarySheet: (month: string, year: number) => void;
  deleteTeacherSalary: (id: string) => void;
  addTeacherSalary: (data: Omit<TeacherSalaryRecord, 'id'>) => void;
  updateAdvanceSalary: (id: string, data: Partial<AdvanceSalaryRecord>) => void;

  // Fund Transfer System
  fundTransfers: FundTransferRecord[];
  executeFundTransfer: (data: Omit<FundTransferRecord, 'id' | 'transferNumber'>) => { success: boolean; message: string };
  deleteFundTransfer: (id: string) => void;

  // Live Notifications System
  notifications: SystemNotification[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  activityLogs: ActivityLog[];
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => void;
  removeToast: (id: string) => void;
  resetToDemoData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_PREFIX = 'edumanage_sms_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard-overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadFromStorage('profile', initialUserProfile));
  const [schoolSettings, setSchoolSettings] = useState<InstitutionSettings>(() => {
    const loaded = loadFromStorage('school_settings', DEFAULT_SCHOOL_SETTINGS);
    return {
      ...DEFAULT_SCHOOL_SETTINGS,
      ...loaded,
      language: loaded?.language || 'en',
      timezone: loaded?.timezone || 'Asia/Dhaka',
    };
  });
  const [classes, setClasses] = useState<SchoolClass[]>(() => loadFromStorage('classes', initialClasses));
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => loadFromStorage('departments', initialDepartments));
  const [subjects, setSubjects] = useState<SubjectItem[]>(() => loadFromStorage('subjects', initialSubjects));
  const [classRoutines, setClassRoutines] = useState<ClassRoutineItem[]>(() => loadFromStorage('class_routines', initialClassRoutines));
  const [shareholders, setShareholders] = useState<Shareholder[]>(() => loadFromStorage('shareholders', initialShareholders));
  const [staff, setStaff] = useState<StaffMember[]>(() => loadFromStorage('staff', initialStaff));
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('students', initialStudents));
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>(() => loadFromStorage('staff_attendance', initialStaffAttendance));
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>(() => loadFromStorage('student_attendance', initialStudentAttendance));
  const [qrLogs, setQrLogs] = useState<QRAttendanceLog[]>(() => loadFromStorage('qr_logs', initialQRLogs));
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>(() => loadFromStorage('events', initialAcademicEvents));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadFromStorage('diary', initialDiaryEntries));
  const [exams, setExams] = useState<Exam[]>(() => loadFromStorage('exams', initialExams));
  const [examRoutines, setExamRoutines] = useState<ExamRoutineItem[]>(() => loadFromStorage('exam_routines', initialExamRoutines));
  const [examResults, setExamResults] = useState<StudentExamResult[]>(() => loadFromStorage('exam_results', initialExamResults));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => loadFromStorage('transactions', initialTransactions));
  const [teacherSalaries, setTeacherSalaries] = useState<TeacherSalaryRecord[]>(() => loadFromStorage('teacher_salaries', initialTeacherSalaries));
  const [advanceSalaries, setAdvanceSalaries] = useState<AdvanceSalaryRecord[]>(() => loadFromStorage('advance_salaries', initialAdvanceSalaries));
  const [fundTransfers, setFundTransfers] = useState<FundTransferRecord[]>(() => loadFromStorage('fund_transfers', initialFundTransfers));
  const [notices, setNotices] = useState<Notice[]>(() => loadFromStorage('notices', initialNotices));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage('activity_logs', initialActivityLogs));
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => loadFromStorage('system_notifications', initialNotifications));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => { saveToStorage('profile', userProfile); }, [userProfile]);
  useEffect(() => { saveToStorage('school_settings', schoolSettings); }, [schoolSettings]);
  useEffect(() => { saveToStorage('classes', classes); }, [classes]);
  useEffect(() => { saveToStorage('departments', departments); }, [departments]);
  useEffect(() => { saveToStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { saveToStorage('class_routines', classRoutines); }, [classRoutines]);
  useEffect(() => { saveToStorage('shareholders', shareholders); }, [shareholders]);
  useEffect(() => { saveToStorage('staff', staff); }, [staff]);
  useEffect(() => { saveToStorage('students', students); }, [students]);
  useEffect(() => { saveToStorage('staff_attendance', staffAttendance); }, [staffAttendance]);
  useEffect(() => { saveToStorage('student_attendance', studentAttendance); }, [studentAttendance]);
  useEffect(() => { saveToStorage('qr_logs', qrLogs); }, [qrLogs]);
  useEffect(() => { saveToStorage('events', academicEvents); }, [academicEvents]);
  useEffect(() => { saveToStorage('diary', diaryEntries); }, [diaryEntries]);
  useEffect(() => { saveToStorage('exams', exams); }, [exams]);
  useEffect(() => { saveToStorage('exam_routines', examRoutines); }, [examRoutines]);
  useEffect(() => { saveToStorage('exam_results', examResults); }, [examResults]);
  useEffect(() => { saveToStorage('transactions', transactions); }, [transactions]);
  useEffect(() => { saveToStorage('teacher_salaries', teacherSalaries); }, [teacherSalaries]);
  useEffect(() => { saveToStorage('advance_salaries', advanceSalaries); }, [advanceSalaries]);
  useEffect(() => { saveToStorage('fund_transfers', fundTransfers); }, [fundTransfers]);
  useEffect(() => { saveToStorage('notices', notices); }, [notices]);
  useEffect(() => { saveToStorage('activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { saveToStorage('system_notifications', notifications); }, [notifications]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (action: string, details: string, module: string) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      action,
      details,
      user: userProfile.name,
      timestamp: 'Just now',
      module,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 40)]);

    // Determine target route if applicable for direct navigation on click
    let actionRoute: string | undefined = undefined;
    const lowerMod = module.toLowerCase();
    const lowerAct = action.toLowerCase();
    if (lowerMod.includes('class') && (lowerMod.includes('routine') || lowerAct.includes('routine'))) {
      actionRoute = 'class-routine-list';
    } else if (lowerMod.includes('subject') || lowerMod.includes('curriculum') || lowerAct.includes('subject')) {
      actionRoute = 'subject-list';
    } else if (lowerMod.includes('class') || lowerMod.includes('academic') || lowerAct.includes('class')) {
      actionRoute = 'class-list';
    } else if (lowerMod.includes('student') || lowerAct.includes('student')) {
      actionRoute = 'student-list';
    } else if (lowerMod.includes('salary') || lowerMod.includes('payroll')) {
      actionRoute = 'teacher-salary-sheet';
    } else if (lowerMod.includes('advance')) {
      actionRoute = 'teacher-salary-advance';
    } else if (lowerMod.includes('fund') || lowerMod.includes('transfer')) {
      actionRoute = 'finance-fund-transfer';
    } else if (lowerMod.includes('exam') && (lowerMod.includes('routine') || lowerAct.includes('routine'))) {
      actionRoute = 'exam-routine-list';
    } else if (lowerMod.includes('exam')) {
      actionRoute = 'exam-list';
    } else if (lowerMod.includes('attendance')) {
      actionRoute = 'attendance-dashboard';
    } else if (lowerMod.includes('finance') || lowerMod.includes('account')) {
      actionRoute = 'finance-dashboard';
    } else if (lowerMod.includes('notice')) {
      actionRoute = 'notice-board';
    }

    const notifType: 'info' | 'success' | 'warning' | 'alert' =
      lowerAct.includes('delete') || lowerAct.includes('remove') || lowerAct.includes('void')
        ? 'alert'
        : lowerAct.includes('warning') || lowerAct.includes('fail')
        ? 'warning'
        : 'success';

    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: action,
      message: details,
      module,
      type: notifType,
      timestamp: new Date().toISOString(),
      read: false,
      actionRoute,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 99)]);
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }) => {
    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: notif.timestamp || new Date().toISOString(),
      read: notif.read ?? false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 99)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
    showToast('success', 'Profile Updated', 'Administrator profile details were updated.');
  };

  const updateSchoolSettings = (data: Partial<InstitutionSettings>) => {
    setSchoolSettings((prev) => {
      const updated = { ...prev, ...data };
      return updated;
    });
    // Keep userProfile institution aligned
    if (data.institutionName || data.schoolName) {
      setUserProfile((prev) => ({
        ...prev,
        institution: data.institutionName || data.schoolName || prev.institution,
      }));
    }
    logActivity('Institution Settings Updated', `Updated details for ${data.schoolName || schoolSettings.schoolName}`, 'Settings');
    showToast('success', 'Settings Saved', 'School and institution information updated across the entire system.');
  };

  const resetSchoolSettings = () => {
    setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
    showToast('info', 'Settings Reset', 'Default school and institution settings restored.');
  };

  const language: AppLanguage = schoolSettings.language || 'en';
  const timezone: string = schoolSettings.timezone || 'Asia/Dhaka';

  const setLanguage = (newLang: AppLanguage) => {
    setSchoolSettings((prev) => ({ ...prev, language: newLang }));
    const langNames: Record<AppLanguage, string> = {
      en: 'English',
      bn: 'English (US)',
      hi: 'Hindi',
    };
    logActivity('Language Changed', `System language switched to ${langNames[newLang]}`, 'System');
    const msg = 'System language switched to English.';
    showToast('success', langNames[newLang], msg);
  };

  const setTimezone = (newTz: string) => {
    setSchoolSettings((prev) => ({ ...prev, timezone: newTz }));
    logActivity('Timezone Changed', `Regional timezone switched to ${newTz}`, 'System');
    showToast('success', 'Timezone Updated', `Clock and report timezone set to ${newTz}.`);
  };

  const t = (key: string, fallback?: string): string => {
    return translate(key, language, fallback);
  };

  // Classes
  const addClass = (data: Omit<SchoolClass, 'id'>) => {
    const newClass: SchoolClass = { ...data, id: 'cls-' + Date.now() };
    setClasses((prev) => [...prev, newClass]);
    logActivity('Class Created', `Added ${newClass.className} (${newClass.classCode})`, 'Class');
    showToast('success', 'Class Added', `${newClass.className} has been registered successfully.`);
  };

  const updateClass = (id: string, data: Partial<SchoolClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    logActivity('Class Updated', `Updated class details for ${data.className || id}`, 'Class');
    showToast('success', 'Class Updated', 'Class information saved.');
  };

  const deleteClass = (id: string) => {
    const found = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    logActivity('Class Deleted', `Removed ${found?.className || id}`, 'Class');
    showToast('info', 'Class Removed', 'Class removed from directory.');
  };

  // Departments
  const addDepartment = (data: Omit<DepartmentItem, 'id'>) => {
    const newDept: DepartmentItem = {
      ...data,
      id: 'dept-' + Date.now(),
      status: data.status || 'Active',
    };
    setDepartments((prev) => [...prev, newDept]);
    logActivity('Department Created', `Created ${newDept.name} (${newDept.code})`, 'Academic & Department');
    showToast('success', 'Department Created', `Department "${newDept.name}" created successfully.`);
  };

  const updateDepartment = (id: string, data: Partial<DepartmentItem>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
    logActivity('Department Updated', `Updated department ${data.name || id}`, 'Academic & Department');
    showToast('success', 'Department Updated', 'Department details updated.');
  };

  const deleteDepartment = (id: string) => {
    const found = departments.find((d) => d.id === id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    logActivity('Department Deleted', `Removed ${found?.name || id}`, 'Academic & Department');
    showToast('info', 'Department Removed', 'Department has been deleted.');
  };

  // Subjects
  const addSubject = (data: Omit<SubjectItem, 'id'>) => {
    const newSub: SubjectItem = {
      ...data,
      id: 'sub-' + Date.now(),
      status: data.status || 'Active',
    };
    setSubjects((prev) => [...prev, newSub]);
    logActivity('Subject Added', `Created subject: ${newSub.name} (${newSub.code})`, 'Class & Department');
    showToast('success', 'Subject Added', `Subject "${newSub.name}" added to curriculum.`);
  };

  const updateSubject = (id: string, data: Partial<SubjectItem>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logActivity('Subject Updated', `Updated subject: ${data.name || id}`, 'Class & Department');
    showToast('success', 'Subject Updated', 'Subject details updated.');
  };

  const deleteSubject = (id: string) => {
    const found = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    logActivity('Subject Removed', `Deleted subject: ${found?.name || id}`, 'Class & Department');
    showToast('info', 'Subject Removed', 'Subject removed from curriculum.');
  };

  const getSubjectsForClassAndGroup = (classIdOrName: string, group?: string): SubjectItem[] => {
    if (!classIdOrName) return [];
    const normalizedInput = classIdOrName.trim().toLowerCase();
    const targetCls = classes.find(
      (c) => c.id.toLowerCase() === normalizedInput || c.className.toLowerCase() === normalizedInput
    );
    const targetClassId = targetCls?.id || classIdOrName;
    const targetClassName = (targetCls?.className || classIdOrName).toLowerCase();

    // Check if this is Class 9 or Class 10 (or SSC)
    const isClass9or10 = /class\s*(9|10)|ix|x|ssc/i.test(targetClassName);

    return subjects.filter((s) => {
      // Check if subject belongs to target class
      const classMatches =
        s.classIds.includes(targetClassId) ||
        s.classIds.some((cid) => {
          const c = classes.find((cl) => cl.id === cid);
          return c && c.className.toLowerCase() === targetClassName;
        }) ||
        (s.classNames && s.classNames.some((cn) => cn.toLowerCase() === targetClassName));

      if (!classMatches) return false;

      // If not Class 9/10, all matched subjects apply
      if (!isClass9or10) return true;

      // For Class 9/10:
      // General subjects (Bangla, English, Math, ICT, Religion) apply to all streams
      if (s.group === 'General') return true;

      // If student/class has a specific group chosen (Science, Commerce, Humanities)
      if (group && group !== 'General') {
        return s.group.toLowerCase() === group.toLowerCase();
      }

      // If no group is filtered, return all
      return true;
    });
  };

  // Academic Class Routines
  const addClassRoutine = (data: Omit<ClassRoutineItem, 'id'>) => {
    const newRtn: ClassRoutineItem = {
      ...data,
      id: 'crt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setClassRoutines((prev) => [...prev, newRtn]);
    logActivity('Class Routine Added', `Scheduled ${newRtn.subjectName} for ${newRtn.className} on ${newRtn.dayOfWeek}`, 'Class & Department');
    showToast('success', 'Class Routine Added', `${newRtn.subjectName} scheduled for ${newRtn.className}.`);
  };

  const addClassRoutinesBatch = (items: Omit<ClassRoutineItem, 'id'>[]) => {
    if (!items.length) return;
    const baseId = Date.now();
    const newItems: ClassRoutineItem[] = items.map((data, index) => ({
      ...data,
      id: `crt-${baseId}-${index}`,
    }));
    setClassRoutines((prev) => [...prev, ...newItems]);
    const first = newItems[0];
    logActivity(
      'Batch Routine Generated',
      `Scheduled ${newItems.length} periods for ${first.className} on ${first.dayOfWeek}`,
      'Class & Department'
    );
    showToast(
      'success',
      'Daily Routine Created',
      `Successfully scheduled ${newItems.length} periods for ${first.className}.`
    );
  };

  const updateClassRoutine = (id: string, data: Partial<ClassRoutineItem>) => {
    setClassRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    logActivity('Class Routine Updated', `Updated schedule period`, 'Class & Department');
    showToast('success', 'Routine Updated', 'Class routine period updated.');
  };

  const deleteClassRoutine = (id: string) => {
    setClassRoutines((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Routine Period Removed', 'Period removed from class routine.');
  };

  const deleteClassRoutinesBatch = (ids: string[]) => {
    if (!ids.length) return;
    const idSet = new Set(ids);
    setClassRoutines((prev) => prev.filter((r) => !idSet.has(r.id)));
    showToast('info', 'Routine Removed', `${ids.length} periods removed from routine.`);
  };

  // Shareholders
  const addShareholder = (data: Omit<Shareholder, 'id'>) => {
    const totalShares = shareholders.reduce((acc, s) => acc + s.numberOfShares, 0) + data.numberOfShares;
    const sharePercentage = totalShares > 0 ? Number(((data.numberOfShares / totalShares) * 100).toFixed(1)) : 10;
    const newSh: Shareholder = { ...data, id: 'sh-' + Date.now(), sharePercentage };
    setShareholders((prev) => [newSh, ...prev]);
    logActivity('Shareholder Added', `Registered shareholder ${newSh.fullName} with ${newSh.numberOfShares} shares`, 'Shareholders');
    showToast('success', 'Shareholder Registered', `${newSh.fullName} has been added.`);
  };

  const updateShareholder = (id: string, data: Partial<Shareholder>) => {
    setShareholders((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logActivity('Shareholder Updated', `Updated details for ${data.fullName || id}`, 'Shareholders');
    showToast('success', 'Shareholder Updated', 'Changes saved successfully.');
  };

  const deleteShareholder = (id: string) => {
    const found = shareholders.find((s) => s.id === id);
    setShareholders((prev) => prev.filter((s) => s.id !== id));
    logActivity('Shareholder Removed', `Deleted record of ${found?.fullName || id}`, 'Shareholders');
    showToast('info', 'Shareholder Deleted', 'Shareholder removed from ledger.');
  };

  // Staff
  const addStaff = (data: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = { ...data, id: 'stf-' + Date.now() };
    setStaff((prev) => [newStaff, ...prev]);
    logActivity('Staff Recruited', `Added ${newStaff.fullName} as ${newStaff.designation}`, 'Staff');
    showToast('success', 'Staff Member Added', `${newStaff.fullName} registered.`);
  };

  const updateStaff = (id: string, data: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logActivity('Staff Updated', `Updated staff record for ${data.fullName || id}`, 'Staff');
    showToast('success', 'Staff Record Updated', 'Changes saved successfully.');
  };

  const deleteStaff = (id: string) => {
    const found = staff.find((s) => s.id === id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
    logActivity('Staff Removed', `Deleted ${found?.fullName || id}`, 'Staff');
    showToast('info', 'Staff Member Removed', 'Staff record deleted.');
  };

  // Students
  const addStudent = (data: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...data, id: 'std-' + Date.now() };
    setStudents((prev) => [newStudent, ...prev]);
    logActivity('Student Enrolled', `Admitted ${newStudent.fullName} to ${newStudent.className}`, 'Student');
    showToast('success', 'Student Enrolled', `${newStudent.fullName} has been admitted.`);
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    logActivity('Student Updated', `Updated profile of ${data.fullName || id}`, 'Student');
    showToast('success', 'Student Updated', 'Student profile details updated.');
  };

  const deleteStudent = (id: string) => {
    const found = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logActivity('Student Removed', `Deleted enrollment for ${found?.fullName || id}`, 'Student');
    showToast('info', 'Student Record Removed', 'Student removed from roll.');
  };

  // Staff Attendance
  const markStaffAttendance = (records: Array<{ staffId: string; status: AttendanceStatus; notes?: string }>, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const newRecords: StaffAttendanceRecord[] = records.map((r) => {
      const stf = staff.find((s) => s.staffId === r.staffId || s.id === r.staffId);
      return {
        id: 'sa-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        staffId: stf?.staffId || r.staffId,
        staffName: stf?.fullName || 'Staff Member',
        designation: stf?.designation || 'Staff',
        department: stf?.department || 'General',
        date: targetDate,
        status: r.status,
        checkInTime: r.status === 'Present' || r.status === 'Late' ? '08:00 AM' : undefined,
        notes: r.notes,
      };
    });

    setStaffAttendance((prev) => {
      const existingFiltered = prev.filter((p) => !(p.date === targetDate && records.some((r) => r.staffId === p.staffId)));
      return [...newRecords, ...existingFiltered];
    });

    logActivity('Staff Attendance Saved', `Recorded attendance for ${records.length} staff members on ${targetDate}`, 'Attendance');
    showToast('success', 'Staff Attendance Saved', `Attendance for ${records.length} staff recorded for ${targetDate}.`);
  };

  // Student Attendance
  const markStudentAttendance = (records: Array<{ studentId: string; status: AttendanceStatus; notes?: string }>, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const newRecords: StudentAttendanceRecord[] = records.map((r) => {
      const std = students.find((s) => s.studentId === r.studentId || s.id === r.studentId);
      return {
        id: 'sta-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        studentId: std?.studentId || r.studentId,
        studentName: std?.fullName || 'Student',
        rollNumber: std?.rollNumber || '00',
        classId: std?.classId || 'cls-1',
        className: std?.className || 'Class',
        section: std?.section || 'A',
        date: targetDate,
        status: r.status,
        notes: r.notes,
      };
    });

    setStudentAttendance((prev) => {
      const existingFiltered = prev.filter((p) => !(p.date === targetDate && records.some((r) => r.studentId === p.studentId)));
      return [...newRecords, ...existingFiltered];
    });

    logActivity('Student Attendance Saved', `Recorded attendance for ${records.length} students on ${targetDate}`, 'Attendance');
    showToast('success', 'Student Attendance Saved', `Attendance submitted for ${records.length} students.`);
  };

  // QR Attendance
  const recordQRScan = (rawIdentifier: string): { success: boolean; message: string; target?: { name: string; type: string } } => {
    const cleanId = rawIdentifier.trim().toUpperCase();
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Look for matching student
    const matchedStudent = students.find(
      (s) => s.studentId.toUpperCase() === cleanId || s.admissionNumber.toUpperCase() === cleanId || s.id.toUpperCase() === cleanId
    );

    if (matchedStudent) {
      // Check duplicate today
      const alreadyScanned = qrLogs.find((l) => l.identifier === matchedStudent.studentId && l.date === todayStr);
      if (alreadyScanned) {
        return {
          success: false,
          message: `Already marked present today at ${alreadyScanned.timestamp}!`,
          target: { name: matchedStudent.fullName, type: 'Student' },
        };
      }

      const logItem: QRAttendanceLog = {
        id: 'qr-' + Date.now(),
        targetId: matchedStudent.id,
        name: matchedStudent.fullName,
        type: 'Student',
        identifier: matchedStudent.studentId,
        timestamp: nowTimeStr,
        date: todayStr,
        status: 'Present',
        subInfo: `${matchedStudent.className} - Sec ${matchedStudent.section} (Roll: ${matchedStudent.rollNumber})`,
      };

      setQrLogs((prev) => [logItem, ...prev]);
      // Also update student attendance table
      markStudentAttendance([{ studentId: matchedStudent.studentId, status: 'Present', notes: 'QR Scanner Check-in' }], todayStr);
      logActivity('QR Attendance Scan', `Student ${matchedStudent.fullName} scanned QR at ${nowTimeStr}`, 'Attendance');
      return { success: true, message: `Welcome ${matchedStudent.fullName}! Attendance registered.`, target: { name: matchedStudent.fullName, type: 'Student' } };
    }

    // Look for matching staff
    const matchedStaff = staff.find((s) => s.staffId.toUpperCase() === cleanId || s.id.toUpperCase() === cleanId);
    if (matchedStaff) {
      const alreadyScanned = qrLogs.find((l) => l.identifier === matchedStaff.staffId && l.date === todayStr);
      if (alreadyScanned) {
        return {
          success: false,
          message: `Already marked present today at ${alreadyScanned.timestamp}!`,
          target: { name: matchedStaff.fullName, type: 'Staff' },
        };
      }

      const logItem: QRAttendanceLog = {
        id: 'qr-' + Date.now(),
        targetId: matchedStaff.id,
        name: matchedStaff.fullName,
        type: 'Staff',
        identifier: matchedStaff.staffId,
        timestamp: nowTimeStr,
        date: todayStr,
        status: 'Present',
        subInfo: `${matchedStaff.designation} (${matchedStaff.department})`,
      };

      setQrLogs((prev) => [logItem, ...prev]);
      // Also update staff attendance table
      markStaffAttendance([{ staffId: matchedStaff.staffId, status: 'Present', notes: 'QR Scanner Check-in' }], todayStr);
      logActivity('QR Attendance Scan', `Staff ${matchedStaff.fullName} checked in via QR at ${nowTimeStr}`, 'Attendance');
      return { success: true, message: `Welcome ${matchedStaff.fullName}! Attendance registered.`, target: { name: matchedStaff.fullName, type: 'Staff' } };
    }

    return { success: false, message: `No active student or staff found with ID "${rawIdentifier}".` };
  };

  // Academic Events
  const addAcademicEvent = (data: Omit<AcademicEvent, 'id'>) => {
    const newEvt: AcademicEvent = { ...data, id: 'evt-' + Date.now() };
    setAcademicEvents((prev) => [...prev, newEvt]);
    logActivity('Event Added', `Scheduled event: ${newEvt.title}`, 'Academic');
    showToast('success', 'Event Created', `"${newEvt.title}" added to academic calendar.`);
  };

  const updateAcademicEvent = (id: string, data: Partial<AcademicEvent>) => {
    setAcademicEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    logActivity('Event Updated', `Updated academic event`, 'Academic');
    showToast('success', 'Event Updated', 'Event details saved.');
  };

  const deleteAcademicEvent = (id: string) => {
    const found = academicEvents.find((e) => e.id === id);
    setAcademicEvents((prev) => prev.filter((e) => e.id !== id));
    logActivity('Event Removed', `Deleted ${found?.title || id}`, 'Academic');
    showToast('info', 'Event Removed', 'Event removed from calendar.');
  };

  // Diary
  const addDiaryEntry = (data: Omit<DiaryEntry, 'id'>) => {
    const newDiary: DiaryEntry = { ...data, id: 'dir-' + Date.now() };
    setDiaryEntries((prev) => [newDiary, ...prev]);
    logActivity('Diary Entry Created', `Added ${newDiary.subject} diary for ${newDiary.className}`, 'Diary');
    showToast('success', 'Diary Published', `Daily homework & lessons published for ${newDiary.className}.`);
  };

  const updateDiaryEntry = (id: string, data: Partial<DiaryEntry>) => {
    setDiaryEntries((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
    showToast('success', 'Diary Updated', 'Diary entry modified.');
  };

  const deleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
    showToast('info', 'Diary Deleted', 'Diary record removed.');
  };

  // Exams
  const addExam = (data: Omit<Exam, 'id'>) => {
    const newEx: Exam = { ...data, id: 'ex-' + Date.now() };
    setExams((prev) => [newEx, ...prev]);
    logActivity('Exam Created', `Created examination: ${newEx.name}`, 'Exam & Result');
    showToast('success', 'Exam Created', `${newEx.name} scheduled.`);
  };

  const updateExam = (id: string, data: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    showToast('success', 'Exam Updated', 'Exam parameters updated.');
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('info', 'Exam Deleted', 'Exam record removed.');
  };

  // Routines
  const addExamRoutine = (data: Omit<ExamRoutineItem, 'id'>) => {
    const newRtn: ExamRoutineItem = { ...data, id: 'rtn-' + Date.now() };
    setExamRoutines((prev) => [...prev, newRtn]);
    logActivity('Routine Added', `Scheduled ${newRtn.subject} on ${newRtn.examDate}`, 'Exam & Result');
    showToast('success', 'Schedule Added', `Exam schedule for ${newRtn.subject} added.`);
  };

  const addExamRoutinesBatch = (items: Omit<ExamRoutineItem, 'id'>[]) => {
    if (!items.length) return;
    const baseId = Date.now();
    const newItems: ExamRoutineItem[] = items.map((data, index) => ({
      ...data,
      id: `rtn-${baseId}-${index}`,
    }));
    setExamRoutines((prev) => [...prev, ...newItems]);
    const first = newItems[0];
    logActivity(
      'Batch Routine Generated',
      `Scheduled ${newItems.length} subjects for ${first.className} (${first.examName})`,
      'Exam & Result'
    );
    showToast(
      'success',
      'Class Routine Created',
      `Successfully scheduled ${newItems.length} subjects for ${first.className}.`
    );
  };

  const updateExamRoutine = (id: string, data: Partial<ExamRoutineItem>) => {
    setExamRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    showToast('success', 'Routine Updated', 'Exam routine updated.');
  };

  const deleteExamRoutine = (id: string) => {
    setExamRoutines((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Routine Removed', 'Item removed from routine.');
  };

  const deleteExamRoutinesBatch = (ids: string[]) => {
    if (!ids.length) return;
    const idSet = new Set(ids);
    setExamRoutines((prev) => prev.filter((r) => !idSet.has(r.id)));
    showToast('info', 'Routine File Removed', `${ids.length} subjects removed from routine.`);
  };

  // Results
  const saveExamResult = (data: Omit<StudentExamResult, 'id'> | StudentExamResult) => {
    if ('id' in data && data.id) {
      setExamResults((prev) => prev.map((r) => (r.id === data.id ? (data as StudentExamResult) : r)));
    } else {
      const newRes: StudentExamResult = { ...(data as Omit<StudentExamResult, 'id'>), id: 'res-' + Date.now() };
      setExamResults((prev) => [newRes, ...prev]);
    }
    logActivity('Marks Submitted', `Computed marks & GPA for ${data.studentName}`, 'Exam & Result');
    showToast('success', 'Result Saved', `Marksheet saved for ${data.studentName}.`);
  };

  const deleteExamResult = (id: string) => {
    setExamResults((prev) => prev.filter((r) => r.id !== id));
    showToast('info', 'Result Deleted', 'Result record removed.');
  };

  // Finances
  const addTransaction = (data: Omit<FinancialTransaction, 'id' | 'receiptNumber'>) => {
    const receiptNum = (data.feeType === 'School Expense' ? 'EXP-' : 'RCP-') + '2026-' + Math.floor(1000 + Math.random() * 9000);
    const newTx: FinancialTransaction = {
      ...data,
      id: 'tx-' + Date.now(),
      receiptNumber: receiptNum,
    };
    setTransactions((prev) => [newTx, ...prev]);
    logActivity('Transaction Recorded', `${newTx.feeType}: BDT ${newTx.amount.toLocaleString()} for ${newTx.partyName}`, 'Finances');
    showToast('success', 'Payment / Transaction Logged', `Receipt ${receiptNum} generated for BDT ${newTx.amount.toLocaleString()}.`);
  };

  const updateTransaction = (id: string, data: Partial<FinancialTransaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    showToast('success', 'Transaction Updated', 'Payment transaction details modified.');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Transaction Removed', 'Record removed.');
  };

  // Teacher Salary & Advance System
  const payTeacherSalary = (
    salaryId: string,
    paymentDetails: {
      bonus: number;
      bonusReason?: string;
      allowances: number;
      advanceDeduction: number;
      paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque';
      paymentDate: string;
      notes?: string;
    }
  ) => {
    const target = teacherSalaries.find((s) => s.id === salaryId);
    if (!target) {
      showToast('error', 'Salary Record Not Found', 'Could not locate teacher salary record.');
      return;
    }

    const netPayable = Math.max(0, target.basicSalary + paymentDetails.bonus + paymentDetails.allowances - paymentDetails.advanceDeduction);
    const receiptNum = target.receiptNumber || 'SAL-2026-' + Math.floor(1000 + Math.random() * 9000);

    setTeacherSalaries((prev) =>
      prev.map((s) =>
        s.id === salaryId
          ? {
              ...s,
              bonus: paymentDetails.bonus,
              bonusReason: paymentDetails.bonusReason,
              allowances: paymentDetails.allowances,
              advanceDeduction: paymentDetails.advanceDeduction,
              netPayable,
              status: 'Completed',
              paymentDate: paymentDetails.paymentDate,
              paymentMethod: paymentDetails.paymentMethod,
              receiptNumber: receiptNum,
              notes: paymentDetails.notes || s.notes,
            }
          : s
      )
    );

    // If advance deduction was applied, deduct from active advance
    if (paymentDetails.advanceDeduction > 0) {
      setAdvanceSalaries((prev) =>
        prev.map((adv) => {
          if (adv.staffId === target.staffId && adv.status === 'Active') {
            const newRecovered = adv.recoveredAmount + paymentDetails.advanceDeduction;
            const newRemaining = Math.max(0, adv.amount - newRecovered);
            return {
              ...adv,
              recoveredAmount: newRecovered,
              remainingBalance: newRemaining,
              status: newRemaining === 0 ? 'Settled' : 'Active',
            };
          }
          return adv;
        })
      );
    }

    // Auto-create salary expense transaction so it subtracts from institutional earnings
    const receiptNumExp = 'SAL-TX-' + Math.floor(1000 + Math.random() * 9000);
    const newTx: FinancialTransaction = {
      id: 'tx-' + Date.now(),
      receiptNumber: receiptNumExp,
      feeType: 'Teacher Salary',
      title: `Teacher Salary - ${target.teacherName} (${target.month})`,
      amount: netPayable,
      date: paymentDetails.paymentDate,
      paymentMethod: paymentDetails.paymentMethod,
      status: 'Paid',
      partyName: target.teacherName,
      partyId: target.staffId,
      category: 'Salaries',
      notes: `Basic: BDT ${target.basicSalary.toLocaleString()} | Bonus: BDT ${paymentDetails.bonus.toLocaleString()} | Advance Deducted: BDT ${paymentDetails.advanceDeduction.toLocaleString()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    logActivity('Teacher Salary Paid', `Disbursed BDT ${netPayable.toLocaleString()} to ${target.teacherName} for ${target.month}`, 'Finances');
    showToast('success', 'Salary Disbursed Successfully', `BDT ${netPayable.toLocaleString()} cleared for ${target.teacherName}.`);
  };

  const disburseAdvanceSalary = (
    data: Omit<AdvanceSalaryRecord, 'id' | 'recoveredAmount' | 'remainingBalance' | 'status'>
  ) => {
    const newAdvance: AdvanceSalaryRecord = {
      ...data,
      id: 'adv-' + Date.now(),
      recoveredAmount: 0,
      remainingBalance: data.amount,
      status: 'Active',
    };
    setAdvanceSalaries((prev) => [newAdvance, ...prev]);

    // Record institutional expense transaction for advance loan
    const receiptNumExp = 'ADV-TX-' + Math.floor(1000 + Math.random() * 9000);
    const newTx: FinancialTransaction = {
      id: 'tx-' + Date.now(),
      receiptNumber: receiptNumExp,
      feeType: 'School Expense',
      title: `Advance Salary Loan - ${data.teacherName}`,
      amount: data.amount,
      date: data.disbursementDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      status: 'Paid',
      partyName: data.teacherName,
      partyId: data.staffId,
      category: 'Salaries',
      notes: `Reason: ${data.reason}. Monthly Repayment Deduction: BDT ${data.monthlyDeduction.toLocaleString()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    logActivity('Advance Salary Approved', `Disbursed advance loan of BDT ${data.amount.toLocaleString()} to ${data.teacherName}`, 'Finances');
    showToast('success', 'Advance Salary Disbursed', `BDT ${data.amount.toLocaleString()} advance approved for ${data.teacherName}.`);
  };

  const updateAdvanceSalary = (id: string, data: Partial<AdvanceSalaryRecord>) => {
    setAdvanceSalaries((prev) => prev.map((adv) => (adv.id === id ? { ...adv, ...data } : adv)));
    showToast('success', 'Advance Record Updated', 'Advance salary adjustments saved.');
  };

  const addTeacherSalary = (data: Omit<TeacherSalaryRecord, 'id'>) => {
    const newSalary: TeacherSalaryRecord = {
      ...data,
      id: 'sal-' + Date.now(),
    };
    setTeacherSalaries((prev) => [newSalary, ...prev]);
    showToast('success', 'Salary Record Added', `Salary entry generated for ${data.teacherName}.`);
  };

  const deleteTeacherSalary = (id: string) => {
    setTeacherSalaries((prev) => prev.filter((s) => s.id !== id));
    showToast('info', 'Salary Entry Removed', 'Salary record removed from sheet.');
  };

  const createMonthlySalarySheet = (month: string, year: number) => {
    const eligibleStaff = staff.filter((st) => (st.salary || 0) > 0);
    const existingStaffIds = new Set(
      teacherSalaries.filter((s) => s.month === month && s.year === year).map((s) => s.staffId)
    );

    const toAdd: TeacherSalaryRecord[] = [];
    eligibleStaff.forEach((st) => {
      if (!existingStaffIds.has(st.id)) {
        const activeAdv = advanceSalaries.find((a) => a.staffId === st.id && a.status === 'Active');
        const proposedDeduction = activeAdv ? Math.min(activeAdv.monthlyDeduction, activeAdv.remainingBalance) : 0;
        const basic = st.salary || 40000;
        const net = Math.max(0, basic - proposedDeduction);

        toAdd.push({
          id: 'sal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          staffId: st.id,
          teacherName: st.fullName,
          designation: st.designation,
          department: st.department,
          month,
          year,
          basicSalary: basic,
          bonus: 0,
          allowances: 0,
          advanceDeduction: proposedDeduction,
          netPayable: net,
          status: 'Pending',
          notes: activeAdv ? `Active advance loan deduction of BDT ${proposedDeduction.toLocaleString()} scheduled` : 'Monthly salary prepared for review',
        });
      }
    });

    if (toAdd.length === 0) {
      showToast('info', 'Sheet Up to Date', `All staff members already have salary records for ${month}.`);
      return;
    }

    setTeacherSalaries((prev) => [...toAdd, ...prev]);
    logActivity('Monthly Salary Sheet Created', `Generated ${toAdd.length} salary records for ${month}`, 'Finances');
    showToast('success', 'Monthly Salary Sheet Created', `Generated ${toAdd.length} salary records for ${month}.`);
  };

  // Notices
  const addNotice = (data: Omit<Notice, 'id'>) => {
    const newNotice: Notice = { ...data, id: 'not-' + Date.now() };
    setNotices((prev) => [newNotice, ...prev]);
    logActivity('Notice Published', `Published: ${newNotice.title}`, 'Notice');
    showToast('success', 'Notice Published', `Notice "${newNotice.title}" has been published.`);
  };

  const updateNotice = (id: string, data: Partial<Notice>) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
    showToast('success', 'Notice Updated', 'Notice details updated.');
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    showToast('info', 'Notice Deleted', 'Notice removed from bulletin board.');
  };

  const togglePinNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextPinned = !n.isPinned;
          showToast('info', nextPinned ? 'Notice Pinned' : 'Notice Unpinned', `Notice pin status toggled.`);
          return { ...n, isPinned: nextPinned };
        }
        return n;
      })
    );
  };

  // Fund Transfer System
  const executeFundTransfer = (data: Omit<FundTransferRecord, 'id' | 'transferNumber'>) => {
    const transferNum = 'TRF-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newTransfer: FundTransferRecord = {
      ...data,
      id: 'trf-' + Date.now(),
      transferNumber: transferNum,
      status: 'Completed',
    };

    setFundTransfers((prev) => [newTransfer, ...prev]);

    // Automatically publish system notice to notify the institution
    const transferNotice: Notice = {
      id: 'not-' + Date.now(),
      title: `Treasury Fund Transfer: BDT ${data.amount.toLocaleString('en-BD')} from ${data.sourceStreamLabel}`,
      category: 'Administrative',
      description: `An official internal fund transfer of BDT ${data.amount.toLocaleString('en-BD')} has been executed from ${data.sourceStreamLabel} into ${data.destinationFund}. Transfer Reference: ${transferNum}. Authorized by: ${data.transferredBy}. Approved by: ${data.approvedBy}. This fund is now credited to the main institutional treasury and available for expenditures.`,
      publishDate: data.date || new Date().toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      targetAudience: 'All',
      priority: 'High',
      publishStatus: 'Published',
      isPinned: false,
      author: data.transferredBy || userProfile.name,
    };
    setNotices((prev) => [transferNotice, ...prev]);

    logActivity(
      'Fund Transfer Executed',
      `Transferred BDT ${data.amount.toLocaleString('en-BD')} from ${data.sourceStreamLabel} to ${data.destinationFund} (${transferNum})`,
      'Finances'
    );

    showToast(
      'success',
      'Fund Transfer Completed',
      `BDT ${data.amount.toLocaleString('en-BD')} successfully added to Main Institutional Treasury.`
    );

    return { success: true, message: `Successfully transferred BDT ${data.amount.toLocaleString('en-BD')}` };
  };

  const deleteFundTransfer = (id: string) => {
    setFundTransfers((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Fund Transfer Voided', 'Transfer record removed.');
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUserProfile(initialUserProfile);
    setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
    setClasses(initialClasses);
    setDepartments(initialDepartments);
    setSubjects(initialSubjects);
    setClassRoutines(initialClassRoutines);
    setShareholders(initialShareholders);
    setStaff(initialStaff);
    setStudents(initialStudents);
    setStaffAttendance(initialStaffAttendance);
    setStudentAttendance(initialStudentAttendance);
    setQrLogs(initialQRLogs);
    setAcademicEvents(initialAcademicEvents);
    setDiaryEntries(initialDiaryEntries);
    setExams(initialExams);
    setExamRoutines(initialExamRoutines);
    setExamResults(initialExamResults);
    setTransactions(initialTransactions);
    setTeacherSalaries(initialTeacherSalaries);
    setAdvanceSalaries(initialAdvanceSalaries);
    setFundTransfers(initialFundTransfers);
    setNotices(initialNotices);
    setActivityLogs(initialActivityLogs);
    setNotifications(initialNotifications);
    showToast('success', 'System Reset', 'Demo data reloaded to pristine state.');
  };

  return (
    <SchoolContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        searchQuery,
        setSearchQuery,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,

        userProfile,
        updateUserProfile,

        schoolSettings,
        updateSchoolSettings,
        resetSchoolSettings,

        language,
        setLanguage,
        timezone,
        setTimezone,
        t,

        classes,
        addClass,
        updateClass,
        deleteClass,

        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,

        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        getSubjectsForClassAndGroup,

        classRoutines,
        addClassRoutine,
        addClassRoutinesBatch,
        updateClassRoutine,
        deleteClassRoutine,
        deleteClassRoutinesBatch,

        shareholders,
        addShareholder,
        updateShareholder,
        deleteShareholder,

        staff,
        addStaff,
        updateStaff,
        deleteStaff,

        students,
        addStudent,
        updateStudent,
        deleteStudent,

        staffAttendance,
        markStaffAttendance,

        studentAttendance,
        markStudentAttendance,

        qrLogs,
        recordQRScan,

        academicEvents,
        addAcademicEvent,
        updateAcademicEvent,
        deleteAcademicEvent,

        diaryEntries,
        addDiaryEntry,
        updateDiaryEntry,
        deleteDiaryEntry,

        exams,
        addExam,
        updateExam,
        deleteExam,

        examRoutines,
        addExamRoutine,
        addExamRoutinesBatch,
        updateExamRoutine,
        deleteExamRoutine,
        deleteExamRoutinesBatch,

        examResults,
        saveExamResult,
        deleteExamResult,

        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        teacherSalaries,
        advanceSalaries,
        payTeacherSalary,
        disburseAdvanceSalary,
        createMonthlySalarySheet,
        deleteTeacherSalary,
        addTeacherSalary,
        updateAdvanceSalary,

        fundTransfers,
        executeFundTransfer,
        deleteFundTransfer,

        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        togglePinNotice,

        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,

        activityLogs,
        toasts,
        showToast,
        removeToast,
        resetToDemoData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
