import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FinancialTransaction } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { ReceiptModal } from './ReceiptModal';
import {
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Receipt,
  Scale,
  Save,
} from 'lucide-react';

export const OthersFinance: React.FC = () => {
  const { transactions, addTransaction, showToast } = useSchool();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    feeType: 'School Expense' as 'School Expense' | 'Other Income',
    title: '',
    category: 'Utilities',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    partyName: '',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque',
    notes: '',
  });

  const categories = [
    'Utilities',
    'Salaries & Remunerations',
    'Maintenance & Campus Repairs',
    'Supplies & Stationery',
    'STEM & Laboratory Equipment',
    'Internet & IT Infrastructure',
    'Hall Rental / Space Lease',
    'Canteen & Concessions',
    'Other Administrative',
  ];

  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.feeType !== 'School Expense' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.feeType === 'School Expense' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  const otherTx = transactions.filter(
    (t) => t.feeType === 'School Expense' || t.feeType === 'Other Income'
  );

  const filteredTx = otherTx.filter((t) => {
    if (activeTab === 'expense') return t.feeType === 'School Expense';
    if (activeTab === 'income') return t.feeType === 'Other Income';
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formData.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a transaction amount greater than 0.');
      return;
    }
    addTransaction({
      feeType: formData.feeType,
      title: formData.title,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      status: 'Paid',
      partyName: formData.partyName || (formData.feeType === 'School Expense' ? 'Vendor' : 'Client'),
      category: formData.category,
      notes: formData.notes,
    });
    setIsAddModalOpen(false);
    setFormData({
      feeType: 'School Expense',
      title: '',
      category: 'Utilities',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      partyName: '',
      paymentMethod: 'Bank Transfer',
      notes: '',
    });
  };

  const columns: Column<FinancialTransaction>[] = [
    {
      key: 'receiptNumber',
      header: 'Voucher No',
      sortable: true,
      render: (t) => (
        <span
          className={`font-mono text-xs font-bold ${
            t.feeType === 'School Expense' ? 'text-rose-600' : 'text-blue-700'
          }`}
        >
          {t.receiptNumber}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Description & Category',
      sortable: true,
      render: (t) => (
        <div>
          <p className="font-bold text-[#172554] text-xs sm:text-sm">{t.title}</p>
          <span className="text-[11px] font-semibold text-slate-400">{t.category || t.feeType}</span>
        </div>
      ),
    },
    {
      key: 'partyName',
      header: 'Vendor / Client',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-700 font-medium">{t.partyName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount (BDT)',
      sortable: true,
      render: (t) => (
        <span
          className={`font-bold text-xs sm:text-sm ${
            t.feeType === 'School Expense' ? 'text-rose-600' : 'text-emerald-700'
          }`}
        >
          {t.feeType === 'School Expense' ? '-' : '+'}
          {fmtBDT(t.amount)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-500 font-mono">{t.date}</span>,
    },
    {
      key: 'feeType',
      header: 'Flow Type',
      sortable: true,
      render: (t) => (
        <Badge variant={t.feeType === 'School Expense' ? 'danger' : 'success'}>
          {t.feeType === 'School Expense' ? 'EXPENSE' : 'INCOME'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedReceipt(t)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
            title="View Voucher Slip"
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
          <h2 className="text-xl font-bold text-[#172554]">School Expense & Miscellaneous Finance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage operational vendor expenditures, campus utilities, and non-tuition revenues</p>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          Record Income / Expense
        </Button>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Gross Income"
          value={fmtBDT(totalIncome)}
          subtitle="Tuition, fees, daycare & donations"
          icon={TrendingUp}
          colorTheme="emerald"
        />
        <StatCard
          title="Total Operational Expenses"
          value={fmtBDT(totalExpenses)}
          subtitle="Salaries, utilities & procurement"
          icon={TrendingDown}
          colorTheme="rose"
        />
        <StatCard
          title="Net Reserve Balance"
          value={fmtBDT(netBalance)}
          subtitle="Positive institutional cash surplus"
          icon={Scale}
          colorTheme="blue"
        />
      </div>

      {/* Tabs & Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {(['all', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors uppercase tracking-wider ${
                activeTab === t
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t === 'all' ? 'All Entries' : t === 'expense' ? 'Expenses' : 'Other Incomes'}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredTx}
          searchPlaceholder="Search transactions by title, vendor, category..."
          exportFileName="Expenses_Income_Ledger"
        />
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Financial Transaction"
        subtitle="Log operational vendor expense or miscellaneous revenue"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Nature *</label>
              <select
                value={formData.feeType}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value as 'School Expense' | 'Other Income' })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="School Expense">School Operational Expense (-)</option>
                <option value="Other Income">Other Miscellaneous Income (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Accounting Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Laboratory Chemical Reagents & Glassware"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Counterparty *</label>
              <input
                type="text"
                required
                placeholder="Company or Person name"
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (BDT) *</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Settlement Method</label>
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
                <option value="Bank Transfer">Bank Transfer / BEFTN</option>
                <option value="Cheque">Corporate Account Cheque</option>
                <option value="bKash">bKash Merchant</option>
                <option value="Cash">Cash Voucher</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Reference / Notes</label>
              <input
                type="text"
                placeholder="Bill number, invoice ID or approval reference..."
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
              Save Voucher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
