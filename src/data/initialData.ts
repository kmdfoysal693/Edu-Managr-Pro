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
  TeacherSalaryRecord,
  AdvanceSalaryRecord,
  FundTransferRecord,
  DepartmentItem,
  SubjectItem,
  ClassRoutineItem,
  SystemNotification,
} from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants/school';

export const initialUserProfile: UserProfile = {
  id: 'usr-001',
  name: 'Administrator',
  email: 'admin@school.edu',
  role: 'Administrator',
  phone: '',
  avatar: DEFAULT_SCHOOL_SETTINGS.logo,
  title: 'System Administrator',
  institution: DEFAULT_SCHOOL_SETTINGS.schoolName,
};

export const initialClasses: SchoolClass[] = [];

export const initialShareholders: Shareholder[] = [];

export const initialStaff: StaffMember[] = [];

export const initialStudents: Student[] = [];

export const initialStaffAttendance: StaffAttendanceRecord[] = [];

export const initialStudentAttendance: StudentAttendanceRecord[] = [];

export const initialQRLogs: QRAttendanceLog[] = [];

export const initialAcademicEvents: AcademicEvent[] = [];

export const initialDiaryEntries: DiaryEntry[] = [];

export const initialExams: Exam[] = [];

export const initialExamRoutines: ExamRoutineItem[] = [];

export const initialExamResults: StudentExamResult[] = [];

export const initialTransactions: FinancialTransaction[] = [];

export const initialNotices: Notice[] = [];

export const initialActivityLogs: ActivityLog[] = [];

export const initialAdvanceSalaries: AdvanceSalaryRecord[] = [];

export const initialTeacherSalaries: TeacherSalaryRecord[] = [];

export const initialFundTransfers: FundTransferRecord[] = [];

export const initialDepartments: DepartmentItem[] = [];

export const initialSubjects: SubjectItem[] = [];

export const initialClassRoutines: ClassRoutineItem[] = [];

export const initialNotifications: SystemNotification[] = [];
