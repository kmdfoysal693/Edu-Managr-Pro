import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SubjectItem, AcademicGroup, SubjectType } from '../../types';
import {
  BookOpenCheck,
  BookPlus,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  X,
  FileText,
  BookmarkCheck,
  Check,
  BookOpen,
} from 'lucide-react';

export const SubjectList: React.FC = () => {
  const { subjects, classes, departments, updateSubject, deleteSubject, setCurrentRoute } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');

  // Edit Modal State
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    bengaliName: string;
    code: string;
    group: AcademicGroup;
    type: SubjectType;
    classIds: string[];
    totalMarks: number;
    passingMarks: number;
    textbookTitle: string;
    author: string;
    departmentId: string;
    status: 'Active' | 'Inactive';
    description: string;
  }>({
    name: '',
    bengaliName: '',
    code: '',
    group: 'General',
    type: 'Compulsory',
    classIds: [],
    totalMarks: 100,
    passingMarks: 33,
    textbookTitle: '',
    author: '',
    departmentId: '',
    status: 'Active',
    description: '',
  });

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.bengaliName && s.bengaliName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.textbookTitle && s.textbookTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Group filter
      if (selectedGroup !== 'All' && s.group !== selectedGroup) return false;

      // Type filter
      if (selectedTypeFilter !== 'All' && s.type !== selectedTypeFilter) return false;

      // Class filter
      if (selectedClassFilter !== 'All') {
        const matchesClass =
          s.classIds.includes(selectedClassFilter) ||
          (s.classNames && s.classNames.some((cn) => cn.toLowerCase() === selectedClassFilter.toLowerCase()));
        if (!matchesClass) return false;
      }

      return true;
    });
  }, [subjects, searchQuery, selectedGroup, selectedTypeFilter, selectedClassFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = subjects.length;
    const science = subjects.filter((s) => s.group === 'Science').length;
    const commerce = subjects.filter((s) => s.group === 'Commerce').length;
    const humanities = subjects.filter((s) => s.group === 'Humanities').length;
    const general = subjects.filter((s) => s.group === 'General').length;
    return { total, science, commerce, humanities, general };
  }, [subjects]);

  const handleOpenEdit = (subject: SubjectItem) => {
    setEditingSubject(subject);
    setEditForm({
      name: subject.name,
      bengaliName: subject.bengaliName || '',
      code: subject.code,
      group: subject.group,
      type: subject.type,
      classIds: [...subject.classIds],
      totalMarks: subject.totalMarks,
      passingMarks: subject.passingMarks,
      textbookTitle: subject.textbookTitle || '',
      author: subject.author || 'NCTB',
      departmentId: subject.departmentId || '',
      status: subject.status,
      description: subject.description || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const selectedClasses = classes.filter((c) => editForm.classIds.includes(c.id));
    const selectedDept = departments.find((d) => d.id === editForm.departmentId);

    updateSubject(editingSubject.id, {
      name: editForm.name.trim(),
      bengaliName: editForm.bengaliName.trim() || undefined,
      code: editForm.code.trim().toUpperCase(),
      group: editForm.group,
      type: editForm.type,
      classIds: editForm.classIds,
      classNames: selectedClasses.map((c) => c.className),
      totalMarks: Number(editForm.totalMarks) || 100,
      passingMarks: Number(editForm.passingMarks) || 33,
      textbookTitle: editForm.textbookTitle.trim() || undefined,
      author: editForm.author.trim() || undefined,
      departmentId: editForm.departmentId || undefined,
      departmentName: selectedDept?.name || undefined,
      status: editForm.status,
      description: editForm.description.trim() || undefined,
    });

    setEditingSubject(null);
  };

  const toggleEditClass = (clsId: string) => {
    setEditForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(clsId)
        ? prev.classIds.filter((id) => id !== clsId)
        : [...prev.classIds, clsId],
    }));
  };

  const handleDelete = (id: string) => {
    deleteSubject(id);
    setDeletingId(null);
  };

  const getGroupBadgeClass = (grp: AcademicGroup) => {
    switch (grp) {
      case 'Science':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'Commerce':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
      case 'Humanities':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    }
  };

  const getTypeBadgeClass = (tp: SubjectType) => {
    switch (tp) {
      case 'Compulsory':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'Elective':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Optional 4th Subject':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">
            <BookOpenCheck className="w-3.5 h-3.5" />
            Curriculum Directory
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic Subject List
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Manage grade curriculum, textbook assignments, and stream division (Science, Commerce, Arts, General). Textbooks automatically attach to classes and student enrollment profiles.
          </p>
        </div>
        <button
          onClick={() => setCurrentRoute('subject-add')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all text-sm shrink-0"
        >
          <BookPlus className="w-4 h-4" />
          Add New Subject
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Subjects</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All registered books</p>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            🧪 Science
          </p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{stats.science}</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Physics, Chem, Bio, H.Math</p>
        </div>

        <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
            💼 Commerce
          </p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">{stats.commerce}</p>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Accounting, Finance, Business</p>
        </div>

        <div className="bg-purple-50/60 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800 shadow-sm">
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-1">
            🏛️ Humanities / Arts
          </p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-1">{stats.humanities}</p>
          <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">History, Geo, Civics, Eco</p>
        </div>

        <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800 shadow-sm">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
            📖 General / Core
          </p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">{stats.general}</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Bangla, Eng, Math, ICT, Junior</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject name, bangla name, code (174, 146), textbook..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Groups</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Humanities">Humanities / Arts</option>
              <option value="General">General / Core</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Group Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['All', 'Science', 'Commerce', 'Humanities', 'General'].map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedGroup === grp
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {grp === 'All' ? 'All Subjects' : grp}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{filteredSubjects.length}</strong> of{' '}
            {subjects.length} subjects
          </p>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Subject & NCTB Code</th>
                <th className="py-3.5 px-4">Stream / Group</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Textbook Title</th>
                <th className="py-3.5 px-4">Assigned Classes</th>
                <th className="py-3.5 px-4 text-center">Marks</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">No subjects found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or group filter.</p>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => {
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                            {sub.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{sub.name}</p>
                            {sub.bengaliName && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">{sub.bengaliName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getGroupBadgeClass(
                            sub.group
                          )}`}
                        >
                          {sub.group === 'Science' && '🧪 Science'}
                          {sub.group === 'Commerce' && '💼 Commerce'}
                          {sub.group === 'Humanities' && '🏛️ Humanities'}
                          {sub.group === 'General' && '📖 General'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium border ${getTypeBadgeClass(
                            sub.type
                          )}`}
                        >
                          {sub.type}
                        </span>
                      </td>

                      {/* Textbook */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate" title={sub.textbookTitle}>
                          {sub.textbookTitle || '—'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {sub.departmentName || (sub.author ? `Pub: ${sub.author}` : '')}
                        </p>
                      </td>

                      {/* Assigned Classes */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex flex-wrap gap-1">
                          {sub.classNames && sub.classNames.length > 0 ? (
                            sub.classNames.slice(0, 3).map((cn, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-medium"
                              >
                                {cn}
                              </span>
                            ))
                          ) : (
                            sub.classIds.slice(0, 3).map((cid) => {
                              const foundCls = classes.find((c) => c.id === cid);
                              return (
                                <span
                                  key={cid}
                                  className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-medium"
                                >
                                  {foundCls?.className || cid}
                                </span>
                              );
                            })
                          )}
                          {sub.classIds.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-medium">
                              +{sub.classIds.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Marks */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {sub.totalMarks}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Pass: {sub.passingMarks}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(sub.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Edit Subject & Textbook
                </h3>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name (English) *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary Name
                  </label>
                  <input
                    type="text"
                    value={editForm.bengaliName}
                    onChange={(e) => setEditForm({ ...editForm, bengaliName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stream / Group *
                  </label>
                  <select
                    value={editForm.group}
                    onChange={(e) => setEditForm({ ...editForm, group: e.target.value as AcademicGroup })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities">Humanities / Arts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as SubjectType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Compulsory">Compulsory</option>
                    <option value="Elective">Elective</option>
                    <option value="Optional 4th Subject">Optional 4th Subject</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Textbook Title
                  </label>
                  <input
                    type="text"
                    value={editForm.textbookTitle}
                    onChange={(e) => setEditForm({ ...editForm, textbookTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={editForm.totalMarks}
                      onChange={(e) => setEditForm({ ...editForm, totalMarks: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pass Marks
                    </label>
                    <input
                      type="number"
                      value={editForm.passingMarks}
                      onChange={(e) => setEditForm({ ...editForm, passingMarks: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Classes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {classes.map((cls) => {
                    const isChecked = editForm.classIds.includes(cls.id);
                    return (
                      <div
                        key={cls.id}
                        onClick={() => toggleEditClass(cls.id)}
                        className={`cursor-pointer px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                          isChecked
                            ? 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{cls.className}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Subject?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove this subject from the school curriculum?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
