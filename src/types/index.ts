export type UserRole = 'Administrator' | 'Principal' | 'Accountant' | 'Teacher';

export type AppLanguage = 'en' | 'bn' | 'hi';

export interface InstitutionSettings {
  schoolName: string;
  institutionName: string;
  institutionType: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: string;
  eiin: string;
  currency: string;
  academicSession: string;
  language: AppLanguage;
  timezone: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  title: string;
  institution: string;
}

export interface Shareholder {
  id: string;
  fullName: string;
  photo: string;
  phoneNumber: string;
  email: string;
  address: string;
  shareAmount: number; // In BDT
  numberOfShares: number;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  sharePercentage?: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  designation: string;
  department: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classId: string;
  className: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export interface QRAttendanceLog {
  id: string;
  targetId: string;
  name: string;
  type: 'Student' | 'Staff';
  identifier: string; // ID number or admission number
  timestamp: string;
  date: string;
  status: AttendanceStatus;
  subInfo: string; // e.g. Class 10 - Sec A or Senior Lecturer
}

export interface StaffMember {
  id: string;
  staffId: string;
  fullName: string;
  photo: string;
  designation: string;
  department: string;
  phoneNumber: string;
  email: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  joiningDate: string;
  salary: number; // In BDT
  employmentStatus: 'Permanent' | 'Contractual' | 'Probation' | 'Inactive';
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export type AcademicGroup = 'General' | 'Science' | 'Commerce' | 'Humanities';
export type SubjectType = 'Compulsory' | 'Elective' | 'Optional 4th Subject';

export interface SubjectItem {
  id: string;
  name: string; // e.g. "Physics", "Accounting", "Bangla 1st Paper"
  bengaliName?: string; // Optional local/alternate name e.g. "Physics", "Accounting"
  code: string; // e.g. "PHY-174", "ACC-146", "BAN-101"
  classIds: string[]; // Classes eligible
  classNames?: string[]; // Readable class names
  group: AcademicGroup; // 'General' | 'Science' | 'Commerce' | 'Humanities'
  type: SubjectType; // 'Compulsory' | 'Elective' | 'Optional 4th Subject'
  totalMarks: number; // e.g. 100
  passingMarks: number; // e.g. 33
  textbookTitle?: string; // Official NCTB textbook name
  author?: string;
  departmentId?: string;
  departmentName?: string;
  status: 'Active' | 'Inactive';
  description?: string;
}

export interface SchoolClass {
  id: string;
  className: string;
  classCode: string;
  sections: string[]; // ['A', 'B', 'C']
  classTeacher: string;
  roomNumber: string;
  maxStudents: number;
  academicYear: string;
  status: 'Active' | 'Inactive';
  description?: string;
  group?: AcademicGroup; // 'General' | 'Science' | 'Commerce' | 'Humanities'
  subjectIds?: string[]; // IDs of assigned subjects
}

export interface DepartmentItem {
  id: string;
  name: string; // e.g. "Science", "Mathematics", "Information Technology"
  bengaliName?: string; // Optional local/alternate name e.g. "Science Department"
  code: string; // e.g. "SCI-101"
  headOfDepartment?: string; // Teacher or Staff name e.g. "Prof. Zahirul Haque"
  contactEmail?: string;
  description?: string;
  category: 'Academic' | 'Administrative' | 'Vocational' | 'Support';
  status: 'Active' | 'Inactive';
}

export type EventCategory = 'Examination' | 'Holiday' | 'School Event' | 'Parent Meeting' | 'Academic Deadline';

export interface AcademicEvent {
  id: string;
  title: string;
  category: EventCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Parents';
}

export interface DiaryEntry {
  id: string;
  date: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  teacherName: string;
  lessonTitle: string;
  homework: string;
  instructions: string;
  submissionDate: string;
}

export interface Student {
  id: string;
  studentId: string;
  admissionNumber: string;
  fullName: string;
  photo: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  classId: string;
  className: string;
  section: string;
  rollNumber: string;
  academicYear: string;
  admissionDate: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  guardianName?: string;
  guardianPhone?: string;
  presentAddress: string;
  permanentAddress: string;
  previousSchool?: string;
  status: 'Active' | 'Suspended' | 'Alumni' | 'Transferred';
  group?: AcademicGroup; // For Class 9 / 10 ('Science' | 'Commerce' | 'Humanities' | 'General')
  assignedSubjects?: string[]; // List of assigned subject names or IDs
}

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Saturday';

export interface ClassRoutineItem {
  id: string;
  classId: string;
  className: string;
  section: string; // e.g., 'A', 'B'
  dayOfWeek: DayOfWeek;
  periodNumber: number; // 1, 2, 3, 4, 5, 6, 7
  periodName?: string; // 'Period 1', 'Tiffin Break'
  startTime: string; // '08:30 AM'
  endTime: string; // '09:15 AM'
  subjectId?: string;
  subjectName: string; // e.g. 'Physics', 'Accounting'
  subjectCode?: string; // '174'
  teacherId?: string;
  teacherName: string;
  roomNumber: string;
  isBreak?: boolean;
}

export interface ExamRoutineItem {
  id: string;
  examId: string;
  examName: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  invigilator: string;
}

export interface Exam {
  id: string;
  name: string; // e.g., "Annual Final Examination 2026"
  academicYear: string;
  classIds: string[]; // Classes eligible
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  status: 'Upcoming' | 'Ongoing' | 'Published' | 'Archived';
  description?: string;
}

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  subjects: SubjectMark[];
  totalObtained: number;
  maxTotal: number;
  percentage: number;
  gpa: number;
  letterGrade: string;
  isPassed: boolean;
  remarks: string;
}

export type FeeType = 'Exam Fee' | 'Monthly Fee' | 'Donation' | 'Day Care Fee' | 'Other Income' | 'School Expense' | 'Teacher Salary';

export type SalaryPaymentStatus = 'Completed' | 'Pending';

export interface TeacherSalaryRecord {
  id: string;
  staffId: string;
  teacherName: string;
  designation: string;
  department: string;
  month: string; // e.g., 'November 2026'
  year: number; // 2026
  basicSalary: number;
  bonus: number;
  bonusReason?: string;
  allowances: number;
  advanceDeduction: number;
  netPayable: number;
  status: SalaryPaymentStatus;
  paymentDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque';
  receiptNumber?: string;
  notes?: string;
}

export interface AdvanceSalaryRecord {
  id: string;
  staffId: string;
  teacherName: string;
  designation: string;
  amount: number;
  requestDate: string;
  disbursementDate?: string;
  monthlyDeduction: number;
  recoveredAmount: number;
  remainingBalance: number;
  reason: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash';
  status: 'Active' | 'Settled';
  approvedBy: string;
}

export type FundSourceStream = 'Monthly Fee' | 'Exam Fee' | 'Donation' | 'Day Care Fee' | 'Other Income' | 'All Streams';

export interface FundTransferRecord {
  id: string;
  transferNumber: string;
  sourceStream: FundSourceStream;
  sourceStreamLabel: string;
  destinationFund: string;
  amount: number; // In BDT
  date: string;
  transferredBy: string;
  approvedBy: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'bKash' | 'Cheque' | 'Internal Ledger';
  referenceNote?: string;
  status: 'Completed' | 'Pending';
}

export interface FinancialTransaction {
  id: string;
  receiptNumber: string;
  feeType: FeeType;
  title: string;
  amount: number; // In BDT
  date: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque';
  status: 'Paid' | 'Pending' | 'Overdue';
  partyName: string; // Student name, donor name, vendor name
  partyId?: string; // Student ID or Staff ID
  partyContact?: string;
  classInfo?: string;
  notes?: string;
  category?: string; // For expenses: 'Utilities', 'Maintenance', 'Salaries', 'Supplies', etc.
}

export type NoticeCategory = 'Academic' | 'Administrative' | 'Examination' | 'Holiday' | 'Sports & Events' | 'Emergency';
export type NoticePriority = 'Normal' | 'Medium' | 'High' | 'Urgent';

export interface Notice {
  id: string;
  title: string;
  category: NoticeCategory;
  description: string;
  publishDate: string;
  expiryDate: string;
  targetAudience: 'All' | 'Teachers & Staff' | 'Students & Parents' | 'Shareholders';
  priority: NoticePriority;
  publishStatus: 'Published' | 'Draft' | 'Archived';
  isPinned: boolean;
  attachmentName?: string;
  author: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  module: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  module: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string; // ISO date string for live relative-time computation
  read: boolean;
  actionRoute?: string;
}

