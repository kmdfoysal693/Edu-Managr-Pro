import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DepartmentItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  Layers,
  PlusCircle,
  Building2,
  BookOpen,
  Users,
  Search,
  Edit,
  Trash2,
  UserCheck,
  CheckCircle2,
  Briefcase,
  LayoutGrid,
  List,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const DepartmentList: React.FC = () => {
  const { departments, staff, addDepartment, updateDepartment, deleteDepartment, setCurrentRoute, language } = useSchool();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Academic' | 'Administrative' | 'Support'>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bengaliName: '',
    code: '',
    headOfDepartment: '',
    contactEmail: '',
    description: '',
    category: 'Academic' as 'Academic' | 'Administrative' | 'Vocational' | 'Support',
    status: 'Active' as 'Active' | 'Inactive',
  });

  // Calculate staff count per department
  const getStaffCount = (deptName: string) => {
    return staff.filter((s) => s.department === deptName).length;
  };

  // Filtered list
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        d.name.toLowerCase().includes(q) ||
        (d.bengaliName && d.bengaliName.toLowerCase().includes(q)) ||
        d.code.toLowerCase().includes(q) ||
        (d.headOfDepartment && d.headOfDepartment.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [departments, categoryFilter, searchQuery]);

  // Overall Stats
  const totalAcademicDepts = departments.filter((d) => d.category === 'Academic').length;
  const totalAdminDepts = departments.filter((d) => d.category === 'Administrative' || d.category === 'Support').length;
  const totalStaffAssigned = staff.length;

  const handleOpenCreateModal = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      bengaliName: '',
      code: `DEPT-${Math.floor(100 + Math.random() * 900)}`,
      headOfDepartment: staff[0]?.fullName || '',
      contactEmail: '',
      description: '',
      category: 'Academic',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentItem) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      bengaliName: dept.bengaliName || '',
      code: dept.code,
      headOfDepartment: dept.headOfDepartment || '',
      contactEmail: dept.contactEmail || '',
      description: dept.description || '',
      category: dept.category,
      status: dept.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingDepartment) {
      updateDepartment(editingDepartment.id, {
        name: formData.name.trim(),
        bengaliName: formData.bengaliName.trim() || undefined,
        code: formData.code.trim().toUpperCase(),
        headOfDepartment: formData.headOfDepartment.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        description: formData.description.trim() || undefined,
        category: formData.category,
        status: formData.status,
      });
    } else {
      addDepartment({
        name: formData.name.trim(),
        bengaliName: formData.bengaliName.trim() || undefined,
        code: formData.code.trim().toUpperCase(),
        headOfDepartment: formData.headOfDepartment.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        description: formData.description.trim() || undefined,
        category: formData.category,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (departmentToDelete) {
      deleteDepartment(departmentToDelete.id);
      setDepartmentToDelete(null);
    }
  };

  // Pre-selected colors for icons
  const getDeptColor = (idx: number) => {
    const colors = [
      { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
      { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      { text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
      { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
      { text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              Class + Department Management
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#172554] tracking-tight">
            {language === 'bn'
              ? 'Academic Departments & Faculty Management'
              : language === 'hi'
              ? 'शैक्षणिक एवं विषय विभाग प्रबंधन'
              : 'Academic & Subject Departments'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {language === 'bn'
              ? 'Create academic departments, assign department heads, and manage faculty.'
              : language === 'hi'
              ? 'विषयवार शैक्षणिक विभाग बनाएं और संकाय वितरण प्रबंधित करें।'
              : 'Create and organize subject departments (Science, Mathematics, Languages, Commerce, ICT). Registered departments appear across all faculty forms, attendance, and salary ledgers.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentRoute('staff-add')}
            className="flex items-center gap-1.5 font-bold text-slate-700 border-slate-200 hover:border-blue-300"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            Add Staff Member
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 font-bold bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            + Create Department 
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Departments"
          value={departments.length}
          subtitle="All academic & administrative units"
          icon={Building2}
          colorTheme="blue"
        />
        <StatCard
          title="Academic Subject Departments"
          value={totalAcademicDepts}
          subtitle="Science, Math, Languages, Commerce, ICT"
          icon={BookOpen}
          colorTheme="indigo"
        />
        <StatCard
          title="Faculty Assigned"
          value={totalStaffAssigned}
          subtitle="Teachers and staff members on roll"
          icon={Users}
          colorTheme="emerald"
        />
        <StatCard
          title="Administrative & Support"
          value={totalAdminDepts}
          subtitle="Finance, IT, Facilities & Daycare"
          icon={Briefcase}
          colorTheme="amber"
        />
      </div>

      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search department by name, code, or department head..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['All', 'Academic', 'Administrative', 'Support'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    categoryFilter === cat
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'All' ? 'All ' : cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Departments Found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or create a new department.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                className="mt-4 font-bold"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" /> Create Department
              </Button>
            </div>
          ) : (
            filteredDepartments.map((dept, idx) => {
              const staffCount = getStaffCount(dept.name);
              const color = getDeptColor(idx);
              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon, Code, Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-2.5 rounded-xl ${color.bg} ${color.text} ${color.border} border`}>
                          <BookOpen className="w-5 h-5" />
                        </span>
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {dept.code}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dept.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {dept.status}
                      </span>
                    </div>

                    {/* Department Name */}
                    <h3 className="font-extrabold text-[#172554] text-base group-hover:text-blue-600 transition-colors">
                      {dept.name}
                    </h3>
                    {dept.bengaliName && (
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {dept.bengaliName}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {dept.description || 'Dedicated academic subject curriculum and laboratory studies.'}
                    </p>

                    {/* Head of Department & Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Head of Dept:
                        </span>
                        <span className="font-bold text-slate-800 text-right">
                          {dept.headOfDepartment || 'Unassigned'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-500" /> Faculty Assigned:
                        </span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                          {staffCount} Teachers / Staff
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Category:
                        </span>
                        <span className="font-semibold text-slate-700">{dept.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentRoute('staff-list')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Faculty <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(dept)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        title="Edit Department"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDepartmentToDelete(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department Name & Bengali</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Head of Department</th>
                  <th className="py-3 px-4 text-center">Faculty Count</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => {
                  const staffCount = getStaffCount(dept.name);
                  return (
                    <tr key={dept.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 text-xs">
                        {dept.code}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{dept.name}</p>
                        {dept.bengaliName && (
                          <p className="text-[11px] text-slate-400">{dept.bengaliName}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {dept.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {dept.headOfDepartment || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        {staffCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            dept.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-1 rounded text-slate-500 hover:text-blue-600 transition-colors"
                            title="Edit Department"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDepartmentToDelete(dept)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Create / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDepartment ? 'Edit Department ' : 'Create New Department '}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200/80 text-blue-900 text-xs">
            <p className="font-bold">Subject / Faculty Department Registration</p>
            <p className="text-blue-800/90 mt-0.5">
              Departments created here will immediately appear in <strong>Add Staff</strong> and across all system filters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science, Mathematics, Islamic Studies"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SCI-DEPT, MATH-101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'Secondary / Alternate Name' : language === 'hi' ? 'विभाग का नाम (स्थानीय)' : 'Regional / Native Name (Optional)'}
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'e.g. Science Department, Mathematics Department' : 'e.g. Science Department'}
              value={formData.bengaliName}
              onChange={(e) => setFormData({ ...formData, bengaliName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Classification / Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="Academic">Academic </option>
                <option value="Administrative">Administrative </option>
                <option value="Support">Support & Facilities </option>
                <option value="Vocational">Vocational & Extracurricular</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Head of Department 
              </label>
              <input
                type="text"
                list="staff-list-options"
                placeholder="Select or enter teacher name"
                value={formData.headOfDepartment}
                onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <datalist id="staff-list-options">
                {staff.map((s) => (
                  <option key={s.id} value={s.fullName}>
                    {s.designation}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Curriculum Scope
            </label>
            <textarea
              rows={3}
              placeholder="Summary of subjects covered, faculty activities, and responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold bg-[#2563EB] hover:bg-blue-700">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {editingDepartment ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {departmentToDelete && (
        <Modal
          isOpen={Boolean(departmentToDelete)}
          onClose={() => setDepartmentToDelete(null)}
          title="Confirm Delete Department"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to remove the department <strong>"{departmentToDelete.name}"</strong> ({departmentToDelete.code})? Staff members assigned to this department will not be deleted.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDepartmentToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete} className="font-bold">
                Delete Department
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
