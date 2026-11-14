import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FundTransferRecord, FundSourceStream } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatCard } from '../../components/common/StatCard';
import {
  ArrowLeftRight,
  PlusCircle,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  FileText,
  TrendingDown,
  Building2,
  Wallet,
  Receipt,
  Coins,
  HeartHandshake,
  Baby,
  PiggyBank,
  Check,
  Search,
  ShieldCheck,
  Send,
  Trash2,
  Layers,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const FundTransfer: React.FC = () => {
  const {
    transactions,
    teacherSalaries,
    fundTransfers,
    schoolSettings,
    userProfile,
    executeFundTransfer,
    deleteFundTransfer,
    showToast,
    language,
  } = useSchool();

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStream, setFilterStream] = useState<string>('All');

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<FundTransferRecord | null>(null);
  const [transferToDelete, setTransferToDelete] = useState<FundTransferRecord | null>(null);

  // Form State
  const [amountInput, setAmountInput] = useState<string>('');
  const [formData, setFormData] = useState({
    sourceStream: 'Monthly Fee' as FundSourceStream,
    destinationFund: 'Main Institutional Treasury',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    transferredBy: userProfile.name ? `${userProfile.name}${userProfile.title ? ` (${userProfile.title})` : ''}` : '',
    approvedBy: '',
    paymentMethod: 'Internal Ledger' as 'Bank Transfer' | 'Cash' | 'bKash' | 'Cheque' | 'Internal Ledger',
    referenceNote: '',
  });

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  // Stream Definitions & Calculations
  const streamsConfig: Array<{
    id: FundSourceStream;
    feeType: string;
    label: string;
    bengaliLabel: string;
    icon: React.ElementType;
    color: string;
    bgLight: string;
    border: string;
  }> = [
    {
      id: 'Monthly Fee',
      feeType: 'Monthly Fee',
      label: 'Monthly Tuition Fee Vault',
      bengaliLabel: 'Monthly Tuition Fee Collection',
      icon: Receipt,
      color: 'text-blue-600',
      bgLight: 'bg-blue-50/70',
      border: 'border-blue-200',
    },
    {
      id: 'Exam Fee',
      feeType: 'Exam Fee',
      label: 'Examination Fee Vault',
      bengaliLabel: 'Examination Fee Collection',
      icon: Coins,
      color: 'text-sky-600',
      bgLight: 'bg-sky-50/70',
      border: 'border-sky-200',
    },
    {
      id: 'Donation',
      feeType: 'Donation',
      label: 'Donation & Endowment Vault',
      bengaliLabel: 'Donation & Trust Fund',
      icon: HeartHandshake,
      color: 'text-violet-600',
      bgLight: 'bg-violet-50/70',
      border: 'border-violet-200',
    },
    {
      id: 'Day Care Fee',
      feeType: 'Day Care Fee',
      label: 'Day Care Fee Vault',
      bengaliLabel: 'Daycare Fee Collection',
      icon: Baby,
      color: 'text-amber-600',
      bgLight: 'bg-amber-50/70',
      border: 'border-amber-200',
    },
    {
      id: 'Other Income',
      feeType: 'Other Income',
      label: 'Other Incomes & Receipts Vault',
      bengaliLabel: 'Other Incomes & Receipts',
      icon: PiggyBank,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50/70',
      border: 'border-emerald-200',
    },
  ];

  // Calculate vault stats for each stream
  const vaultStats = streamsConfig.map((st) => {
    // Total collected through transactions
    const totalCollected = transactions
      .filter((t) => t.feeType === st.feeType && t.status === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total transferred to main institutional treasury
    const totalTransferred = fundTransfers
      .filter((t) => t.status === 'Completed' && t.sourceStream === st.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const availableToTransfer = Math.max(0, totalCollected - totalTransferred);

    return {
      ...st,
      totalCollected,
      totalTransferred,
      availableToTransfer,
    };
  });

  // Overall Totals
  const totalTransferredToMainTreasury = fundTransfers
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPendingInVaults = vaultStats.reduce((sum, v) => sum + v.availableToTransfer, 0);

  // Expenditures
  const totalTeacherSalariesPaid = teacherSalaries
    .filter((s) => s.status === 'Completed')
    .reduce((sum, s) => sum + s.netPayable, 0);

  const totalOtherExpenses = transactions
    .filter((t) => t.feeType === 'School Expense' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInstitutionalExpenses = totalTeacherSalariesPaid + totalOtherExpenses;

  // Crucial Rule: Net Usable Institutional Treasury Balance is Transferred Funds minus Expenditures!
  const netInstitutionalTreasuryBalance = totalTransferredToMainTreasury - totalInstitutionalExpenses;

  // Open transfer modal with specific stream
  const handleOpenTransferForStream = (streamId: FundSourceStream) => {
    const targetVault = vaultStats.find((v) => v.id === streamId);
    const maxAvailable = targetVault ? targetVault.availableToTransfer : 0;
    const initialAmount = maxAvailable > 0 ? maxAvailable : 0;

    setAmountInput(initialAmount > 0 ? initialAmount.toString() : '');
    setFormData({
      sourceStream: streamId,
      destinationFund: 'Main Institutional Treasury',
      amount: initialAmount,
      date: new Date().toISOString().split('T')[0],
      transferredBy: userProfile.name ? `${userProfile.name}${userProfile.title ? ` (${userProfile.title})` : ''}` : '',
      approvedBy: '',
      paymentMethod: 'Internal Ledger',
      referenceNote: '',
    });
    setIsTransferModalOpen(true);
  };

  // Submit Fund Transfer Form (Triggers Permission Confirmation Dialog)
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVault = vaultStats.find((v) => v.id === formData.sourceStream);
    const available = targetVault ? targetVault.availableToTransfer : 0;
    const cleanDigits = amountInput.replace(/[^0-9]/g, '');
    const amountVal = cleanDigits === '' ? 0 : Number(cleanDigits);

    if (amountVal <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a transfer amount greater than 0.');
      return;
    }

    if (amountVal > available) {
      showToast('error', 'Insufficient Balance', `Entered amount exceeds available vault balance (${fmtBDT(available)}).`);
      return;
    }

    // Sync formData.amount
    setFormData((prev) => ({ ...prev, amount: amountVal }));

    // Open explicit permission and confirmation dialog
    setIsConfirmModalOpen(true);
  };

  // Explicitly Confirmed & Authorized by User
  const handleConfirmAndExecuteTransfer = () => {
    const targetVault = vaultStats.find((v) => v.id === formData.sourceStream);
    const available = targetVault ? targetVault.availableToTransfer : 0;
    const cleanDigits = amountInput.replace(/[^0-9]/g, '');
    const finalAmount = cleanDigits === '' ? formData.amount : Number(cleanDigits);

    if (finalAmount <= 0 || finalAmount > available) {
      return;
    }

    executeFundTransfer({
      sourceStream: formData.sourceStream,
      sourceStreamLabel: targetVault?.label || formData.sourceStream,
      destinationFund: formData.destinationFund,
      amount: finalAmount,
      date: formData.date,
      transferredBy: formData.transferredBy,
      approvedBy: formData.approvedBy,
      paymentMethod: formData.paymentMethod,
      referenceNote: formData.referenceNote,
      status: 'Completed',
    });

    setIsConfirmModalOpen(false);
    setIsTransferModalOpen(false);
  };

  // Filter transfers list
  const filteredTransfers = fundTransfers.filter((t) => {
    const matchesStream = filterStream === 'All' || t.sourceStream === filterStream;
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceStreamLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationFund.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.transferredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.referenceNote || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStream && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <ArrowLeftRight className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Central Treasury & Inter-Fund Settlement
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            {language === 'bn'
              ? 'Fund Transfer & Main Institutional Treasury'
              : language === 'hi'
              ? 'फंड ट्रांसफर एवं केंद्रीय ट्रेजरी'
              : 'Fund Transfer & Institutional Treasury'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {language === 'bn'
              ? 'Exam fees, tuition, donations, daycare, and other incomes remain in collection vaults until formally transferred to the institutional treasury for operational expenditures and salaries.'
              : language === 'hi'
              ? 'परीक्षा शुल्क, मासिक शुल्क, दान और अन्य आय स्थानांतरित होने तक उनके संबंधित वॉल्ट में रहती हैं। ट्रांसफर के बाद ही वे केंद्रीय कोष में जुड़ती हैं।'
              : 'Exam fee, monthly tuition fee, donation, day care fee & other collections stay in source vaults until transferred. Once transferred via Fund Transfer, they credit to the Main Operating Treasury to fund payroll and campus expenditures.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenTransferForStream('Monthly Fee')}
            className="flex items-center gap-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            New Fund Transfer
          </Button>
        </div>
      </div>

      {/* Explanatory Rule Callout Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-white/10 rounded-xl flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              {language === 'bn'
                ? 'Fund Transfer Policy & Guidelines'
                : language === 'hi'
                ? 'संस्थागत फंड ट्रांसफर नियम'
                : 'Institutional Treasury & Fund Transfer Policy'}
            </h3>
            <p className="text-xs text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
              {language === 'bn' ? (
                <>
                  <strong>1. Collection Vaults:</strong> Fees collected from tuition, exams, donations, and daycare remain in dedicated holding vaults.<br />
                  <strong>2. Fund Transfer:</strong> Executing a transfer formally moves collections into the Main Institutional Operating Treasury.<br />
                  <strong>3. Operating Expenditures:</strong> Teacher salaries and school expenses are disbursed strictly from transferred treasury balances.
                </>
              ) : language === 'hi' ? (
                <>
                  <strong>1. संकलित फंड:</strong> परीक्षा शुल्क, मासिक शुल्क, दान और अन्य आय से एकत्र की गई राशि सीधे केंद्रीय फंड में नहीं जुड़ती है—यह पहले अलग-अलग वॉल्ट में रहती है।<br />
                  <strong>2. फंड ट्रांसफर:</strong> ट्रांसफर के माध्यम से ही राशि मुख्य ट्रेजरी में स्थानांतरित होती है।<br />
                  <strong>3. व्यय एवं वेतन:</strong> केंद्रीय कोष से ही शिक्षकों का वेतन और संस्थागत खर्च वहन किया जा सकता है।
                </>
              ) : (
                <>
                  <strong>1. Collection Vaults:</strong> Revenues from exam fees, tuition, donations, daycare & others stay isolated in source vaults until transferred.<br />
                  <strong>2. Treasury Settlement:</strong> Inter-fund transfer explicitly settles collections into the Main Operating Treasury.<br />
                  <strong>3. Expenditure Safeguard:</strong> Faculty payroll and institutional expenditures are disbursed strictly from verified treasury balances.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-center w-full md:w-auto md:min-w-[180px]">
          <span className="text-[11px] font-semibold text-blue-200 block uppercase">
            Available in Main Treasury
          </span>
          <span className="text-xl font-black font-mono text-emerald-300">
            {fmtBDT(netInstitutionalTreasuryBalance)}
          </span>
          <span className="text-[10px] text-blue-200/80 block mt-0.5">
            Ready for School Expenditures
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transferred to Treasury (Transferred)"
          value={fmtBDT(totalTransferredToMainTreasury)}
          subtitle={`${fundTransfers.length} Total Transfer Batches Completed`}
          icon={ArrowLeftRight}
          colorTheme="indigo"
        />
        <StatCard
          title="Pending in Vaults (Awaiting Transfer)"
          value={fmtBDT(totalPendingInVaults)}
          subtitle="Available Across 5 Fee Streams"
          icon={Clock}
          colorTheme="amber"
        />
        <StatCard
          title="Total Institutional Expenses (Disbursed)"
          value={fmtBDT(totalInstitutionalExpenses)}
          subtitle={`Salaries: ${fmtBDT(totalTeacherSalariesPaid)} | Other: ${fmtBDT(totalOtherExpenses)}`}
          icon={TrendingDown}
          colorTheme="rose"
        />
        <StatCard
          title="Net Usable Treasury Balance"
          value={fmtBDT(netInstitutionalTreasuryBalance)}
          subtitle="Transferred Earnings minus Expenses"
          icon={Wallet}
          colorTheme="emerald"
        />
      </div>

      {/* 5 Source Fee Collection Vault Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#172554] flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Fee Collection Vaults (Pending & Available Balances)
            </h2>
            <p className="text-xs text-slate-500">
              Each collection stream tracks total student/donor payments vs funds already settled into the central institutional treasury.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vaultStats.map((vault) => {
            const IconComp = vault.icon;
            const hasAvailable = vault.availableToTransfer > 0;
            return (
              <div
                key={vault.id}
                className={`bg-white rounded-2xl border ${vault.border} p-4 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${vault.bgLight} ${vault.color}`}>
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {hasAvailable ? 'Ready to Transfer' : 'Fully Settled'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
                    {vault.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-3">{vault.bengaliLabel}</p>

                  <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Collected:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {fmtBDT(vault.totalCollected)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Transferred:</span>
                      <span className="font-mono text-indigo-600 font-semibold">
                        {fmtBDT(vault.totalTransferred)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700 font-bold pt-1 border-t border-dashed border-slate-200">
                      <span>Available Now:</span>
                      <span
                        className={`font-mono text-sm font-extrabold ${
                          hasAvailable ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {fmtBDT(vault.availableToTransfer)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <Button
                    variant={hasAvailable ? 'primary' : 'outline'}
                    size="sm"
                    disabled={!hasAvailable}
                    onClick={() => handleOpenTransferForStream(vault.id)}
                    className={`w-full !py-1.5 !text-xs font-bold flex items-center justify-center gap-1.5 ${
                      hasAvailable
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transfer to Treasury
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fund Transfer Ledger & History Table */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-[#172554] flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Fund Transfer Settlement History & Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Verified record of all settled transfers into the school's central operating treasury.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference, vault, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStream}
              onChange={(e) => setFilterStream(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Streams</option>
              <option value="Monthly Fee">Monthly Tuition Fee</option>
              <option value="Exam Fee">Exam Fee</option>
              <option value="Donation">Donation</option>
              <option value="Day Care Fee">Day Care Fee</option>
              <option value="Other Income">Other Income</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Transfer Ref</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Source Collection Vault</th>
                <th className="py-3 px-3">Destination Treasury</th>
                <th className="py-3 px-3 text-right">Transferred Amount</th>
                <th className="py-3 px-3">Authorized / Approved By</th>
                <th className="py-3 px-3">Method & Notes</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No fund transfer records found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-xs">
                      {trf.transferNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                      {trf.date}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm">
                        {trf.sourceStreamLabel}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Fee Stream: {trf.sourceStream}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium text-xs">
                      {trf.destinationFund}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-sm text-emerald-700">
                      +{fmtBDT(trf.amount)}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{trf.transferredBy}</p>
                      <p className="text-[10px] text-slate-400">Apprv: {trf.approvedBy}</p>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500 max-w-xs">
                      <p className="font-medium text-slate-700">{trf.paymentMethod}</p>
                      <p className="text-[11px] truncate text-slate-400" title={trf.referenceNote}>
                        {trf.referenceNote || '—'}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Completed
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedVoucher(trf)}
                          className="p-1.5 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                          title="View & Print Official Transfer Voucher"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTransferToDelete(trf)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Void Transfer Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Execute Fund Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Execute Inter-Fund Transfer to Main Treasury"
        maxWidth="2xl"
      >
        <form noValidate onSubmit={handleTransferSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Information box */}
          <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200/80 text-indigo-900 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Transfer to Institutional Operating Treasury</p>
              <p className="text-indigo-800/90 mt-0.5">
                Funds transferred will be credited to the institution's main operating balance, officially recorded in system notifications, and made available for faculty salaries and campus expenses.
              </p>
            </div>
          </div>

          {/* Source Stream Selection & Balance */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Source Collection Vault
            </label>
            <select
              value={formData.sourceStream}
              onChange={(e) => {
                const stream = e.target.value as FundSourceStream;
                const v = vaultStats.find((item) => item.id === stream);
                const avail = v && v.availableToTransfer > 0 ? v.availableToTransfer : 0;
                setAmountInput(avail > 0 ? avail.toString() : '');
                setFormData({
                  ...formData,
                  sourceStream: stream,
                  amount: avail,
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
            >
              {vaultStats.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — Available to Transfer: {fmtBDT(v.availableToTransfer)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Max Button with Real-Time Balance Validation */}
          {(() => {
            const currentVault = vaultStats.find((v) => v.id === formData.sourceStream);
            const maxAvailable = currentVault ? currentVault.availableToTransfer : 0;
            const cleanDigits = amountInput.replace(/[^0-9]/g, '');
            const amountNum = cleanDigits === '' ? 0 : Number(cleanDigits);
            const isExceeding = amountNum > maxAvailable;
            const isZeroOrNegative = amountNum <= 0;

            const updateAmount = (val: string | number) => {
              const str = typeof val === 'number' ? (val > 0 ? val.toString() : '') : val;
              // Normalize Bengali digits (U+09E6 to U+09EF) to standard 0-9 digits
              let normalized = '';
              for (let i = 0; i < str.length; i++) {
                const code = str.charCodeAt(i);
                if (code >= 0x09e6 && code <= 0x09ef) {
                  normalized += String(code - 0x09e6);
                } else {
                  normalized += str[i];
                }
              }
              const digits = normalized.replace(/[^0-9]/g, '');
              setAmountInput(digits);
              const num = digits === '' ? 0 : Number(digits);
              setFormData((prev) => ({ ...prev, amount: num }));
            };

            return (
              <div
                className={`p-4 rounded-xl border space-y-3 transition-colors ${
                  isExceeding
                    ? 'bg-rose-50/80 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                    Transfer Amount (BDT) *
                  </label>
                  <button
                    type="button"
                    onClick={() => updateAmount(maxAvailable)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Transfer Max Available ({fmtBDT(maxAvailable)})
                  </button>
                </div>

                <div className="relative">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm select-none pointer-events-none ${
                      isExceeding ? 'text-rose-600 font-black' : 'text-slate-400'
                    }`}
                  >
                    BDT 
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    placeholder="Type transfer amount (e.g. 18000)"
                    value={amountInput}
                    onChange={(e) => updateAmount(e.target.value)}
                    className={`w-full pl-14 pr-3 py-2.5 rounded-lg font-mono font-black text-lg transition-all focus:outline-none ${
                      isExceeding
                        ? 'border-2 border-rose-500 bg-white text-rose-700 ring-2 ring-rose-200'
                        : 'border border-slate-300 bg-white text-emerald-600 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                </div>

                {/* Quick Preset Buttons for Fast Selection */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Select:</span>
                  <button
                    type="button"
                    onClick={() => updateAmount(maxAvailable)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    Full Vault ({fmtBDT(maxAvailable)})
                  </button>
                  {maxAvailable >= 10000 && (
                    <button
                      type="button"
                      onClick={() => updateAmount(10000)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      BDT 10,000
                    </button>
                  )}
                  {maxAvailable >= 5000 && (
                    <button
                      type="button"
                      onClick={() => updateAmount(5000)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      BDT 5,000
                    </button>
                  )}
                  {maxAvailable >= 1000 && (
                    <button
                      type="button"
                      onClick={() => updateAmount(1000)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    >
                      BDT 1,000
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => updateAmount('')}
                    className="px-2 py-1 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer ml-auto"
                  >
                    Clear
                  </button>
                </div>

                {/* RED WARNING SIGNAL WHEN EXCEEDING BALANCE */}
                {isExceeding && (
                  <div className="p-3.5 bg-rose-100/90 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 animate-fadeIn shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-rose-950 font-black text-xs uppercase tracking-wide">
                          Insufficient Balance Warning!
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800">
                          Transfer Limit Exceeded
                        </span>
                      </div>
                      <p className="text-rose-800 leading-relaxed text-[11px]">
                        The entered amount <strong>{fmtBDT(amountNum)}</strong> exceeds the available balance of{' '}
                        <strong>{fmtBDT(maxAvailable)}</strong> in {currentVault?.label || formData.sourceStream}. You can transfer any amount within the balance, but cannot transfer more than the available funds.
                      </p>
                      <button
                        type="button"
                        onClick={() => updateAmount(maxAvailable)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-950 underline cursor-pointer"
                      >
                        Click here to adjust to maximum available balance ({fmtBDT(maxAvailable)})
                      </button>
                    </div>
                  </div>
                )}

                {/* Positive balance info when valid */}
                {!isExceeding && !isZeroOrNegative && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 gap-1">
                    <span>
                      Available Balance: <strong className="text-slate-800">{fmtBDT(maxAvailable)}</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Remaining in Vault After Transfer: {fmtBDT(Math.max(0, maxAvailable - amountNum))}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Destination Account */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Destination Treasury Account (Destination Fund)
            </label>
            <select
              value={formData.destinationFund}
              onChange={(e) => setFormData({ ...formData, destinationFund: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="Main Institutional Treasury">
                Main Institutional Treasury (General Operating Fund)
              </option>
              <option value="Teacher & Staff Payroll Reserve">
                Teacher & Staff Payroll Reserve
              </option>
              <option value="Campus Infrastructure & Development Fund">
                Campus Infrastructure & Development Fund
              </option>
            </select>
          </div>

          {/* Method and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Settlement / Transfer Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="Internal Ledger">Internal Treasury Ledger Transfer</option>
                <option value="Bank Transfer">Bank Account Direct Deposit</option>
                <option value="Cash">Cash Vault Deposit</option>
                <option value="bKash">bKash Merchant Settlement</option>
                <option value="Cheque">Bank Cheque Clearance</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transfer Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Authorizers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transferred By (Transferring Officer)
              </label>
              <input
                type="text"
                required
                value={formData.transferredBy}
                onChange={(e) => setFormData({ ...formData, transferredBy: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Approved By (Approving Authority)
              </label>
              <input
                type="text"
                required
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Reference Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transfer Remarks / Resolution Note
            </label>
            <input
              type="text"
              value={formData.referenceNote}
              onChange={(e) => setFormData({ ...formData, referenceNote: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Monthly tuition fee batch settlement for faculty salaries"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            {(() => {
              const currentVault = vaultStats.find((v) => v.id === formData.sourceStream);
              const maxAvailable = currentVault ? currentVault.availableToTransfer : 0;
              const cleanDigits = amountInput.replace(/[^0-9]/g, '');
              const currentAmt = cleanDigits === '' ? 0 : Number(cleanDigits);
              const isExceeding = currentAmt > maxAvailable;
              const isInvalid = currentAmt <= 0;

              if (isExceeding) {
                return (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 rounded-lg cursor-not-allowed flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Cannot Transfer: Exceeds Available Balance
                  </button>
                );
              }

              return (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isInvalid}
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Proceed to Confirm Transfer
                </Button>
              );
            })()}
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Printable Official Fund Transfer Voucher */}
      <Modal
        isOpen={Boolean(selectedVoucher)}
        onClose={() => setSelectedVoucher(null)}
        title="Official Inter-Fund Transfer Voucher"
        maxWidth="2xl"
      >
        {selectedVoucher && (
          <div className="space-y-4">
            <div
              id="printable-fund-transfer-voucher"
              className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xs text-slate-900 font-sans"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={schoolSettings.logo}
                    alt={schoolSettings.schoolName}
                    className="w-14 h-14 object-contain rounded-full border border-slate-200 p-0.5"
                  />
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      {schoolSettings.schoolName}
                    </h1>
                    <p className="text-xs font-semibold text-slate-600">
                      {schoolSettings.institutionName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {schoolSettings.address} • EIIN: {schoolSettings.eiin}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-indigo-900 text-white text-xs font-bold rounded">
                    TRANSFER VOUCHER
                  </span>
                  <p className="text-xs font-mono font-bold text-indigo-700 mt-1">
                    {selectedVoucher.transferNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Date: {selectedVoucher.date}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-3 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                  OFFICIAL INTER-FUND SETTLEMENT & CLEARANCE VOUCHER
                </h2>
                <p className="text-[11px] text-slate-500">
                  Certified Transfer into Main Institutional Operating Treasury
                </p>
              </div>

              {/* Voucher Details Table */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Source Collection Vault (Source Fund)
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedVoucher.sourceStreamLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 block">Stream: {selectedVoucher.sourceStream}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Destination Account (Destination Fund)
                    </span>
                    <span className="font-bold text-indigo-800 text-sm">
                      {selectedVoucher.destinationFund}
                    </span>
                    <span className="text-[11px] text-slate-500 block">Status: Credited & Cleared</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Settlement Method:</span>
                  <span className="font-semibold text-slate-800">{selectedVoucher.paymentMethod}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Transfer Reference / Purpose:</span>
                  <span className="text-slate-800 text-right max-w-sm">{selectedVoucher.referenceNote || 'N/A'}</span>
                </div>

                {/* Amount Highlight */}
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between my-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Total Transferred Amount (Total Transferred Amount)
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      Credited directly into central school earnings
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-emerald-300">
                    {fmtBDT(selectedVoucher.amount)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12 pt-6 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="w-36 sm:w-40 border-b border-slate-400 mx-auto mb-1.5"></div>
                  <p className="font-bold text-slate-800">{selectedVoucher.transferredBy}</p>
                  <p className="text-[10px] text-slate-500">Transferred By / Accounts Officer</p>
                </div>
                <div>
                  <div className="w-36 sm:w-40 border-b border-slate-400 mx-auto mb-1.5"></div>
                  <p className="font-bold text-slate-800">{selectedVoucher.approvedBy}</p>
                  <p className="text-[10px] text-slate-500">Approved By / Principal & Authority</p>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 mt-8 pt-2 border-t border-slate-100">
                <p>EduManage SMS Central Treasury Module</p>
                <p>Official Seal Area: [ SEAL ]</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={() => setSelectedVoucher(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  printElement('printable-fund-transfer-voucher', {
                    title: `Fund-Transfer-${selectedVoucher.transferNumber}`,
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

      {/* MODAL 3: Explicit Permission & Authorization Confirmation Dialog */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Authorization Required: Confirm Fund Transfer"
        subtitle="Please review and confirm this fund transfer authorization before processing."
        maxWidth="lg"
      >
        {(() => {
          const targetVault = vaultStats.find((v) => v.id === formData.sourceStream);
          const available = targetVault ? targetVault.availableToTransfer : 0;
          const transferAmount = Number(formData.amount) || 0;
          const postBalance = Math.max(0, available - transferAmount);

          return (
            <div className="space-y-4">
              {/* Security Shield Banner */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Executive Permission & Security Check
                  </h4>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    You are authorizing an internal transfer of funds from a collection vault into the main institutional operating treasury.
                  </p>
                </div>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Source Vault (Debit):</span>
                    <span className="font-bold text-slate-800 block text-sm">{targetVault?.label || formData.sourceStream}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Current Balance: {fmtBDT(available)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Destination Account (Credit):</span>
                    <span className="font-bold text-indigo-700 block text-sm">{formData.destinationFund}</span>
                    <span className="text-[11px] text-slate-500">Operating Central Treasury</span>
                  </div>
                </div>

                {/* Amount Highlight */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                      Transfer Amount to Debit
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      Within authorized vault balance
                    </span>
                  </div>
                  <span className="text-xl font-black font-mono text-emerald-300">
                    {fmtBDT(transferAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Remaining in Source Vault:</span>
                    <span className="font-bold text-slate-800 font-mono">{fmtBDT(postBalance)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Settlement Method:</span>
                    <span className="font-bold text-slate-800">{formData.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Transferring Officer:</span>
                    <span className="font-medium text-slate-700">{formData.transferredBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Approving Authority:</span>
                    <span className="font-medium text-slate-700">{formData.approvedBy}</span>
                  </div>
                </div>

                {formData.referenceNote && (
                  <div className="pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400 block">Remarks / Reference:</span>
                    <span className="italic text-slate-600">{formData.referenceNote}</span>
                  </div>
                )}
              </div>

              {/* Permission Agreement Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Confirmation Required:</strong> Clicking "Confirm & Complete Transfer" will finalize this transaction, credit the central treasury, and publish an official institutional notification.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Back / Modify
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmAndExecuteTransfer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Complete Transfer
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Void Transfer Confirmation Dialog */}
      {transferToDelete && (
        <ConfirmDialog
          isOpen={Boolean(transferToDelete)}
          onClose={() => setTransferToDelete(null)}
          onConfirm={() => {
            deleteFundTransfer(transferToDelete.id);
            setTransferToDelete(null);
          }}
          title="Void Fund Transfer"
          message={`Are you sure you want to void and remove fund transfer ${transferToDelete.transferNumber} (${fmtBDT(transferToDelete.amount)})?`}
          confirmLabel="Void Transfer"
        />
      )}
    </div>
  );
};
