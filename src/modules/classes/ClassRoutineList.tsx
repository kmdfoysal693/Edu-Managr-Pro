import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DayOfWeek, ClassRoutineItem } from '../../types';
import {
  CalendarClock,
  Printer,
  Edit2,
  Trash2,
  X,
  Sparkles,
  CalendarDays,
  LayoutGrid,
  List,
  PlusCircle,
  Plus,
  Save,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

const WEEK_DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];

export const ClassRoutineList: React.FC = () => {
  const {
    classes,
    classRoutines,
    subjects,
    staff,
    schoolSettings,
    updateClassRoutine,
    deleteClassRoutine,
    deleteClassRoutinesBatch,
    addClassRoutine,
    addClassRoutinesBatch,
    getSubjectsForClassAndGroup,
    setCurrentRoute,
    showToast,
  } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Bulk Multi-Subject Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState<string>(classes[0]?.id || '');
  const [bulkSection, setBulkSection] = useState<string>('A');
  const [bulkDay, setBulkDay] = useState<DayOfWeek>('Sunday');
  const [bulkDefaultTimeStart, setBulkDefaultTimeStart] = useState<string>('09:00 AM');
  const [bulkDefaultTimeEnd, setBulkDefaultTimeEnd] = useState<string>('09:45 AM');
  const [bulkDefaultRoom, setBulkDefaultRoom] = useState<string>('Room 101');
  const [bulkRows, setBulkRows] = useState<{
    id: string;
    periodNumber: number;
    periodName: string;
    startTime: string;
    endTime: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    teacherId: string;
    teacherName: string;
    roomNumber: string;
    dayOfWeek: DayOfWeek;
  }[]>([]);

  // Single Subject Modal State
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleClassId, setSingleClassId] = useState<string>(classes[0]?.id || '');
  const [singleSection, setSingleSection] = useState<string>('A');
  const [singleSubjectId, setSingleSubjectId] = useState<string>('');
  const [singleSubjectName, setSingleSubjectName] = useState<string>('');
  const [singleSubjectCode, setSingleSubjectCode] = useState<string>('');
  const [singleTeacherId, setSingleTeacherId] = useState<string>(staff[0]?.id || '');
  const [singleTeacherName, setSingleTeacherName] = useState<string>(staff[0]?.fullName || '');
  const [singleDay, setSingleDay] = useState<DayOfWeek>('Sunday');
  const [singlePeriodName, setSinglePeriodName] = useState<string>('Period 1');
  const singlePeriodNum = 1;
  const [singleStartTime, setSingleStartTime] = useState<string>('08:30 AM');
  const [singleEndTime, setSingleEndTime] = useState<string>('09:15 AM');
  const [singleRoom, setSingleRoom] = useState<string>('Room 101');

  // Edit slot modal
  const [editingSlot, setEditingSlot] = useState<ClassRoutineItem | null>(null);
  const [editForm, setEditForm] = useState<{
    periodName: string;
    startTime: string;
    endTime: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    teacherName: string;
    roomNumber: string;
    isBreak: boolean;
  }>({
    periodName: '',
    startTime: '',
    endTime: '',
    subjectId: '',
    subjectName: '',
    subjectCode: '',
    teacherName: '',
    roomNumber: '',
    isBreak: false,
  });

  // Selected Class details
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Bulk Selected Class
  const bulkSelectedClass = useMemo(() => {
    return classes.find((c) => c.id === bulkClassId) || classes[0];
  }, [classes, bulkClassId]);

  // Single Selected Class
  const singleSelectedClass = useMemo(() => {
    return classes.find((c) => c.id === singleClassId) || classes[0];
  }, [classes, singleClassId]);

  // Helper to get curriculum subjects for bulk class
  const getSubjectsForBulk = (clsId: string) => {
    const cls = classes.find((c) => c.id === clsId) || classes[0];
    if (!cls) return [];
    if (cls.subjectIds && cls.subjectIds.length > 0) {
      const explicit = subjects.filter((s) => cls.subjectIds?.includes(s.id));
      if (explicit.length > 0) return explicit;
    }
    const stream =
      cls.group ||
      (/sci/i.test(cls.className)
        ? 'Science'
        : /com|bus/i.test(cls.className)
        ? 'Commerce'
        : /art|hum/i.test(cls.className)
        ? 'Humanities'
        : 'General');
    const result = getSubjectsForClassAndGroup(cls.id, stream);
    return result.length > 0 ? result : subjects.slice(0, 8);
  };

  // Open Bulk Multi-Subject Modal
  const openBulkClassRoutineModal = (targetClassId?: string) => {
    if (classes.length === 0) {
      showToast('info', 'Please create an academic class first before scheduling routines.');
      return;
    }
    const classIdToUse = targetClassId || selectedClassId || classes[0]?.id || '';
    setBulkClassId(classIdToUse);
    const cls = classes.find((c) => c.id === classIdToUse) || classes[0];
    const roomToUse = cls?.roomNumber || 'Room 101';
    setBulkDefaultRoom(roomToUse);
    setBulkSection(cls?.sections?.[0] || 'A');

    const subs = getSubjectsForBulk(classIdToUse);
    const initialRows = subs.map((sub, idx) => {
      const teacher = staff.length > 0 ? staff[idx % staff.length] : undefined;
      return {
        id: `bulk-row-${Date.now()}-${idx}`,
        periodNumber: idx + 1,
        periodName: `Period ${idx + 1}`,
        startTime: bulkDefaultTimeStart,
        endTime: bulkDefaultTimeEnd,
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        teacherId: teacher?.id || '',
        teacherName: teacher?.fullName || 'TBA',
        roomNumber: roomToUse,
        dayOfWeek: bulkDay,
      };
    });
    setBulkRows(initialRows);
    setIsBulkModalOpen(true);
  };

  // When class changes in bulk modal
  const handleBulkClassChange = (newClassId: string) => {
    setBulkClassId(newClassId);
    const cls = classes.find((c) => c.id === newClassId);
    const roomToUse = cls?.roomNumber || bulkDefaultRoom;
    setBulkDefaultRoom(roomToUse);
    if (cls?.sections && !cls.sections.includes(bulkSection)) {
      setBulkSection(cls.sections[0] || 'A');
    }
    const subs = getSubjectsForBulk(newClassId);
    const newRows = subs.map((sub, idx) => {
      const teacher = staff.length > 0 ? staff[idx % staff.length] : undefined;
      return {
        id: `bulk-row-${Date.now()}-${idx}`,
        periodNumber: idx + 1,
        periodName: `Period ${idx + 1}`,
        startTime: bulkDefaultTimeStart,
        endTime: bulkDefaultTimeEnd,
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        teacherId: teacher?.id || '',
        teacherName: teacher?.fullName || 'TBA',
        roomNumber: roomToUse,
        dayOfWeek: bulkDay,
      };
    });
    setBulkRows(newRows);
  };

  // Sync default time to all bulk rows
  const handleBulkDefaultTimeChange = (newStart: string, newEnd: string) => {
    setBulkDefaultTimeStart(newStart);
    setBulkDefaultTimeEnd(newEnd);
    setBulkRows((prev) =>
      prev.map((r) => ({
        ...r,
        startTime: newStart,
        endTime: newEnd,
      }))
    );
  };

  // Sync default room to all bulk rows
  const handleBulkDefaultRoomChange = (newRoom: string) => {
    setBulkDefaultRoom(newRoom);
    setBulkRows((prev) =>
      prev.map((r) => ({
        ...r,
        roomNumber: newRoom,
      }))
    );
  };

  // Update a single bulk row field
  const handleBulkRowFieldChange = (id: string, field: string, value: any) => {
    const curSubs = getSubjectsForBulk(bulkClassId);
    setBulkRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'subjectId') {
          const found = curSubs.find((s) => s.id === value);
          return {
            ...r,
            subjectId: value,
            subjectName: found?.name || r.subjectName,
            subjectCode: found?.code || r.subjectCode,
          };
        }
        if (field === 'teacherId') {
          const foundTeacher = staff.find((st) => st.id === value);
          return {
            ...r,
            teacherId: value,
            teacherName: foundTeacher?.fullName || value,
          };
        }
        return { ...r, [field]: value };
      })
    );
  };

  // Add extra subject row in bulk modal
  const handleAddExtraBulkRow = () => {
    const curSubs = getSubjectsForBulk(bulkClassId);
    const nextNum = bulkRows.length + 1;
    const sub = curSubs.length > 0 ? curSubs[nextNum % curSubs.length] : undefined;
    const teacher = staff.length > 0 ? staff[nextNum % staff.length] : undefined;
    const newRow = {
      id: `bulk-row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      periodNumber: nextNum,
      periodName: `Period ${nextNum}`,
      startTime: bulkDefaultTimeStart,
      endTime: bulkDefaultTimeEnd,
      subjectId: sub?.id || '',
      subjectName: sub?.name || 'Subject',
      subjectCode: sub?.code || '',
      teacherId: teacher?.id || '',
      teacherName: teacher?.fullName || 'TBA',
      roomNumber: bulkDefaultRoom || 'Room 101',
      dayOfWeek: bulkDay,
    };
    setBulkRows([...bulkRows, newRow]);
  };

  // Delete subject row in bulk modal
  const handleDeleteBulkRow = (id: string) => {
    if (bulkRows.length <= 1) return;
    setBulkRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Save Bulk Multi-Subject Routine
  const handleSaveBulkRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkSelectedClass || bulkRows.length === 0) return;

    const itemsToAdd: Omit<ClassRoutineItem, 'id'>[] = bulkRows.map((r, idx) => ({
      classId: bulkSelectedClass.id,
      className: bulkSelectedClass.className,
      section: bulkSection,
      dayOfWeek: r.dayOfWeek || bulkDay,
      periodNumber: r.periodNumber || idx + 1,
      periodName: r.periodName || `Period ${idx + 1}`,
      startTime: r.startTime,
      endTime: r.endTime,
      subjectId: r.subjectId || undefined,
      subjectName: r.subjectName,
      subjectCode: r.subjectCode || undefined,
      teacherId: r.teacherId || undefined,
      teacherName: r.teacherName,
      roomNumber: r.roomNumber,
      isBreak: false,
    }));

    addClassRoutinesBatch(itemsToAdd);
    setSelectedClassId(bulkSelectedClass.id);
    setSelectedSection(bulkSection);
    setIsBulkModalOpen(false);
  };

  // Open Single Subject Modal
  const openSingleSubjectModal = (targetClassId?: string) => {
    if (classes.length === 0) {
      showToast('info', 'Please create an academic class first before adding routine slots.');
      return;
    }
    const classIdToUse = targetClassId || selectedClassId || classes[0]?.id || '';
    setSingleClassId(classIdToUse);
    const cls = classes.find((c) => c.id === classIdToUse) || classes[0];
    setSingleSection(cls?.sections?.[0] || 'A');
    setSingleRoom(cls?.roomNumber || 'Room 101');

    const subs = getSubjectsForBulk(classIdToUse);
    if (subs.length > 0) {
      setSingleSubjectId(subs[0].id);
      setSingleSubjectName(subs[0].name);
      setSingleSubjectCode(subs[0].code);
    }
    if (staff.length > 0) {
      setSingleTeacherId(staff[0].id);
      setSingleTeacherName(staff[0].fullName);
    } else {
      setSingleTeacherId('');
      setSingleTeacherName('');
    }
    setIsSingleModalOpen(true);
  };

  // Save Single Subject Routine
  const handleSaveSingleSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleSelectedClass) return;

    addClassRoutine({
      classId: singleSelectedClass.id,
      className: singleSelectedClass.className,
      section: singleSection,
      dayOfWeek: singleDay,
      periodNumber: singlePeriodNum,
      periodName: singlePeriodName,
      startTime: singleStartTime,
      endTime: singleEndTime,
      subjectId: singleSubjectId || undefined,
      subjectName: singleSubjectName,
      subjectCode: singleSubjectCode || undefined,
      teacherId: singleTeacherId || undefined,
      teacherName: singleTeacherName,
      roomNumber: singleRoom,
      isBreak: false,
    });

    setSelectedClassId(singleSelectedClass.id);
    setSelectedSection(singleSection);
    setIsSingleModalOpen(false);
  };

  // Filter routines strictly for current class and section
  const currentClassRoutines = useMemo(() => {
    return classRoutines.filter(
      (r) =>
        (r.classId === selectedClassId || r.className === selectedClass?.className) &&
        (selectedSection === 'All' || r.section === selectedSection)
    );
  }, [classRoutines, selectedClassId, selectedClass, selectedSection]);

  // Unique periods across this class's routine (sorted by periodNumber)
  const periodNumbers = useMemo(() => {
    const nums = Array.from(new Set(currentClassRoutines.map((r) => r.periodNumber))).sort((a, b) => a - b);
    return nums.length > 0 ? nums : [1, 2, 3, 4, 5, 6, 7];
  }, [currentClassRoutines]);

  // Filtered subjects for editing slot (strictly this class's subjects)
  const classSubjects = useMemo(() => {
    if (!selectedClass) return [];
    if (selectedClass.subjectIds && selectedClass.subjectIds.length > 0) {
      const explicit = subjects.filter((s) => selectedClass.subjectIds?.includes(s.id));
      if (explicit.length > 0) return explicit;
    }
    const stream =
      selectedClass.group ||
      (/sci/i.test(selectedClass.className)
        ? 'Science'
        : /com|bus/i.test(selectedClass.className)
        ? 'Commerce'
        : /art|hum/i.test(selectedClass.className)
        ? 'Humanities'
        : 'General');

    return subjects.filter((s) => {
      const is9or10 = /class\s*(9|10)|ix|x/i.test(selectedClass.className);
      if (is9or10) {
        if (s.group === 'General') return true;
        return stream !== 'General' ? s.group === stream : true;
      }
      return s.classIds.includes(selectedClass.id) || (s.classNames && s.classNames.includes(selectedClass.className));
    });
  }, [selectedClass, subjects]);

  const handleOpenEdit = (slot: ClassRoutineItem) => {
    setEditingSlot(slot);
    setEditForm({
      periodName: slot.periodName || `Period ${slot.periodNumber}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: slot.subjectId || '',
      subjectName: slot.subjectName,
      subjectCode: slot.subjectCode || '',
      teacherName: slot.teacherName,
      roomNumber: slot.roomNumber,
      isBreak: Boolean(slot.isBreak),
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    updateClassRoutine(editingSlot.id, {
      periodName: editForm.periodName,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      subjectId: editForm.subjectId || undefined,
      subjectName: editForm.subjectName,
      subjectCode: editForm.subjectCode || undefined,
      teacherName: editForm.teacherName,
      roomNumber: editForm.roomNumber,
      isBreak: editForm.isBreak,
    });

    setEditingSlot(null);
  };

  const handlePrint = () => {
    printElement('printable-official-class-routine', {
      title: `Class-Routine-${selectedClass?.className || 'Academic'}`,
      pageSize: 'A4',
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-2">
            <CalendarClock className="w-3.5 h-3.5" />
            Class Schedule & Timetables
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Academic Routine List
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            View full weekly timetable grids for all academic grades, manage period timings, teachers, classrooms, and generate official printable routine cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs sm:text-sm backdrop-blur-sm shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Routine
          </button>
          <button
            onClick={() => openBulkClassRoutineModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            Create Class Routine (Multi-Subject)
          </button>
          <button
            onClick={() => openSingleSubjectModal()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs sm:text-sm backdrop-blur-sm shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Single Subject
          </button>
        </div>
      </div>

      {/* Class & Section Selection Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div className="min-w-[220px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {classes.length === 0 && <option value="">-- No Classes Created Yet --</option>}
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className} ({cls.classCode})
                </option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="min-w-[130px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Sections</option>
              {(selectedClass?.sections || ['A', 'B']).map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Class Stream Badge */}
          {selectedClass?.group && selectedClass.group !== 'General' && (
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedClass.group === 'Science'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : selectedClass.group === 'Commerce'
                    ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                }`}
              >
                {selectedClass.group === 'Science' && '🧪 Science Stream'}
                {selectedClass.group === 'Commerce' && '💼 Commerce Stream'}
                {selectedClass.group === 'Humanities' && '🏛️ Humanities Stream'}
              </span>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Timetable Grid
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Day-by-Day Cards
          </button>
        </div>
      </div>

      {/* Routine Display Area */}
      {currentClassRoutines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {classes.length === 0
              ? 'No Academic Classes Created Yet'
              : `No routine scheduled for ${selectedClass?.className || 'this class'} (${selectedSection === 'All' ? 'All Sections' : `Sec ${selectedSection}`})`}
          </h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {classes.length === 0
              ? 'Create your first academic class and assign subjects before generating class routines.'
              : "You haven't added any period timetable for this class yet. Click below to add single periods or generate the class schedule."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {classes.length === 0 ? (
              <button
                onClick={() => setCurrentRoute('class-add')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Create Academic Class
              </button>
            ) : (
              <>
                <button
                  onClick={() => openBulkClassRoutineModal()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4" />
                  Create Class Routine (Multi-Subject)
                </button>
                <button
                  onClick={() => openSingleSubjectModal()}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Single Subject
                </button>
              </>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* WEEKLY TIMETABLE GRID VIEW (Standard Timetable Layout) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#172554] dark:text-white">
                {selectedClass?.className} — Weekly Master Timetable (Section: {selectedSection})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Room: {selectedClass?.roomNumber || '—'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total {currentClassRoutines.length} active scheduled periods
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4 w-28 uppercase tracking-wider sticky left-0 bg-slate-100/90 dark:bg-slate-800 backdrop-blur-xs z-10">
                    Day / Period
                  </th>
                  {periodNumbers.map((pNum) => {
                    const sample = currentClassRoutines.find((r) => r.periodNumber === pNum);
                    return (
                      <th key={pNum} className="py-3 px-3 text-center min-w-[150px] border-l border-slate-200 dark:border-slate-700">
                        <span className="block font-extrabold text-slate-900 dark:text-white">
                          {sample?.periodName || `Period ${pNum}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">
                          {sample ? `${sample.startTime} - ${sample.endTime}` : ''}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {WEEK_DAYS.filter((day) => currentClassRoutines.some((r) => r.dayOfWeek === day)).map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>{day}</span>
                      </div>
                    </td>

                    {periodNumbers.map((pNum) => {
                      const slot = currentClassRoutines.find(
                        (r) => r.dayOfWeek === day && r.periodNumber === pNum
                      );

                      if (!slot) {
                        return (
                          <td
                            key={pNum}
                            className="py-3 px-3 text-center border-l border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10 text-slate-300 dark:text-slate-600 text-xs"
                          >
                            —
                          </td>
                        );
                      }

                      if (slot.isBreak) {
                        return (
                          <td
                            key={pNum}
                            className="py-3 px-3 text-center border-l border-slate-200 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300"
                          >
                            <span className="font-bold text-[11px] block">☕ {slot.subjectName}</span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={pNum}
                          className="py-3 px-3 border-l border-slate-100 dark:border-slate-800 group relative"
                        >
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-xs transition-all">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              {slot.subjectCode && (
                                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                                  {slot.subjectCode}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {slot.roomNumber}
                              </span>
                            </div>

                            <p className="font-bold text-slate-900 dark:text-white text-xs truncate" title={slot.subjectName}>
                              {slot.subjectName}
                            </p>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              👨‍🏫 {slot.teacherName}
                            </p>

                            {/* Hover Edit/Delete Action Buttons */}
                            <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => handleOpenEdit(slot)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer"
                                title="Edit Slot"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteClassRoutine(slot.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 cursor-pointer"
                                title="Delete Slot"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DAY-BY-DAY CARDS VIEW */
        <div className="space-y-4">
          {WEEK_DAYS.filter((day) => currentClassRoutines.some((r) => r.dayOfWeek === day)).map((day) => {
            const daySlots = currentClassRoutines
              .filter((r) => r.dayOfWeek === day)
              .sort((a, b) => a.periodNumber - b.periodNumber);

            return (
              <div
                key={day}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{day}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold dark:bg-slate-800 dark:text-slate-300">
                      {daySlots.length} Periods
                    </span>
                  </div>
                  <button
                    onClick={() => deleteClassRoutinesBatch(daySlots.map((d) => d.id))}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Day
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        slot.isBreak
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-slate-50/70 border-slate-200 text-slate-800 dark:bg-slate-800/40 dark:border-slate-700 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500 text-[10px] uppercase">
                          {slot.periodName || `Period ${slot.periodNumber}`}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>

                      <p className="font-bold text-sm truncate">{slot.subjectName}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>👨‍🏫 {slot.teacherName}</span>
                        <span className="font-mono">🏛️ {slot.roomNumber}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteClassRoutine(slot.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Routine Period Slot
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Period Label
                  </label>
                  <input
                    type="text"
                    value={editForm.periodName}
                    onChange={(e) => setEditForm({ ...editForm, periodName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={editForm.isBreak ? 'BREAK' : editForm.subjectId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'BREAK') {
                      setEditForm({
                        ...editForm,
                        subjectId: '',
                        subjectName: 'Tiffin / Recess (Break)',
                        subjectCode: 'BREAK',
                        isBreak: true,
                        teacherName: 'Duty Teacher',
                      });
                    } else {
                      const found = classSubjects.find((s) => s.id === val);
                      setEditForm({
                        ...editForm,
                        subjectId: val,
                        subjectName: found?.name || editForm.subjectName,
                        subjectCode: found?.code || '',
                        isBreak: false,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <optgroup label="Class Curriculum Subjects">
                    {classSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Breaks">
                    <option value="BREAK">☕ Tiffin / Recess Break</option>
                  </optgroup>
                </select>
              </div>

              {!editForm.isBreak && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teacher
                  </label>
                  <select
                    value={editForm.teacherName}
                    onChange={(e) => setEditForm({ ...editForm, teacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    {staff.map((st) => (
                      <option key={st.id} value={st.fullName}>
                        {st.fullName} ({st.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
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

      {/* Official Print Timetable Sheet Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl p-6 md:p-8 space-y-6 my-6 print:m-0 print:p-0 print:shadow-none print:border-none print:w-full">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">
                  Official Printable Class Routine
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Routine
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div id="printable-official-class-routine" className="border border-slate-300 rounded-xl p-6 md:p-8 bg-white print:border-0 print:p-0">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
                <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
                  {schoolSettings.institutionName || schoolSettings.schoolName}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {schoolSettings.address || '—'} {schoolSettings.eiin ? `• EIIN: ${schoolSettings.eiin}` : ''}
                </p>
                <div className="inline-block px-4 py-1 mt-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                  Weekly Class Routine — Academic Session {selectedClass?.academicYear || String(new Date().getFullYear())}
                </div>
              </div>

              {/* Class & Meta Info */}
              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-5">
                <div>
                  <span className="text-slate-500 font-normal">Class: </span>
                  <strong className="text-sm font-bold">{selectedClass?.className || '—'}</strong>
                  {selectedClass?.group && selectedClass.group !== 'General' && (
                    <span className="ml-1 text-[11px] text-blue-700 font-bold">({selectedClass.group})</span>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-slate-500 font-normal">Section: </span>
                  <strong>{selectedSection === 'All' ? 'All Sections' : `Section ${selectedSection}`}</strong> • Room: {selectedClass?.roomNumber || '—'}
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-normal">Class Teacher: </span>
                  <strong>{selectedClass?.classTeacher || '—'}</strong>
                </div>
              </div>

              {/* Routine Table */}
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-800 text-[11px] font-bold text-slate-900">
                    <th className="border border-slate-800 py-2.5 px-2 text-center w-24">Day</th>
                    {periodNumbers.map((pNum) => {
                      const sample = currentClassRoutines.find((r) => r.periodNumber === pNum);
                      return (
                        <th key={pNum} className="border border-slate-800 py-2.5 px-2 text-center">
                          <span className="block font-bold">{sample?.periodName || `P${pNum}`}</span>
                          <span className="text-[9px] text-slate-600 font-mono font-normal">
                            {sample ? `${sample.startTime} - ${sample.endTime}` : ''}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {WEEK_DAYS.filter((day) => currentClassRoutines.some((r) => r.dayOfWeek === day)).map((day) => (
                    <tr key={day} className="border-b border-slate-800">
                      <td className="border border-slate-800 py-2 px-2.5 font-bold text-center bg-slate-100">
                        {day}
                      </td>
                      {periodNumbers.map((pNum) => {
                        const slot = currentClassRoutines.find(
                          (r) => r.dayOfWeek === day && r.periodNumber === pNum
                        );

                        if (!slot) {
                          return (
                            <td key={pNum} className="border border-slate-800 text-center text-slate-400">
                              —
                            </td>
                          );
                        }

                        if (slot.isBreak) {
                          return (
                            <td key={pNum} className="border border-slate-800 py-2 px-1 text-center bg-slate-100 font-bold text-[10px]">
                              Tiffin Break
                            </td>
                          );
                        }

                        return (
                          <td key={pNum} className="border border-slate-800 py-2 px-1.5 text-center">
                            <strong className="block text-[11px] font-bold leading-tight text-slate-900">
                              {slot.subjectName}
                            </strong>
                            {slot.subjectCode && (
                              <span className="text-[9px] text-slate-500 font-mono">({slot.subjectCode})</span>
                            )}
                            <span className="block text-[10px] text-slate-600 mt-0.5">
                              {slot.teacherName.replace(/^(Prof\.|Dr\.|Engr\.|Mawlana)\s+/, '')}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-16 mt-8 text-center text-xs text-slate-700">
                <div className="border-t border-slate-400 pt-1">
                  Class Teacher&apos;s Signature
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Routine Committee In-Charge
                </div>
                <div className="border-t border-slate-400 pt-1">
                  Principal / Head of Institution
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BULK MULTI-SUBJECT CLASS ROUTINE MODAL                          */}
      {/* ============================================================== */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Create Class Routine (Multi-Subject)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auto-populates curriculum subjects for the selected class, with auto-syncing default time and room.
                </p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkRoutine} className="space-y-5">
              {/* Top Configuration Controls */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Select Class */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Class *
                    </label>
                    <select
                      value={bulkClassId}
                      onChange={(e) => handleBulkClassChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.className} ({cls.classCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Section *
                    </label>
                    <select
                      value={bulkSection}
                      onChange={(e) => setBulkSection(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                    >
                      {(bulkSelectedClass?.sections || ['A', 'B']).map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Routine Day */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Routine Day *
                    </label>
                    <select
                      value={bulkDay}
                      onChange={(e) => {
                        const newDay = e.target.value as DayOfWeek;
                        setBulkDay(newDay);
                        setBulkRows((prev) => prev.map((r) => ({ ...r, dayOfWeek: newDay })));
                      }}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-indigo-600 dark:text-indigo-400"
                    >
                      {WEEK_DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Default Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>Default Time Slot</span>
                      <span className="text-[10px] text-blue-600 font-semibold">Auto-Syncs</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={bulkDefaultTimeStart}
                        onChange={(e) => handleBulkDefaultTimeChange(e.target.value, bulkDefaultTimeEnd)}
                        placeholder="09:00 AM"
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-white"
                      />
                      <input
                        type="text"
                        value={bulkDefaultTimeEnd}
                        onChange={(e) => handleBulkDefaultTimeChange(bulkDefaultTimeStart, e.target.value)}
                        placeholder="09:45 AM"
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Default Room */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>Default Room</span>
                      <span className="text-[10px] text-blue-600 font-semibold">Auto-Syncs</span>
                    </label>
                    <input
                      type="text"
                      value={bulkDefaultRoom}
                      onChange={(e) => handleBulkDefaultRoomChange(e.target.value)}
                      placeholder="e.g. Room 301"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editing default time or room auto-syncs to all subjects below.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExtraBulkRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Subject
                  </button>
                </div>
              </div>

              {/* Subject Rows Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Subject</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Teacher</th>
                      <th className="py-2.5 px-3 min-w-[100px]">Period</th>
                      <th className="py-2.5 px-3 min-w-[170px]">Time Slot</th>
                      <th className="py-2.5 px-3 min-w-[110px]">Room</th>
                      <th className="py-2.5 px-3 w-10 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkRows.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-center font-bold text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={r.subjectId}
                            onChange={(e) => handleBulkRowFieldChange(r.id, 'subjectId', e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                          >
                            {getSubjectsForBulk(bulkClassId).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.code})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={r.teacherId}
                            onChange={(e) => handleBulkRowFieldChange(r.id, 'teacherId', e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                          >
                            {staff.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.fullName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={r.periodName}
                            onChange={(e) => handleBulkRowFieldChange(r.id, 'periodName', e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={r.startTime}
                              onChange={(e) => handleBulkRowFieldChange(r.id, 'startTime', e.target.value)}
                              className="w-20 px-1.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                            />
                            <span>-</span>
                            <input
                              type="text"
                              value={r.endTime}
                              onChange={(e) => handleBulkRowFieldChange(r.id, 'endTime', e.target.value)}
                              className="w-20 px-1.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={r.roomNumber}
                            onChange={(e) => handleBulkRowFieldChange(r.id, 'roomNumber', e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteBulkRow(r.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  {bulkRows.length} subjects ready to schedule for {bulkSelectedClass?.className} ({bulkDay})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Save Class Routine ({bulkRows.length} Subjects)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SINGLE SUBJECT ROUTINE MODAL                                   */}
      {/* ============================================================== */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  Add Single Subject Routine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schedule an individual subject period slot for a class.
                </p>
              </div>
              <button
                onClick={() => setIsSingleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Class */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={singleClassId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setSingleClassId(newCls);
                      const cls = classes.find((c) => c.id === newCls);
                      if (cls?.sections?.[0]) setSingleSection(cls.sections[0]);
                      if (cls?.roomNumber) setSingleRoom(cls.roomNumber);
                      const subs = getSubjectsForBulk(newCls);
                      if (subs.length > 0) {
                        setSingleSubjectId(subs[0].id);
                        setSingleSubjectName(subs[0].name);
                        setSingleSubjectCode(subs[0].code);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className} ({cls.classCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section *
                  </label>
                  <select
                    value={singleSection}
                    onChange={(e) => setSingleSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {(singleSelectedClass?.sections || ['A', 'B']).map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={singleSubjectId}
                  onChange={(e) => {
                    const subs = getSubjectsForBulk(singleClassId);
                    const found = subs.find((s) => s.id === e.target.value);
                    setSingleSubjectId(e.target.value);
                    if (found) {
                      setSingleSubjectName(found.name);
                      setSingleSubjectCode(found.code);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  {getSubjectsForBulk(singleClassId).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.group || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher *
                </label>
                <select
                  value={singleTeacherId}
                  onChange={(e) => {
                    const st = staff.find((t) => t.id === e.target.value);
                    setSingleTeacherId(e.target.value);
                    if (st) setSingleTeacherName(st.fullName);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Routine Day *
                  </label>
                  <select
                    value={singleDay}
                    onChange={(e) => setSingleDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600"
                  >
                    {WEEK_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Period Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={singlePeriodName}
                    onChange={(e) => setSinglePeriodName(e.target.value)}
                    placeholder="Period 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleStartTime}
                    onChange={(e) => setSingleStartTime(e.target.value)}
                    placeholder="08:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleEndTime}
                    onChange={(e) => setSingleEndTime(e.target.value)}
                    placeholder="09:15 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={singleRoom}
                  onChange={(e) => setSingleRoom(e.target.value)}
                  placeholder="Room 301"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Single Subject Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
