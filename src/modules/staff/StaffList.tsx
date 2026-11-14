import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StaffMember } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StaffIdCardModal } from './StaffIdCardModal';
import {
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Save,
  Filter,
  Contact,
  Upload,
} from 'lucide-react';

export const StaffList: React.FC = () => {
  const { staff, staffAttendance, updateStaff, deleteStaff, setCurrentRoute, departments: schoolDepts, schoolSettings, showToast } = useSchool();
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedStaffForIdCard, setSelectedStaffForIdCard] = useState<StaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [viewTab, setViewTab] = useState<'profile' | 'attendance' | 'salary'>('profile');

  const departments = [
    'All',
    ...Array.from(
      new Set([...schoolDepts.map((d) => d.name), ...staff.map((s) => s.department)])
    ),
  ];

  const filteredStaff = useMemo(() => {
    if (deptFilter === 'All') return staff;
    return staff.filter((s) => s.department === deptFilter);
  }, [staff, deptFilter]);

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    updateStaff(editingStaff.id, editingStaff);
    setEditingStaff(null);
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStaff) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid Image File', 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;
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
            setEditingStaff((prev) => (prev ? { ...prev, photo: canvas.toDataURL('image/jpeg', 0.85) } : prev));
          } else {
            setEditingStaff((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
          }
        };
        img.src = dataUrl;
      } else {
        setEditingStaff((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
      }
    };
    reader.readAsDataURL(file);
  };

  const columns: Column<StaffMember>[] = [
    {
      key: 'fullName',
      header: 'Staff Member',
      sortable: true,
      render: (st) => (
        <div className="flex items-center gap-3">
          <img src={st.photo} alt={st.fullName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200" />
          <div>
            <p
              className="font-bold text-[#172554] hover:text-[#2563EB] cursor-pointer"
              onClick={() => {
                setSelectedStaff(st);
                setViewTab('profile');
              }}
            >
              {st.fullName}
            </p>
            <p className="text-xs text-slate-400 font-mono">{st.staffId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Role & Department',
      sortable: true,
      render: (st) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{st.designation}</p>
          <p className="text-[11px] text-slate-400">{st.department}</p>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'Contact Info',
      render: (st) => (
        <div className="text-xs">
          <p className="text-slate-700">{st.phoneNumber}</p>
          <p className="text-slate-400">{st.email}</p>
        </div>
      ),
    },
    {
      key: 'salary',
      header: 'Salary (Monthly)',
      sortable: true,
      render: (st) => <span className="font-bold text-slate-800">{fmtBDT(st.salary)}</span>,
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      sortable: true,
      render: (st) => <Badge variant={getStatusBadgeVariant(st.employmentStatus)}>{st.employmentStatus}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (st) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedStaff(st);
              setViewTab('profile');
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Full Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedStaffForIdCard(st)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Staff Smart ID Card"
          >
            <Contact className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => setEditingStaff(st)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Details"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStaffToDelete(st)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Staff"
          >
            <Trash2 className="w-4 h-4" />
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
          <h2 className="text-xl font-bold text-[#172554]">Faculty & Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage teachers, administrative staff, and payroll classifications</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setCurrentRoute('staff-add')}>
          Add Staff Member
        </Button>
      </div>

      {/* Filter by Department */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              deptFilter === dept
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {dept} ({dept === 'All' ? staff.length : staff.filter((s) => s.department === dept).length})
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredStaff}
        searchPlaceholder="Search staff by name, ID, designation, or phone..."
        exportFileName="Faculty_Staff_Directory"
      />

      {/* Modal: View Staff Profile with Tabs */}
      {selectedStaff && (
        <Modal
          isOpen={Boolean(selectedStaff)}
          onClose={() => setSelectedStaff(null)}
          title="Staff Profile & Records"
          subtitle={`Staff ID: ${selectedStaff.staffId}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedStaff.photo}
                alt={selectedStaff.fullName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#172554]">{selectedStaff.fullName}</h4>
                  <Badge variant={getStatusBadgeVariant(selectedStaff.employmentStatus)}>
                    {selectedStaff.employmentStatus}
                  </Badge>
                </div>
                <p className="text-xs text-blue-600 font-semibold">{selectedStaff.designation}</p>
                <p className="text-xs text-slate-400">{selectedStaff.department}</p>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setViewTab('profile')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  viewTab === 'profile' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Profile & Contact
              </button>
              <button
                onClick={() => setViewTab('attendance')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  viewTab === 'attendance' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Attendance History
              </button>
              <button
                onClick={() => setViewTab('salary')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  viewTab === 'salary' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Salary & Contract
              </button>
            </div>

            {/* Tab 1: Profile & Contact */}
            {viewTab === 'profile' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Gender</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.gender}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Date of Birth</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.dateOfBirth}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Official Email</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.email}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Phone</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.phoneNumber}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400">Residential Address</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.address}</p>
                </div>

                {selectedStaff.emergencyContact && (
                  <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                    <p className="font-bold text-rose-800">Emergency Contact</p>
                    <p className="text-slate-700 mt-1">
                      {selectedStaff.emergencyContact.name} ({selectedStaff.emergencyContact.relation}) •{' '}
                      {selectedStaff.emergencyContact.phone}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Attendance History */}
            {viewTab === 'attendance' && (
              <div className="space-y-3">
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Check-in</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffAttendance
                        .filter((a) => a.staffId === selectedStaff.staffId)
                        .map((att) => (
                          <tr key={att.id}>
                            <td className="px-3 py-2 font-mono text-slate-600">{att.date}</td>
                            <td className="px-3 py-2 text-slate-500">{att.checkInTime || '-'}</td>
                            <td className="px-3 py-2">
                              <Badge variant={getStatusBadgeVariant(att.status)} size="sm">
                                {att.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{att.notes || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Salary */}
            {viewTab === 'salary' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-700 font-medium">Monthly Gross Remuneration</p>
                    <h3 className="text-2xl font-black text-emerald-800 mt-1">{fmtBDT(selectedStaff.salary)}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-white rounded-lg font-bold text-emerald-700 border border-emerald-200">
                    Active Payroll
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Joining Date</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.joiningDate}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Contractual Classification</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStaff.employmentStatus}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Contact}
                onClick={() => {
                  const s = selectedStaff;
                  setSelectedStaff(null);
                  setSelectedStaffForIdCard(s);
                }}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold"
              >
                Staff ID Card
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStaff(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit}
                  onClick={() => {
                    setEditingStaff(selectedStaff);
                    setSelectedStaff(null);
                  }}
                >
                  Edit Staff
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Edit Staff */}
      {editingStaff && (
        <Modal
          isOpen={Boolean(editingStaff)}
          onClose={() => setEditingStaff(null)}
          title="Edit Staff Member"
          subtitle={`Editing details for ${editingStaff.fullName}`}
          maxWidth="xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Staff Photo Upload */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
              <img
                src={editingStaff.photo || schoolSettings.logo}
                alt={editingStaff.fullName}
                className="w-16 h-20 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
              />
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-[#172554]">Staff Member Photo</p>
                <input
                  ref={editPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Upload}
                    onClick={() => editPhotoInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  {editingStaff.photo && editingStaff.photo !== schoolSettings.logo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        setEditingStaff({ ...editingStaff, photo: schoolSettings.logo });
                        if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStaff.fullName}
                  onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={editingStaff.designation}
                  onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={editingStaff.department}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  {schoolDepts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} {d.bengaliName ? `(${d.bengaliName})` : ''}
                    </option>
                  ))}
                  {/* Keep custom legacy department if not found in list */}
                  {!schoolDepts.some((d) => d.name === editingStaff.department) && (
                    <option value={editingStaff.department}>{editingStaff.department}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editingStaff.phoneNumber}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary (BDT)</label>
                <input
                  type="number"
                  required
                  value={editingStaff.salary}
                  onChange={(e) => setEditingStaff({ ...editingStaff, salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
                <select
                  value={editingStaff.employmentStatus}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      employmentStatus: e.target.value as 'Permanent' | 'Contractual' | 'Probation' | 'Inactive',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contractual">Contractual</option>
                  <option value="Probation">Probation</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  required
                  value={editingStaff.address}
                  onChange={(e) => setEditingStaff({ ...editingStaff, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {staffToDelete && (
        <ConfirmDialog
          isOpen={Boolean(staffToDelete)}
          onClose={() => setStaffToDelete(null)}
          onConfirm={() => deleteStaff(staffToDelete.id)}
          title="Remove Staff Record"
          message={`Are you sure you want to remove ${staffToDelete.fullName} (${staffToDelete.designation}) from the faculty directory?`}
          confirmLabel="Remove Staff"
        />
      )}

      {/* Staff ID Card Modal */}
      {selectedStaffForIdCard && (
        <StaffIdCardModal
          staff={selectedStaffForIdCard}
          onClose={() => setSelectedStaffForIdCard(null)}
        />
      )}
    </div>
  );
};
