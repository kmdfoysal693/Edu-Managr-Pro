import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Briefcase, Save, ArrowLeft, Plus, Building2, Camera, Upload, Trash2 } from 'lucide-react';

export const StaffAdd: React.FC = () => {
  const { addStaff, setCurrentRoute, departments, addDepartment, schoolSettings, showToast } = useSchool();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const [isQuickDeptOpen, setIsQuickDeptOpen] = useState(false);
  const [quickDeptForm, setQuickDeptForm] = useState({
    name: '',
    bengaliName: '',
    code: '',
    category: 'Academic' as 'Academic' | 'Administrative' | 'Support',
    headOfDepartment: '',
    description: '',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    photo: '',
    staffId: `STF-${Math.floor(1000 + Math.random() * 9000)}`,
    designation: '',
    department: departments[0]?.name || '',
    phoneNumber: '',
    email: '',
    address: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 0,
    employmentStatus: 'Permanent' as 'Permanent' | 'Contractual' | 'Probation' | 'Inactive',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  useEffect(() => {
    if ((!formData.department || !departments.some((d) => d.name === formData.department)) && departments[0]?.name) {
      setFormData((prev) => ({ ...prev, department: departments[0].name }));
    }
  }, [departments, formData.department]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid Image File', 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;
      // Resize large camera photos cleanly so localStorage stays fast and crisp on ID cards
      if (file.size > 350 * 1024 && file.type !== 'image/svg+xml') {
        const img = new Image();
        img.onload = () => {
          const maxDim = 600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setFormData((prev) => ({ ...prev, photo: canvas.toDataURL('image/jpeg', 0.85) }));
          } else {
            setFormData((prev) => ({ ...prev, photo: dataUrl }));
          }
        };
        img.src = dataUrl;
      } else {
        setFormData((prev) => ({ ...prev, photo: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department) {
      showToast('error', 'Department Required', 'Please create or select a department first.');
      return;
    }
    const added = addStaff({
      fullName: formData.fullName,
      photo: formData.photo || schoolSettings.logo,
      staffId: formData.staffId,
      designation: formData.designation,
      department: formData.department,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      joiningDate: formData.joiningDate,
      salary: Number(formData.salary),
      employmentStatus: formData.employmentStatus,
      emergencyContact: {
        name: formData.emergencyContactName,
        relation: formData.emergencyContactRelation,
        phone: formData.emergencyContactPhone,
      },
    });
    if (added) {
      setCurrentRoute('staff-list');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Add Staff / Faculty Member</h2>
          <p className="text-xs text-slate-500 mt-0.5">Register new teachers, administrative officers, and campus personnel</p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setCurrentRoute('staff-list')}>
          Back to List
        </Button>
      </div>

      <Card title="Staff Registration Form" icon={Briefcase}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic Information */}
          <div>
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">1. Basic Profile</h4>

            {/* Staff Photo Upload */}
            <div className="mb-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-28 rounded-xl bg-white border-2 border-slate-200 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Staff Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Camera className="w-7 h-7 mb-1 text-slate-300" />
                    <span className="text-[10px] font-medium leading-tight">No Photo Selected</span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <div>
                  <label className="block text-xs font-bold text-[#172554]">
                    Staff Member Photo (For Profile & Staff ID Card)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a portrait image from your device. It will be displayed on this form, the directory, and the printable Staff Smart ID Card.
                  </p>
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Upload}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    Choose File
                  </Button>

                  {formData.photo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, photo: '' }));
                        setSelectedFileName('');
                        if (photoInputRef.current) photoInputRef.current.value = '';
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Remove Photo
                    </Button>
                  )}

                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
                    {selectedFileName || 'JPG, PNG, WebP supported'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kazi Nazmul Alam"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff ID Code *</label>
                <input
                  type="text"
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Chemistry Lecturer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Department *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickDeptForm({
                        name: '',
                        bengaliName: '',
                        code: `DEPT-${Math.floor(100 + Math.random() * 900)}`,
                        category: 'Academic',
                        headOfDepartment: '',
                        description: '',
                      });
                      setIsQuickDeptOpen(true);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + New Dept
                  </button>
                </div>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  {departments.length === 0 ? (
                    <option value="">-- Click "+ New Dept" to Create Department --</option>
                  ) : (
                    departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} {d.bengaliName ? `(${d.bengaliName})` : ''} — {d.category}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Employment & Compensation */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">2. Employment & Salary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary (BDT) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status *</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employmentStatus: e.target.value as 'Permanent' | 'Contractual' | 'Probation' | 'Inactive',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contractual">Contractual</option>
                  <option value="Probation">Probationary Period</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining *</label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Contact & Emergency */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">3. Contact Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1711-000000"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@school.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Plot/Flat, Road, Sector, Area, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">4. Emergency Contact Person</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nasima Haque"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Brother"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  placeholder="+880 1..."
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCurrentRoute('staff-list')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Save Staff Record
            </Button>
          </div>
        </form>
      </Card>

      {/* Quick Add Department Modal */}
      {isQuickDeptOpen && (
        <Modal
          isOpen={isQuickDeptOpen}
          onClose={() => setIsQuickDeptOpen(false)}
          title="Create New Department"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!quickDeptForm.name.trim()) return;
              addDepartment({
                name: quickDeptForm.name.trim(),
                bengaliName: quickDeptForm.bengaliName.trim(),
                code: quickDeptForm.code.trim().toUpperCase() || `DEPT-${Math.floor(100 + Math.random() * 900)}`,
                category: quickDeptForm.category,
                headOfDepartment: quickDeptForm.headOfDepartment.trim() || 'To be assigned',
                description: quickDeptForm.description.trim() || 'Academic subject department',
                status: 'Active',
              });
              // Auto-select this newly created department in the staff form
              setFormData((prev) => ({
                ...prev,
                department: quickDeptForm.name.trim(),
              }));
              setIsQuickDeptOpen(false);
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Adding a department here will make it immediately available across all staff forms, faculty records, and salary sheets.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics & Astronomy"
                  value={quickDeptForm.name}
                  onChange={(e) => setQuickDeptForm({ ...quickDeptForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Regional / Native Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics Department"
                  value={quickDeptForm.bengaliName}
                  onChange={(e) => setQuickDeptForm({ ...quickDeptForm, bengaliName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHY"
                  value={quickDeptForm.code}
                  onChange={(e) => setQuickDeptForm({ ...quickDeptForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={quickDeptForm.category}
                  onChange={(e) =>
                    setQuickDeptForm({
                      ...quickDeptForm,
                      category: e.target.value as 'Academic' | 'Administrative' | 'Support',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Support">Support / Facilities</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Head of Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Kazi Nazmul Alam"
                  value={quickDeptForm.headOfDepartment}
                  onChange={(e) => setQuickDeptForm({ ...quickDeptForm, headOfDepartment: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of department subjects and faculty responsibilities..."
                value={quickDeptForm.description}
                onChange={(e) => setQuickDeptForm({ ...quickDeptForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsQuickDeptOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Building2}>
                Create & Select Department
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
