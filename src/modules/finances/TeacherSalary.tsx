import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherSalaryRecord, AdvanceSalaryRecord } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  Banknote,
  PlusCircle,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingDown,
  Gift,
  HandCoins,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  Trash2,
  UserCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const TeacherSalary: React.FC = () => {
  const {
    staff,
    teacherSalaries,
    advanceSalaries,
    fundTransfers,
    schoolSettings,
    payTeacherSalary,
    disburseAdvanceSalary,
    createMonthlySalarySheet,
    deleteTeacherSalary,
    setCurrentRoute,
    departments: schoolDepts,
    language,
    t,
  } = useSchool();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'sheet' | 'advances'>('sheet');

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('November 2026');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSalaryToPay, setSelectedSalaryToPay] = useState<TeacherSalaryRecord | null>(null);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isPrintSheetModalOpen, setIsPrintSheetModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<TeacherSalaryRecord | null>(null);

  // Pay Salary Form State
  const [payFormData, setPayFormData] = useState({
    bonus: 0,
    bonusReason: 'Performance Bonus',
    allowances: 0,
    advanceDeduction: 0,
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Cheque',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: 'Approved and cleared in full',
  });

  // Grant Advance Form State
  const [advanceFormData, setAdvanceFormData] = useState({
    staffId: staff[0]?.id || 'STF-1001',
    amount: 15000,
    monthlyDeduction: 3000,
    reason: 'Medical & Family Expense',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'Bank Transfer' | 'bKash',
    disbursementDate: new Date().toISOString().split('T')[0],
    approvedBy: 'Dr. Mahmudur Rahman (Principal)',
  });

  // Unique months available
  const availableMonths = Array.from(new Set(teacherSalaries.map((s) => s.month)));
  if (!availableMonths.includes('November 2026')) availableMonths.unshift('November 2026');
  if (!availableMonths.includes('December 2026')) availableMonths.push('December 2026');

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
  const totalMonthlyBill = monthSalaries.reduce((sum, s) => sum + s.basicSalary + s.bonus + s.allowances, 0);
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

    setPayFormData({
      bonus: salary.bonus || 0,
      bonusReason: salary.bonusReason || 'Monthly Performance Bonus',
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

    payTeacherSalary(selectedSalaryToPay.id, {
      bonus: Number(payFormData.bonus),
      bonusReason: payFormData.bonusReason,
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
    if (!st) return;

    disburseAdvanceSalary({
      staffId: st.id,
      teacherName: st.fullName,
      designation: st.designation,
      amount: Number(advanceFormData.amount),
      requestDate: new Date().toISOString().split('T')[0],
      disbursementDate: advanceFormData.disbursementDate,
      monthlyDeduction: Number(advanceFormData.monthlyDeduction),
      reason: advanceFormData.reason,
      paymentMethod: advanceFormData.paymentMethod,
      approvedBy: advanceFormData.approvedBy,
    });

    setIsAdvanceModalOpen(false);
  };

  // Generate Current Month Sheet
  const handleGenerateSheet = () => {
    createMonthlySalarySheet(selectedMonth, 2026);
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
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No salary records match the selected filters for {selectedMonth}.
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
                  <option value="Eid Festival Bonus">Eid Festival Bonus</option>
                  <option value="Performance Bonus">Performance Bonus</option>
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
                      Basic ({fmtBDT(selectedSalaryToPay.basicSalary)}) + Bonus ({fmtBDT(payFormData.bonus)}) - Advance ({fmtBDT(payFormData.advanceDeduction)})
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
                    <th className="border border-slate-300 p-1.5 text-right w-20">Bonus & Allow (BDT)</th>
                    <th className="border border-slate-300 p-1.5 text-right w-20">Adv Deduct (BDT)</th>
                    <th className="border border-slate-300 p-1.5 text-right w-24">Net Paid (BDT)</th>
                    <th className="border border-slate-300 p-1.5 w-20">Status</th>
                    <th className="border border-slate-300 p-1.5 w-28 text-left">Payment Info & Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthSalaries.map((s, idx) => {
                    const isCompleted = s.status === 'Completed';
                    const bonusTotal = s.bonus + s.allowances;
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
                        {/* 6. Bonus & Allowances */}
                        <td className="border border-slate-300 p-1.5 text-right font-mono text-emerald-700">
                          {bonusTotal > 0 ? bonusTotal.toLocaleString() : '—'}
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
                      {monthSalaries.reduce((sum, s) => sum + s.bonus + s.allowances, 0).toLocaleString()}
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
