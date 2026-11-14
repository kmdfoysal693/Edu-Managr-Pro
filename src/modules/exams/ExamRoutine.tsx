import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ExamRoutineItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatCard } from '../../components/common/StatCard';
import { getSubjectsForClass } from '../../constants/classSubjects';
import {
  Clock,
  PlusCircle,
  Printer,
  Edit,
  Trash2,
  Calendar,
  Save,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  CalendarDays,
  Building,
  RotateCcw,
  BookOpen,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

interface BulkRoutineRow {
  tempId: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  section: string;
}

interface RoutineFileGroup {
  id: string; // `${examId}__${classId}`
  examId: string;
  examName: string;
  classId: string;
  className: string;
  section: string;
  startDate: string;
  endDate: string;
  subjectCount: number;
  items: ExamRoutineItem[];
}

export const ExamRoutine: React.FC = () => {
  const {
    examRoutines,
    exams,
    classes,
    addExamRoutine,
    addExamRoutinesBatch,
    updateExamRoutine,
    deleteExamRoutine,
    deleteExamRoutinesBatch,
    schoolSettings,
    language,
    showToast,
  } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedExamId, setSelectedExamId] = useState<string>('All');
  const [selectedClassId, setSelectedClassId] = useState<string>('All');
  const [activeViewTab, setActiveViewTab] = useState<'files' | 'slots'>('files');

  // Single Subject Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExamRoutineItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ExamRoutineItem | null>(null);

  // Group File Actions State
  const [selectedRoutineFileForPrint, setSelectedRoutineFileForPrint] = useState<RoutineFileGroup | null>(null);
  const [fileGroupToDelete, setFileGroupToDelete] = useState<RoutineFileGroup | null>(null);

  // Bulk Multi-Subject Routine Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkExamId, setBulkExamId] = useState<string>(exams[0]?.id || '');
  const [bulkClassId, setBulkClassId] = useState<string>(classes[0]?.id || '');
  const [bulkStartDate, setBulkStartDate] = useState<string>(todayStr);
  const [bulkGapDays, setBulkGapDays] = useState<number>(2);
  const [bulkSkipFridays, setBulkSkipFridays] = useState<boolean>(true);
  const [bulkDefaultTimeStart, setBulkDefaultTimeStart] = useState<string>('09:00 AM');
  const [bulkDefaultTimeEnd, setBulkDefaultTimeEnd] = useState<string>('12:00 PM');
  const [bulkDefaultRoom, setBulkDefaultRoom] = useState<string>('Hall 1');
  const [bulkDefaultSection, setBulkDefaultSection] = useState<string>('All Sections');
  const [bulkRows, setBulkRows] = useState<BulkRoutineRow[]>([]);
  const [editingFileGroupId, setEditingFileGroupId] = useState<string | null>(null);

  // Single Subject Form Data (Invigilator removed per user requirement)
  const [formData, setFormData] = useState({
    examId: exams[0]?.id || '',
    classId: classes[0]?.id || '',
    section: 'All Sections',
    subject: '',
    examDate: todayStr,
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    roomNumber: 'Hall 1',
  });

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  // Helper to compute sequential dates skipping Fridays
  const computeDateForIndex = (
    baseDateStr: string,
    index: number,
    gap: number,
    skipFri: boolean
  ): string => {
    try {
      const d = new Date(baseDateStr);
      if (isNaN(d.getTime())) return baseDateStr;

      // If base date is Friday and skipping is active, move to Saturday
      if (skipFri && d.getDay() === 5) {
        d.setDate(d.getDate() + 1);
      }

      for (let i = 0; i < index; i++) {
        let steps = gap > 0 ? gap : 1;
        while (steps > 0) {
          d.setDate(d.getDate() + 1);
          if (skipFri && d.getDay() === 5) {
            continue; // Skip Friday
          }
          steps--;
        }
      }
      return d.toISOString().slice(0, 10);
    } catch {
      return baseDateStr;
    }
  };

  // Group all individual routines into Unified Routine Files (1 File = 1 Routine Slot per Class & Exam)
  const routineFiles = useMemo(() => {
    const map = new Map<string, RoutineFileGroup>();

    examRoutines.forEach((item) => {
      const key = `${item.examId}__${item.classId}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          examId: item.examId,
          examName: item.examName,
          classId: item.classId,
          className: item.className,
          section: item.section,
          startDate: item.examDate,
          endDate: item.examDate,
          subjectCount: 0,
          items: [],
        });
      }
      const group = map.get(key)!;
      group.items.push(item);
      group.subjectCount++;
      if (item.examDate < group.startDate) group.startDate = item.examDate;
      if (item.examDate > group.endDate) group.endDate = item.examDate;
    });

    // Sort items within each file chronologically
    map.forEach((g) => {
      g.items.sort((a, b) => a.examDate.localeCompare(b.examDate));
    });

    return Array.from(map.values());
  }, [examRoutines]);

  // Filtered routine files
  const filteredRoutineFiles = useMemo(() => {
    return routineFiles.filter((file) => {
      const matchExam = selectedExamId === 'All' || file.examId === selectedExamId;
      const matchClass = selectedClassId === 'All' || file.classId === selectedClassId;
      return matchExam && matchClass;
    });
  }, [routineFiles, selectedExamId, selectedClassId]);

  // Filtered individual subject routines for detailed slots view
  const filteredRoutines = useMemo(() => {
    return examRoutines.filter((r) => {
      const matchExam = selectedExamId === 'All' || r.examId === selectedExamId;
      const matchClass = selectedClassId === 'All' || r.classId === selectedClassId;
      return matchExam && matchClass;
    });
  }, [examRoutines, selectedExamId, selectedClassId]);

  // Total Scheduled Slots KPI (User Requirement: multiple subjects in a routine count as 1 slot/file)
  const totalScheduledSlotsCount = routineFiles.length;
  const filteredSlotsCount = filteredRoutineFiles.length;

  // Open Bulk Modal and load all subjects for the chosen class
  const openBulkRoutineModal = (targetClassId?: string, existingFileGroup?: RoutineFileGroup) => {
    if (existingFileGroup) {
      // Editing existing routine file
      setEditingFileGroupId(existingFileGroup.id);
      setBulkExamId(existingFileGroup.examId);
      setBulkClassId(existingFileGroup.classId);
      setBulkStartDate(existingFileGroup.startDate);
      setBulkDefaultSection(existingFileGroup.section);

      const firstItem = existingFileGroup.items[0];
      if (firstItem) {
        setBulkDefaultTimeStart(firstItem.startTime);
        setBulkDefaultTimeEnd(firstItem.endTime);
        setBulkDefaultRoom(firstItem.roomNumber);
      }

      setBulkRows(
        existingFileGroup.items.map((it, idx) => ({
          tempId: `row-${Date.now()}-${idx}`,
          subject: it.subject,
          examDate: it.examDate,
          startTime: it.startTime,
          endTime: it.endTime,
          roomNumber: it.roomNumber,
          section: it.section,
        }))
      );
    } else {
      // Creating a fresh new routine file
      if (exams.length === 0 || classes.length === 0) {
        showToast('info', 'Please create an examination term and an academic class first.');
        return;
      }
      setEditingFileGroupId(null);
      const classIdToUse = targetClassId || bulkClassId || classes[0]?.id || '';
      setBulkClassId(classIdToUse);
      const examIdToUse = bulkExamId || exams[0]?.id || '';
      setBulkExamId(examIdToUse);

      const ex = exams.find((e) => e.id === examIdToUse) || exams[0];
      const startDate = ex?.startDate || todayStr;
      setBulkStartDate(startDate);

      const cls = classes.find((c) => c.id === classIdToUse);
      const roomToUse = cls?.roomNumber ? `Room ${cls.roomNumber}` : 'Hall 1';
      setBulkDefaultRoom(roomToUse);

      // Auto-populate all subjects for that class
      const subjectNames = getSubjectsForClass(cls?.className || '');
      const generatedRows: BulkRoutineRow[] = subjectNames.map((subj, idx) => ({
        tempId: `row-${Date.now()}-${idx}`,
        subject: subj,
        examDate: computeDateForIndex(startDate, idx, bulkGapDays, bulkSkipFridays),
        startTime: bulkDefaultTimeStart,
        endTime: bulkDefaultTimeEnd,
        roomNumber: roomToUse,
        section: bulkDefaultSection,
      }));

      setBulkRows(generatedRows);
    }

    setIsBulkModalOpen(true);
  };

  // When class changes in bulk modal: auto-populate all subjects of that class
  const handleBulkClassChange = (newClassId: string) => {
    setBulkClassId(newClassId);
    const cls = classes.find((c) => c.id === newClassId);
    const roomToUse = cls?.roomNumber ? `Room ${cls.roomNumber}` : bulkDefaultRoom;
    setBulkDefaultRoom(roomToUse);

    const subjectNames = getSubjectsForClass(cls?.className || '');
    const generatedRows: BulkRoutineRow[] = subjectNames.map((subj, idx) => ({
      tempId: `row-${Date.now()}-${idx}`,
      subject: subj,
      examDate: computeDateForIndex(bulkStartDate, idx, bulkGapDays, bulkSkipFridays),
      startTime: bulkDefaultTimeStart,
      endTime: bulkDefaultTimeEnd,
      roomNumber: roomToUse,
      section: bulkDefaultSection,
    }));

    setBulkRows(generatedRows);
  };

  // Instantly update default start time and sync all rows reactively
  const handleDefaultStartTimeChange = (newStartTime: string) => {
    setBulkDefaultTimeStart(newStartTime);
    setBulkRows((prev) =>
      prev.map((row) => ({
        ...row,
        startTime: newStartTime,
      }))
    );
  };

  // Instantly update default end time and sync all rows reactively
  const handleDefaultEndTimeChange = (newEndTime: string) => {
    setBulkDefaultTimeEnd(newEndTime);
    setBulkRows((prev) =>
      prev.map((row) => ({
        ...row,
        endTime: newEndTime,
      }))
    );
  };

  // Instantly update default room and sync all rows reactively
  const handleDefaultRoomChange = (newRoom: string) => {
    setBulkDefaultRoom(newRoom);
    setBulkRows((prev) =>
      prev.map((row) => ({
        ...row,
        roomNumber: newRoom,
      }))
    );
  };

  // Instantly update start date and re-sequence all rows reactively
  const handleStartDateChange = (newDate: string) => {
    setBulkStartDate(newDate);
    setBulkRows((prev) =>
      prev.map((row, idx) => ({
        ...row,
        examDate: computeDateForIndex(newDate, idx, bulkGapDays, bulkSkipFridays),
      }))
    );
  };

  // Instantly update gap days and re-sequence all rows reactively
  const handleGapDaysChange = (newGap: number) => {
    setBulkGapDays(newGap);
    setBulkRows((prev) =>
      prev.map((row, idx) => ({
        ...row,
        examDate: computeDateForIndex(bulkStartDate, idx, newGap, bulkSkipFridays),
      }))
    );
  };

  // Instantly update skip fridays and re-sequence all rows reactively
  const handleSkipFridaysChange = (skip: boolean) => {
    setBulkSkipFridays(skip);
    setBulkRows((prev) =>
      prev.map((row, idx) => ({
        ...row,
        examDate: computeDateForIndex(bulkStartDate, idx, bulkGapDays, skip),
      }))
    );
  };

  // Re-apply batch dates and room/times to all current subjects
  const handleApplyBatchSettings = () => {
    setBulkRows((prev) =>
      prev.map((row, idx) => ({
        ...row,
        examDate: computeDateForIndex(bulkStartDate, idx, bulkGapDays, bulkSkipFridays),
        startTime: bulkDefaultTimeStart,
        endTime: bulkDefaultTimeEnd,
        roomNumber: bulkDefaultRoom,
        section: bulkDefaultSection,
      }))
    );
  };

  // Update a single field on a subject row
  const handleUpdateRowField = (index: number, field: keyof BulkRoutineRow, value: string) => {
    setBulkRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Delete a subject from the routine (User requirement)
  const handleDeleteRow = (index: number) => {
    setBulkRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Add an extra subject row
  const handleAddExtraRow = () => {
    const nextIdx = bulkRows.length;
    const nextDate = computeDateForIndex(bulkStartDate, nextIdx, bulkGapDays, bulkSkipFridays);
    const newRow: BulkRoutineRow = {
      tempId: `row-${Date.now()}-${nextIdx}`,
      subject: 'New Subject',
      examDate: nextDate,
      startTime: bulkDefaultTimeStart,
      endTime: bulkDefaultTimeEnd,
      roomNumber: bulkDefaultRoom,
      section: bulkDefaultSection,
    };
    setBulkRows((prev) => [...prev, newRow]);
  };

  // Save all bulk routine subjects into a unified file
  const handleSaveBulkRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRows.length) return;

    const currentEx = exams.find((e) => e.id === bulkExamId) || exams[0];
    const currentCls = classes.find((c) => c.id === bulkClassId) || classes[0];
    if (!currentEx || !currentCls) {
      showToast('error', 'Please create and select both an examination and a class.');
      return;
    }

    // If editing an existing file group, remove old slots first to prevent duplicates
    if (editingFileGroupId) {
      const existingFile = routineFiles.find((f) => f.id === editingFileGroupId);
      if (existingFile) {
        deleteExamRoutinesBatch(existingFile.items.map((it) => it.id));
      }
    }

    const routinePayload: Omit<ExamRoutineItem, 'id'>[] = bulkRows.map((r) => ({
      examId: currentEx.id,
      examName: currentEx.name,
      classId: currentCls.id,
      className: currentCls.className,
      section: r.section || 'All Sections',
      subject: r.subject.trim() || 'Subject',
      examDate: r.examDate,
      startTime: r.startTime,
      endTime: r.endTime,
      roomNumber: r.roomNumber,
      invigilator: '', // Invigilator removed per user requirement
    }));

    addExamRoutinesBatch(routinePayload);
    setIsBulkModalOpen(false);
    setEditingFileGroupId(null);

    // Auto-select this exam and class in the view
    setSelectedExamId(currentEx.id);
    setSelectedClassId(currentCls.id);
  };

  // Delete entire routine file
  const handleConfirmDeleteFileGroup = () => {
    if (!fileGroupToDelete) return;
    deleteExamRoutinesBatch(fileGroupToDelete.items.map((it) => it.id));
    setFileGroupToDelete(null);
  };

  // Single Subject Save (Invigilator removed)
  const handleAddSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find((c) => c.id === formData.classId) || classes[0];
    const ex = exams.find((e) => e.id === formData.examId) || exams[0];
    if (!cls || !ex) {
      showToast('error', 'Please create an examination and a class first.');
      return;
    }
    addExamRoutine({
      examId: ex.id,
      examName: ex.name,
      classId: cls.id,
      className: cls.className,
      section: formData.section,
      subject: formData.subject,
      examDate: formData.examDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      roomNumber: formData.roomNumber,
      invigilator: '', // Invigilator removed per user requirement
    });
    setIsAddModalOpen(false);
  };

  // Edit Single Routine
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateExamRoutine(editingItem.id, {
      ...editingItem,
      invigilator: '', // Ensure invigilator remains blank
    });
    setEditingItem(null);
  };

  // Format date readable
  const formatReadableDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        weekday: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  // Columns for detailed subject slots (Invigilator column removed per user requirement)
  const slotColumns: Column<ExamRoutineItem>[] = [
    {
      key: 'examDate',
      header: 'Exam Date',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2 font-mono font-bold text-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{r.examDate}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Class',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-[#172554] text-xs sm:text-sm">{r.subject}</p>
          <p className="text-[11px] text-slate-400 font-medium">
            {r.className} • <span className="font-semibold text-slate-600">{r.section}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Time Slot',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium">
            {r.startTime} - {r.endTime}
          </span>
        </div>
      ),
    },
    {
      key: 'roomNumber',
      header: 'Hall / Room',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          <Building className="w-3 h-3 text-slate-500" />
          {r.roomNumber}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right no-print',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setEditingItem(r)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
            title="Edit Subject"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setItemToDelete(r)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Remove Subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Examination Timetable & Routine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate class-wise routines for all subjects, manage routine files, and print official timetable sheets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print All Routines Button */}
          <Button
            variant="outline"
            icon={Printer}
            onClick={() =>
              printElement('printable-all-exam-routines', {
                title: `Exam-Routines-${selectedExam?.name || 'All'}`,
                pageSize: 'A4',
                orientation: 'landscape',
              })
            }
          >
            Print Routine
          </Button>

          {/* Primary Multi-Subject Routine Generator Button (User Exact Renaming Requirement) */}
          <Button
            variant="primary"
            icon={CalendarDays}
            onClick={() => openBulkRoutineModal()}
            className="shadow-xs font-semibold"
          >
            {language === 'bn'
              ? 'Create Exam Routine (Multi-Subject)'
              : 'Create Exam Routine (Multi-Subject)'}
          </Button>

          {/* Single Subject Button (User Exact Renaming Requirement: "Add Single Subject") */}
          <Button
            variant="outline"
            icon={PlusCircle}
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold"
          >
            {language === 'bn' ? 'Add Single Subject' : 'Add Single Subject'}
          </Button>
        </div>
      </div>

      {/* Quick Summary KPI Cards (User Requirement: Total Scheduled Slots counts 1 per routine file) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Scheduled Slots"
          value={`${totalScheduledSlotsCount} ${totalScheduledSlotsCount === 1 ? 'Slot' : 'Slots'}`}
          subtitle={`${examRoutines.length} subjects covered across ${totalScheduledSlotsCount} class routines`}
          icon={CalendarDays}
          colorTheme="blue"
        />
        <StatCard
          title="Active Classes with Routines"
          value={`${totalScheduledSlotsCount} Routine Files`}
          subtitle={`${filteredSlotsCount} files match current exam filter`}
          icon={BookOpen}
          colorTheme="emerald"
        />
        <StatCard
          title="Selected Examination"
          value={selectedExam?.name ? selectedExam.name.slice(0, 24) + '...' : 'All Examinations'}
          subtitle={`Term status: ${selectedExam?.status || 'Active'}`}
          icon={Layers}
          colorTheme="indigo"
        />
      </div>

      {/* Filter Row & Tab Switcher */}
      <div className="no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0">Examination:</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="All">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 shrink-0">Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle: Unified Routine Files vs All Subject Slots */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveViewTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'files'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Routine Files (File View)</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
              {filteredRoutineFiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveViewTab('slots')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'slots'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Subject Slots (Detailed)</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {filteredRoutines.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: UNIFIED ROUTINE FILES VIEW */}
      {/* ============================================================== */}
      <div id="printable-all-exam-routines">
      {activeViewTab === 'files' && (
        <div className="space-y-4">
          {filteredRoutineFiles.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              <CalendarDays className="w-12 h-12 mx-auto text-blue-500/60 mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No Routine Files Found
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Click "Create Exam Routine (Multi-Subject)" above to auto-generate a complete multi-subject routine file for any class.
              </p>
              <Button
                variant="primary"
                icon={CalendarDays}
                onClick={() => openBulkRoutineModal()}
                className="mt-4"
              >
                {language === 'bn' ? 'Create Exam Routine (Multi-Subject)' : 'Create Exam Routine (Multi-Subject)'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoutineFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
                            {file.className}
                          </span>
                          <span className="text-xs text-slate-400 font-mono font-medium">
                            Sec: {file.section}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-[#172554] mt-1.5 leading-snug">
                          {file.examName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            {file.startDate} &mdash; {file.endDate}
                          </span>
                        </p>
                      </div>

                      {/* Single Slot Badge */}
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {file.subjectCount} Subjects
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">1 Routine Slot</p>
                      </div>
                    </div>
                  </div>

                  {/* Subject Pills Preview */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Scheduled Subjects:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {file.items.map((sub) => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          {sub.subject}
                          <span className="text-[10px] text-slate-400 font-mono">({sub.examDate.slice(5)})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* View and Print Unified File Button */}
                    <button
                      onClick={() => setSelectedRoutineFileForPrint(file)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      title="Open printable official routine file"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View & Print Routine File</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Routine File */}
                      <button
                        onClick={() => openBulkRoutineModal(file.classId, file)}
                        className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
                        title="Edit subjects, dates, and halls in this routine"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Routine File */}
                      <button
                        onClick={() => setFileGroupToDelete(file)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
                        title="Delete entire routine file for this class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: DETAILED INDIVIDUAL SUBJECT SLOTS TABLE */}
      {/* ============================================================== */}
      {activeViewTab === 'slots' && (
        <div className="print-page bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="print-only mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img
                src={schoolSettings.logo}
                alt={schoolSettings.schoolName}
                className="w-10 h-10 object-contain rounded-full"
              />
              <h2 className="text-lg font-black uppercase text-[#172554]">{schoolSettings.schoolName}</h2>
            </div>
            <h3 className="text-sm font-bold text-blue-700">{selectedExam?.name || 'Examination Routine'}</h3>
            <p className="text-xs text-slate-500">
              {schoolSettings.address} • Estd: {schoolSettings.establishedYear} • EIIN: {schoolSettings.eiin}
            </p>
          </div>

          <DataTable
            columns={slotColumns}
            data={filteredRoutines}
            searchPlaceholder="Search routine by subject, room, or date..."
            exportFileName="Exam_Routines"
          />
        </div>
      )}
      </div>

      {/* ============================================================== */}
      {/* OFFICIAL PRINTABLE ROUTINE FILE MODAL (Invigilator removed)   */}
      {/* ============================================================== */}
      {selectedRoutineFileForPrint && (
        <Modal
          isOpen={Boolean(selectedRoutineFileForPrint)}
          onClose={() => setSelectedRoutineFileForPrint(null)}
          title="Official Examination Routine Sheet"
          subtitle="Formatted for official notice board and academic printing"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Printable Document Sheet */}
            <div
              id="printable-routine-document"
              className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 print-page relative overflow-hidden"
            >
              {/* Institution Official Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-full bg-white p-1 ring-2 ring-blue-600/30 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                    <p className="text-xs font-black text-blue-700 uppercase tracking-widest mt-1">
                      OFFICIAL EXAMINATION TIMETABLE & ROUTINE
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-slate-50 border-2 border-slate-400 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold text-slate-600">
                    <span>ACADEMIC</span>
                    <span>SEAL</span>
                  </div>
                </div>
              </div>

              {/* Routine File Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-300 text-xs mb-4">
                <div>
                  <span className="text-slate-400 font-semibold block">Examination:</span>
                  <p className="font-bold text-[#172554] truncate">{selectedRoutineFileForPrint.examName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Target Class & Sec:</span>
                  <p className="font-bold text-blue-700">
                    {selectedRoutineFileForPrint.className} (Sec: {selectedRoutineFileForPrint.section})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Total Subjects:</span>
                  <p className="font-bold text-slate-800">
                    {selectedRoutineFileForPrint.subjectCount} Subjects Scheduled
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Routine Period:</span>
                  <p className="font-bold text-slate-800">
                    {selectedRoutineFileForPrint.startDate} &mdash; {selectedRoutineFileForPrint.endDate}
                  </p>
                </div>
              </div>

              {/* Multi-Subject Schedule Table (Invigilator removed per user requirement) */}
              <div className="border border-slate-400 rounded-xl overflow-hidden mb-5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-[#172554] border-b border-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5 w-14 text-center">SL</th>
                      <th className="px-4 py-2.5">Date & Day</th>
                      <th className="px-4 py-2.5">Subject Name</th>
                      <th className="px-4 py-2.5">Exam Time</th>
                      <th className="px-4 py-2.5">Room / Hall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedRoutineFileForPrint.items.map((sub, i) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-center font-bold text-slate-500">{i + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                          {formatReadableDate(sub.examDate)}
                        </td>
                        <td className="px-4 py-2.5 font-black text-blue-900">{sub.subject}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                          {sub.startTime} - {sub.endTime}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{sub.roomNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* General Examination Rules & Instructions */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
                <p className="font-bold text-[#172554] mb-1">
                  Instructions for Candidates:
                </p>
                <ol className="list-decimal list-inside text-slate-600 space-y-0.5 text-[11px]">
                  <li>Students must enter the examination hall at least 30 minutes before exam commencement.</li>
                  <li>Original Admit Card and Student ID card must be placed on the designated desk.</li>
                  <li>Mobile phones, smart devices, and unauthorized papers are strictly prohibited in the exam hall.</li>
                  <li>Any candidate arriving later than 15 minutes past start time will not be permitted.</li>
                </ol>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t-2 border-slate-300 flex items-end justify-between text-xs">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <p className="font-semibold text-slate-600">Exam Controller</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <p className="font-semibold text-slate-600">Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-800 mb-1 mt-6" />
                  <p className="font-bold text-[#172554]">Head of Institution</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setSelectedRoutineFileForPrint(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  printElement('printable-routine-document', {
                    title: `Exam-Routine-${selectedRoutineFileForPrint.className}-${selectedRoutineFileForPrint.examName}`,
                    pageSize: 'A4',
                    orientation: 'portrait',
                  });
                }}
              >
                Print Routine File
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* BULK MULTI-SUBJECT ROUTINE GENERATOR MODAL (Invigilator removed) */}
      {/* ============================================================== */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setEditingFileGroupId(null);
        }}
        title="Create Exam Routine (Multi-Subject)"
        subtitle={
          editingFileGroupId
            ? 'Edit subjects, dates, and times for this routine file'
            : 'Select a class to auto-load all curriculum subjects, customize dates, times, rooms, or delete unneeded subjects'
        }
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveBulkRoutine} className="space-y-4">
          {/* Top Configuration Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Select Exam */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Select Examination
                </label>
                <select
                  value={bulkExamId}
                  onChange={(e) => setBulkExamId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {exams.length === 0 && <option value="">-- Create Exam First --</option>}
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Class (Trigger that loads all subjects) */}
              <div>
                <label className="block text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  2. Target Class (Loads Subjects)
                </label>
                <select
                  value={bulkClassId}
                  onChange={(e) => handleBulkClassChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-500 rounded-lg font-bold text-blue-900 shadow-xs"
                >
                  {classes.length === 0 && <option value="">-- Create Class First --</option>}
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} ({c.sections.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Routine Start Date
                </label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              {/* Day Interval Gap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Days Between Exams
                </label>
                <select
                  value={bulkGapDays}
                  onChange={(e) => handleGapDaysChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  <option value={1}>1 Day (Consecutive Days)</option>
                  <option value={2}>2 Days (1 Day Preparation Gap)</option>
                  <option value={3}>3 Days (2 Days Preparation Gap)</option>
                  <option value={4}>4 Days (3 Days Preparation Gap)</option>
                </select>
              </div>
            </div>

            {/* Batch Defaults Applicator with Live Reactive Sync */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkSkipFridays}
                    onChange={(e) => handleSkipFridaysChange(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Skip Fridays (Weekly Holiday)</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Default Time:</span>
                  <input
                    type="text"
                    value={bulkDefaultTimeStart}
                    onChange={(e) => handleDefaultStartTimeChange(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded text-center font-bold focus:border-blue-500 focus:outline-none"
                    title="Change default start time (updates all subject slots live)"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    value={bulkDefaultTimeEnd}
                    onChange={(e) => handleDefaultEndTimeChange(e.target.value)}
                    placeholder="12:00 PM"
                    className="w-20 px-2 py-1 text-xs bg-white border border-slate-200 rounded text-center font-bold focus:border-blue-500 focus:outline-none"
                    title="Change default end time (updates all subject slots live)"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Default Room:</span>
                  <input
                    type="text"
                    value={bulkDefaultRoom}
                    onChange={(e) => handleDefaultRoomChange(e.target.value)}
                    placeholder="Room 401 & 402"
                    className="w-28 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-semibold focus:border-blue-500 focus:outline-none"
                    title="Change default room (updates all subject halls live)"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyBatchSettings}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Apply start date, gaps, time and room to all subjects below"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Apply Settings to All Rows
              </button>
            </div>
          </div>

          {/* Subject Rows Table (Invigilator removed per user requirement) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#172554] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {`Subjects in Routine (${bulkRows.length} subjects scheduled)`}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Edit each subject individually or click the red trash icon to delete unwanted subjects.
                </p>
              </div>

              <Button variant="outline" size="sm" type="button" icon={Plus} onClick={handleAddExtraRow}>
                Add Subject
              </Button>
            </div>

            {bulkRows.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-semibold">
                  No subjects in the routine list.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Switch class or click &quot;+ Add Subject&quot; to create exam slots.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  icon={RotateCcw}
                  onClick={() => handleBulkClassChange(bulkClassId)}
                  className="mt-3"
                >
                  Reload Class Subjects
                </Button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold text-[#172554] border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5 w-10 text-center">#</th>
                        <th className="px-3 py-2.5 min-w-[200px]">
                          Subject Name
                        </th>
                        <th className="px-3 py-2.5 min-w-[140px]">
                          Exam Date
                        </th>
                        <th className="px-3 py-2.5 min-w-[170px]">
                          Time Slot
                        </th>
                        <th className="px-3 py-2.5 min-w-[140px]">
                          Room / Hall
                        </th>
                        <th className="px-2 py-2.5 w-12 text-center text-rose-600">
                          Del
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {bulkRows.map((row, idx) => (
                        <tr key={row.tempId} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-3 py-2 text-center font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              required
                              value={row.subject}
                              onChange={(e) => handleUpdateRowField(idx, 'subject', e.target.value)}
                              placeholder="Subject Name"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              required
                              value={row.examDate}
                              onChange={(e) => handleUpdateRowField(idx, 'examDate', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-semibold text-slate-800 text-xs focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={row.startTime}
                                onChange={(e) => handleUpdateRowField(idx, 'startTime', e.target.value)}
                                placeholder="09:00 AM"
                                className="w-18 px-1.5 py-1.5 border border-slate-200 rounded text-center text-xs font-medium focus:border-blue-500 focus:outline-none"
                              />
                              <span className="text-slate-400">-</span>
                              <input
                                type="text"
                                value={row.endTime}
                                onChange={(e) => handleUpdateRowField(idx, 'endTime', e.target.value)}
                                placeholder="12:00 PM"
                                className="w-18 px-1.5 py-1.5 border border-slate-200 rounded text-center text-xs font-medium focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.roomNumber}
                              onChange={(e) => handleUpdateRowField(idx, 'roomNumber', e.target.value)}
                              placeholder="Room 401 & 402"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded font-semibold text-slate-700 text-xs focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Remove subject from routine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              <span className="font-bold text-[#172554]">{bulkRows.length}</span>{' '}
              subjects ready in 1 unified routine file
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setEditingFileGroupId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                icon={Save}
                disabled={bulkRows.length === 0}
                className="font-bold shadow-xs"
              >
                {`Save Routine File (${bulkRows.length} Subjects)`}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* SINGLE SUBJECT MODAL (Invigilator removed, renamed)           */}
      {/* ============================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Single Subject"
        subtitle="Schedule an individual subject exam slot with date, time, and room allocation"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSingleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Examination</label>
              <select
                value={formData.examId}
                onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                {exams.length === 0 && <option value="">-- Create Exam First --</option>}
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                {classes.length === 0 && <option value="">-- Create Class First --</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Higher Mathematics"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                placeholder="12:00 PM"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Hall</label>
              <input
                type="text"
                placeholder="Room 401 & 402"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Save}>
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* EDIT INDIVIDUAL SUBJECT ROUTINE MODAL (Invigilator removed)   */}
      {/* ============================================================== */}
      {editingItem && (
        <Modal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title="Edit Subject Routine"
          subtitle={`Editing ${editingItem.subject}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={editingItem.subject}
                  onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={editingItem.examDate}
                  onChange={(e) => setEditingItem({ ...editingItem, examDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Hall</label>
                <input
                  type="text"
                  value={editingItem.roomNumber}
                  onChange={(e) => setEditingItem({ ...editingItem, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="text"
                  value={editingItem.startTime}
                  onChange={(e) => setEditingItem({ ...editingItem, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="text"
                  value={editingItem.endTime}
                  onChange={(e) => setEditingItem({ ...editingItem, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Single Subject Confirmation */}
      {itemToDelete && (
        <ConfirmDialog
          isOpen={Boolean(itemToDelete)}
          onClose={() => setItemToDelete(null)}
          onConfirm={() => deleteExamRoutine(itemToDelete.id)}
          title="Delete Schedule Entry"
          message={`Are you sure you want to remove ${itemToDelete.subject} on ${itemToDelete.examDate}?`}
          confirmLabel="Delete"
        />
      )}

      {/* Delete Entire Routine File Confirmation */}
      {fileGroupToDelete && (
        <ConfirmDialog
          isOpen={Boolean(fileGroupToDelete)}
          onClose={() => setFileGroupToDelete(null)}
          onConfirm={handleConfirmDeleteFileGroup}
          title="Delete Entire Routine File"
          message={`Are you sure you want to remove the entire routine file for ${fileGroupToDelete.className} (${fileGroupToDelete.subjectCount} subjects)?`}
          confirmLabel="Delete File"
        />
      )}
    </div>
  );
};
