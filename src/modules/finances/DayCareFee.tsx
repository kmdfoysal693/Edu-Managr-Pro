import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FinancialTransaction } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { ReceiptModal } from './ReceiptModal';
import { StudentFeeSelector } from './StudentFeeSelector';
import {
  Baby,
  PlusCircle,
  Receipt,
  CheckCircle2,
  Clock,
  Save,
  Filter,
} from 'lucide-react';

export const DayCareFee: React.FC = () => {
  const { transactions, students, classes, addTransaction, updateTransaction, showToast } = useSchool();

  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [filterClass, setFilterClass] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: students[0]?.studentId || '',
    month: '',
    amount: 0,
    paymentMethod: 'bKash' as 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque',
    status: 'Paid' as 'Paid' | 'Pending',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const daycareTx = transactions.filter((t) => t.feeType === 'Day Care Fee');
  const filteredTx = daycareTx.filter((t) => {
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchClass =
      filterClass === 'All' ||
      (t.classInfo && t.classInfo.toLowerCase().includes(filterClass.toLowerCase()));
    return matchStatus && matchClass;
  });

  const totalDaycareCollected = daycareTx.filter((t) => t.status === 'Paid').reduce((s, t) => s + t.amount, 0);
  const totalDaycarePending = daycareTx.filter((t) => t.status === 'Pending').reduce((s, t) => s + t.amount, 0);

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  useEffect(() => {
    if ((!formData.studentId || !students.some((s) => s.studentId === formData.studentId)) && students[0]?.studentId) {
      setFormData((prev) => ({ ...prev, studentId: students[0].studentId }));
    }
  }, [students, formData.studentId, isAddModalOpen]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.studentId === formData.studentId);
    if (!st) {
      showToast('error', 'No Student Selected', 'Please admit and select a student before recording fees.');
      return;
    }
    const amt = Number(formData.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a fee amount greater than 0.');
      return;
    }
    addTransaction({
      feeType: 'Day Care Fee',
      title: formData.month,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      partyName: st.fullName,
      partyId: st.studentId,
      classInfo: `${st.className} (Daycare)`,
      notes: formData.notes,
    });
    setIsAddModalOpen(false);
  };

  const handleMarkPaid = (tx: FinancialTransaction) => {
    updateTransaction(tx.id, { status: 'Paid' });
  };

  const columns: Column<FinancialTransaction>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt ID',
      sortable: true,
      render: (t) => <span className="font-mono text-xs font-bold text-blue-700">{t.receiptNumber}</span>,
    },
    {
      key: 'partyName',
      header: 'Student Name',
      sortable: true,
      render: (t) => (
        <div>
          <p className="font-bold text-[#172554] text-xs sm:text-sm">{t.partyName}</p>
          <p className="text-[11px] text-slate-400 font-mono">
            {t.partyId} • {t.classInfo}
          </p>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Daycare Term',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-700 font-medium">{t.title}</span>,
    },
    {
      key: 'amount',
      header: 'Monthly Fee',
      sortable: true,
      render: (t) => <span className="font-bold text-slate-900 text-xs sm:text-sm">{fmtBDT(t.amount)}</span>,
    },
    {
      key: 'date',
      header: 'Payment Date',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-500 font-mono">{t.date}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <Badge variant={getStatusBadgeVariant(t.status)}>{t.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {t.status === 'Pending' && (
            <button
              onClick={() => handleMarkPaid(t)}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
              title="Collect Payment"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </button>
          )}
          <button
            onClick={() => setSelectedReceipt(t)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
            title="Print Money Receipt"
          >
            <Receipt className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Daycare & Infant Care Fee Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track extended afternoon care, nursery meals, and monthly daycare dues</p>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          Record Daycare Fee
        </Button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Daycare Collection" value={fmtBDT(totalDaycareCollected)} icon={Receipt} colorTheme="emerald" />
        <StatCard title="Pending Daycare Balances" value={fmtBDT(totalDaycarePending)} icon={Clock} colorTheme="rose" />
        <StatCard title="Daycare Active Students" value={daycareTx.length} icon={Baby} colorTheme="sky" />
      </div>

      {/* Status & Class Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {(['All', 'Paid', 'Pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  filterStatus === st
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st} ({st === 'All' ? daycareTx.length : daycareTx.filter((t) => t.status === st).length})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Class Filter:
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Classes ({daycareTx.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.className}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredTx}
          searchPlaceholder="Search daycare fees by student name, ID..."
          exportFileName="Daycare_Fees_Ledger"
        />
      </div>

      {/* Add Daycare Fee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Daycare Fee"
        subtitle="Collect monthly daycare and infant care payment"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <StudentFeeSelector
                label="Daycare Student"
                selectedStudentId={formData.studentId}
                onSelectStudent={(st) => {
                  setFormData({ ...formData, studentId: st.studentId });
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Month & Program</label>
              <input
                type="text"
                required
                placeholder="e.g. Monthly Extended Daycare"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Fee (BDT) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque',
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Paid' | 'Pending' })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Program Hours</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Save}>
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
