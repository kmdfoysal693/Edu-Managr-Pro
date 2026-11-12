import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Users,
  Briefcase,
  GraduationCap,
  Layers,
  CalendarCheck,
  UserCheck,
  UsersRound,
  Receipt,
  Coins,
  HeartHandshake,
  Clock,
  Bell,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  Banknote,
  Wallet,
  ArrowLeftRight,
  CalendarClock,
  CalendarPlus,
  BookOpen,
  FileSpreadsheet,
  BellRing,
  Sparkles,
  CheckCheck,
  Search,
} from 'lucide-react';

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const {
    students,
    staff,
    classes,
    shareholders,
    studentAttendance,
    staffAttendance,
    transactions,
    teacherSalaries,
    fundTransfers,
    notices,
    exams,
    academicEvents,
    activityLogs,
    setCurrentRoute,
    subjects,
    classRoutines,
    examRoutines,
    advanceSalaries,
    notifications,
    unreadNotificationsCount,
  } = useSchool();

  // Calculated Stats
  const totalStudents = students.length;
  const totalStaff = staff.length;
  const totalTeachers = staff.filter((s) => s.department !== 'Administration & Finance' && s.department !== 'IT & Facilities').length;
  const totalClasses = classes.length;

  const todayStr = new Date().toISOString().split('T')[0];

  const todayStudentAtt = studentAttendance.filter((a) => a.date === todayStr);
  const studentPresentCount = todayStudentAtt.filter((a) => a.status === 'Present').length;
  const studentAttPct = totalStudents > 0 ? Math.round((studentPresentCount / totalStudents) * 100) : 0;

  const todayStaffAtt = staffAttendance.filter((a) => a.date === todayStr);
  const staffPresentCount = todayStaffAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const staffAttPct = totalStaff > 0 ? Math.round((staffPresentCount / totalStaff) * 100) : 0;

  const totalShareholdersCount = shareholders.length;

  // Financial sums across all 5 collection vaults
  const monthlyFeeCollection = transactions
    .filter((t) => t.feeType === 'Monthly Fee' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const examFeeCollection = transactions
    .filter((t) => t.feeType === 'Exam Fee' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonations = transactions
    .filter((t) => t.feeType === 'Donation' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const daycareFeeCollection = transactions
    .filter((t) => t.feeType === 'Day Care Fee' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const otherIncomes = transactions
    .filter((t) => t.feeType === 'Other Income' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total Gross Collected across vaults
  const totalCollectionsInVaults = monthlyFeeCollection + examFeeCollection + totalDonations + daycareFeeCollection + otherIncomes;

  // Official Institutional Operating Earnings: ONLY funds transferred via Fund Transfer!
  // Funds enter official earnings only upon transfer
  const totalTransferredToMainTreasury = fundTransfers
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Un-transferred collections remaining in vaults
  const totalPendingInVaults = Math.max(0, totalCollectionsInVaults - totalTransferredToMainTreasury);

  // Total Teacher & Staff Salaries Disbursed
  const totalTeacherSalariesPaid = teacherSalaries
    .filter((s) => s.status === 'Completed')
    .reduce((sum, s) => sum + s.netPayable, 0);

  // Other school operational expenses
  const otherSchoolExpenses = transactions
    .filter((t) => t.feeType === 'School Expense' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInstitutionalExpenses = totalTeacherSalariesPaid + otherSchoolExpenses;

  // Net Usable Institutional Treasury Balance
  const netInstitutionalTreasuryBalance = totalTransferredToMainTreasury - totalInstitutionalExpenses;

  const pendingFeesTotal = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalNoticesCount = notices.length;

  // Newly Added Systems Calculations
  const totalClassRoutineSlots = classRoutines.length;
  const uniqueClassesWithRoutine = new Set(classRoutines.map((r) => r.className)).size;

  const totalCurriculumSubjects = subjects.length;
  const scienceSubjectsCount = subjects.filter((s) => s.group === 'Science').length;
  const commerceSubjectsCount = subjects.filter((s) => s.group === 'Commerce').length;
  const humanitiesSubjectsCount = subjects.filter((s) => s.group === 'Humanities').length;
  const compulsorySubjectsCount = subjects.filter((s) => s.group === 'General' || !s.group).length;

  const totalExamRoutineSlots = examRoutines.length;
  const uniqueExamClasses = new Set(examRoutines.map((r) => r.className)).size;

  const totalAdvanceDisbursed = advanceSalaries.reduce((sum, a) => sum + a.amount, 0);
  const totalAdvanceRecovered = advanceSalaries.reduce((sum, a) => sum + a.recoveredAmount, 0);
  const totalAdvanceRemaining = advanceSalaries.reduce((sum, a) => sum + a.remainingBalance, 0);
  const activeAdvanceCount = advanceSalaries.filter((a) => a.status === 'Active').length;

  // Format BDT
  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  // Monthly Tuition Fee Student Clearance Ratios
  const monthlyPaidStudentIds = new Set(
    transactions.filter((t) => t.feeType === 'Monthly Fee' && t.status === 'Paid').map((t) => t.partyId)
  );
  const monthlyPaidStudentsCount = students.filter((s) => monthlyPaidStudentIds.has(s.studentId)).length;
  const monthlyUnpaidStudentsCount = Math.max(0, totalStudents - monthlyPaidStudentsCount);
  const monthlyFeePaidPct = totalStudents > 0 ? Math.round((monthlyPaidStudentsCount / totalStudents) * 100) : 0;

  // Examination Fee Student Clearance Ratios
  const examPaidStudentIds = new Set(
    transactions.filter((t) => t.feeType === 'Exam Fee' && t.status === 'Paid').map((t) => t.partyId)
  );
  const examPaidStudentsCount = students.filter((s) => examPaidStudentIds.has(s.studentId)).length;
  const examUnpaidStudentsCount = Math.max(0, totalStudents - examPaidStudentsCount);
  const examFeePaidPct = totalStudents > 0 ? Math.round((examPaidStudentsCount / totalStudents) * 100) : 0;

  // Monthly Staff Salary Clearance Ratios
  const currentSalaryMonth = 'November 2026';
  const currentMonthSalaries = teacherSalaries.filter((s) => s.month === currentSalaryMonth);
  const paidStaffCount = currentMonthSalaries.filter((s) => s.status === 'Completed').length;
  const unpaidStaffCount = Math.max(0, totalStaff - paidStaffCount);
  const staffSalaryPaidPct = totalStaff > 0 ? Math.round((paidStaffCount / totalStaff) * 100) : 0;

  // Fund Transfer History Table Filters & Search
  const [transferFilterVault, setTransferFilterVault] = React.useState<string>('All');
  const [transferSearchQuery, setTransferSearchQuery] = React.useState<string>('');

  const filteredFundTransfers = fundTransfers.filter((trf) => {
    const matchesVault =
      transferFilterVault === 'All' ||
      trf.sourceStream === transferFilterVault ||
      trf.sourceStreamLabel.toLowerCase().includes(transferFilterVault.toLowerCase());
    const matchesSearch =
      !transferSearchQuery ||
      trf.transferNumber.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      trf.sourceStreamLabel.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      trf.destinationFund.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      (trf.referenceNote && trf.referenceNote.toLowerCase().includes(transferSearchQuery.toLowerCase())) ||
      trf.transferredBy.toLowerCase().includes(transferSearchQuery.toLowerCase());
    return matchesVault && matchesSearch;
  });

  // Chart Data: Student Attendance Overview (Past 6 Days)
  const attendanceOverviewData = [
    { day: 'Mon', Present: 24, Absent: 2, Late: 1 },
    { day: 'Tue', Present: 25, Absent: 1, Late: 1 },
    { day: 'Wed', Present: 26, Absent: 0, Late: 1 },
    { day: 'Thu', Present: 23, Absent: 3, Late: 1 },
    { day: 'Fri', Present: 25, Absent: 1, Late: 1 },
    { day: 'Sat (Today)', Present: Math.max(studentPresentCount, 7), Absent: 1, Late: 0 },
  ];

  // Chart Data: Monthly Fee Collection Trend (6 months)
  const monthlyTrendData = [
    { month: 'May', Target: 180000, Collected: 175000 },
    { month: 'Jun', Target: 180000, Collected: 182000 },
    { month: 'Jul', Target: 185000, Collected: 178000 },
    { month: 'Aug', Target: 190000, Collected: 195000 },
    { month: 'Sep', Target: 190000, Collected: 188000 },
    { month: 'Oct', Target: 200000, Collected: 212000 },
  ];

  // Chart Data: Student Distribution by Class
  const classDistData = [
    { name: 'Class 10 (SSC)', value: 42, color: '#2563EB' },
    { name: 'Class 9', value: 38, color: '#0EA5E9' },
    { name: 'Class 8', value: 35, color: '#10B981' },
    { name: 'Class 5', value: 30, color: '#F59E0B' },
    { name: 'Primary (1-4)', value: 65, color: '#8B5CF6' },
    { name: 'Pre-Primary', value: 45, color: '#EC4899' },
  ];

  // Chart Data: Exam Performance Overview
  const examPerformanceData = [
    { subject: 'Bangla', GPA5: 85, GPA4: 12, Below: 3 },
    { subject: 'English', GPA5: 88, GPA4: 9, Below: 3 },
    { subject: 'Math', GPA5: 92, GPA4: 6, Below: 2 },
    { subject: 'Science', GPA5: 90, GPA4: 8, Below: 2 },
    { subject: 'Higher Math', GPA5: 84, GPA4: 13, Below: 3 },
  ];

  // Chart Data: Income Overview (Tuition, Exam, Donations, Daycare)
  const incomeOverviewData = [
    { week: 'Week 1', Tuition: 45000, ExamFees: 12000, Donations: 20000, Daycare: 8000 },
    { week: 'Week 2', Tuition: 62000, ExamFees: 18000, Donations: 50000, Daycare: 12000 },
    { week: 'Week 3', Tuition: 58000, ExamFees: 25000, Donations: 80000, Daycare: 10000 },
    { week: 'Week 4', Tuition: 47000, ExamFees: 30000, Donations: 75000, Daycare: 9000 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#2563EB] rounded-2xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Academic Session 2026-2027 Active
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2.5">
            Welcome back, Md. Foysal Khan
          </h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Everything is running smoothly. Today student presence is at{' '}
            <span className="font-bold text-white underline decoration-emerald-400 decoration-2">{studentAttPct}%</span> across all classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
            onClick={() => setCurrentRoute('attendance-qr')}
          >
            Launch QR Attendance
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="!bg-white !text-[#1E3A8A] hover:!bg-blue-50 font-bold"
            onClick={() => setCurrentRoute('student-add')}
          >
            + Admit Student
          </Button>
        </div>
      </div>

      {/* Institutional Financial Balance & Fund Transfer Settlement Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <Wallet className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-[#172554]">
                Institutional Treasury & Fund Transfer Balance
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fees in collection vaults enter official operating earnings only via <strong>Fund Transfer</strong>, from which salaries and school expenditures are funded.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentRoute('finance-fund-transfer')}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Fund Transfer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentRoute('finance-salary')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
            >
              <Banknote className="w-4 h-4 text-blue-600" />
              Teacher Salary
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Official Operating Earnings (Transferred Funds) */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                Main Treasury Inflow
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                Transferred
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                {fmtBDT(totalTransferredToMainTreasury)}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Settled
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Moved to treasury via Fund Transfer
            </p>
          </div>

          {/* Card 2: Pending in Collection Vaults */}
          <div
            onClick={() => setCurrentRoute('finance-fund-transfer')}
            className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 cursor-pointer hover:border-amber-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Pending in Vaults
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Un-transferred
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-800">
                {fmtBDT(totalPendingInVaults)}
              </span>
              <span className="text-xs font-bold text-amber-600">Awaiting</span>
            </div>
            <p className="text-[11px] text-amber-700/80 mt-1 flex items-center justify-between">
              <span>Exam, Tuition & Donations</span>
              <span className="underline group-hover:text-amber-900 font-bold">Transfer Now &rarr;</span>
            </p>
          </div>

          {/* Card 3: Expenditures Subtracted */}
          <div
            onClick={() => setCurrentRoute('finance-salary')}
            className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 cursor-pointer hover:border-rose-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                Salaries & Expenses
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                - Subtracted
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-rose-700">
                - {fmtBDT(totalInstitutionalExpenses)}
              </span>
              <span className="text-xs font-bold text-rose-500 flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Disbursed
              </span>
            </div>
            <p className="text-[11px] text-rose-600/80 mt-1 flex items-center justify-between">
              <span>Salaries ({fmtBDT(totalTeacherSalariesPaid)}) + Other</span>
              <span className="underline group-hover:text-rose-800 font-bold">View Sheet &rarr;</span>
            </p>
          </div>

          {/* Card 4: Net Usable Institutional Treasury Balance */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-sm border border-indigo-950">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
              Net Usable Treasury Balance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
                {fmtBDT(netInstitutionalTreasuryBalance)}
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 mt-1">
              Transferred earnings minus paid expenses
            </p>
          </div>
        </div>
      </div>


      {/* 12 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={GraduationCap}
          trend={{ value: '+8.4%', isPositive: true, label: 'vs last semester' }}
          colorTheme="blue"
          onClick={() => setCurrentRoute('student-list')}
        />
        <StatCard
          title="Total Staff"
          value={totalStaff}
          icon={Briefcase}
          trend={{ value: 'Full capacity', isNeutral: true }}
          colorTheme="sky"
          onClick={() => setCurrentRoute('staff-list')}
        />
        <StatCard
          title="Total Teachers"
          value={totalTeachers}
          icon={Users}
          trend={{ value: '1:14 ratio', isPositive: true, label: 'student/teacher' }}
          colorTheme="indigo"
          onClick={() => setCurrentRoute('staff-list')}
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          icon={Layers}
          trend={{ value: '26 sections', isNeutral: true }}
          colorTheme="violet"
          onClick={() => setCurrentRoute('class-list')}
        />
        <StatCard
          title="Today's Student Attendance"
          value={`${studentAttPct}%`}
          subtitle={`${studentPresentCount} of ${totalStudents} present`}
          icon={CalendarCheck}
          trend={{ value: '+2.1%', isPositive: true, label: 'from yesterday' }}
          colorTheme="emerald"
          onClick={() => setCurrentRoute('attendance-student')}
        />
        <StatCard
          title="Today's Staff Attendance"
          value={`${staffAttPct}%`}
          subtitle={`${staffPresentCount} of ${totalStaff} present`}
          icon={UserCheck}
          trend={{ value: '98% avg', isPositive: true }}
          colorTheme="teal"
          onClick={() => setCurrentRoute('attendance-staff')}
        />
        <StatCard
          title="Total Shareholders"
          value={totalShareholdersCount}
          icon={UsersRound}
          trend={{ value: 'BDT 9,000,000', isPositive: true, label: 'equity capital' }}
          colorTheme="indigo"
          onClick={() => setCurrentRoute('shareholder-list')}
        />
        <StatCard
          title="Monthly Fee Collection"
          value={fmtBDT(monthlyFeeCollection)}
          icon={Receipt}
          trend={{ value: '+12.5%', isPositive: true, label: 'October run rate' }}
          colorTheme="emerald"
          onClick={() => setCurrentRoute('finance-monthly-fee')}
        />
        <StatCard
          title="Monthly Fee Clearance"
          value={`${monthlyUnpaidStudentsCount}/${totalStudents}`}
          subtitle={`${monthlyUnpaidStudentsCount} of ${totalStudents} students unpaid (${monthlyPaidStudentsCount} paid)`}
          icon={Receipt}
          trend={{ value: `${monthlyPaidStudentsCount}/${totalStudents} Paid`, isPositive: monthlyUnpaidStudentsCount === 0, label: 'student ratio' }}
          colorTheme={monthlyUnpaidStudentsCount > 0 ? 'amber' : 'emerald'}
          onClick={() => setCurrentRoute('finance-monthly-fee')}
        />
        <StatCard
          title="Exam Fee Collection"
          value={fmtBDT(examFeeCollection)}
          icon={Coins}
          trend={{ value: '88% cleared', isPositive: true }}
          colorTheme="sky"
          onClick={() => setCurrentRoute('finance-exam-fee')}
        />
        <StatCard
          title="Exam Fee Clearance"
          value={`${examUnpaidStudentsCount}/${totalStudents}`}
          subtitle={`${examUnpaidStudentsCount} of ${totalStudents} students unpaid (${examPaidStudentsCount} paid)`}
          icon={Coins}
          trend={{ value: `${examPaidStudentsCount}/${totalStudents} Paid`, isPositive: examUnpaidStudentsCount === 0, label: 'student ratio' }}
          colorTheme={examUnpaidStudentsCount > 0 ? 'amber' : 'sky'}
          onClick={() => setCurrentRoute('finance-exam-fee')}
        />
        <StatCard
          title="Total Donations"
          value={fmtBDT(totalDonations)}
          icon={HeartHandshake}
          trend={{ value: '+BDT 225,000', isPositive: true, label: 'this month' }}
          colorTheme="violet"
          onClick={() => setCurrentRoute('finance-donation')}
        />
        <StatCard
          title="Teacher Salaries Disbursed"
          value={fmtBDT(totalTeacherSalariesPaid)}
          subtitle={`${paidStaffCount} of ${totalStaff} staff paid`}
          icon={Banknote}
          trend={{ value: `${paidStaffCount} paid / ${unpaidStaffCount} pending`, isPositive: true }}
          colorTheme="rose"
          onClick={() => setCurrentRoute('finance-salary')}
        />
        <StatCard
          title="Staff Salaries Disbursed"
          value={`${paidStaffCount}/${totalStaff}`}
          subtitle={`${paidStaffCount} of ${totalStaff} staff paid for ${currentSalaryMonth}`}
          icon={UserCheck}
          trend={{ value: `${unpaidStaffCount}/${totalStaff} Pending Clearance`, isPositive: unpaidStaffCount === 0, label: 'click to manage' }}
          colorTheme="indigo"
          onClick={() => setCurrentRoute('finance-salary')}
        />
        <StatCard
          title="Pending Student Fees"
          value={fmtBDT(pendingFeesTotal)}
          icon={Clock}
          trend={{ value: '4 reminders sent', isPositive: false }}
          colorTheme="rose"
          onClick={() => setCurrentRoute('finance-monthly-fee')}
        />
        <StatCard
          title="Total Notices"
          value={totalNoticesCount}
          icon={Bell}
          trend={{ value: '2 high priority', isNeutral: true }}
          colorTheme="amber"
          onClick={() => setCurrentRoute('notice-board')}
        />
      </div>

      {/* Student Fee & Staff Salary Payment Clearance Status Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Receipt className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-[#172554]">
                Student Fee & Staff Salary Payment Clearance Status
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live clearance ratios tracking students with pending dues vs cleared fees, and faculty monthly salary disbursement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Session 2026-2027
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Monthly Tuition Fee Student Clearance */}
          <div
            onClick={() => setCurrentRoute('finance-monthly-fee')}
            className="p-5 rounded-xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/90 hover:border-emerald-400 transition-all cursor-pointer group shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" /> Monthly Fee Clearance
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Tuition Fee
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-900">
                {monthlyUnpaidStudentsCount}/{totalStudents}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Unpaid (Due)
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Out of {totalStudents} total students, <strong className="text-amber-800">{monthlyUnpaidStudentsCount}</strong> have not paid monthly fees (<strong className="text-emerald-700">{monthlyPaidStudentsCount}</strong> cleared).
            </p>

            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Payment Rate ({monthlyFeePaidPct}%)</span>
                <span>{monthlyPaidStudentsCount} of {totalStudents} Students</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyFeePaidPct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Collected: {fmtBDT(monthlyFeeCollection)}</span>
              <span className="font-bold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                Collect Fee &rarr;
              </span>
            </div>
          </div>

          {/* Card 2: Examination Fee Student Clearance */}
          <div
            onClick={() => setCurrentRoute('finance-exam-fee')}
            className="p-5 rounded-xl bg-gradient-to-br from-sky-50/60 to-white border border-sky-200/90 hover:border-sky-400 transition-all cursor-pointer group shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-sky-600" /> Exam Fee Clearance
              </span>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                Semester Final
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-sky-900">
                {examUnpaidStudentsCount}/{totalStudents}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Unpaid (Due)
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Out of {totalStudents} total students, <strong className="text-amber-800">{examUnpaidStudentsCount}</strong> have not paid examination fees (<strong className="text-sky-700">{examPaidStudentsCount}</strong> cleared).
            </p>

            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Payment Rate ({examFeePaidPct}%)</span>
                <span>{examPaidStudentsCount} of {totalStudents} Students</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${examFeePaidPct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Collected: {fmtBDT(examFeeCollection)}</span>
              <span className="font-bold text-sky-700 group-hover:text-sky-900 flex items-center gap-1">
                Collect Fee &rarr;
              </span>
            </div>
          </div>

          {/* Card 3: Staff Salary Disbursement Clearance */}
          <div
            onClick={() => setCurrentRoute('finance-salary')}
            className="p-5 rounded-xl bg-gradient-to-br from-rose-50/60 to-white border border-rose-200/90 hover:border-rose-400 transition-all cursor-pointer group shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-rose-600" /> Staff Salaries Disbursed
              </span>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                {currentSalaryMonth}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-rose-900">
                {paidStaffCount}/{totalStaff}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Staff Paid
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              For {currentSalaryMonth}, <strong className="text-emerald-700">{paidStaffCount}</strong> of {totalStaff} staff members have been paid in full (<strong className="text-rose-700">{unpaidStaffCount}</strong> pending clearance).
            </p>

            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Disbursement Rate ({staffSalaryPaidPct}%)</span>
                <span>{paidStaffCount} of {totalStaff} Staff Paid</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${staffSalaryPaidPct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Disbursed: {fmtBDT(totalTeacherSalariesPaid)}</span>
              <span className="font-bold text-rose-700 group-hover:text-rose-900 flex items-center gap-1">
                Salary Management &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Charts: Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Student Attendance Overview (Bar Chart) */}
        <Card
          title="Student Attendance Overview"
          subtitle="Daily presence, absence, and late check-in trend"
          icon={CalendarCheck}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('attendance-student')}>
              Full Sheet <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Present" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Late" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Monthly Fee Collection (Line Chart) */}
        <Card
          title="Monthly Fee Collection Trend"
          subtitle="Collected amounts vs projected school target (BDT)"
          icon={Receipt}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('finance-monthly-fee')}>
              Breakdown <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `BDT ${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [fmtBDT(Number(val) || 0), 'Amount']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Collected" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Target" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Student Distribution by Class (Donut Chart) */}
        <Card
          title="Student Distribution by Class"
          subtitle="Enrolled student density across grades"
          icon={Layers}
        >
          <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-full sm:w-1/2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {classDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val || 0} Students`, 'Total']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 grid grid-cols-2 gap-2 text-xs">
              {classDistData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.value} students</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Chart 4: Exam Performance Overview (Bar Chart) */}
        <Card
          title="Exam Performance Overview"
          subtitle="SSC Pre-Test & Mid-Term grade distribution (%)"
          icon={TrendingUp}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('exam-results')}>
              Report Cards <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={examPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="GPA5" name="GPA 5.0 (A+)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GPA4" name="GPA 4.0-4.9 (A)" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Below" name="Below 4.0" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Comprehensive Fund Transfer History & Vault Settlement Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <ArrowLeftRight className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-[#172554]">
                Fund Transfer History & Vault Settlement
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete audit log of funds transferred from individual collection vaults (Monthly Fee, Exam Fee, Donations, Daycare, etc.) into the main institutional treasury.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              Total Settled: {fmtBDT(totalTransferredToMainTreasury)}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentRoute('finance-fund-transfer')}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <ArrowLeftRight className="w-4 h-4" />
              + New Fund Transfer
            </Button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'All', label: 'All Vaults' },
              { id: 'Monthly Fee', label: 'Monthly Fee' },
              { id: 'Exam Fee', label: 'Exam Fee' },
              { id: 'Donation', label: 'Donation' },
              { id: 'Day Care Fee', label: 'Day Care' },
              { id: 'Other Income', label: 'Other' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setTransferFilterVault(v.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  transferFilterVault === v.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transfer history..."
              value={transferSearchQuery}
              onChange={(e) => setTransferSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Transfers Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transfer Ref</th>
                <th className="py-3 px-4">Source Vault (From)</th>
                <th className="py-3 px-4">Destination Treasury (To)</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4">Transferred By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredFundTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No fund transfer records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredFundTransfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-indigo-700">{trf.transferNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{trf.date} • {trf.paymentMethod}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{trf.sourceStreamLabel}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {trf.sourceStream}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{trf.destinationFund}</span>
                      </div>
                      {trf.referenceNote && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]" title={trf.referenceNote}>
                          {trf.referenceNote}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-black text-sm text-emerald-700">
                        {fmtBDT(trf.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{trf.transferredBy}</div>
                      <div className="text-[10px] text-slate-400">Approved: {trf.approvedBy}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" size="sm">
                        {trf.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setCurrentRoute('finance-fund-transfer')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        Open <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary info */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredFundTransfers.length} of {fundTransfers.length} settled transfer records</span>
          <button
            onClick={() => setCurrentRoute('finance-fund-transfer')}
            className="text-indigo-600 hover:underline font-semibold mt-1 sm:mt-0"
          >
            Manage All Vault Transfers in Finance &rarr;
          </button>
        </div>
      </div>

      {/* Chart 5: Comprehensive Income Overview (Area Chart) */}
      <Card
        title="Income Streams Overview"
        subtitle="Weekly revenue breakdown across Tuition, Exam Fees, Donations & Daycare (BDT)"
        icon={Receipt}
        action={
          <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('finance-others')}>
            Finance Center <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
      >
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeOverviewData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTuition" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `BDT ${val / 1000}k`} />
              <Tooltip
                formatter={(val: any) => [fmtBDT(Number(val) || 0), 'Amount']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Tuition" stroke="#2563EB" fillOpacity={1} fill="url(#colorTuition)" />
              <Area type="monotone" dataKey="Donations" stroke="#10B981" fillOpacity={1} fill="url(#colorDonations)" />
              <Area type="monotone" dataKey="ExamFees" stroke="#F59E0B" fillOpacity={1} fill="url(#colorExam)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Additional Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Student Admissions */}
        <Card
          title="Recent Admissions"
          subtitle="Newly enrolled students"
          icon={GraduationCap}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('student-list')}>
              View All
            </Button>
          }
        >
          <div className="space-y-3">
            {students.slice(0, 4).map((student) => (
              <div
                key={student.id}
                onClick={() => setCurrentRoute('student-list')}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={student.photo}
                    alt={student.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172554] truncate">{student.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {student.className} • Roll: {student.rollNumber}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(student.status)} size="sm">
                  {student.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Fee Transactions */}
        <Card
          title="Recent Transactions"
          subtitle="Real-time financial activity"
          icon={Receipt}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('finance-monthly-fee')}>
              All Ledger
            </Button>
          }
        >
          <div className="space-y-3">
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#172554] truncate">{tx.partyName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({tx.paymentMethod})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{tx.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-bold ${
                      tx.feeType === 'School Expense' ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {tx.feeType === 'School Expense' ? '-' : '+'}
                    {fmtBDT(tx.amount)}
                  </p>
                  <Badge variant={getStatusBadgeVariant(tx.status)} size="sm" className="mt-0.5">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Academic Events & Exams */}
        <Card
          title="Upcoming Events & Exams"
          subtitle="Scheduled timeline"
          icon={Calendar}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('academic-calendar')}>
              Calendar
            </Button>
          }
        >
          <div className="space-y-3">
            {academicEvents.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                onClick={() => setCurrentRoute('academic-calendar')}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#2563EB]">
                    {evt.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{evt.startDate}</span>
                </div>
                <h5 className="text-xs font-bold text-[#172554] mt-1.5 truncate">{evt.title}</h5>
                {evt.time && <p className="text-[11px] text-slate-500 mt-0.5">{evt.time}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Latest Notices & Recent Activity Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Notices */}
        <Card
          title="Official Notices & Circulars"
          subtitle="Announcements for students, guardians & staff"
          icon={Bell}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('notice-board')}>
              Notice Board
            </Button>
          }
        >
          <div className="space-y-3">
            {notices.slice(0, 3).map((notice, index) => {
              const isColored = index % 2 === 1;

              return (
                <div
                  key={notice.id}
                  onClick={() => setCurrentRoute('notice-board')}
                  style={isColored ? { backgroundColor: '#99A1AF' } : { backgroundColor: '#FFFFFF' }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    isColored
                      ? 'border-[#7E8795] text-slate-950 hover:shadow-md'
                      : 'border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {notice.isPinned && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isColored ? 'bg-amber-300 text-amber-950 font-black' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          PINNED
                        </span>
                      )}
                      <Badge variant={getStatusBadgeVariant(notice.priority)} size="sm">
                        {notice.priority}
                      </Badge>
                    </div>
                    <span className={`text-[11px] font-mono ${isColored ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                      {notice.publishDate}
                    </span>
                  </div>
                  <h4
                    className={`text-xs sm:text-sm font-bold mt-2 line-clamp-1 ${
                      isColored ? 'text-slate-950' : 'text-[#172554]'
                    }`}
                  >
                    {notice.title}
                  </h4>
                  <p
                    className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                      isColored ? 'text-slate-900 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {notice.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activities & Live Notifications Stream */}
        <Card
          title="Live System Activity & Audit"
          subtitle="Real-time notifications of changes across the entire institution"
          icon={BellRing}
          action={
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoute('activity-log')}>
              Full Log <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          }
        >
          <div className="space-y-2.5">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.actionRoute) setCurrentRoute(notif.actionRoute);
                }}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer border ${
                  !notif.read ? 'bg-blue-50/50 border-blue-200/60 hover:bg-blue-50' : 'hover:bg-slate-50 border-slate-100'
                }`}
              >
                <div className="shrink-0 mt-1">
                  {notif.type === 'alert' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                  ) : notif.type === 'warning' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                  ) : notif.type === 'success' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#172554] truncate">{notif.title}</p>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-1">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {notif.module}
                    </span>
                    {notif.actionRoute && (
                      <span className="text-[10px] font-bold text-[#2563EB] hover:underline">
                        Open &rarr;
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
