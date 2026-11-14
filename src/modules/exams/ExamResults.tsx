import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { StudentExamResult, SubjectMark } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import {
  Award,
  PlusCircle,
  FileText,
  Printer,
  Trash2,
  CheckCircle2,
  Save,
  Plus,
  X,
  Search,
  Filter,
  RotateCcw,
  User,
  GraduationCap,
  Calendar,
  AlertCircle,
  Download,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const ExamResults: React.FC = () => {
  const { examResults, exams, students, saveExamResult, deleteExamResult, schoolSettings, showToast, t } = useSchool();

  const [selectedResultForCard, setSelectedResultForCard] = useState<StudentExamResult | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState('ALL');
  const [examTermFilter, setExamTermFilter] = useState('ALL');
  const [resultStatusFilter, setResultStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Form State for Marks Entry
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.studentId || '');

  const [subjectsList, setSubjectsList] = useState<SubjectMark[]>([
    { subject: '', marksObtained: 0, totalMarks: 100, grade: 'F', gradePoint: 0.0 },
  ]);

  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if ((!selectedExamId || !exams.some((e) => e.id === selectedExamId)) && exams[0]?.id) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  useEffect(() => {
    if ((!selectedStudentId || !students.some((s) => s.studentId === selectedStudentId)) && students[0]?.studentId) {
      setSelectedStudentId(students[0].studentId);
    }
  }, [students, selectedStudentId]);

  // Helper grading formula
  const computeGrade = (obtained: number, total: number): { grade: string; gp: number } => {
    if (!Number.isFinite(total) || total <= 0) return { grade: 'F', gp: 0.0 };
    const safeObtained = Number.isFinite(obtained) ? Math.max(0, obtained) : 0;
    const pct = (safeObtained / total) * 100;
    if (pct >= 80) return { grade: 'A+', gp: 5.0 };
    if (pct >= 70) return { grade: 'A', gp: 4.0 };
    if (pct >= 60) return { grade: 'A-', gp: 3.5 };
    if (pct >= 50) return { grade: 'B', gp: 3.0 };
    if (pct >= 40) return { grade: 'C', gp: 2.0 };
    if (pct >= 33) return { grade: 'D', gp: 1.0 };
    return { grade: 'F', gp: 0.0 };
  };

  const handleMarkChange = (index: number, val: number) => {
    const updated = [...subjectsList];
    const item = updated[index];
    item.marksObtained = val;
    const { grade, gp } = computeGrade(val, item.totalMarks);
    item.grade = grade;
    item.gradePoint = gp;
    setSubjectsList(updated);
  };

  const handleAddSubjectRow = () => {
    setSubjectsList((prev) => [
      ...prev,
      { subject: '', marksObtained: 0, totalMarks: 100, grade: 'F', gradePoint: 0.0 },
    ]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    if (subjectsList.length > 1) {
      setSubjectsList(subjectsList.filter((_, i) => i !== index));
    }
  };

  // Submit Result Entry
  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.studentId === selectedStudentId);
    const ex = exams.find((e) => e.id === selectedExamId);

    if (!ex) {
      showToast('error', 'Please create and select an examination first.');
      return;
    }
    if (!st) {
      showToast('error', 'Please admit and select a student first.');
      return;
    }
    if (subjectsList.some((s) => !s.subject.trim())) {
      showToast('error', 'Missing Subject Name', 'Please enter a name for every subject row.');
      return;
    }
    if (subjectsList.some((s) => s.totalMarks <= 0 || s.marksObtained < 0 || s.marksObtained > s.totalMarks)) {
      showToast('error', 'Invalid Marks Range', 'Marks obtained must be between 0 and each subject total marks.');
      return;
    }

    const totalObtained = subjectsList.reduce((sum, s) => sum + s.marksObtained, 0);
    const maxTotal = subjectsList.reduce((sum, s) => sum + s.totalMarks, 0);
    const percentage = maxTotal > 0 ? Number(((totalObtained / maxTotal) * 100).toFixed(1)) : 0;
    const avgGP =
      subjectsList.length > 0
        ? Number((subjectsList.reduce((sum, s) => sum + s.gradePoint, 0) / subjectsList.length).toFixed(2))
        : 0;

    const isAnyFailed = subjectsList.some((s) => s.grade === 'F');
    const isPassed = !isAnyFailed && percentage >= 33;
    const letterGrade = isAnyFailed
      ? 'F'
      : avgGP >= 5.0
      ? 'A+'
      : avgGP >= 4.0
      ? 'A'
      : avgGP >= 3.5
      ? 'A-'
      : avgGP >= 3.0
      ? 'B'
      : avgGP >= 2.0
      ? 'C'
      : 'D';

    saveExamResult({
      examId: selectedExamId,
      examName: ex?.name || 'Annual Examination',
      studentId: selectedStudentId,
      studentName: st?.fullName || 'Student',
      rollNumber: st?.rollNumber || '01',
      className: st?.className || 'Class 10',
      section: st?.section || 'A',
      subjects: subjectsList,
      totalObtained,
      maxTotal,
      percentage,
      gpa: isAnyFailed ? 0.0 : avgGP,
      letterGrade,
      isPassed,
      remarks,
    });

    setIsEntryModalOpen(false);
  };

  // Unique options for filter dropdowns
  const studentOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; roll: string; className: string }>();
    examResults.forEach((r) => {
      if (!map.has(r.studentId)) {
        map.set(r.studentId, {
          id: r.studentId,
          name: r.studentName,
          roll: r.rollNumber,
          className: r.className,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [examResults]);

  const examTermOptions = useMemo(() => {
    const terms = new Set<string>();
    examResults.forEach((r) => terms.add(r.examName));
    exams.forEach((e) => terms.add(e.name));
    return Array.from(terms).filter(Boolean).sort();
  }, [examResults, exams]);

  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    examResults.forEach((r) => classes.add(r.className));
    return Array.from(classes).filter(Boolean).sort();
  }, [examResults]);

  const gradeOptions = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F'];

  // Filtered dataset
  const filteredResults = useMemo(() => {
    return examResults.filter((r) => {
      // 1. Text Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          r.studentName.toLowerCase().includes(query) ||
          r.studentId.toLowerCase().includes(query) ||
          r.rollNumber.toLowerCase().includes(query) ||
          r.examName.toLowerCase().includes(query) ||
          r.className.toLowerCase().includes(query) ||
          r.section.toLowerCase().includes(query) ||
          r.letterGrade.toLowerCase().includes(query) ||
          r.remarks.toLowerCase().includes(query) ||
          r.subjects.some((s) => s.subject.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // 2. Student Filter
      if (studentFilter !== 'ALL') {
        if (r.studentId !== studentFilter && r.studentName !== studentFilter) {
          return false;
        }
      }

      // 3. Exam Term Filter
      if (examTermFilter !== 'ALL') {
        if (r.examName !== examTermFilter && r.examId !== examTermFilter) {
          return false;
        }
      }

      // 4. Result Status Filter (Passed / Failed)
      if (resultStatusFilter === 'PASSED' && !r.isPassed) {
        return false;
      }
      if (resultStatusFilter === 'FAILED' && r.isPassed) {
        return false;
      }

      // 5. Class Filter
      if (classFilter !== 'ALL') {
        if (r.className !== classFilter) {
          return false;
        }
      }

      // 6. Grade Filter
      if (gradeFilter !== 'ALL') {
        if (r.letterGrade !== gradeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [examResults, searchQuery, studentFilter, examTermFilter, resultStatusFilter, classFilter, gradeFilter]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (studentFilter !== 'ALL') count++;
    if (examTermFilter !== 'ALL') count++;
    if (resultStatusFilter !== 'ALL') count++;
    if (classFilter !== 'ALL') count++;
    if (gradeFilter !== 'ALL') count++;
    return count;
  }, [searchQuery, studentFilter, examTermFilter, resultStatusFilter, classFilter, gradeFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStudentFilter('ALL');
    setExamTermFilter('ALL');
    setResultStatusFilter('ALL');
    setClassFilter('ALL');
    setGradeFilter('ALL');
  };

  // Quick stats computed on overall results
  const totalRecords = examResults.length;
  const passedRecords = examResults.filter((r) => r.isPassed).length;
  const failedRecords = examResults.filter((r) => !r.isPassed).length;
  const goldenAStarCount = examResults.filter((r) => r.gpa >= 5.0 && r.isPassed).length;
  const passRate = totalRecords > 0 ? ((passedRecords / totalRecords) * 100).toFixed(1) : '0';
  const overallAvgGpa =
    totalRecords > 0
      ? (examResults.reduce((acc, r) => acc + r.gpa, 0) / totalRecords).toFixed(2)
      : '0.00';

  // Columns definition
  const columns: Column<StudentExamResult>[] = [
    {
      key: 'rollNumber',
      header: 'Roll',
      sortable: true,
      className: 'w-16 text-center font-bold text-slate-700',
      render: (r) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200">
          {r.rollNumber}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student Name',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
            {r.studentName.charAt(0)}
          </div>
          <div>
            <p
              className="font-bold text-[#172554] hover:text-[#2563EB] cursor-pointer text-sm leading-tight"
              onClick={() => setSelectedResultForCard(r)}
            >
              {r.studentName}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {r.studentId} • <span className="font-semibold text-slate-600">{r.className}</span> ({r.section})
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'examName',
      header: 'Exam Term',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-800">{r.examName}</span>
        </div>
      ),
    },
    {
      key: 'totalObtained',
      header: 'Marks & %',
      sortable: true,
      render: (r) => (
        <div className="text-xs">
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-slate-900">{r.totalObtained}</span>
            <span className="text-slate-400">/ {r.maxTotal}</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600">{r.percentage}% score</span>
        </div>
      ),
    },
    {
      key: 'gpa',
      header: 'GPA & Grade',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-xs px-2.5 py-1 rounded-md border ${
              r.gpa >= 5.0
                ? 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-300'
                : r.gpa >= 4.0
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : r.gpa >= 3.0
                ? 'bg-slate-100 text-slate-800 border-slate-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            GPA {r.gpa.toFixed(2)}
          </span>
          <span
            className={`font-bold text-xs px-2 py-1 rounded-md border ${
              r.letterGrade === 'A+'
                ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                : r.letterGrade === 'F'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {r.letterGrade}
          </span>
        </div>
      ),
    },
    {
      key: 'isPassed',
      header: 'Result Status',
      sortable: true,
      render: (r) => (
        <Badge variant={r.isPassed ? 'success' : 'danger'}>
          {r.isPassed ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASSED
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-600" /> FAILED
            </span>
          )}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right no-print',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedResultForCard(r)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Generate Academic Report Card"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteExamResult(r.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Delete Marksheet"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Export filtered results as CSV
  const handleExportFilteredCSV = () => {
    if (!filteredResults.length) return;
    const headers = [
      'Roll Number',
      'Student Name',
      'Student ID',
      'Class',
      'Section',
      'Exam Term',
      'Marks Obtained',
      'Total Marks',
      'Percentage',
      'GPA',
      'Letter Grade',
      'Result Status',
      'Teacher Remarks',
    ];
    const rows = filteredResults.map((r) => [
      `"${r.rollNumber}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.studentId}"`,
      `"${r.className}"`,
      `"${r.section}"`,
      `"${r.examName.replace(/"/g, '""')}"`,
      r.totalObtained,
      r.maxTotal,
      `"${r.percentage}%"`,
      r.gpa.toFixed(2),
      `"${r.letterGrade}"`,
      `"${r.isPassed ? 'PASSED' : 'FAILED'}"`,
      `"${r.remarks.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Exam_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">
            {t('exam.title', 'Student Examination Results & Transcripts')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('exam.subtitle', 'Automated GPA calculation, letter grading, pass/fail status & official report cards')}
          </p>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsEntryModalOpen(true)}>
          {t('exam.enter_marks', 'Enter Student Marks')}
        </Button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('exam.stat_total_results', 'Total Results Evaluated')}
          value={totalRecords}
          subtitle={`${filteredResults.length} matching active filters`}
          icon={BookOpen}
          colorTheme="blue"
        />
        <StatCard
          title={t('exam.stat_passed', 'Passed Candidates')}
          value={passedRecords}
          subtitle={`${passRate}% overall institutional pass rate`}
          icon={CheckCircle2}
          colorTheme="emerald"
          trend={{ value: `${passRate}%`, isPositive: Number(passRate) >= 70, label: 'Pass Rate' }}
        />
        <StatCard
          title={t('exam.stat_failed', 'Failed / Retake Needed')}
          value={failedRecords}
          subtitle={failedRecords > 0 ? 'Remedial coaching recommended' : 'Zero failures reported'}
          icon={AlertCircle}
          colorTheme={failedRecords > 0 ? 'rose' : 'teal'}
          trend={failedRecords > 0 ? { value: `${failedRecords} Students`, isPositive: false, label: 'Requires Attention' } : undefined}
        />
        <StatCard
          title={t('exam.stat_avg_gpa', 'Average Term GPA')}
          value={`${overallAvgGpa} / 5.0`}
          subtitle={`${goldenAStarCount} students achieved Golden A+`}
          icon={Award}
          colorTheme="amber"
          trend={{ value: `${goldenAStarCount} Golden A+`, isPositive: true, label: 'Top Scorers' }}
        />
      </div>

      {/* Main Results Table with Search Bar & Filters Side-by-Side */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <DataTable
          columns={columns}
          data={filteredResults}
          hideSearch={true}
          customToolbar={
            <div className="space-y-3.5 mb-4">
              {/* Primary Search & Filter Bar - Side by Side */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                {/* 1. Search Bar */}
                <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('exam.search_placeholder', 'Search student name, roll number, ID, or remarks...')}
                    className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 shadow-xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters positioned directly beside the search bar */}
                <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
                  {/* 2. Student Name Filter Dropdown */}
                  <div className="relative w-full sm:w-auto sm:min-w-[160px]">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={studentFilter}
                      onChange={(e) => setStudentFilter(e.target.value)}
                      className={`w-full pl-8 pr-7 py-2 text-xs bg-white border rounded-xl appearance-none font-medium cursor-pointer transition-colors shadow-xs ${
                        studentFilter !== 'ALL'
                          ? 'border-blue-500 text-blue-700 bg-blue-50/40 ring-1 ring-blue-500/30'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      title="Filter by Student Name"
                    >
                      <option value="ALL">👤 {t('exam.filter_all_students', 'All Students')}</option>
                      {studentOptions.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} (Roll {st.roll} - {st.className})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Exam Term Filter Dropdown */}
                  <div className="relative w-full sm:w-auto sm:min-w-[165px]">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={examTermFilter}
                      onChange={(e) => setExamTermFilter(e.target.value)}
                      className={`w-full pl-8 pr-7 py-2 text-xs bg-white border rounded-xl appearance-none font-medium cursor-pointer transition-colors shadow-xs ${
                        examTermFilter !== 'ALL'
                          ? 'border-blue-500 text-blue-700 bg-blue-50/40 ring-1 ring-blue-500/30'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      title="Filter by Exam Term"
                    >
                      <option value="ALL">📝 {t('exam.filter_all_terms', 'All Exam Terms')}</option>
                      {examTermOptions.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Result Status Filter Dropdown */}
                  <div className="relative w-full sm:w-auto sm:min-w-[140px]">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={resultStatusFilter}
                      onChange={(e) => setResultStatusFilter(e.target.value as 'ALL' | 'PASSED' | 'FAILED')}
                      className={`w-full pl-8 pr-7 py-2 text-xs bg-white border rounded-xl appearance-none font-medium cursor-pointer transition-colors shadow-xs ${
                        resultStatusFilter !== 'ALL'
                          ? resultStatusFilter === 'PASSED'
                            ? 'border-emerald-500 text-emerald-800 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                            : 'border-rose-500 text-rose-800 bg-rose-50/40 ring-1 ring-rose-500/30'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      title="Filter by Result Status"
                    >
                      <option value="ALL">🎯 {t('exam.filter_all_results', 'All Results')}</option>
                      <option value="PASSED">✅ {t('exam.filter_passed', 'Passed Only')}</option>
                      <option value="FAILED">❌ {t('exam.filter_failed', 'Failed / Retake')}</option>
                    </select>
                  </div>

                  {/* 5. Class Filter Dropdown */}
                  <div className="relative w-full sm:w-auto sm:min-w-[125px]">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className={`w-full pl-8 pr-7 py-2 text-xs bg-white border rounded-xl appearance-none font-medium cursor-pointer transition-colors shadow-xs ${
                        classFilter !== 'ALL'
                          ? 'border-blue-500 text-blue-700 bg-blue-50/40 ring-1 ring-blue-500/30'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      title="Filter by Class"
                    >
                      <option value="ALL">🏫 {t('exam.filter_all_classes', 'All Classes')}</option>
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 6. Grade Filter Dropdown */}
                  <div className="relative w-full sm:w-auto sm:min-w-[115px]">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className={`w-full pl-8 pr-7 py-2 text-xs bg-white border rounded-xl appearance-none font-medium cursor-pointer transition-colors shadow-xs ${
                        gradeFilter !== 'ALL'
                          ? 'border-blue-500 text-blue-700 bg-blue-50/40 ring-1 ring-blue-500/30'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      title="Filter by Letter Grade"
                    >
                      <option value="ALL">⭐ {t('exam.filter_all_grades', 'All Grades')}</option>
                      {gradeOptions.map((grd) => (
                        <option key={grd} value={grd}>
                          Grade {grd}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters Button (appears when any filter is active) */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                      title="Reset all search filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('exam.filter_reset', 'Reset')}</span>
                      <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 text-[10px] font-black inline-flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    </button>
                  )}

                  {/* Export CSV Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={handleExportFilteredCSV}
                    className="shrink-0"
                  >
                    CSV
                  </Button>
                </div>
              </div>

              {/* Secondary Row: Quick Filter Status Pills & Active Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {/* Quick Status Buttons for Instant Easy Filtering */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Quick:
                  </span>

                  {/* All Results Pill */}
                  <button
                    onClick={() => {
                      setResultStatusFilter('ALL');
                      setGradeFilter('ALL');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      resultStatusFilter === 'ALL' && gradeFilter === 'ALL'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t('exam.quick_all', 'All Results')} ({totalRecords})
                  </button>

                  {/* Passed Pill */}
                  <button
                    onClick={() => {
                      setResultStatusFilter('PASSED');
                      setGradeFilter('ALL');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      resultStatusFilter === 'PASSED'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {t('exam.quick_passed', 'Passed')} ({passedRecords})
                  </button>

                  {/* Failed Pill */}
                  <button
                    onClick={() => {
                      setResultStatusFilter('FAILED');
                      setGradeFilter('ALL');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      resultStatusFilter === 'FAILED'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {t('exam.quick_failed', 'Failed')} ({failedRecords})
                  </button>

                  {/* Golden A+ Pill */}
                  <button
                    onClick={() => {
                      setResultStatusFilter('PASSED');
                      setGradeFilter('A+');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      gradeFilter === 'A+'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {t('exam.quick_golden', 'Golden A+ (GPA 5.0)')} ({goldenAStarCount})
                  </button>
                </div>

                {/* Counter of matching records */}
                <div className="text-xs text-slate-500 font-medium ml-auto">
                  {t('exam.showing_count', `Showing ${filteredResults.length} of ${totalRecords} exam records`)
                    .replace('{filtered}', String(filteredResults.length))
                    .replace('{total}', String(totalRecords))}
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active:</span>

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                      Query: &quot;{searchQuery}&quot;
                      <button onClick={() => setSearchQuery('')} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {studentFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                      Student: {studentOptions.find((s) => s.id === studentFilter)?.name || studentFilter}
                      <button onClick={() => setStudentFilter('ALL')} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {examTermFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">
                      Term: {examTermFilter}
                      <button onClick={() => setExamTermFilter('ALL')} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {resultStatusFilter !== 'ALL' && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
                        resultStatusFilter === 'PASSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      Status: {resultStatusFilter}
                      <button onClick={() => setResultStatusFilter('ALL')} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {classFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                      Class: {classFilter}
                      <button onClick={() => setClassFilter('ALL')} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {gradeFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                      Grade: {gradeFilter}
                      <button onClick={() => setGradeFilter('ALL')} className="hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-blue-600 hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Marks Entry Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Student Subject Marks Entry"
        subtitle="Automatic grade points, letter grades, and overall GPA calculations"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Examination</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium"
              >
                {exams.length === 0 && <option value="">-- Create Examination First --</option>}
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium"
              >
                {students.length === 0 && <option value="">-- Admit Student First --</option>}
                {students.map((st) => (
                  <option key={st.id} value={st.studentId}>
                    {st.fullName} ({st.className} - Roll {st.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#172554] uppercase tracking-wider">Subject Marks Breakdown</h4>
              <Button variant="outline" size="sm" type="button" icon={Plus} onClick={handleAddSubjectRow}>
                Add Subject
              </Button>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {subjectsList.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="text"
                    value={sub.subject}
                    onChange={(e) => {
                      const updated = [...subjectsList];
                      updated[idx].subject = e.target.value;
                      setSubjectsList(updated);
                    }}
                    placeholder="Subject Name"
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded font-semibold text-slate-800"
                  />

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Marks:</span>
                    <input
                      type="number"
                      min="0"
                      max={sub.totalMarks}
                      value={sub.marksObtained}
                      onChange={(e) => handleMarkChange(idx, Number(e.target.value))}
                      className="w-20 px-2 py-1.5 border border-slate-200 rounded font-bold text-center text-slate-900"
                    />
                    <span className="text-slate-400">/ {sub.totalMarks}</span>
                  </div>

                  <div className="w-14 text-center">
                    <span className="font-black px-2 py-1 rounded bg-blue-100 text-blue-800 block text-xs">
                      {sub.grade}
                    </span>
                  </div>

                  <div className="w-12 text-center text-slate-600 font-bold">
                    GP: {sub.gradePoint.toFixed(1)}
                  </div>

                  {subjectsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubjectRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Save}>
              Save & Compute Result
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Report Card / Academic Transcript Modal */}
      {selectedResultForCard && (
        <Modal
          isOpen={Boolean(selectedResultForCard)}
          onClose={() => setSelectedResultForCard(null)}
          title="Official Academic Progress Report Card"
          subtitle="Comprehensive grade sheet & terminal marksheet"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Printable Transcript */}
            <div
              id="printable-report-card"
              className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-8 print-page relative overflow-hidden"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4 text-center">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-full bg-white p-1 ring-2 ring-blue-600/30 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={schoolSettings.logo}
                      alt={schoolSettings.schoolName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#172554] uppercase tracking-tight">
                      {schoolSettings.institutionName || schoolSettings.schoolName}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {schoolSettings.address} • Estd: {schoolSettings.establishedYear} • EIIN: {schoolSettings.eiin}
                    </p>
                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mt-0.5">
                      Progress Report & Academic Transcript
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-xs font-mono font-bold">
                    SEAL
                  </div>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-5">
                <div>
                  <span className="text-slate-400">Student:</span>
                  <p className="font-bold text-[#172554] truncate">{selectedResultForCard.studentName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Student ID / Roll:</span>
                  <p className="font-mono font-bold text-blue-700">
                    {selectedResultForCard.studentId} (Roll {selectedResultForCard.rollNumber})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Grade & Sec:</span>
                  <p className="font-bold text-slate-800">
                    {selectedResultForCard.className} - Sec {selectedResultForCard.section}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Exam Term:</span>
                  <p className="font-bold text-slate-800 truncate">{selectedResultForCard.examName}</p>
                </div>
              </div>

              {/* Subject Marks Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden mb-5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-[#172554] border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-2">Subject Name</th>
                      <th className="px-3 py-2 text-center">Full Marks</th>
                      <th className="px-3 py-2 text-center">Marks Obtained</th>
                      <th className="px-3 py-2 text-center">Letter Grade</th>
                      <th className="px-3 py-2 text-center">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedResultForCard.subjects.map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-800">{sub.subject}</td>
                        <td className="px-3 py-2 text-center text-slate-500">{sub.totalMarks}</td>
                        <td className="px-3 py-2 text-center font-bold text-slate-900">{sub.marksObtained}</td>
                        <td className="px-3 py-2 text-center font-bold text-blue-700">{sub.grade}</td>
                        <td className="px-3 py-2 text-center font-mono font-bold">{sub.gradePoint.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50/60 font-black text-slate-900 border-t-2 border-slate-300">
                      <td className="px-3 py-2">Grand Total / Overall Summary</td>
                      <td className="px-3 py-2 text-center">{selectedResultForCard.maxTotal}</td>
                      <td className="px-3 py-2 text-center text-blue-700">{selectedResultForCard.totalObtained}</td>
                      <td className="px-3 py-2 text-center text-blue-800">{selectedResultForCard.letterGrade}</td>
                      <td className="px-3 py-2 text-center text-blue-800">
                        GPA {selectedResultForCard.gpa.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-6">
                <span className="font-bold text-[#172554]">Faculty Evaluation Remarks:</span>
                <p className="text-slate-600 italic mt-0.5">{selectedResultForCard.remarks}</p>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <p className="font-semibold text-slate-600">Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <p className="font-semibold text-slate-600">Guardian Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 mb-1 mt-6" />
                  <p className="font-bold text-[#172554]">Head of Institution</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setSelectedResultForCard(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  printElement('printable-report-card', {
                    title: `Report-Card-${selectedResultForCard.studentId}`,
                    pageSize: 'A4',
                    orientation: 'portrait',
                  });
                }}
              >
                Print Report Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
