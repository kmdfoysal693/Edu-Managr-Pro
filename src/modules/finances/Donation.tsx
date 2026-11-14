import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FinancialTransaction } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { ReceiptModal } from './ReceiptModal';
import {
  HeartHandshake,
  PlusCircle,
  Receipt,
  Users,
  Coins,
  Save,
} from 'lucide-react';

export const Donation: React.FC = () => {
  const { transactions, addTransaction, showToast } = useSchool();

  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    donorName: '',
    phone: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    paymentMethod: 'Bank Transfer' as 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Cheque',
    notes: '',
  });

  const donationTx = transactions.filter((t) => t.feeType === 'Donation');
  const totalDonations = donationTx.reduce((sum, t) => sum + t.amount, 0);

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(formData.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a donation amount greater than 0.');
      return;
    }
    addTransaction({
      feeType: 'Donation',
      title: formData.purpose,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      status: 'Paid',
      partyName: formData.donorName,
      partyContact: formData.phone,
      notes: formData.notes,
    });
    setIsAddModalOpen(false);
    setFormData({
      donorName: '',
      phone: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      purpose: '',
      paymentMethod: 'Bank Transfer',
      notes: '',
    });
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
      header: 'Philanthropist / Donor',
      sortable: true,
      render: (t) => (
        <div>
          <p className="font-bold text-[#172554] text-xs sm:text-sm">{t.partyName}</p>
          <p className="text-[11px] text-slate-400">{t.partyContact || 'Contact verified'}</p>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Donation Purpose',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-700 font-medium">{t.title}</span>,
    },
    {
      key: 'amount',
      header: 'Donation Amount (BDT)',
      sortable: true,
      render: (t) => <span className="font-bold text-emerald-700 text-xs sm:text-sm">{fmtBDT(t.amount)}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (t) => <span className="text-xs text-slate-500 font-mono">{t.date}</span>,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      sortable: true,
      render: (t) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {t.paymentMethod}
        </span>
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
            title="Print Official Donation Certificate & Receipt"
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
          <h2 className="text-xl font-bold text-[#172554]">Institutional Endowment & Donations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Philanthropic contributions, scholarship grants, and campus developmental funds</p>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          Record New Donation
        </Button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Donations Received" value={fmtBDT(totalDonations)} icon={HeartHandshake} colorTheme="emerald" />
        <StatCard title="Number of Philanthropists" value={donationTx.length} icon={Users} colorTheme="blue" />
        <StatCard
          title="Average Contribution"
          value={fmtBDT(donationTx.length > 0 ? Math.round(totalDonations / donationTx.length) : 0)}
          icon={Coins}
          colorTheme="violet"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={donationTx}
        searchPlaceholder="Search donations by donor name, phone, purpose..."
        exportFileName="Donations_Endowment_Ledger"
      />

      {/* Add Donation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Philanthropic Donation"
        subtitle="Issue official tax-exempt money receipt"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Donor / Foundation Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Begum Rokeya Chowdhury Trust"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+880 1711-000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Amount (BDT) *</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                <option value="Bank Transfer">Direct Bank Transfer</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="bKash">bKash Merchant Pay</option>
                <option value="Nagad">Nagad</option>
                <option value="Cash">Cash at Campus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Purpose *</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Lab Instruments"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Special Notes / Recognition</label>
              <textarea
                rows={2}
                placeholder="e.g. Recognition plaque in auditorium wing..."
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
              Save & Generate Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
