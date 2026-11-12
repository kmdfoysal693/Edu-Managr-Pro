import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  Search,
  Filter,
  GraduationCap,
  Users,
  CheckCircle2,
  X,
  Phone,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface StudentFeeSelectorProps {
  selectedStudentId: string;
  onSelectStudent: (student: Student) => void;
  label?: string;
  defaultClassId?: string;
}

export const StudentFeeSelector: React.FC<StudentFeeSelectorProps> = ({
  selectedStudentId,
  onSelectStudent,
  label = 'Select Student',
  defaultClassId = 'ALL',
}) => {
  const { students, classes } = useSchool();

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected student object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.studentId === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Sync default class if initial student belongs to a class
  useEffect(() => {
    if (selectedStudent && selectedClassId === 'ALL') {
      // Keep 'ALL' or let user browse
    }
  }, [selectedStudent]);

  // Extract all available groups/departments from students
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    students.forEach((s) => {
      if (s.group) depts.add(s.group);
      if (/sci/i.test(s.className)) depts.add('Science');
      if (/com|bus/i.test(s.className)) depts.add('Commerce');
      if (/art|hum/i.test(s.className)) depts.add('Humanities');
    });
    return Array.from(depts);
  }, [students]);

  // Filter students based on Class, Department/Group, and Search query
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // 1. Class Filter
      if (selectedClassId !== 'ALL') {
        const matchesClassId = st.classId === selectedClassId;
        const targetClass = classes.find((c) => c.id === selectedClassId);
        const matchesClassName = targetClass && st.className.toLowerCase().includes(targetClass.className.toLowerCase());
        if (!matchesClassId && !matchesClassName) {
          return false;
        }
      }

      // 2. Department / Stream Filter
      if (selectedDepartment !== 'ALL') {
        const stGroup = st.group || '';
        const inClass = st.className.toLowerCase();
        const matchesGroup =
          stGroup.toLowerCase() === selectedDepartment.toLowerCase() ||
          inClass.includes(selectedDepartment.toLowerCase());
        if (!matchesGroup) {
          return false;
        }
      }

      // 3. Search Query Filter (Name, Student ID, Roll, Class, Department, Guardian)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = st.fullName.toLowerCase().includes(query);
        const idMatch = st.studentId.toLowerCase().includes(query);
        const rollMatch = st.rollNumber.toLowerCase().includes(query) || `roll ${st.rollNumber}`.includes(query);
        const classMatch = st.className.toLowerCase().includes(query);
        const sectionMatch = `sec ${st.section}`.toLowerCase().includes(query) || st.section.toLowerCase() === query;
        const deptMatch = (st.group || '').toLowerCase().includes(query);
        const fatherMatch = (st.fatherName || '').toLowerCase().includes(query);
        const guardianMatch = (st.guardianName || '').toLowerCase().includes(query);

        return (
          nameMatch ||
          idMatch ||
          rollMatch ||
          classMatch ||
          sectionMatch ||
          deptMatch ||
          fatherMatch ||
          guardianMatch
        );
      }

      return true;
    });
  }, [students, classes, selectedClassId, selectedDepartment, searchQuery]);

  const handleSelect = (studentId: string) => {
    const found = students.find((s) => s.studentId === studentId);
    if (found) {
      onSelectStudent(found);
    }
  };

  const handleClearFilters = () => {
    setSelectedClassId('ALL');
    setSelectedDepartment('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>{label} (Class & Student Filter)</span>
        </label>

        {(selectedClassId !== 'ALL' || selectedDepartment !== 'ALL' || searchQuery) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear Filter
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Class Filter */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
            Filter by Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              const newCls = e.target.value;
              setSelectedClassId(newCls);
              // If current student not in this class, auto select first student of class
              if (newCls !== 'ALL') {
                const targetCls = classes.find((c) => c.id === newCls);
                const classStudents = students.filter(
                  (s) => s.classId === newCls || (targetCls && s.className.includes(targetCls.className))
                );
                if (classStudents.length > 0 && !classStudents.some((s) => s.studentId === selectedStudentId)) {
                  onSelectStudent(classStudents[0]);
                }
              }
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Classes ({students.length} Students)</option>
            {classes.map((c) => {
              const count = students.filter(
                (s) => s.classId === c.id || s.className.toLowerCase().includes(c.className.toLowerCase())
              ).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.className} ({count} {count === 1 ? 'Student' : 'Students'})
                </option>
              );
            })}
          </select>
        </div>

        {/* Department / Stream Filter */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
            Department / Stream
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Streams</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input: Name, Class, Department, Roll */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
            Search Student
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, Roll, Class, Dept..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtered Students Dropdown / Selector */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>
            Candidate Students ({filteredStudents.length} available)
          </span>
          {filteredStudents.length === 0 && (
            <span className="text-rose-500 font-bold">No students match filter criteria</span>
          )}
        </div>

        {filteredStudents.length > 0 ? (
          <select
            value={selectedStudentId}
            onChange={(e) => handleSelect(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border-2 border-blue-500/80 rounded-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            {filteredStudents.map((st) => (
              <option key={st.id} value={st.studentId}>
                {st.fullName} — {st.className} (Sec {st.section}, Roll: {st.rollNumber}) [{st.studentId}]
                {st.group ? ` • ${st.group}` : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <span>No student found for this class or search filter.</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Selected Student Profile Preview Card */}
      {selectedStudent && (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={selectedStudent.photo}
              alt={selectedStudent.fullName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                // Fallback avatar if URL fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#172554] dark:text-white">
                  {selectedStudent.fullName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedStudent.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                  {selectedStudent.studentId}
                </span>
                <span>•</span>
                <span>{selectedStudent.className}</span>
                <span>•</span>
                <span>Sec: <strong>{selectedStudent.section}</strong></span>
                <span>•</span>
                <span>Roll: <strong>{selectedStudent.rollNumber}</strong></span>
                {selectedStudent.group && (
                  <>
                    <span>•</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                      {selectedStudent.group}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
            <span className="block text-slate-400">Guardian Contact:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {selectedStudent.guardianName || selectedStudent.fatherName || 'Guardian'}
            </span>
            <span className="block font-mono text-[10px] text-slate-500">
              {selectedStudent.guardianPhone || selectedStudent.fatherPhone || ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
