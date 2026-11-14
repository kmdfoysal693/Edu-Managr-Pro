import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Shareholder } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StatCard } from '../../components/common/StatCard';
import { ShareholderIdCardModal } from './ShareholderIdCardModal';
import {
  UsersRound,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Coins,
  Percent,
  FileDown,
  Printer,
  Upload,
  ShieldCheck,
  Building,
  Contact,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const ShareholderList: React.FC = () => {
  const { shareholders, updateShareholder, deleteShareholder, setCurrentRoute, schoolSettings } = useSchool();
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  const [selectedShareholderForIdCard, setSelectedShareholderForIdCard] = useState<Shareholder | null>(null);
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [shareholderToDelete, setShareholderToDelete] = useState<Shareholder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // Filtered dataset
  const filteredShareholders = useMemo(() => {
    if (statusFilter === 'All') return shareholders;
    return shareholders.filter((s) => s.status === statusFilter);
  }, [shareholders, statusFilter]);

  // Aggregate stats
  const totalShares = shareholders.reduce((acc, s) => acc + s.numberOfShares, 0);
  const totalInvestment = shareholders.reduce((acc, s) => acc + s.shareAmount, 0);
  const avgInvestment = shareholders.length > 0 ? Math.round(totalInvestment / shareholders.length) : 0;

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingShareholder) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditingShareholder((prev) => prev ? { ...prev, photo: reader.result as string } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShareholder) return;
    updateShareholder(editingShareholder.id, editingShareholder);
    setEditingShareholder(null);
  };

  const columns: Column<Shareholder>[] = [
    {
      key: 'fullName',
      header: 'Shareholder',
      sortable: true,
      render: (sh) => (
        <div className="flex items-center gap-3">
          <img src={sh.photo} alt={sh.fullName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200" />
          <div>
            <p className="font-bold text-[#172554] hover:text-[#2563EB] cursor-pointer" onClick={() => setSelectedShareholder(sh)}>
              {sh.fullName}
            </p>
            <p className="text-xs text-slate-400">{sh.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'numberOfShares',
      header: 'Shares & Equity',
      sortable: true,
      render: (sh) => (
        <div>
          <span className="font-bold text-slate-800">{sh.numberOfShares} Shares</span>
          <span className="text-xs text-blue-600 font-semibold block">({sh.sharePercentage || 10}% equity)</span>
        </div>
      ),
    },
    {
      key: 'shareAmount',
      header: 'Capital Investment',
      sortable: true,
      render: (sh) => <span className="font-bold text-emerald-700">{fmtBDT(sh.shareAmount)}</span>,
    },
    {
      key: 'phoneNumber',
      header: 'Contact',
      render: (sh) => (
        <div className="text-xs">
          <p className="text-slate-700">{sh.phoneNumber}</p>
          <p className="text-slate-400 truncate max-w-[150px]">{sh.address}</p>
        </div>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Member Since',
      sortable: true,
      render: (sh) => <span className="text-xs text-slate-500">{sh.joiningDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (sh) => <Badge variant={getStatusBadgeVariant(sh.status)}>{sh.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (sh) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedShareholderForIdCard(sh)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Shareholder Smart Membership Card"
          >
            <Contact className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            onClick={() => setSelectedShareholder(sh)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingShareholder(sh)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Shareholder"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShareholderToDelete(sh)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Shareholder"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Shareholder & Trustee Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage school capital equity, shares, and governing board stakeholders</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setCurrentRoute('shareholder-add')}>
          Add Shareholder
        </Button>
      </div>

      {/* Aggregate Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Subscribed Shares"
          value={totalShares}
          subtitle="Issued equity units"
          icon={Coins}
          colorTheme="blue"
        />
        <StatCard
          title="Total Paid-up Capital"
          value={fmtBDT(totalInvestment)}
          subtitle="Direct school capital reserves"
          icon={Percent}
          colorTheme="emerald"
        />
        <StatCard
          title="Average Equity Contribution"
          value={fmtBDT(avgInvestment)}
          subtitle={`Across ${shareholders.length} active stakeholders`}
          icon={UsersRound}
          colorTheme="violet"
        />
      </div>

      {/* Filter Tabs & Data Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {(['All', 'Active', 'Inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab} ({tab === 'All' ? shareholders.length : shareholders.filter((s) => s.status === tab).length})
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredShareholders}
          searchPlaceholder="Search shareholders by name, email, phone, or address..."
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={FileDown}
              onClick={() => setIsInvoiceModalOpen(true)}
              className="text-[#2563EB] border-blue-200 hover:bg-blue-50 font-bold"
            >
              Download PDF
            </Button>
          }
        />
      </div>

      {/* View Shareholder Details Modal */}
      {selectedShareholder && (
        <Modal
          isOpen={Boolean(selectedShareholder)}
          onClose={() => setSelectedShareholder(null)}
          title="Shareholder Profile & Equity Certificate"
          subtitle="Official institutional governance registry document"
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedShareholder.photo}
                alt={selectedShareholder.fullName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#172554]">{selectedShareholder.fullName}</h4>
                  <Badge variant={getStatusBadgeVariant(selectedShareholder.status)}>
                    {selectedShareholder.status}
                  </Badge>
                </div>
                {selectedShareholder.notes && (
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{selectedShareholder.notes}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">Member ID: {selectedShareholder.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-slate-500">Number of Shares</p>
                <p className="text-lg font-bold text-blue-700 mt-0.5">{selectedShareholder.numberOfShares} Units</p>
              </div>
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <p className="text-slate-500">Capital Value</p>
                <p className="text-lg font-bold text-emerald-700 mt-0.5">{fmtBDT(selectedShareholder.shareAmount)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex items-center gap-3 pt-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-medium">{selectedShareholder.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-medium">{selectedShareholder.email}</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-medium">{selectedShareholder.address}</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-medium">Joined: {selectedShareholder.joiningDate}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedShareholder(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Contact}
                onClick={() => {
                  const sh = selectedShareholder;
                  setSelectedShareholder(null);
                  setSelectedShareholderForIdCard(sh);
                }}
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold"
              >
                Shareholder Card
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Edit}
                onClick={() => {
                  setEditingShareholder(selectedShareholder);
                  setSelectedShareholder(null);
                }}
              >
                Edit Details
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Shareholder Modal */}
      {editingShareholder && (
        <Modal
          isOpen={Boolean(editingShareholder)}
          onClose={() => setEditingShareholder(null)}
          title="Edit Shareholder Information"
          subtitle="Update equity holding or contact information"
          maxWidth="xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingShareholder.fullName}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Photo</label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <img
                    src={editingShareholder.photo}
                    alt="Preview"
                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Choose File (Gallery / Storage)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editingShareholder.phoneNumber}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingShareholder.email}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={editingShareholder.address}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Share Capital (BDT)</label>
                <input
                  type="number"
                  required
                  value={editingShareholder.shareAmount}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, shareAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Shares</label>
                <input
                  type="number"
                  required
                  value={editingShareholder.numberOfShares}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, numberOfShares: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingShareholder.status}
                  onChange={(e) =>
                    setEditingShareholder({ ...editingShareholder, status: e.target.value as 'Active' | 'Inactive' })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Designation Notes</label>
                <input
                  type="text"
                  value={editingShareholder.notes || ''}
                  onChange={(e) => setEditingShareholder({ ...editingShareholder, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingShareholder(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      {shareholderToDelete && (
        <ConfirmDialog
          isOpen={Boolean(shareholderToDelete)}
          onClose={() => setShareholderToDelete(null)}
          onConfirm={() => deleteShareholder(shareholderToDelete.id)}
          title="Delete Shareholder Record"
          message={`Are you sure you want to delete ${shareholderToDelete.fullName}? All associated equity entries will be archived.`}
          confirmLabel="Delete Record"
        />
      )}

      {/* Official Shareholder Invoice & Equity Statement Printable Modal */}
      {isInvoiceModalOpen && (
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title="Official Shareholder Equity Invoice & Register"
          subtitle="Certified Institutional Capital Ledger • Reference: INV-OMS-SHR-2026-0881"
          maxWidth="4xl"
        >
          <div className="space-y-5">
            {/* Printable Invoice Container */}
            <div id="printable-shareholder-invoice" className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 print-page shadow-sm">
              {/* 1. School Header & Brand */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-800 pb-5 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-full bg-white p-1 ring-2 ring-blue-600/30 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={schoolSettings.logo}
                      alt={`${schoolSettings.schoolName} Logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-[#172554] tracking-tight">
                      {schoolSettings.institutionName || schoolSettings.schoolName}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      {schoolSettings.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400 mt-1">
                      <span><strong>EIIN:</strong> {schoolSettings.eiin}</span>
                      <span>•</span>
                      <span><strong>Estd:</strong> {schoolSettings.establishedYear}</span>
                      <span>•</span>
                      <span><strong>Tel:</strong> {schoolSettings.phone}</span>
                      <span>•</span>
                      <span><strong>Email:</strong> {schoolSettings.email}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-[#172554] text-white text-xs font-black uppercase tracking-wider rounded-md">
                    EQUITY INVOICE / STATEMENT
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-700 mt-1.5">INV-OMS-SHR-2026-0881</p>
                  <p className="text-[11px] text-slate-400">
                    Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* 2. Invoice Meta / Billing Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Issued For</p>
                  <p className="font-bold text-[#172554]">Board of Trustees & Capital Shareholders</p>
                  <p className="text-slate-500 text-[11px]">Governing Body Equity Holding</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Fiscal Session & Term</p>
                  <p className="font-bold text-[#172554]">Academic Session 2025-2026</p>
                  <p className="text-slate-500 text-[11px]">Capital Ledger Resolution #OMS-42</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Currency & Settlement</p>
                  <p className="font-bold text-emerald-700 font-mono">Bangladeshi Taka (BDT)</p>
                  <p className="text-slate-500 text-[11px]">Paid-Up Institutional Capital</p>
                </div>
              </div>

              {/* 3. Summary KPIs Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Shares</p>
                  <p className="text-base font-extrabold text-[#172554]">{totalShares} Units</p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Capital Value</p>
                  <p className="text-base font-extrabold text-emerald-700">{fmtBDT(totalInvestment)}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Average Equity</p>
                  <p className="text-base font-extrabold text-blue-700">{fmtBDT(avgInvestment)}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Trustees</p>
                  <p className="text-base font-extrabold text-purple-700">{shareholders.length} Members</p>
                </div>
              </div>

              {/* 4. Itemized Shareholder Ledger Table (Like an Invoice) */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[#172554] uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">SL</th>
                      <th className="py-2.5 px-3">Shareholder / Trustee</th>
                      <th className="py-2.5 px-3">Member ID</th>
                      <th className="py-2.5 px-3 text-center">Shares (Units)</th>
                      <th className="py-2.5 px-3 text-center">Equity Ratio</th>
                      <th className="py-2.5 px-3 text-right">Capital Value (BDT)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {shareholders.map((sh, idx) => (
                      <tr key={sh.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#172554]">{sh.fullName}</p>
                          <p className="text-[11px] text-slate-500">{sh.phoneNumber} • {sh.email}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{sh.id}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{sh.numberOfShares}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                          {sh.sharePercentage || Math.round((sh.numberOfShares / (totalShares || 1)) * 100)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          {fmtBDT(sh.shareAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {sh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-800">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider font-extrabold text-[#172554]">
                        Total Subscribed Capital & Shares:
                      </td>
                      <td className="py-3 px-3 text-center font-black text-slate-900">{totalShares}</td>
                      <td className="py-3 px-3 text-center font-black text-blue-800">100%</td>
                      <td className="py-3 px-3 text-right font-black text-emerald-800 text-sm">
                        {fmtBDT(totalInvestment)}
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-700 font-bold">VERIFIED</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 5. Institution Contact & Statutory Declaration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                  <p className="font-bold text-[#172554] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Registered Institutional Office:
                  </p>
                  <p className="text-slate-700 font-semibold">{schoolSettings.schoolName}</p>
                  <p className="text-slate-600">{schoolSettings.address}</p>
                  <p className="text-slate-500 text-[11px]">
                    Tel: {schoolSettings.phone} • Email: {schoolSettings.email}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    Governing Board Statutory Declaration:
                  </p>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    This document certifies that the shares and capital stated above represent the official paid-up equity in {schoolSettings.schoolName} as recorded in the Institutional Registry.
                  </p>
                </div>
              </div>

              {/* 6. Signatures & Official Seals */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-slate-400" />
                  <p className="font-bold text-[#172554] mt-1.5">Senior Accounts Officer</p>
                  <p className="text-[10px] text-slate-400">Finance & Budget Dept</p>
                </div>

                <div>
                  <div className="h-10 border-b border-slate-400" />
                  <p className="font-bold text-[#172554] mt-1.5">Bursar & Financial Controller</p>
                  <p className="text-[10px] text-slate-400">{schoolSettings.schoolName}</p>
                </div>

                <div>
                  <div className="h-10 border-b border-slate-400" />
                  <p className="font-bold text-[#172554] mt-1.5">Principal & Board Secretary</p>
                  <p className="text-[10px] text-slate-400">{schoolSettings.schoolName}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setIsInvoiceModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  printElement('printable-shareholder-invoice', {
                    title: 'Shareholder-Equity-Statement',
                    pageSize: 'A4',
                    orientation: 'portrait',
                  });
                }}
              >
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Shareholder Smart ID Card Modal */}
      {selectedShareholderForIdCard && (
        <ShareholderIdCardModal
          shareholder={selectedShareholderForIdCard}
          onClose={() => setSelectedShareholderForIdCard(null)}
        />
      )}
    </div>
  );
};
