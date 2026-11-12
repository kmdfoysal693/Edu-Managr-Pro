/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Modules
import { DashboardOverview } from './modules/dashboard/DashboardOverview';
import { ShareholderAdd } from './modules/shareholders/ShareholderAdd';
import { ShareholderList } from './modules/shareholders/ShareholderList';
import { StaffAttendance } from './modules/attendance/StaffAttendance';
import { StudentAttendance } from './modules/attendance/StudentAttendance';
import { QRAttendance } from './modules/attendance/QRAttendance';
import { StaffAdd } from './modules/staff/StaffAdd';
import { StaffList } from './modules/staff/StaffList';
import { ClassAdd } from './modules/classes/ClassAdd';
import { ClassList } from './modules/classes/ClassList';
import { DepartmentList } from './modules/classes/DepartmentList';
import { SubjectAdd } from './modules/classes/SubjectAdd';
import { SubjectList } from './modules/classes/SubjectList';
import { ClassRoutineAdd } from './modules/classes/ClassRoutineAdd';
import { ClassRoutineList } from './modules/classes/ClassRoutineList';
import { AcademicCalendar } from './modules/academic/AcademicCalendar';
import { DailyDiary } from './modules/diary/DailyDiary';
import { DiaryList } from './modules/diary/DiaryList';
import { StudentAdd } from './modules/students/StudentAdd';
import { StudentList } from './modules/students/StudentList';
import { AdmitCard } from './modules/students/AdmitCard';
import { ExamRoutine } from './modules/exams/ExamRoutine';
import { ManageExam } from './modules/exams/ManageExam';
import { ExamResults } from './modules/exams/ExamResults';
import { ExamFee } from './modules/finances/ExamFee';
import { MonthlyFee } from './modules/finances/MonthlyFee';
import { Donation } from './modules/finances/Donation';
import { DayCareFee } from './modules/finances/DayCareFee';
import { OthersFinance } from './modules/finances/OthersFinance';
import { TeacherSalary } from './modules/finances/TeacherSalary';
import { FundTransfer } from './modules/finances/FundTransfer';
import { NoticeNew } from './modules/notices/NoticeNew';
import { NoticeBoard } from './modules/notices/NoticeBoard';

const MainLayout: React.FC = () => {
  const { currentRoute, isSidebarCollapsed } = useSchool();

  const renderModule = () => {
    switch (currentRoute) {
      // Dashboard
      case 'dashboard-overview':
        return <DashboardOverview />;

      // Shareholders
      case 'shareholder-add':
        return <ShareholderAdd />;
      case 'shareholder-list':
        return <ShareholderList />;

      // Attendance
      case 'attendance-staff':
        return <StaffAttendance />;
      case 'attendance-student':
        return <StudentAttendance />;
      case 'attendance-qr':
        return <QRAttendance />;

      // Staff
      case 'staff-add':
        return <StaffAdd />;
      case 'staff-list':
        return <StaffList />;

      // Class & Department
      case 'class-add':
        return <ClassAdd />;
      case 'class-list':
        return <ClassList />;
      case 'class-routine-add':
        return <ClassRoutineAdd />;
      case 'class-routine-list':
        return <ClassRoutineList />;
      case 'subject-add':
        return <SubjectAdd />;
      case 'subject-list':
        return <SubjectList />;
      case 'class-department':
        return <DepartmentList />;

      // Academic
      case 'academic-calendar':
        return <AcademicCalendar />;

      // Diary
      case 'diary-add':
        return <DailyDiary />;
      case 'diary-list':
        return <DiaryList />;

      // Student
      case 'student-add':
        return <StudentAdd />;
      case 'student-list':
        return <StudentList />;
      case 'student-admit-card':
        return <AdmitCard />;

      // Exam & Result
      case 'exam-routine':
        return <ExamRoutine />;
      case 'exam-manage':
        return <ManageExam />;
      case 'exam-results':
        return <ExamResults />;

      // Finances
      case 'finance-fund-transfer':
        return <FundTransfer />;
      case 'finance-salary':
        return <TeacherSalary />;
      case 'finance-exam-fee':
        return <ExamFee />;
      case 'finance-monthly-fee':
        return <MonthlyFee />;
      case 'finance-donation':
        return <Donation />;
      case 'finance-daycare-fee':
        return <DayCareFee />;
      case 'finance-others':
        return <OthersFinance />;

      // Notice
      case 'notice-new':
        return <NoticeNew />;
      case 'notice-board':
        return <NoticeBoard />;

      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header */}
        <Header />

        {/* Dynamic Route Content */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-150">
          {renderModule()}
        </main>
      </div>

      {/* Global Interactive Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
