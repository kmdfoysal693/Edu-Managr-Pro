import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DayOfWeek, ClassRoutineItem } from '../../types';
import {
  CalendarPlus,
  CalendarClock,
  CalendarDays,
  Plus,
  PlusCircle,
  Trash2,
  Sparkles,
  BookOpen,
  Layers,
  Save,
} from 'lucide-react';

interface RoutineRowItem {
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
  isBreak: boolean;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];

const DEFAULT_TIME_SLOTS = [
  { num: 1, name: 'Period 1', start: '08:30 AM', end: '09:15 AM', isBreak: false },
  { num: 2, name: 'Period 2', start: '09:15 AM', end: '10:00 AM', isBreak: false },
  { num: 3, name: 'Period 3', start: '10:00 AM', end: '10:45 AM', isBreak: false },
  { num: 4, name: 'Period 4', start: '11:15 AM', end: '12:00 PM', isBreak: false },
  { num: 5, name: 'Period 5', start: '12:00 PM', end: '12:45 PM', isBreak: false },
  { num: 6, name: 'Period 6', start: '12:45 PM', end: '01:30 PM', isBreak: false },
  { num: 7, name: 'Period 7', start: '01:30 PM', end: '02:15 PM', isBreak: false },
];

export const ClassRoutineAdd: React.FC = () => {
  const {
    classes,
    staff,
    subjects,
    getSubjectsForClassAndGroup,
    addClassRoutine,
    addClassRoutinesBatch,
    setCurrentRoute,
    showToast,
  } = useSchool();

  // Mode Switcher: Multi-Subject vs Single Subject Routine
  const [creationMode, setCreationMode] = useState<'multi' | 'single'>('multi');

  // Multi-Subject Form State
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Sunday');
  const [defaultTimeStart, setDefaultTimeStart] = useState<string>('09:00 AM');
  const [defaultTimeEnd, setDefaultTimeEnd] = useState<string>('09:45 AM');
  const [defaultRoom, setDefaultRoom] = useState<string>('Room 101');

  // Single Subject Form State
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

  // Selected class entity for Multi-Subject mode
  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Selected class entity for Single Subject mode
  const singleClass = useMemo(() => {
    return classes.find((c) => c.id === singleClassId) || classes[0];
  }, [classes, singleClassId]);

  // Sync sections when class changes
  useEffect(() => {
    if (selectedClass && selectedClass.sections && !selectedClass.sections.includes(selectedSection)) {
      setSelectedSection(selectedClass.sections[0] || 'A');
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (singleClass && singleClass.sections && !singleClass.sections.includes(singleSection)) {
      setSingleSection(singleClass.sections[0] || 'A');
    }
    if (singleClass?.roomNumber) {
      setSingleRoom(singleClass.roomNumber);
    }
  }, [singleClass, singleSection]);

  // Dynamic class subjects for Multi-Subject mode
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

    const result = getSubjectsForClassAndGroup(selectedClass.id, stream);
    return result.length > 0 ? result : subjects.slice(0, 8);
  }, [selectedClass, getSubjectsForClassAndGroup, subjects]);

  // Dynamic class subjects for Single Subject mode
  const singleClassSubjects = useMemo(() => {
    if (!singleClass) return [];
    if (singleClass.subjectIds && singleClass.subjectIds.length > 0) {
      const explicit = subjects.filter((s) => singleClass.subjectIds?.includes(s.id));
      if (explicit.length > 0) return explicit;
    }
    const stream =
      singleClass.group ||
      (/sci/i.test(singleClass.className)
        ? 'Science'
        : /com|bus/i.test(singleClass.className)
        ? 'Commerce'
        : /art|hum/i.test(singleClass.className)
        ? 'Humanities'
        : 'General');

    const result = getSubjectsForClassAndGroup(singleClass.id, stream);
    return result.length > 0 ? result : subjects.slice(0, 8);
  }, [singleClass, getSubjectsForClassAndGroup, subjects]);

  // Multi-Subject Rows
  const [rows, setRows] = useState<RoutineRowItem[]>([]);

  // Initialize multi-subject rows whenever class or classSubjects change
  useEffect(() => {
    if (!selectedClass || classSubjects.length === 0) return;

    const baseRoom = selectedClass.roomNumber || defaultRoom || 'Room 101';
    setDefaultRoom(baseRoom);

    const initialRows: RoutineRowItem[] = classSubjects.map((sub, index) => {
      const slot = DEFAULT_TIME_SLOTS[index % DEFAULT_TIME_SLOTS.length];
      const teacher = staff.length > 0 ? staff[index % staff.length] : undefined;

      return {
        id: `row-${index}-${Date.now()}`,
        periodNumber: slot?.num || index + 1,
        periodName: slot?.name || `Period ${index + 1}`,
        startTime: defaultTimeStart,
        endTime: defaultTimeEnd,
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        teacherId: teacher?.id || '',
        teacherName: teacher?.fullName || 'TBA',
        roomNumber: baseRoom,
        dayOfWeek: selectedDay,
        isBreak: false,
      };
    });

    setRows(initialRows);
  }, [selectedClassId, classSubjects]);

  // Update default time slot and propagate to all rows
  const handleDefaultTimeChange = (newStart: string, newEnd: string) => {
    setDefaultTimeStart(newStart);
    setDefaultTimeEnd(newEnd);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        startTime: newStart,
        endTime: newEnd,
      }))
    );
  };

  // Update default room and propagate to all rows
  const handleDefaultRoomChange = (newRoom: string) => {
    setDefaultRoom(newRoom);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        roomNumber: newRoom,
      }))
    );
  };

  // Update an individual row field (users can freely customize room/time/day/teacher per row)
  const handleRowChange = (id: string, field: keyof RoutineRowItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        if (field === 'subjectId') {
          const foundSub = classSubjects.find((s) => s.id === value);
          return {
            ...r,
            subjectId: value,
            subjectName: foundSub?.name || r.subjectName,
            subjectCode: foundSub?.code || r.subjectCode,
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

  // Add extra subject row
  const handleAddExtraRow = () => {
    const nextNum = rows.length + 1;
    const sub = classSubjects.length > 0 ? classSubjects[nextNum % classSubjects.length] : undefined;
    const teacher = staff.length > 0 ? staff[nextNum % staff.length] : undefined;

    const newRow: RoutineRowItem = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      periodNumber: nextNum,
      periodName: `Period ${nextNum}`,
      startTime: defaultTimeStart,
      endTime: defaultTimeEnd,
      subjectId: sub?.id || '',
      subjectName: sub?.name || 'Subject',
      subjectCode: sub?.code || '',
      teacherId: teacher?.id || '',
      teacherName: teacher?.fullName || 'TBA',
      roomNumber: defaultRoom || 'Room 101',
      dayOfWeek: selectedDay,
      isBreak: false,
    };

    setRows([...rows, newRow]);
  };

  // Remove a subject row
  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Submit Multi-Subject Routine Batch
  const handleSubmitMultiSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || rows.length === 0) {
      showToast('error', 'Please create a class and add at least one subject slot.');
      return;
    }

    const itemsToAdd: Omit<ClassRoutineItem, 'id'>[] = rows.map((r, idx) => ({
      classId: selectedClass.id,
      className: selectedClass.className,
      section: selectedSection,
      dayOfWeek: r.dayOfWeek || selectedDay,
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
    setCurrentRoute('class-routine-list');
  };

  // Submit Single Subject Routine
  const handleSubmitSingleSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleClass) {
      showToast('error', 'Please create an academic class first.');
      return;
    }
    if (!singleSubjectName.trim()) {
      showToast('error', 'Please select or enter a subject.');
      return;
    }

    addClassRoutine({
      classId: singleClass.id,
      className: singleClass.className,
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
      teacherName: singleTeacherName || 'TBA',
      roomNumber: singleRoom,
      isBreak: false,
    });

    setCurrentRoute('class-routine-list');
  };

  // Full week auto-schedule
  const handleAutoGenerateFullWeek = () => {
    if (!selectedClass || classSubjects.length === 0) {
      showToast('error', 'Please create a class with subjects first.');
      return;
    }

    const weekDays: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const allWeekItems: Omit<ClassRoutineItem, 'id'>[] = [];

    weekDays.forEach((day, dayIdx) => {
      DEFAULT_TIME_SLOTS.forEach((slot, slotIdx) => {
        const subOffset = (dayIdx * 2 + slotIdx) % classSubjects.length;
        const sub = classSubjects[subOffset];
        const teacher = staff.length > 0 ? staff[(dayIdx + slotIdx) % staff.length] : undefined;

        allWeekItems.push({
          classId: selectedClass.id,
          className: selectedClass.className,
          section: selectedSection,
          dayOfWeek: day,
          periodNumber: slot.num,
          periodName: slot.name,
          startTime: slot.start,
          endTime: slot.end,
          subjectId: sub?.id,
          subjectName: sub?.name || 'Subject',
          subjectCode: sub?.code || '',
          teacherId: teacher?.id,
          teacherName: teacher?.fullName || 'TBA',
          roomNumber: selectedClass.roomNumber || defaultRoom || 'Room 101',
          isBreak: false,
        });
      });
    });

    addClassRoutinesBatch(allWeekItems);
    setCurrentRoute('class-routine-list');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner with Mode Selector */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-white mb-2">
            <CalendarPlus className="w-3.5 h-3.5" />
            Class Schedule & Routine System
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Create Class Routine
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Schedule class routines with single subject allocation or complete multi-subject routine batches, with default time and room auto-synchronization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentRoute('class-routine-list')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs backdrop-blur-sm shadow-sm cursor-pointer"
          >
            <CalendarClock className="w-4 h-4" />
            View Routine List
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCreationMode('multi')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            creationMode === 'multi'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Create Class Routine (Multi-Subject)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
            Recommended
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCreationMode('single')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            creationMode === 'single'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Single Subject Routine</span>
        </button>
      </div>

      {/* ================================================================ */}
      {/* MODE 1: MULTI-SUBJECT ROUTINE (Exact Exam Routine Multi-Subject UX) */}
      {/* ================================================================ */}
      {creationMode === 'multi' && (
        <form onSubmit={handleSubmitMultiSubject} className="space-y-6">
          {/* Top Configuration Card: Class, Section, Day, Default Time & Room */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#172554]">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Class, Section & Global Default Allocation</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedClass?.group && selectedClass.group !== 'General' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                    {selectedClass.group} Stream
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                  {classSubjects.length} Curriculum Subjects Loaded
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
              {/* Target Class */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Class *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {classes.length === 0 && <option value="">-- Create a Class First --</option>}
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section *
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {(selectedClass?.sections || ['A', 'B']).map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Routine Day *
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => {
                    const newDay = e.target.value as DayOfWeek;
                    setSelectedDay(newDay);
                    setRows((prev) => prev.map((r) => ({ ...r, dayOfWeek: newDay })));
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Time Slot (Changes propagate immediately to all rows) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Default Time Slot</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Auto-Syncs</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={defaultTimeStart}
                    onChange={(e) => handleDefaultTimeChange(e.target.value, defaultTimeEnd)}
                    placeholder="09:00 AM"
                    className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                    title="Start Time"
                  />
                  <input
                    type="text"
                    value={defaultTimeEnd}
                    onChange={(e) => handleDefaultTimeChange(defaultTimeStart, e.target.value)}
                    placeholder="09:45 AM"
                    className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                    title="End Time"
                  />
                </div>
              </div>

              {/* Default Room (Changes propagate immediately to all rows) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Default Room / Hall</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Auto-Syncs</span>
                </label>
                <input
                  type="text"
                  value={defaultRoom}
                  onChange={(e) => handleDefaultRoomChange(e.target.value)}
                  placeholder="e.g. Room 301"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Changing Default Time or Default Room updates all subjects below automatically. You can also customize time and room for individual subjects freely.
              </span>
            </p>
          </div>

          {/* Subject Rows Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-[#172554] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Scheduled Subjects ({rows.length} Subjects Loaded)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review or customize subjects, teachers, time slots, and rooms. Delete unwanted subjects using the red trash icon.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddExtraRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Subject
                </button>
                <button
                  type="button"
                  onClick={handleAutoGenerateFullWeek}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Schedule Full Week (5 Days)
                </button>
              </div>
            </div>

            {/* Table of Subject Rows */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3 min-w-[200px]">Subject Name & Code</th>
                    <th className="py-3 px-3 min-w-[180px]">Assigned Teacher</th>
                    <th className="py-3 px-3 min-w-[110px]">Day</th>
                    <th className="py-3 px-3 min-w-[110px]">Period Title</th>
                    <th className="py-3 px-3 min-w-[200px]">Time Slot (Start - End)</th>
                    <th className="py-3 px-3 min-w-[130px]">Room / Hall</th>
                    <th className="py-3 px-3 w-12 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Period # */}
                      <td className="py-3 px-3 text-center font-bold text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-3">
                        <select
                          value={row.subjectId}
                          onChange={(e) => handleRowChange(row.id, 'subjectId', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {classSubjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Teacher */}
                      <td className="py-3 px-3">
                        <select
                          value={row.teacherId}
                          onChange={(e) => handleRowChange(row.id, 'teacherId', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Teacher</option>
                          {staff.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.fullName} ({st.department})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Day */}
                      <td className="py-3 px-3">
                        <select
                          value={row.dayOfWeek}
                          onChange={(e) => handleRowChange(row.id, 'dayOfWeek', e.target.value as DayOfWeek)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-700"
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Period Title */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={row.periodName}
                          onChange={(e) => handleRowChange(row.id, 'periodName', e.target.value)}
                          placeholder={`Period ${index + 1}`}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-700"
                        />
                      </td>

                      {/* Time Slot (Individual Start & End Time) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={row.startTime}
                            onChange={(e) => handleRowChange(row.id, 'startTime', e.target.value)}
                            className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-semibold text-slate-800"
                            placeholder="09:00 AM"
                          />
                          <span className="text-slate-400 font-bold">-</span>
                          <input
                            type="text"
                            value={row.endTime}
                            onChange={(e) => handleRowChange(row.id, 'endTime', e.target.value)}
                            className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-semibold text-slate-800"
                            placeholder="09:45 AM"
                          />
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={row.roomNumber}
                          onChange={(e) => handleRowChange(row.id, 'roomNumber', e.target.value)}
                          placeholder="e.g. Room 301"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                        />
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Exclude Subject from Routine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Form Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">
                {rows.length} subjects ready to schedule for {selectedClass?.className} ({selectedDay})
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentRoute('class-routine-list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rows.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Class Routine ({rows.length} Subjects)
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ================================================================ */}
      {/* MODE 2: SINGLE SUBJECT ROUTINE (Dedicated Single Subject Form)   */}
      {/* ================================================================ */}
      {creationMode === 'single' && (
        <form onSubmit={handleSubmitSingleSubject} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-[#172554] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Add Single Subject Routine Slot
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Schedule an individual subject period with class, section, teacher, time slot, and classroom allocation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Class *
                </label>
                <select
                  value={singleClassId}
                  onChange={(e) => setSingleClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {classes.length === 0 && <option value="">-- Create a Class First --</option>}
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section *
                </label>
                <select
                  value={singleSection}
                  onChange={(e) => setSingleSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {(singleClass?.sections || ['A', 'B']).map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  value={singleSubjectId}
                  onChange={(e) => {
                    const found = singleClassSubjects.find((s) => s.id === e.target.value);
                    setSingleSubjectId(e.target.value);
                    if (found) {
                      setSingleSubjectName(found.name);
                      setSingleSubjectCode(found.code);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Select from Curriculum Subjects --</option>
                  {singleClassSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.group || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Teacher */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Teacher *
                </label>
                <select
                  value={singleTeacherId}
                  onChange={(e) => {
                    const st = staff.find((t) => t.id === e.target.value);
                    setSingleTeacherId(e.target.value);
                    setSingleTeacherName(st ? st.fullName : '');
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Assign Teacher Later --</option>
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.designation} - {st.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Routine Day *
                </label>
                <select
                  value={singleDay}
                  onChange={(e) => setSingleDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-indigo-700"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Period Title *
                </label>
                <input
                  type="text"
                  required
                  value={singlePeriodName}
                  onChange={(e) => setSinglePeriodName(e.target.value)}
                  placeholder="e.g. Period 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="text"
                  required
                  value={singleStartTime}
                  onChange={(e) => setSingleStartTime(e.target.value)}
                  placeholder="08:30 AM"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Time *
                </label>
                <input
                  type="text"
                  required
                  value={singleEndTime}
                  onChange={(e) => setSingleEndTime(e.target.value)}
                  placeholder="09:15 AM"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                />
              </div>

              {/* Room Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Room / Classroom *
                </label>
                <input
                  type="text"
                  required
                  value={singleRoom}
                  onChange={(e) => setSingleRoom(e.target.value)}
                  placeholder="e.g. Room 301 / Science Lab"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentRoute('class-routine-list')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Single Subject Routine
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
