import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UsersRound, Save, ArrowLeft, Upload, CheckCircle } from 'lucide-react';

export const ShareholderAdd: React.FC = () => {
  const { addShareholder, setCurrentRoute, schoolSettings } = useSchool();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    photo: '',
    phoneNumber: '',
    email: '',
    address: '',
    shareAmount: 0,
    numberOfShares: 1,
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Inactive',
    notes: '',
  });

  const [photoSourceType, setPhotoSourceType] = useState<'file' | 'url'>('file');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addShareholder({
      fullName: formData.fullName,
      photo: formData.photo || schoolSettings.logo,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      shareAmount: Number(formData.shareAmount),
      numberOfShares: Number(formData.numberOfShares),
      joiningDate: formData.joiningDate,
      status: formData.status,
      notes: formData.notes,
    });
    setCurrentRoute('shareholder-list');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Add New Shareholder</h2>
          <p className="text-xs text-slate-500 mt-0.5">Register school governing body and equity shareholders</p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setCurrentRoute('shareholder-list')}>
          Back to List
        </Button>
      </div>

      <Card title="Shareholder Information" icon={UsersRound}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alhaj Engr. Abdul Matin"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Profile Photo *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoSourceType('file')}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      photoSourceType === 'file'
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-500 hover:text-slate-800 bg-slate-100'
                    }`}
                  >
                    Choose File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSourceType('url')}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      photoSourceType === 'url'
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-500 hover:text-slate-800 bg-slate-100'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {/* Hidden Native File Input (accepts image/* so it opens gallery on mobile/tablet and file explorer on PC) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {photoSourceType === 'file' ? (
                <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="relative group shrink-0">
                    <img
                      src={formData.photo || schoolSettings.logo}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover ring-2 ring-blue-500/30"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Choose File (Gallery / Storage)</span>
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {uploadedFileName ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Selected: {uploadedFileName}
                        </span>
                      ) : (
                        'Tap to browse photos or choose from device gallery'
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <img
                    src={formData.photo || schoolSettings.logo}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+880 1711-000000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                placeholder="shareholder@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address *</label>
              <input
                type="text"
                required
                placeholder="House, Road, Area, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Share Capital Amount (BDT) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.shareAmount}
                onChange={(e) => setFormData({ ...formData, shareAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of Shares *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.numberOfShares}
                onChange={(e) => setFormData({ ...formData, numberOfShares: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation & Notes</label>
              <textarea
                rows={3}
                placeholder="Governing body role, advisory portfolio, or equity agreement notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCurrentRoute('shareholder-list')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Save Shareholder
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
