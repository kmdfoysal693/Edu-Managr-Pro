import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  UsersRound,
  CalendarCheck,
  UserCheck,
  QrCode,
  GraduationCap,
  Briefcase,
  Layers,
  CalendarRange,
  BookOpen,
  BookMarked,
  Award,
  Wallet,
  Bell,
  Clock,
  FileText,
  BadgeAlert,
  Coins,
  Receipt,
  HeartHandshake,
  Baby,
  PiggyBank,
  PlusCircle,
  ListOrdered,
  FileCheck2,
  CalendarDays,
  Banknote,
  ArrowLeftRight,
  Building2,
  BookPlus,
  BookOpenCheck,
  CalendarPlus,
  CalendarClock,
  CreditCard,
} from 'lucide-react';

export interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  subItems: SubMenuItem[];
  defaultSubItem?: string;
  badge?: string;
}

export const NAVIGATION_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    defaultSubItem: 'dashboard-overview',
    subItems: [
      { id: 'dashboard-overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    ],
  },
  {
    id: 'shareholders',
    label: 'Shareholders',
    icon: UsersRound,
    defaultSubItem: 'shareholder-list',
    subItems: [
      { id: 'shareholder-add', label: 'Add Shareholder', icon: UserPlus },
      { id: 'shareholder-list', label: 'Shareholder List', icon: UsersRound },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    defaultSubItem: 'attendance-student',
    subItems: [
      { id: 'attendance-staff', label: 'Staff Attendance', icon: UserCheck },
      { id: 'attendance-student', label: 'Student Attendance', icon: GraduationCap },
      { id: 'attendance-qr', label: 'QR Attendance', icon: QrCode, badge: 'Live', badgeColor: 'bg-emerald-500 text-white' },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Briefcase,
    defaultSubItem: 'staff-list',
    subItems: [
      { id: 'staff-add', label: 'Add Staff', icon: PlusCircle },
      { id: 'staff-list', label: 'Staff List', icon: Briefcase },
    ],
  },
  {
    id: 'class',
    label: 'Class & Department',
    icon: Layers,
    defaultSubItem: 'class-list',
    subItems: [
      { id: 'class-add', label: 'Add Class', icon: PlusCircle },
      { id: 'class-list', label: 'Class List', icon: Layers },
      { id: 'class-department', label: 'Department', icon: Building2 },
    ],
  },
  {
    id: 'routine',
    label: 'Routine',
    icon: CalendarClock,
    defaultSubItem: 'class-routine-list',
    subItems: [
      { id: 'class-routine-list', label: 'Routine List', icon: CalendarClock },
      { id: 'class-routine-add', label: 'Add Class Routine', icon: CalendarPlus },
    ],
  },
  {
    id: 'subject',
    label: 'Subject',
    icon: BookOpenCheck,
    defaultSubItem: 'subject-list',
    subItems: [
      { id: 'subject-list', label: 'Subject List', icon: BookOpenCheck },
      { id: 'subject-add', label: 'Add Subject', icon: BookPlus },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: CalendarRange,
    defaultSubItem: 'academic-calendar',
    subItems: [
      { id: 'academic-calendar', label: 'Academic Calendar', icon: CalendarDays },
    ],
  },
  {
    id: 'diary',
    label: 'Diary',
    icon: BookOpen,
    defaultSubItem: 'diary-list',
    subItems: [
      { id: 'diary-add', label: 'Daily Diary', icon: PlusCircle },
      { id: 'diary-list', label: 'Diary List', icon: BookMarked },
    ],
  },
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    defaultSubItem: 'student-list',
    subItems: [
      { id: 'student-add', label: 'Add Student', icon: UserPlus },
      { id: 'student-list', label: 'Student List', icon: GraduationCap },
      { id: 'student-admit-card', label: 'Admit Card', icon: FileCheck2 },
    ],
  },
  {
    id: 'exam',
    label: 'Exam & Result',
    icon: Award,
    defaultSubItem: 'exam-routine',
    subItems: [
      { id: 'exam-routine', label: 'Exam Routine', icon: Clock },
      { id: 'exam-manage', label: 'Manage Exam', icon: ListOrdered },
      { id: 'exam-results', label: 'Exam Results', icon: FileText },
    ],
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: Wallet,
    defaultSubItem: 'finance-monthly-fee',
    subItems: [
      { id: 'finance-fund-transfer', label: 'Fund Transfer', icon: ArrowLeftRight, badge: 'Treasury', badgeColor: 'bg-indigo-600 text-white' },
      { id: 'finance-salary', label: 'Teacher Salary & Advance', icon: Banknote, badge: 'New', badgeColor: 'bg-emerald-500 text-white' },
      { id: 'finance-exam-fee', label: 'Exam Fee', icon: Coins },
      { id: 'finance-monthly-fee', label: 'Monthly Fee', icon: Receipt },
      { id: 'finance-donation', label: 'Donation', icon: HeartHandshake },
      { id: 'finance-daycare-fee', label: 'Day Care Fee', icon: Baby },
      { id: 'finance-others', label: 'Others (Income & Expense)', icon: PiggyBank },
    ],
  },
  {
    id: 'notice',
    label: 'Notice',
    icon: Bell,
    defaultSubItem: 'notice-board',
    subItems: [
      { id: 'notice-new', label: 'New Notice', icon: PlusCircle },
      { id: 'notice-board', label: 'Notice Board', icon: BadgeAlert },
    ],
  },
  {
    id: 'subscription',
    label: 'Subscription',
    icon: CreditCard,
    defaultSubItem: 'subscription-plans',
    subItems: [
      { id: 'subscription-plans', label: 'Subscription Plans', icon: CreditCard },
    ],
  },
];
