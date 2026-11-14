import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicGroup, SubjectType } from '../../types';
import {
  BookPlus,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';

export const SubjectAdd: React.FC = () => {
  const { classes, departments, addSubject, setCurrentRoute, showToast } = useSchool();

  const [name, setName] = useState('');
  const [bengaliName, setBengaliName] = useState('');
  const [code, setCode] = useState('');
  const [group, setGroup] = useState<AcademicGroup>('General');
  const [type, setType] = useState<SubjectType>('Compulsory');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(33);
  const [textbookTitle, setTextbookTitle] = useState('');
  const [author, setAuthor] = useState('NCTB (National Curriculum and Textbook Board)');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');

  // Handle class selection toggle
  const toggleClass = (clsId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(clsId) ? prev.filter((id) => id !== clsId) : [...prev, clsId]
    );
  };

  // Quick class selectors
  const selectAllClasses = () => {
    setSelectedClassIds(classes.map((c) => c.id));
  };

  const selectSecondaryClasses = () => {
    // Select Class 9 & 10
    const sec = classes.filter((c) => /class\s*(9|10)|ix|x|ssc/i.test(c.className)).map((c) => c.id);
    setSelectedClassIds(sec.length > 0 ? sec : classes.slice(0, 3).map((c) => c.id));
  };

  const selectJuniorClasses = () => {
    // Select Class 6 to 8
    const jun = classes.filter((c) => /class\s*(6|7|8)|vi|vii|viii/i.test(c.className)).map((c) => c.id);
    setSelectedClassIds(jun);
  };

  const selectPrimaryClasses = () => {
    // Select Primary / KG / 1-5
    const pri = classes.filter((c) => /class\s*([1-5])|play|nursery|kg/i.test(c.className)).map((c) => c.id);
    setSelectedClassIds(pri);
  };

  const clearClassSelection = () => {
    setSelectedClassIds([]);
  };

  // Template Quick Presets
  const applyPreset = (presetType: 'science' | 'commerce' | 'humanities' | 'compulsory') => {
    selectSecondaryClasses();
    if (presetType === 'science') {
      setName('Physics');
      setBengaliName('Physics');
      setCode('174');
      setGroup('Science');
      setType('Elective');
      setTotalMarks(100);
      setPassingMarks(33);
      setTextbookTitle('NCTB Secondary Physics (Theory & Practical)');
      setDescription('Mechanics, thermodynamics, wave, optics, electromagnetism, and atomic physics.');
      const sciDept = departments.find((d) => /sci/i.test(d.name));
      if (sciDept) setDepartmentId(sciDept.id);
    } else if (presetType === 'commerce') {
      setName('Accounting');
      setBengaliName('Accounting');
      setCode('146');
      setGroup('Commerce');
      setType('Elective');
      setTotalMarks(100);
      setPassingMarks(33);
      setTextbookTitle('NCTB Secondary Accounting (Theory & Practice)');
      setDescription('Double-entry bookkeeping, cash book, trial balance, and financial statement analysis.');
      const comDept = departments.find((d) => /com|bus/i.test(d.name));
      if (comDept) setDepartmentId(comDept.id);
    } else if (presetType === 'humanities') {
      setName('History of Bangladesh & World Civilization');
      setBengaliName('History of Bangladesh & World Civilization');
      setCode('153');
      setGroup('Humanities');
      setType('Elective');
      setTotalMarks(100);
      setPassingMarks(33);
      setTextbookTitle('NCTB History of Bangladesh and World Civilization');
      setDescription('Ancient Bengal, Mughal rule, British colonial era, 1952 Language Movement, and 1971 Liberation War.');
      const socDept = departments.find((d) => /soc|human/i.test(d.name));
      if (socDept) setDepartmentId(socDept.id);
    } else if (presetType === 'compulsory') {
      setName('Bangla 1st Paper');
      setBengaliName('Bangla 1st Paper (Literature)');
      setCode('101');
      setGroup('General');
      setType('Compulsory');
      setTotalMarks(100);
      setPassingMarks(33);
      setTextbookTitle('NCTB Madhyamik Bangla Sahitto (Class 9-10)');
      setDescription('Core literary texts, poetry, prose, and creative question assessments.');
      const langDept = departments.find((d) => /lang|bang/i.test(d.name));
      if (langDept) setDepartmentId(langDept.id);
    }
  };

  const handleReset = () => {
    setName('');
    setBengaliName('');
    setCode('');
    setGroup('General');
    setType('Compulsory');
    setSelectedClassIds([]);
    setTotalMarks(100);
    setPassingMarks(33);
    setTextbookTitle('');
    setDescription('');
    setDepartmentId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('error', 'Missing Subject Name', 'Please enter a subject name.');
      return;
    }
    if (!code.trim()) {
      showToast('error', 'Missing Subject Code', 'Please enter a subject code.');
      return;
    }
    if (selectedClassIds.length === 0) {
      showToast('error', 'Class Required', 'Please select at least one class for this subject.');
      return;
    }
    if (Number(totalMarks) <= 0 || Number(passingMarks) < 0 || Number(passingMarks) > Number(totalMarks)) {
      showToast('error', 'Invalid Marks', 'Passing marks cannot exceed total marks.');
      return;
    }

    const selectedClasses = classes.filter((c) => selectedClassIds.includes(c.id));
    const selectedDept = departments.find((d) => d.id === departmentId);

    const added = addSubject({
      name: name.trim(),
      bengaliName: bengaliName.trim() || undefined,
      code: code.trim().toUpperCase(),
      classIds: selectedClassIds,
      classNames: selectedClasses.map((c) => c.className),
      group,
      type,
      totalMarks: Number(totalMarks) || 100,
      passingMarks: Number(passingMarks) || 33,
      textbookTitle: textbookTitle.trim() || `${name.trim()} (NCTB Textbook)`,
      author: author.trim() || 'NCTB',
      departmentId: departmentId || undefined,
      departmentName: selectedDept?.name || undefined,
      status,
      description: description.trim() || undefined,
    });

    // Navigate to Subject List
    if (added) {
      setCurrentRoute('subject-list');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-white mb-2">
            <BookPlus className="w-3.5 h-3.5" />
            Curriculum & Textbooks
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Add New Academic Subject
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Register textbook details, NCTB subject codes, and academic stream groups (Science, Commerce, Arts/Humanities, General) to automatically link with classes and student enrollments.
          </p>
        </div>
        <button
          onClick={() => setCurrentRoute('subject-list')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl border border-white/20 transition-all text-sm backdrop-blur-sm shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          View Subject List
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Templates Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Quick Fill Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset('science')}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              🧪 Science - Physics
            </button>
            <button
              type="button"
              onClick={() => applyPreset('commerce')}
              className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              💼 Commerce - Accounting
            </button>
            <button
              type="button"
              onClick={() => applyPreset('humanities')}
              className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-lg hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-colors"
            >
              🏛️ Arts / Humanities - History
            </button>
            <button
              type="button"
              onClick={() => applyPreset('compulsory')}
              className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-colors"
            >
              📖 Compulsory (General) - Bangla
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              1. Basic Subject Identification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify subject title, Bengali nomenclature, and standard NCTB curriculum code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Physics, Higher Math, Accounting"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Secondary / Alternate Name
              </label>
              <input
                type="text"
                value={bengaliName}
                onChange={(e) => setBengaliName(e.target.value)}
                placeholder="e.g. Physics, Higher Math"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 174, 146, 126, BAN-101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Academic Stream & Subject Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Stream / Group <span className="text-rose-500">*</span>
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as AcademicGroup)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="General">General / All (Common Core)</option>
                <option value="Science">Science (Physics, Chemistry, Biology)</option>
                <option value="Commerce">Commerce / Business Studies (Accounting, Finance, Business)</option>
                <option value="Humanities">Humanities / Arts (History, Geography, Civics)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                For Class 9-10, students in Science automatically get Science textbooks; Commerce gets Commerce, etc.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SubjectType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Compulsory">Compulsory (Core Curriculum)</option>
                <option value="Elective">Elective / Group Major</option>
                <option value="Optional 4th Subject">Optional 4th Subject</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Select Department (Optional) --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marks and Textbook Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                min={10}
                max={200}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Passing Marks
              </label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                min={5}
                max={100}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Textbook Title
              </label>
              <input
                type="text"
                value={textbookTitle}
                onChange={(e) => setTextbookTitle(e.target.value)}
                placeholder="e.g. NCTB Secondary Physics, English For Today"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Target Classes Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                2. Applicable Classes for this Subject <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select the classes that have this textbook in their syllabus.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllClasses}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={selectSecondaryClasses}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium transition-colors"
              >
                Class 9 & 10
              </button>
              <button
                type="button"
                onClick={selectJuniorClasses}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-medium transition-colors"
              >
                Junior (6-8)
              </button>
              <button
                type="button"
                onClick={selectPrimaryClasses}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium transition-colors"
              >
                Primary (1-5)
              </button>
              <button
                type="button"
                onClick={clearClassSelection}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {classes.map((cls) => {
              const isSelected = selectedClassIds.includes(cls.id);
              return (
                <div
                  key={cls.id}
                  onClick={() => toggleClass(cls.id)}
                  className={`cursor-pointer select-none rounded-xl p-3 border transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{cls.className}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{cls.classCode}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedClassIds.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              ⚠️ Please pick at least one class where this subject is taught.
            </p>
          )}
        </div>

        {/* Additional Details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              3. Syllabus Notes & Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Curriculum Overview / Topics Covered
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mention core chapters, practical requirements, or textbook references..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publishing Authority / Board
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="NCTB / National Curriculum and Textbook Board"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'Active'}
                      onChange={() => setStatus('Active')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                    <input
                      type="radio"
                      name="status"
                      checked={status === 'Inactive'}
                      onChange={() => setStatus('Inactive')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Form
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <BookPlus className="w-4 h-4" />
            Save Subject & Curriculum
          </button>
        </div>
      </form>
    </div>
  );
};
