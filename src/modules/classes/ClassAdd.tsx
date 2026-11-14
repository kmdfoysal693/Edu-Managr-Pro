import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AcademicGroup } from '../../types';
import {
  Layers,
  Save,
  ArrowLeft,
  Plus,
  X,
  BookOpen,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

export const ClassAdd: React.FC = () => {
  const { addClass, staff, subjects, setCurrentRoute } = useSchool();

  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    classTeacher: staff[0]?.fullName || '',
    roomNumber: '201',
    maxStudents: 40,
    academicYear: String(new Date().getFullYear()),
    status: 'Active' as 'Active' | 'Inactive',
    description: '',
  });

  const [group, setGroup] = useState<AcademicGroup>('General');
  const [sections, setSections] = useState<string[]>(['A', 'B']);
  const [newSectionInput, setNewSectionInput] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Detect whether class is secondary (Class 9 or 10)
  const isSecondaryClass = useMemo(() => {
    return /class\s*(9|10)|ix|x|ssc/i.test(formData.className);
  }, [formData.className]);

  // Compute auto-suggested subjects based on class name and group
  useEffect(() => {
    if (!formData.className.trim()) {
      setSelectedSubjectIds([]);
      return;
    }

    const normalizedName = formData.className.toLowerCase();
    const is9or10 = /class\s*(9|10)|ix|x|ssc/i.test(normalizedName);

    const matched = subjects.filter((s) => {
      // Check if this subject explicitly lists this class or general class matching
      const matchesDirect = s.classNames?.some((cn) => cn.toLowerCase() === normalizedName);
      const isJuniorSubject = s.code.startsWith('PRI-') || s.code === '150';

      if (is9or10) {
        if (isJuniorSubject) return false;
        // Compulsory core (General) applies to all 9/10 classes
        if (s.group === 'General') return true;
        // Stream subjects must match selected group
        if (group && group !== 'General') {
          return s.group === group;
        }
        return true;
      } else {
        // Primary / Junior: match primary / junior subjects or general
        if (/class\s*([1-5])|play|nursery|kg/i.test(normalizedName)) {
          return isJuniorSubject || s.group === 'General';
        }
        // Class 6, 7, 8:
        if (/class\s*(6|7|8)/i.test(normalizedName)) {
          return s.group === 'General' && ['109', '154', '111', '150'].includes(s.code);
        }
        return matchesDirect || s.group === 'General';
      }
    });

    setSelectedSubjectIds(matched.map((m) => m.id));
  }, [formData.className, group, subjects]);

  const handleAddSection = () => {
    const s = newSectionInput.trim().toUpperCase();
    if (s && !sections.includes(s)) {
      setSections([...sections, s]);
      setNewSectionInput('');
    }
  };

  const handleRemoveSection = (sec: string) => {
    if (sections.length > 1) {
      setSections(sections.filter((s) => s !== sec));
    }
  };

  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const selectAllSuggested = () => {
    const available = subjects.filter((s) => {
      if (isSecondaryClass) {
        if (s.group === 'General') return true;
        return group !== 'General' ? s.group === group : true;
      }
      return true;
    });
    setSelectedSubjectIds(available.map((a) => a.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClass({
      className: formData.className,
      classCode: formData.classCode || formData.className.substring(0, 3).toUpperCase(),
      sections,
      classTeacher: formData.classTeacher,
      roomNumber: formData.roomNumber,
      maxStudents: Number(formData.maxStudents),
      academicYear: formData.academicYear,
      status: formData.status,
      description: formData.description,
      group: isSecondaryClass ? group : 'General',
      subjectIds: selectedSubjectIds,
    });
    setCurrentRoute('class-list');
  };

  // Group quick presets for Class 9/10
  const setQuickGroup = (g: AcademicGroup) => {
    setGroup(g);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Add New Academic Class</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure curriculum grades, sections, academic stream, and auto-attached textbooks
          </p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setCurrentRoute('class-list')}>
          Back to Class List
        </Button>
      </div>

      <Card title="Class Configuration Form" icon={Layers}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Class 9 (Science), Class 10 (Commerce), Class 8"
                value={formData.className}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, className: val });
                  // auto suggest group if user types Science, Commerce, Arts
                  if (/sci/i.test(val)) setGroup('Science');
                  else if (/com|bus/i.test(val)) setGroup('Commerce');
                  else if (/art|hum/i.test(val)) setGroup('Humanities');
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CLS-09-SCI, CLS-08"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            {/* Academic Stream Group Selection (Especially for Class 9/10) */}
            <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Academic Stream / Group
                  {isSecondaryClass && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                      Class 9 / 10 Secondary Stream
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickGroup('Science')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      group === 'Science'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    🧪 Science
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickGroup('Commerce')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      group === 'Commerce'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    💼 Commerce
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickGroup('Humanities')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      group === 'Humanities'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50'
                    }`}
                  >
                    🏛️ Arts / Humanities
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickGroup('General')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      group === 'General'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    📖 General
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Selecting Science will automatically attach Physics, Chemistry, Biology & Higher Math textbooks; Commerce attaches Accounting & Finance; Arts attaches History & Geography.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Class Teacher</label>
              <select
                value={formData.classTeacher}
                onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Optional / Assign Later --</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.fullName}>
                    {s.fullName} ({s.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 302"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Students Capacity *</label>
              <input
                type="number"
                required
                min="10"
                max="60"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manage Class Sections</label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {sections.map((sec) => (
                  <span
                    key={sec}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    Section {sec}
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sec)}
                        className="text-blue-400 hover:text-blue-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Add Section (e.g. C)"
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 uppercase"
                />
                <Button variant="outline" size="sm" type="button" icon={Plus} onClick={handleAddSection}>
                  Add
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Description / Notes</label>
              <textarea
                rows={2}
                placeholder="Optional grade level details or curriculum focus..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Automatic Textbook & Curriculum Assignment Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Auto-Assigned Curriculum Textbooks
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {selectedSubjectIds.length} books selected
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These textbooks will be linked with this class. Students enrolled will automatically have access to these books.
                </p>
              </div>
              <button
                type="button"
                onClick={selectAllSuggested}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Select All Suggested
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
              {subjects
                .filter((sub) => {
                  if (isSecondaryClass) {
                    if (sub.group === 'General') return true;
                    return group !== 'General' ? sub.group === group : true;
                  }
                  return true;
                })
                .map((sub) => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                        isChecked
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sub.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              sub.group === 'Science'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.group === 'Commerce'
                                ? 'bg-blue-100 text-blue-800'
                                : sub.group === 'Humanities'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sub.group}
                          </span>
                        </div>
                        <p className="text-xs font-bold mt-1 truncate">{sub.name}</p>
                        {sub.bengaliName && (
                          <p className="text-[11px] text-slate-500 truncate">{sub.bengaliName}</p>
                        )}
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{sub.textbookTitle}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5 transition-colors ${
                          isChecked ? 'bg-blue-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCurrentRoute('class-list')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Create Class & Attach Textbooks
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
