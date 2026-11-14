import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { AcademicGroup, SubjectItem } from '../../types';
import {
  GraduationCap,
  Save,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';

export const StudentAdd: React.FC = () => {
  const { classes, subjects, getSubjectsForClassAndGroup, addStudent, setCurrentRoute, schoolSettings, showToast } = useSchool();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const currentYear = String(new Date().getFullYear());
  const [formData, setFormData] = useState({
    fullName: '',
    photo: '',
    studentId: `STD-${currentYear}-${String(Math.floor(100 + Math.random() * 900))}`,
    admissionNumber: `ADM-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'A+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
    classId: classes[0]?.id || '',
    section: classes[0]?.sections?.[0] || 'A',
    rollNumber: '',
    academicYear: currentYear,
    admissionDate: new Date().toISOString().split('T')[0],
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    guardianName: '',
    guardianPhone: '',
    presentAddress: '',
    permanentAddress: '',
    previousSchool: '',
    status: 'Active' as 'Active' | 'Suspended' | 'Alumni' | 'Transferred',
  });

  useEffect(() => {
    if ((!formData.classId || !classes.some((c) => c.id === formData.classId)) && classes[0]) {
      setFormData((prev) => ({
        ...prev,
        classId: classes[0].id,
        section: classes[0].sections?.[0] || 'A',
      }));
    }
  }, [classes, formData.classId]);

  const selectedClass = classes.find((c) => c.id === formData.classId);

  // Academic Group state for Class 9/10 (Science, Commerce, Humanities, General)
  const [academicGroup, setAcademicGroup] = useState<AcademicGroup>(() => {
    if (selectedClass?.group) return selectedClass.group;
    if (selectedClass?.className && /sci/i.test(selectedClass.className)) return 'Science';
    if (selectedClass?.className && /com|bus/i.test(selectedClass.className)) return 'Commerce';
    return 'General';
  });

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Detect whether class is Class 9 or 10
  const isSecondaryGrade = useMemo(() => {
    if (!selectedClass) return false;
    return /class\s*(9|10)|ix|x|ssc/i.test(selectedClass.className);
  }, [selectedClass]);

  // When class changes, sync academic group
  useEffect(() => {
    if (selectedClass?.group) {
      setAcademicGroup(selectedClass.group);
    } else if (selectedClass?.className && /sci/i.test(selectedClass.className)) {
      setAcademicGroup('Science');
    } else if (selectedClass?.className && /com|bus/i.test(selectedClass.className)) {
      setAcademicGroup('Commerce');
    } else if (selectedClass?.className && /art|hum/i.test(selectedClass.className)) {
      setAcademicGroup('Humanities');
    } else {
      setAcademicGroup('General');
    }
  }, [formData.classId, selectedClass]);

  // Dynamically compute assigned textbooks
  const assignedTextbooks = useMemo<SubjectItem[]>(() => {
    if (!selectedClass) return [];
    return getSubjectsForClassAndGroup(selectedClass.id, academicGroup);
  }, [selectedClass, academicGroup, getSubjectsForClassAndGroup, subjects]);

  // Automatically select all assigned textbooks when class or group changes
  useEffect(() => {
    setSelectedSubjectIds(assignedTextbooks.map((b) => b.id));
  }, [assignedTextbooks]);

  const toggleSubject = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

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
    if (!formData.classId || !selectedClass) {
      showToast('error', 'Class Required', 'Please create and select an academic class before admitting a student.');
      return;
    }

    const assignedNames = subjects
      .filter((s) => selectedSubjectIds.includes(s.id))
      .map((s) => `${s.name} (${s.code})`);

    const added = addStudent({
      fullName: formData.fullName,
      photo: formData.photo || schoolSettings.logo,
      studentId: formData.studentId,
      admissionNumber: formData.admissionNumber,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      classId: formData.classId,
      className: selectedClass?.className || 'Class',
      section: formData.section,
      rollNumber: formData.rollNumber,
      academicYear: formData.academicYear,
      admissionDate: formData.admissionDate,
      fatherName: formData.fatherName,
      fatherPhone: formData.fatherPhone,
      motherName: formData.motherName,
      motherPhone: formData.motherPhone,
      guardianName: formData.guardianName || formData.fatherName,
      guardianPhone: formData.guardianPhone || formData.fatherPhone,
      presentAddress: formData.presentAddress,
      permanentAddress: formData.permanentAddress || formData.presentAddress,
      previousSchool: formData.previousSchool,
      status: formData.status,
      group: isSecondaryGrade ? academicGroup : 'General',
      assignedSubjects: assignedNames,
    });
    if (added) {
      setCurrentRoute('student-list');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Student Admission & Enrollment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new students with stream selection (Science, Commerce, Arts) and auto-assigned curriculum textbooks
          </p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setCurrentRoute('student-list')}>
          Back to Student List
        </Button>
      </div>

      <Card title="Student Admission Form" icon={GraduationCap}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Academic Enrollment */}
          <div>
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
              1. Academic Enrollment & Class Placement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Number *</label>
                <input
                  type="text"
                  required
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admitted Class *</label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => {
                    const nextClass = classes.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      classId: e.target.value,
                      section: nextClass?.sections?.[0] || 'A',
                    });
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  {classes.length === 0 ? (
                    <option value="">-- Create a Class First --</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section & Roll *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-1/2 px-2 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                  >
                    {(selectedClass?.sections || ['A']).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Roll"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-1/2 px-2 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Academic Stream Selection (for Class 9 & 10) */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Student Academic Stream / Group
                    {isSecondaryGrade && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                        Class 9/10 Stream
                      </span>
                    )}
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select department group. Science students will receive Science textbooks (Physics, Chemistry, Biology, Higher Math), Commerce receives Accounting/Finance, Arts receives History/Civics.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAcademicGroup('Science')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                      academicGroup === 'Science'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    🧪 Science
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcademicGroup('Commerce')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                      academicGroup === 'Commerce'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    💼 Commerce
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcademicGroup('Humanities')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                      academicGroup === 'Humanities'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    🏛️ Arts / Humanities
                  </button>
                  {!isSecondaryGrade && (
                    <button
                      type="button"
                      onClick={() => setAcademicGroup('General')}
                      className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                        academicGroup === 'General'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      📖 General
                    </button>
                  )}
                </div>
              </div>

              {/* DYNAMIC TEXTBOOK CURRICULUM PREVIEW */}
              <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Auto-Assigned Curriculum Textbooks ({assignedTextbooks.length} Textbooks Assigned):
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {academicGroup} Department Curriculum
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                  {assignedTextbooks.map((book) => {
                    const isChecked = selectedSubjectIds.includes(book.id);
                    return (
                      <div
                        key={book.id}
                        onClick={() => toggleSubject(book.id)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                          isChecked
                            ? 'bg-white border-blue-400 shadow-xs text-slate-900'
                            : 'bg-slate-50/60 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold px-1 rounded bg-slate-100 text-slate-700">
                              {book.code}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1 rounded ${
                                book.group === 'Science'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : book.group === 'Commerce'
                                  ? 'bg-blue-100 text-blue-800'
                                  : book.group === 'Humanities'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {book.group}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 truncate mt-1">{book.name}</p>
                          {book.bengaliName && (
                            <p className="text-[11px] text-slate-500 truncate">{book.bengaliName}</p>
                          )}
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{book.textbookTitle}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 mt-0.5 ${
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
            </div>
          </div>

          {/* Section 2: Personal Profile */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">2. Student Profile Details</h4>

            {/* Student Photo Upload */}
            <div className="mb-5 p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-28 rounded-xl bg-white border-2 border-slate-200 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Student Preview"
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
                    Student Photo (For Profile, Admit Card & Student ID Card)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a portrait image from your device. It will be displayed on this form, the student directory, admit cards, and the printable Student ID Card.
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter student full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Guardian Details */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">3. Parents & Guardian Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father&apos;s Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rafiqul Islam"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father&apos;s Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1711-000000"
                  value={formData.fatherPhone}
                  onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mother&apos;s Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nasima Begum"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mother&apos;s Mobile Phone</label>
                <input
                  type="tel"
                  placeholder="+880 1811-000000"
                  value={formData.motherPhone}
                  onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name (If different)</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone Number</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address & Previous School */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">4. Address & Prior Institution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Present Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House/Plot, Road, Area, City"
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Village / City Address</label>
                <input
                  type="text"
                  placeholder="Village, Thana, District"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous School & Transfer Certificate (TC) Details</label>
                <input
                  type="text"
                  placeholder="School name, previous grade, and TC number (if applicable)"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCurrentRoute('student-list')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Enroll Student & Assign Textbooks
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
