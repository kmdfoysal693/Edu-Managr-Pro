import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherSalaryRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  Banknote,
  PlusCircle,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  HandCoins,
  RefreshCw,
  Search,
  Check,
  Calendar,
  Trash2,
  ArrowLeftRight,
  Gift,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const GIFT_REASON_PRESETS = [
  'Eid Bonus',
  'Work Performance',
  'Festival Gift',
  'Best Attendance Award',
  'Extra Duty / Overtime Gift',
  'Annual Appreciation Gift',
  'Custom Reason',
] as const;

export const TeacherSalary: React.FC = () => {
  const {
    staff,
    teacherSalaries,
    advanceSalaries,
    schoolSettings,
    payTeacherSalary,
    addTeacherSalary,
    disburseAdvanceSalary,
    createMonthlySalarySheet,
    deleteTeacherSalary,
    setCurrentRoute,
    departments: schoolDepts,
    showToast,
    language,
  } = useSchool();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'sheet' | 'advances'>('sheet');

  const nowDate = new Date();
  const currentMonthName = MONTH_NAMES[nowDate.getMonth()];
  const currentYear = nowDate.getFullYear();
  const currentMonthLabel = `${currentMonthName} ${currentYear}`;

  // Unique months available
  const availableMonths = Array.from(new Set(teacherSalaries.map((s) => s.month)));
  if (!availableMonths.includes(currentMonthLabel)) availableMonths.unshift(currentMonthLabel);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || currentMonthLabel);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddSalaryModalOpen, setIsAddSalaryModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSalaryToPay, setSelectedSalaryToPay] = useState<TeacherSalaryRecord | null>(null);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isPrintSheetModalOpen, setIsPrintSheetModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<TeacherSalaryRecord | null>(null);

  // Add Direct Salary Form State
  const [addSalaryForm, setAddSalaryForm] = useState({
    staffId: staff[0]?.id || '',
    billingMonthName: currentMonthName,
    billingYear: currentYear,
    basicSalary: staff[0]?.salary || 0,
    giftAmount: 0,
    giftReason: 'Eid Bonus',
    customGiftReason: '',
    allowances: 0,
    advanceDeduction: 0,
    status: 'Completed' as 'Completed' | 'Pending',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque',
    paymentDate: nowDate.toISOString().split('T')[0],
    notes: '',
  });

  // Pay Salary Form State
  const [payFormData, setPayFormData] = useState({
    bonus: 0,
    bonusReason: '',
    giftAmount: 0,
    giftReason: 'Eid Bonus',
    customGiftReason: '',
    allowances: 0,
    advanceDeduction: 0,
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque',
    paymentDate: nowDate.toISOString().split('T')[0],
    notes: '',
  });

  // Grant Advance Form State
  const [advanceFormData, setAdvanceFormData] = useState({
    staffId: staff[0]?.id || '',
    amount: 0,
    monthlyDeduction: 0,
    reason: '',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer' | 'bKash',
    disbursementDate: nowDate.toISOString().split('T')[0],
    approvedBy: '',
  });

  useEffect(() => {
    if ((!advanceFormData.staffId || !staff.some((s) => s.id === advanceFormData.staffId)) && staff[0]?.id) {
      setAdvanceFormData((prev) => ({ ...prev, staffId: staff[0].id }));
    }
  }, [staff, advanceFormData.staffId, isAdvanceModalOpen]);

  // Helper to get suggested advance deduction for a staff member
  const getActiveAdvance = (staffId: string) =>
    advanceSalaries.find((a) => a.staffId === staffId && a.status === 'Active');

  const handleOpenAddSalaryModal = () => {
    const parts = selectedMonth.split(' ');
    const parsedMonth = MONTH_NAMES.includes(parts[0]) ? parts[0] : currentMonthName;
    const parsedYear = Number(parts[1]) || currentYear;
    const defaultStaff = staff[0];
    const activeAdv = defaultStaff ? getActiveAdvance(defaultStaff.id) : undefined;
    const suggestedDed = activeAdv ? Math.min(activeAdv.monthlyDeduction, activeAdv.remainingBalance) : 0;

    setAddSalaryForm({
      staffId: defaultStaff?.id || '',
      billingMonthName: parsedMonth,
      billingYear: parsedYear,
      basicSalary: defaultStaff?.salary || 0,
      giftAmount: 0,
      giftReason: 'Eid Bonus',
      customGiftReason: '',
      allowances: 0,
      advanceDeduction: suggestedDed,
      status: 'Completed',
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsAddSalaryModalOpen(true);
  };

  const handleAddFormStaffChange = (newStaffId: string) => {
    const chosen = staff.find((st) => st.id === newStaffId);
    const activeAdv = getActiveAdvance(newStaffId);
    const suggestedDed = activeAdv ? Math.min(activeAdv.monthlyDeduction, activeAdv.remainingBalance) : 0;
    setAddSalaryForm((prev) => ({
      ...prev,
      staffId: newStaffId,
      basicSalary: chosen?.salary || 0,
      advanceDeduction: suggestedDed,
    }));
  };

  const handleAddSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenStaff = staff.find((st) => st.id === addSalaryForm.staffId);
    if (!chosenStaff) {
      showToast('error', 'No Staff Selected', 'Please select or register a teacher/staff member first.');
      return;
    }

    const basicAmt = Math.max(0, Number(addSalaryForm.basicSalary) || 0);
    const giftAmt = Math.max(0, Number(addSalaryForm.giftAmount) || 0);
    const allowancesAmt = Math.max(0, Number(addSalaryForm.allowances) || 0);
    const deductionAmt = Math.max(0, Number(addSalaryForm.advanceDeduction) || 0);

    if (basicAmt <= 0 && giftAmt <= 0 && allowancesAmt <= 0) {
      showToast('error', 'Amount Required', 'Enter a basic salary, gift money, or allowance greater than 0.');
      return;
    }

    const resolvedGiftReason =
      giftAmt > 0
        ? addSalaryForm.giftReason === 'Custom Reason'
          ? addSalaryForm.customGiftReason.trim() || 'Special Gift'
          : addSalaryForm.giftReason
        : undefined;

    const targetMonthLabel = `${addSalaryForm.billingMonthName} ${addSalaryForm.billingYear}`;
    const existingPending = teacherSalaries.find(
      (s) => s.staffId === chosenStaff.id && s.month === targetMonthLabel && s.status === 'Pending'
    );

    if (existingPending && addSalaryForm.status === 'Completed') {
      payTeacherSalary(existingPending.id, {
        basicSalary: basicAmt,
        bonus: existingPending.bonus || 0,
        bonusReason: existingPending.bonusReason,
        giftAmount: giftAmt,
        giftReason: resolvedGiftReason,
        allowances: allowancesAmt,
        advanceDeduction: deductionAmt,
        paymentMethod: addSalaryForm.paymentMethod,
        paymentDate: addSalaryForm.paymentDate,
        notes: addSalaryForm.notes.trim() || existingPending.notes || 'Monthly salary disbursed',
      });
    } else {
      const netPayable = Math.max(0, basicAmt + giftAmt + allowancesAmt - deductionAmt);
      addTeacherSalary({
        staffId: chosenStaff.id,
        teacherName: chosenStaff.fullName,
        designation: chosenStaff.designation,
        department: chosenStaff.department,
        month: targetMonthLabel,
        year: Number(addSalaryForm.billingYear) || currentYear,
        basicSalary: basicAmt,
        bonus: 0,
        giftAmount: giftAmt,
        giftReason: resolvedGiftReason,
        allowances: allowancesAmt,
        advanceDeduction: deductionAmt,
        netPayable,
        status: addSalaryForm.status,
        paymentDate: addSalaryForm.status === 'Completed' ? addSalaryForm.paymentDate : undefined,
        paymentMethod: addSalaryForm.status === 'Completed' ? addSalaryForm.paymentMethod : undefined,
        notes: addSalaryForm.notes.trim() || (giftAmt > 0 ? `Includes gift: ${resolvedGiftReason}` : undefined),
      });
    }

    setSelectedMonth(targetMonthLabel);
    setIsAddSalaryModalOpen(false);
  };

  // Filtered salary records for active month
  const monthSalaries = teacherSalaries.filter((s) => s.month === selectedMonth);
  const filteredSalaries = monthSalaries.filter((s) => {
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesSearch =
      s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDept && matchesSearch;
  });

  // Stats calculation
  const totalMonthlyBill = monthSalaries.reduce(
    (sum, s) => sum + s.basicSalary + s.bonus + (s.giftAmount || 0) + s.allowances,
    0
  );
  const totalCompletedAmount = monthSalaries.filter((s) => s.status === 'Completed').reduce((sum, s) => sum + s.netPayable, 0);
  const completedCount = monthSalaries.filter((s) => s.status === 'Completed').length;

  const totalPendingAmount = monthSalaries.filter((s) => s.status === 'Pending').reduce((sum, s) => sum + s.netPayable, 0);
  const pendingCount = monthSalaries.filter((s) => s.status === 'Pending').length;

  const totalActiveAdvances = advanceSalaries
    .filter((a) => a.status === 'Active')
    .reduce((sum, a) => sum + a.remainingBalance, 0);
  const activeAdvanceCount = advanceSalaries.filter((a) => a.status === 'Active').length;

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  // Open Pay Modal
  const handleOpenPayModal = (salary: TeacherSalaryRecord) => {
    setSelectedSalaryToPay(salary);
    // Find active advance for this teacher to prefill suggested installment deduction
    const activeAdv = advanceSalaries.find((a) => a.staffId === salary.staffId && a.status === 'Active');
    const suggestedDeduction = activeAdv ? Math.min(activeAdv.monthlyDeduction, activeAdv.remainingBalance) : 0;

    const existingGiftReason = salary.giftReason || 'Eid Bonus';
    const isPresetGift = GIFT_REASON_PRESETS.includes(existingGiftReason as any) && existingGiftReason !== 'Custom Reason';

    setPayFormData({
      bonus: salary.bonus || 0,
      bonusReason: salary.bonusReason || 'Performance Bonus',
      giftAmount: salary.giftAmount || 0,
      giftReason: isPresetGift ? existingGiftReason : 'Custom Reason',
      customGiftReason: isPresetGift ? '' : existingGiftReason,
      allowances: salary.allowances || 0,
      advanceDeduction: suggestedDeduction,
      paymentMethod: salary.paymentMethod || 'Bank Transfer',
      paymentDate: salary.paymentDate || new Date().toISOString().split('T')[0],
      notes: salary.notes || 'Monthly salary cleared in full',
    });
    setIsPayModalOpen(true);
  };

  // Submit Pay Salary
  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalaryToPay) return;

    const giftAmt = Math.max(0, Number(payFormData.giftAmount) || 0);
    const resolvedGiftReason =
      giftAmt > 0
        ? payFormData.giftReason === 'Custom Reason'
          ? payFormData.customGiftReason.trim() || 'Special Gift'
          : payFormData.giftReason
        : undefined;

    payTeacherSalary(selectedSalaryToPay.id, {
      bonus: Number(payFormData.bonus),
      bonusReason: payFormData.bonusReason,
      giftAmount: giftAmt,
      giftReason: resolvedGiftReason,
      allowances: Number(payFormData.allowances),
      advanceDeduction: Number(payFormData.advanceDeduction),
      paymentMethod: payFormData.paymentMethod,
      paymentDate: payFormData.paymentDate,
      notes: payFormData.notes,
    });

    setIsPayModalOpen(false);
    setSelectedSalaryToPay(null);
  };

  // Submit Advance Salary Grant
  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = staff.find((s) => s.id === advanceFormData.staffId);
    if (!st) {
      showToast('error', 'No Staff Selected', 'Please register a teacher or staff member first.');
      return;
    }
    const amt = Number(advanceFormData.amount);
    const ded = Number(advanceFormData.monthlyDeduction);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('error', 'Invalid Advance Amount', 'Advance amount must be greater than 0.');
      return;
    }
    if (!Number.isFinite(ded) || ded <= 0 || ded > amt) {
      showToast('error', 'Invalid Monthly Deduction', 'Monthly installment must be between 1 and total loan amount.');
      return;
    }

    disburseAdvanceSalary({
      staffId: st.id,
      teacherName: st.fullName,
      designation: st.designation,
      amount: amt,
      requestDate: new Date().toISOString().split('T')[0],
      disbursementDate: advanceFormData.disbursementDate,
      monthlyDeduction: ded,
      reason: advanceFormData.reason,
      paymentMethod: advanceFormData.paymentMethod,
      approvedBy: advanceFormData.approvedBy,
    });

    setIsAdvanceModalOpen(false);
  };

  // Generate Current Month Sheet
  const handleGenerateSheet = () => {
    if (staff.length === 0) {
      showToast('warning', 'No Faculty Registered', 'Please add teachers or staff before generating a monthly salary sheet.');
      return;
    }
    createMonthlySalarySheet(selectedMonth, currentYear);
  };

  // Unique departments
  const departments = [
    'All',
    ...Array.from(
      new Set([...schoolDepts.map((d) => d.name), ...staff.map((s) => s.department)])
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Banknote className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Finances & Payroll
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            {language === 'bn'
              ? 'Teacher & Staff Payroll and Advance Ledger'
              : language === 'hi'
              ? 'शिक्षक एवं स्टाफ वेतन तथा अग्रिम प्रबंधन'
              : 'Teacher & Staff Salary Management'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {language === 'bn'
              ? 'Manage faculty monthly salaries, bonuses, advance loans, and print official statements.'
              : language === 'hi'
              ? 'मासिक संकाय वेतन ट्रैक करें, प्रदर्शन बोनस वितरित करें, अग्रिम ऋण प्रबंधित करें और आधिकारिक A4 विवरण प्रिंट करें।'
              : 'Track monthly faculty salaries, disburse performance bonuses, handle advance loans with automatic deductions, and print official A4 statements.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddSalaryModal}
            className="flex items-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Add Salary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentRoute('finance-fund-transfer')}
            className="flex items-center gap-1.5 font-bold text-indigo-700 hover:text-indigo-800 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            {language === 'bn' ? 'Fund Transfer' : language === 'hi' ? 'फंड ट्रांसफर' : 'Fund Transfer'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPrintSheetModalOpen(true)}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-blue-700 hover:border-blue-300"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            {language === 'bn' ? 'Print A4 Statement' : language === 'hi' ? 'वेतन विवरण A4' : 'Print A4 Statement'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvanceModalOpen(true)}
            className="flex items-center gap-1.5 font-bold text-amber-700 hover:text-amber-800 border-amber-200 bg-amber-50/60 hover:bg-amber-100/60"
          >
            <HandCoins className="w-4 h-4 text-amber-600" />
            {language === 'bn' ? '+ Advance Salary' : language === 'hi' ? '+ अग्रिम वेतन' : '+ Advance Salary'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateSheet}
            className="flex items-center gap-1.5 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            {language === 'bn' ? 'Generate Sheet' : language === 'hi' ? 'मासिक शीट बनाएं' : 'Generate Sheet'}
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Total Salary Budget (${selectedMonth})`}
          value={fmtBDT(totalMonthlyBill)}
          subtitle={`${monthSalaries.length} Total Faculty on Roll`}
          icon={DollarSign}
          colorTheme="blue"
        />
        <StatCard
          title="Completed / Paid"
          value={fmtBDT(totalCompletedAmount)}
          subtitle={`${completedCount} of ${monthSalaries.length} Teachers Cleared`}
          icon={CheckCircle2}
          colorTheme="emerald"
        />
        <StatCard
          title="Pending / Unpaid"
          value={fmtBDT(totalPendingAmount)}
          subtitle={`${pendingCount} Awaiting Disbursement`}
          icon={AlertCircle}
          colorTheme="rose"
        />
        <StatCard
          title="Active Advance Loans"
          value={fmtBDT(totalActiveAdvances)}
          subtitle={`${activeAdvanceCount} Staff Members with Active Advances`}
          icon={HandCoins}
          colorTheme="amber"
        />
      </div>

      {/* Tabs and Filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'sheet'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Salary Sheet ({selectedMonth})
            </button>
            <button
              onClick={() => setActiveTab('advances')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'advances'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Advance Salary Ledger
              {activeAdvanceCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {activeAdvanceCount}
                </span>
              )}
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Billing Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Monthly Salary Sheet */}
        {activeTab === 'sheet' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by teacher name, ID, or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed / Paid (Green)</option>
                  <option value="Pending">Pending / Unpaid (Red)</option>
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">SL</th>
                    <th className="py-3 px-3">Teacher / Staff Member</th>
                    <th className="py-3 px-3">Designation & Dept</th>
                    <th className="py-3 px-3 text-right">Basic Salary</th>
                    <th className="py-3 px-3 text-right">Gift Money</th>
                    <th className="py-3 px-3 text-right">Bonus</th>
                    <th className="py-3 px-3 text-right">Allowances</th>
                    <th className="py-3 px-3 text-right">Advance Deducted</th>
                    <th className="py-3 px-3 text-right">Net Payable / Disbursed</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <p className="mb-3">No salary records match the selected filters for {selectedMonth}.</p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenAddSalaryModal}
                          className="inline-flex items-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Salary
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filteredSalaries.map((s, idx) => {
                      const isCompleted = s.status === 'Completed';
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="py-3 px-3 font-mono text-slate-400 text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {/* Status symbol indicator right next to name */}
                              <span
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  isCompleted
                                    ? 'bg-emerald-500 ring-4 ring-emerald-100'
                                    : 'bg-rose-500 ring-4 ring-rose-100'
                                }`}
                                title={isCompleted ? 'Salary Completed' : 'Salary Pending'}
                              />
                              <div>
                                <p className="font-bold text-[#172554] text-xs sm:text-sm">
                                  {s.teacherName}
                                </p>
                                <span className="font-mono text-[11px] text-slate-400">
                                  {s.staffId}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-700 text-xs">{s.designation}</p>
                            <p className="text-[11px] text-slate-400">{s.department}</p>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                            {fmtBDT(s.basicSalary)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {(s.giftAmount || 0) > 0 ? (
                              <div>
                                <span className="font-bold text-violet-700">+{fmtBDT(s.giftAmount || 0)}</span>
                                {s.giftReason && (
                                  <p className="text-[10px] text-violet-500 font-sans font-semibold">{s.giftReason}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {s.bonus > 0 ? (
                              <div>
                                <span className="font-bold text-emerald-600">+{fmtBDT(s.bonus)}</span>
                                {s.bonusReason && (
                                  <p className="text-[10px] text-slate-400 font-sans">{s.bonusReason}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {s.allowances > 0 ? (
                              <span className="text-blue-600 font-medium">+{fmtBDT(s.allowances)}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {s.advanceDeduction > 0 ? (
                              <span className="font-bold text-rose-600">
                                -{fmtBDT(s.advanceDeduction)}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-sm text-[#172554]">
                            {fmtBDT(s.netPayable)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isCompleted ? (
                                <button
                                  onClick={() => setSelectedVoucher(s)}
                                  className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                                  title="View Printable Payslip Voucher"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenPayModal(s)}
                                  className="!py-1 !px-2.5 !text-xs font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Pay Now
                                </Button>
                              )}
                              <button
                                onClick={() => deleteTeacherSalary(s.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Remove from sheet"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Advance Salary Ledger */}
        {activeTab === 'advances' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#172554] text-base">
                  Faculty Advance Salary & Loan Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Track approved advance loans, monthly recovery deductions, and remaining balances.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAdvanceModalOpen(true)}
                className="flex items-center gap-1.5 font-bold bg-amber-600 hover:bg-amber-700"
              >
                <PlusCircle className="w-4 h-4" />
                Grant New Advance
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Advance ID</th>
                    <th className="py-3 px-3">Teacher / Staff</th>
                    <th className="py-3 px-3 text-right">Loan Amount</th>
                    <th className="py-3 px-3 text-right">Monthly Installment</th>
                    <th className="py-3 px-3 text-right">Recovered Amount</th>
                    <th className="py-3 px-3 text-right">Remaining Balance</th>
                    <th className="py-3 px-3">Purpose / Reason</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Disbursed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advanceSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No advance salary records on file.
                      </td>
                    </tr>
                  ) : (
                    advanceSalaries.map((adv) => {
                      const isActive = adv.status === 'Active';
                      return (
                        <tr key={adv.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-amber-700">
                            {adv.id}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-[#172554]">{adv.teacherName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {adv.staffId} • {adv.designation}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                            {fmtBDT(adv.amount)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-rose-600 font-semibold">
                            {fmtBDT(adv.monthlyDeduction)} / mo
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 font-semibold">
                            {fmtBDT(adv.recoveredAmount)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-700">
                            {fmtBDT(adv.remainingBalance)}
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-xs">
                            <p className="font-medium">{adv.reason}</p>
                            <p className="text-[11px] text-slate-400">Apprv: {adv.approvedBy}</p>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Settled
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-500">
                            {adv.disbursementDate || adv.requestDate}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 0: Add Teacher / Staff Monthly Salary Modal */}
      <Modal
        isOpen={isAddSalaryModalOpen}
        onClose={() => setIsAddSalaryModalOpen(false)}
        title="Add Teacher & Staff Salary"
        maxWidth="2xl"
      >
        {staff.length === 0 ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172554]">No Teachers or Staff Registered</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add at least one teacher or staff member before creating or disbursing a monthly salary.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddSalaryModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsAddSalaryModalOpen(false);
                  setCurrentRoute('staff-add');
                }}
              >
                Go to Add Staff Member
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddSalarySubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Staff Selection + Month/Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Teacher / Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={addSalaryForm.staffId}
                  onChange={(e) => handleAddFormStaffChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} — {st.designation} ({st.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Month</label>
                  <select
                    value={addSalaryForm.billingMonthName}
                    onChange={(e) => setAddSalaryForm({ ...addSalaryForm, billingMonthName: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2050"
                    value={addSalaryForm.billingYear}
                    onChange={(e) => setAddSalaryForm({ ...addSalaryForm, billingYear: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Duplicate / Existing month record notice */}
            {(() => {
              const targetMonth = `${addSalaryForm.billingMonthName} ${addSalaryForm.billingYear}`;
              const existingRecord = teacherSalaries.find(
                (s) => s.staffId === addSalaryForm.staffId && s.month === targetMonth
              );
              if (!existingRecord) return null;
              return (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  {existingRecord.status === 'Pending' ? (
                    <span>
                      A <strong>Pending</strong> sheet entry exists for <strong>{targetMonth}</strong>. Selecting <strong>Completed</strong> will update and pay that entry directly.
                    </span>
                  ) : (
                    <span>
                      Salary for <strong>{targetMonth}</strong> is already marked <strong>Completed</strong>. Submitting will record an additional entry.
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Basic Salary & Allowances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monthly Basic Salary (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={addSalaryForm.basicSalary}
                  onChange={(e) => setAddSalaryForm({ ...addSalaryForm, basicSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-[#172554]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Other Allowances (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={addSalaryForm.allowances}
                  onChange={(e) => setAddSalaryForm({ ...addSalaryForm, allowances: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-blue-600"
                />
              </div>
            </div>

            {/* Gift Money Option Section */}
            <div className="bg-violet-50/70 p-3.5 rounded-xl border border-violet-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-violet-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-violet-600" />
                  Gift Money (Eid Bonus, Work Performance, Festival Gift, etc.)
                </span>
                <span className="text-[11px] font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-violet-900 mb-1">
                    Gift Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={addSalaryForm.giftAmount}
                    onChange={(e) => setAddSalaryForm({ ...addSalaryForm, giftAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono font-bold text-violet-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-violet-900 mb-1">
                    Gift Category / Reason
                  </label>
                  <select
                    value={addSalaryForm.giftReason}
                    onChange={(e) => setAddSalaryForm({ ...addSalaryForm, giftReason: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-slate-800"
                  >
                    {GIFT_REASON_PRESETS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {addSalaryForm.giftReason === 'Custom Reason' && (
                <div>
                  <label className="block font-semibold text-violet-900 mb-1">
                    Specify Custom Gift Purpose
                  </label>
                  <input
                    type="text"
                    value={addSalaryForm.customGiftReason}
                    onChange={(e) => setAddSalaryForm({ ...addSalaryForm, customGiftReason: e.target.value })}
                    placeholder="e.g. Excellent Board Exam Result, Festival Appreciation..."
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Advance Deduction */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HandCoins className="w-4 h-4 text-amber-600" />
                  Advance Salary Loan Deduction (BDT)
                </span>
                {(() => {
                  const activeAdv = getActiveAdvance(addSalaryForm.staffId);
                  return activeAdv ? (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Active Loan Balance: {fmtBDT(activeAdv.remainingBalance)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">No active advance loan</span>
                  );
                })()}
              </div>
              <input
                type="number"
                min="0"
                value={addSalaryForm.advanceDeduction}
                onChange={(e) => setAddSalaryForm({ ...addSalaryForm, advanceDeduction: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-rose-600"
              />
            </div>

            {/* Live Net Summary */}
            {(() => {
              const basicVal = Number(addSalaryForm.basicSalary) || 0;
              const giftVal = Number(addSalaryForm.giftAmount) || 0;
              const allowVal = Number(addSalaryForm.allowances) || 0;
              const dedVal = Number(addSalaryForm.advanceDeduction) || 0;
              const netVal = Math.max(0, basicVal + giftVal + allowVal - dedVal);
              return (
                <div className="p-3.5 rounded-xl bg-blue-900 text-white flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">
                      Total Net Payable Salary
                    </span>
                    <span className="text-[11px] text-blue-300">
                      Basic ({fmtBDT(basicVal)}) + Gift ({fmtBDT(giftVal)}) + Allowances ({fmtBDT(allowVal)}) - Advance ({fmtBDT(dedVal)})
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {fmtBDT(netVal)}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Payment Status, Method & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={addSalaryForm.status}
                  onChange={(e) => setAddSalaryForm({ ...addSalaryForm, status: e.target.value as 'Completed' | 'Pending' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                >
                  <option value="Completed">Completed (Disburse Now)</option>
                  <option value="Pending">Pending (Save to Sheet)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Disbursement Method
                </label>
                <select
                  value={addSalaryForm.paymentMethod}
                  onChange={(e) => setAddSalaryForm({ ...addSalaryForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="bKash">bKash Payroll</option>
                  <option value="Nagad">Nagad Payroll</option>
                  <option value="Cash">Cash Voucher</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={addSalaryForm.paymentDate}
                  onChange={(e) => setAddSalaryForm({ ...addSalaryForm, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Salary Notes / Remarks
              </label>
              <input
                type="text"
                value={addSalaryForm.notes}
                onChange={(e) => setAddSalaryForm({ ...addSalaryForm, notes: e.target.value })}
                placeholder="Optional voucher notes (e.g. Includes Eid festival gift & performance appreciation)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddSalaryModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {addSalaryForm.status === 'Completed' ? 'Save & Pay Salary' : 'Save Pending Entry'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 1: Pay Teacher Salary Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedSalaryToPay(null);
        }}
        title={`Disburse Monthly Salary — ${selectedSalaryToPay?.teacherName || ''}`}
        maxWidth="2xl"
      >
        {selectedSalaryToPay && (
          <form onSubmit={handlePaySubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Header info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedSalaryToPay.teacherName}</p>
                <p className="text-xs text-slate-500">
                  {selectedSalaryToPay.staffId} • {selectedSalaryToPay.designation} ({selectedSalaryToPay.department})
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Basic Salary</span>
                <span className="font-mono font-bold text-base text-[#172554]">
                  {fmtBDT(selectedSalaryToPay.basicSalary)}
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bonus Amount (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={payFormData.bonus}
                  onChange={(e) => setPayFormData({ ...payFormData, bonus: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bonus Reason / Type
                </label>
                <select
                  value={payFormData.bonusReason}
                  onChange={(e) => setPayFormData({ ...payFormData, bonusReason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Performance Bonus">Performance Bonus</option>
                  <option value="Eid Festival Bonus">Eid Festival Bonus</option>
                  <option value="Annual Increment Bonus">Annual Increment Bonus</option>
                  <option value="Olympiad / Debate Coaching">Olympiad / Debate Coaching</option>
                  <option value="Special Honorarium">Special Honorarium</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Allowances
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={payFormData.allowances}
                  onChange={(e) => setPayFormData({ ...payFormData, allowances: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-blue-600"
                />
              </div>
            </div>

            {/* Gift Money Option Section */}
            <div className="bg-violet-50/70 p-3.5 rounded-xl border border-violet-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-violet-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-violet-600" />
                  Gift Money (Eid Bonus, Work Performance, etc.)
                </span>
                <span className="text-[11px] font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-violet-900 mb-1">
                    Gift Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={payFormData.giftAmount}
                    onChange={(e) => setPayFormData({ ...payFormData, giftAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono font-bold text-violet-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-violet-900 mb-1">
                    Gift Purpose / Reason
                  </label>
                  <select
                    value={payFormData.giftReason}
                    onChange={(e) => setPayFormData({ ...payFormData, giftReason: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-semibold text-slate-800"
                  >
                    {GIFT_REASON_PRESETS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {payFormData.giftReason === 'Custom Reason' && (
                <div>
                  <label className="block font-semibold text-violet-900 mb-1">
                    Specify Custom Gift Purpose
                  </label>
                  <input
                    type="text"
                    value={payFormData.customGiftReason}
                    onChange={(e) => setPayFormData({ ...payFormData, customGiftReason: e.target.value })}
                    placeholder="e.g. Outstanding class result gift..."
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Advance Deduction section */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HandCoins className="w-4 h-4 text-amber-600" />
                  Advance Salary Deduction
                </span>
                {(() => {
                  const activeAdv = advanceSalaries.find(
                    (a) => a.staffId === selectedSalaryToPay.staffId && a.status === 'Active'
                  );
                  return activeAdv ? (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Active Balance: {fmtBDT(activeAdv.remainingBalance)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">No active advance loan</span>
                  );
                })()}
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  value={payFormData.advanceDeduction}
                  onChange={(e) =>
                    setPayFormData({ ...payFormData, advanceDeduction: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-rose-600"
                />
                <p className="text-[11px] text-amber-700 mt-1">
                  Amount deducted will be credited to this teacher's advance loan balance.
                </p>
              </div>
            </div>

            {/* Net Calculation Summary */}
            {(() => {
              const net = Math.max(
                0,
                selectedSalaryToPay.basicSalary +
                  Number(payFormData.bonus) +
                  Number(payFormData.giftAmount) +
                  Number(payFormData.allowances) -
                  Number(payFormData.advanceDeduction)
              );
              return (
                <div className="p-3.5 rounded-xl bg-blue-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs text-blue-200 block uppercase font-bold tracking-wider">
                      Net Payable to Teacher
                    </span>
                    <span className="text-[11px] text-blue-300">
                      Basic ({fmtBDT(selectedSalaryToPay.basicSalary)}) + Gift ({fmtBDT(payFormData.giftAmount)}) + Bonus ({fmtBDT(payFormData.bonus)}) - Advance ({fmtBDT(payFormData.advanceDeduction)})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {fmtBDT(net)}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Payment Method & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Disbursement Method
                </label>
                <select
                  value={payFormData.paymentMethod}
                  onChange={(e) => setPayFormData({ ...payFormData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="bKash">bKash Payroll</option>
                  <option value="Nagad">Nagad Payroll</option>
                  <option value="Cash">Cash Voucher</option>
                  <option value="Cheque">Account Payee Cheque</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={payFormData.paymentDate}
                  onChange={(e) => setPayFormData({ ...payFormData, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Disbursement Notes / Voucher Remarks
              </label>
              <input
                type="text"
                value={payFormData.notes}
                onChange={(e) => setPayFormData({ ...payFormData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPayModalOpen(false);
                  setSelectedSalaryToPay(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Confirm & Mark Completed
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: Grant Advance Salary Modal */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Grant Faculty Advance Salary / Loan"
        maxWidth="xl"
      >
        <form onSubmit={handleAdvanceSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Teacher / Staff Member
            </label>
            <select
              value={advanceFormData.staffId}
              onChange={(e) => setAdvanceFormData({ ...advanceFormData, staffId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              {staff.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} — {st.designation} (Salary: {fmtBDT(st.salary || 0)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Advance Amount (BDT)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={advanceFormData.amount}
                onChange={(e) => setAdvanceFormData({ ...advanceFormData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-amber-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monthly Repayment Deduction (BDT)
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={advanceFormData.monthlyDeduction}
                onChange={(e) =>
                  setAdvanceFormData({ ...advanceFormData, monthlyDeduction: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Advance Purpose / Justification
            </label>
            <input
              type="text"
              required
              value={advanceFormData.reason}
              onChange={(e) => setAdvanceFormData({ ...advanceFormData, reason: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Medical emergency, child education, festival expense"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Disbursement Method
              </label>
              <select
                value={advanceFormData.paymentMethod}
                onChange={(e) => setAdvanceFormData({ ...advanceFormData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="bKash">bKash</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Disbursement Date
              </label>
              <input
                type="date"
                value={advanceFormData.disbursementDate}
                onChange={(e) => setAdvanceFormData({ ...advanceFormData, disbursementDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sanctioned By
            </label>
            <input
              type="text"
              value={advanceFormData.approvedBy}
              onChange={(e) => setAdvanceFormData({ ...advanceFormData, approvedBy: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdvanceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-bold bg-amber-600 hover:bg-amber-700 text-white"
            >
              <HandCoins className="w-4 h-4 mr-1.5" />
              Sanction Advance
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Printable A4 Teacher Salary Statement (Print A4 Statement Sheet) */}
      <Modal
        isOpen={isPrintSheetModalOpen}
        onClose={() => setIsPrintSheetModalOpen(false)}
        title="Printable A4 Teacher Salary Statement"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50/80 p-3 rounded-xl border border-blue-200 print:hidden">
            <p className="text-xs text-blue-800">
              This statement is formatted for standard <strong>A4 paper</strong> with maximum 10 columns, official institutional header, dynamic logo, and authority signatures.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                printElement('a4-salary-statement', {
                  title: 'Monthly-Salary-Statement',
                  pageSize: 'A4',
                  orientation: 'landscape',
                })
              }
              className="flex items-center gap-1.5 font-bold"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </Button>
          </div>

          {/* Printable A4 Sheet Paper Preview */}
          <div
            id="a4-salary-statement"
            className="bg-white p-6 sm:p-8 rounded-lg border border-slate-300 shadow-sm text-slate-900 font-sans"
            style={{ minHeight: '1000px' }}
          >
            {/* Header: School Logo & Info */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={schoolSettings.logo}
                    alt={schoolSettings.schoolName}
                    className="w-16 h-16 object-contain rounded-full border border-slate-200 p-0.5"
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                      {schoolSettings.schoolName}
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">
                      {schoolSettings.institutionName}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{schoolSettings.address}</span>
                      <span>•</span>
                      <span>EIIN: {schoolSettings.eiin}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Phone: {schoolSettings.phone} | Email: {schoolSettings.email} | Web: {schoolSettings.website}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded-sm">
                    Official Salary Statement
                  </span>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    Month: {selectedMonth}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Generated: {new Date().toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* Statement Title & Meta */}
            <div className="text-center my-3 pb-2">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide underline underline-offset-4 decoration-slate-400">
                MONTHLY FACULTY & STAFF SALARY DISBURSEMENT STATEMENT
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Academic Session: {schoolSettings.academicSession} | Total Faculty: {monthSalaries.length} | Completed: {completedCount} | Pending: {pendingCount}
              </p>
            </div>

            {/* Exactly 10 Columns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                    <th className="border border-slate-300 p-1.5 w-8">#</th>
                    <th className="border border-slate-300 p-1.5 w-20">Teacher ID</th>
                    <th className="border border-slate-300 p-1.5 text-left">Teacher Name & Designation</th>
                    <th className="border border-slate-300 p-1.5 w-20">Month/Year</th>
                    <th className="border border-slate-300 p-1.5 text-right w-20">Basic (BDT)</th>
                    <th className="border border-slate-300 p-1.5 text-right w-24">Gift, Bonus & Allow (BDT)</th>
                    <th className="border border-slate-300 p-1.5 text-right w-20">Adv Deduct (BDT)</th>
                    <th className="border border-slate-300 p-1.5 text-right w-24">Net Paid (BDT)</th>
                    <th className="border border-slate-300 p-1.5 w-20">Status</th>
                    <th className="border border-slate-300 p-1.5 w-28 text-left">Payment Info & Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthSalaries.map((s, idx) => {
                    const isCompleted = s.status === 'Completed';
                    const bonusTotal = s.bonus + (s.giftAmount || 0) + s.allowances;
                    return (
                      <tr key={s.id} className="text-slate-800">
                        {/* 1. SL */}
                        <td className="border border-slate-300 p-1.5 text-center font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        {/* 2. Teacher ID */}
                        <td className="border border-slate-300 p-1.5 text-center font-mono text-[10px] font-bold">
                          {s.staffId}
                        </td>
                        {/* 3. Teacher Name & Designation */}
                        <td className="border border-slate-300 p-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${
                                isCompleted ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{s.teacherName}</p>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                {s.designation} ({s.department})
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* 4. Month/Year */}
                        <td className="border border-slate-300 p-1.5 text-center text-[10px] font-mono">
                          {s.month}
                        </td>
                        {/* 5. Basic Salary */}
                        <td className="border border-slate-300 p-1.5 text-right font-mono font-semibold">
                          {s.basicSalary.toLocaleString()}
                        </td>
                        {/* 6. Gift, Bonus & Allowances */}
                        <td className="border border-slate-300 p-1.5 text-right font-mono text-emerald-700">
                          {bonusTotal > 0 ? (
                            <div>
                              <span>{bonusTotal.toLocaleString()}</span>
                              {(s.giftAmount || 0) > 0 && s.giftReason && (
                                <span className="block text-[9px] text-violet-700 font-sans">
                                  Gift: {s.giftReason}
                                </span>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        {/* 7. Advance Deducted */}
                        <td className="border border-slate-300 p-1.5 text-right font-mono text-rose-700">
                          {s.advanceDeduction > 0 ? `-${s.advanceDeduction.toLocaleString()}` : '—'}
                        </td>
                        {/* 8. Net Paid */}
                        <td className="border border-slate-300 p-1.5 text-right font-mono font-black text-slate-900 bg-slate-50/50">
                          {s.netPayable.toLocaleString()}
                        </td>
                        {/* 9. Status (Green for completed, Red for pending) */}
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-[10px]">
                          {isCompleted ? (
                            <span className="text-emerald-700 font-extrabold flex items-center justify-center gap-0.5">
                              ● Completed
                            </span>
                          ) : (
                            <span className="text-rose-700 font-extrabold flex items-center justify-center gap-0.5">
                              ● Pending
                            </span>
                          )}
                        </td>
                        {/* 10. Payment Info & Date */}
                        <td className="border border-slate-300 p-1.5 text-[10px] text-slate-600">
                          {isCompleted ? (
                            <div>
                              <p className="font-bold text-slate-800">{s.paymentMethod}</p>
                              <p className="text-[9px] text-slate-400 font-mono">{s.paymentDate} • {s.receiptNumber}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unprocessed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Table Totals Row */}
                <tfoot>
                  <tr className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-400">
                    <td colSpan={4} className="border border-slate-300 p-2 text-right uppercase">
                      Total Monthly Grand Summary (BDT):
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {monthSalaries.reduce((sum, s) => sum + s.basicSalary, 0).toLocaleString()}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-emerald-700">
                      {monthSalaries.reduce((sum, s) => sum + s.bonus + (s.giftAmount || 0) + s.allowances, 0).toLocaleString()}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-rose-700">
                      -{monthSalaries.reduce((sum, s) => sum + s.advanceDeduction, 0).toLocaleString()}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-black text-sm bg-slate-200">
                      {monthSalaries.reduce((sum, s) => sum + s.netPayable, 0).toLocaleString()}
                    </td>
                    <td colSpan={2} className="border border-slate-300 p-2 text-center text-[10px] font-bold text-slate-600">
                      Cleared: {fmtBDT(totalCompletedAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bottom Official Signatures Section */}
            <div className="mt-16 pt-8 border-t border-slate-200">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-32 border-b border-slate-400 mb-2"></div>
                  <p className="text-xs font-bold text-slate-800">Senior Accounts Officer</p>
                  <p className="text-[10px] text-slate-400">Billing & Verification</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-32 border-b border-slate-400 mb-2"></div>
                  <p className="text-xs font-bold text-slate-800">Head Accountant / Bursar</p>
                  <p className="text-[10px] text-slate-400">Finance Controller</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-32 border-b border-slate-400 mb-2"></div>
                  <p className="text-xs font-bold text-slate-800">Principal</p>
                  <p className="text-[10px] text-slate-400">{schoolSettings.schoolName}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-32 border-b border-slate-400 mb-2"></div>
                  <p className="text-xs font-bold text-slate-800">Chairman, Governing Body</p>
                  <p className="text-[10px] text-slate-400">Final Sanction & Seal</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 text-[10px] text-slate-400">
                <p>System Generated via EduManage SMS • Certified Accurate</p>
                <p>Official School Seal Area: [ SEAL ]</p>
                <p>Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Single Teacher Printable Payslip Voucher */}
      <Modal
        isOpen={Boolean(selectedVoucher)}
        onClose={() => setSelectedVoucher(null)}
        title="Teacher Monthly Payslip Voucher"
        maxWidth="lg"
      >
        {selectedVoucher && (
          <div className="space-y-4">
            <div id="printable-salary-voucher" className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-900 print-page">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={schoolSettings.logo}
                    alt={schoolSettings.schoolName}
                    className="w-12 h-12 object-contain rounded-full border border-slate-200"
                  />
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase">
                      {schoolSettings.schoolName}
                    </h2>
                    <p className="text-[11px] text-slate-500">{schoolSettings.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedVoucher.receiptNumber}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {selectedVoucher.paymentDate}
                  </p>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Teacher Name</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedVoucher.teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Staff ID / Designation</span>
                  <span className="font-semibold text-slate-700">
                    {selectedVoucher.staffId} • {selectedVoucher.designation}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Billing Month</span>
                  <span className="font-bold text-blue-700">{selectedVoucher.month}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Method</span>
                  <span className="font-semibold text-emerald-700">{selectedVoucher.paymentMethod}</span>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Monthly Salary</span>
                  <span className="font-mono font-semibold">{fmtBDT(selectedVoucher.basicSalary)}</span>
                </div>
                {selectedVoucher.bonus > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span>Bonus ({selectedVoucher.bonusReason || 'Incentive'})</span>
                    <span className="font-mono font-semibold">+{fmtBDT(selectedVoucher.bonus)}</span>
                  </div>
                )}
                {(selectedVoucher.giftAmount || 0) > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-violet-700">
                    <span>Gift Money ({selectedVoucher.giftReason || 'Special Gift'})</span>
                    <span className="font-mono font-semibold">+{fmtBDT(selectedVoucher.giftAmount || 0)}</span>
                  </div>
                )}
                {selectedVoucher.allowances > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span>Allowances</span>
                    <span className="font-mono font-semibold">+{fmtBDT(selectedVoucher.allowances)}</span>
                  </div>
                )}
                {selectedVoucher.advanceDeduction > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                    <span>Advance Salary Loan Deduction</span>
                    <span className="font-mono font-semibold">-{fmtBDT(selectedVoucher.advanceDeduction)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 font-bold text-base text-slate-900 border-t-2 border-slate-800 mt-2">
                  <span>Net Disbursed Amount:</span>
                  <span className="font-mono text-emerald-600 font-black">{fmtBDT(selectedVoucher.netPayable)}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="text-slate-500 text-[10px]">Teacher's Signature</span>
                </div>
                <div>
                  <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="text-slate-500 text-[10px]">Authorized Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedVoucher(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  printElement('printable-salary-voucher', {
                    title: `Salary-Voucher-${selectedVoucher.receiptNumber}`,
                    pageSize: 'A4',
                    orientation: 'portrait',
                  })
                }
                className="flex items-center gap-1.5 font-bold"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
