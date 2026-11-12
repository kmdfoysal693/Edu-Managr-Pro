import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  GraduationCap,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  CheckCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { classes, students, studentAttendance, markStudentAttendance, showToast } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[9]?.id || classes[0]?.id || 'cls-10');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [activeTab, setActiveTab] = useState<'sheet' | 'report'>('sheet');

  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Filter students for chosen class & section
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => (s.classId === selectedClassId || s.className === currentClass?.className) && (selectedSection === 'All' || s.section === selectedSection)
    );
  }, [students, selectedClassId, currentClass, selectedSection]);

  // Attendance Form
  const [attendanceForm, setAttendanceForm] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});

  // Synchronize attendance state when class or date changes
  React.useEffect(() => {
    const map: Record<string, { status: AttendanceStatus; notes: string }> = {};
    classStudents.forEach((st) => {
      const existing = studentAttendance.find(
        (a) => (a.studentId === st.studentId || a.studentId === st.id) && a.date === selectedDate
      );
      map[st.studentId] = {
        status: existing ? existing.status : 'Present',
        notes: existing?.notes || '',
      };
    });
    setAttendanceForm(map);
  }, [classStudents, selectedDate, studentAttendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    classStudents.forEach((st) => {
      updated[st.studentId] = {
        status,
        notes: attendanceForm[st.studentId]?.notes || '',
      };
    });
    setAttendanceForm(updated);
    showToast('info', 'Batch Updated', `All ${classStudents.length} students set to ${status}.`);
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(attendanceForm).map(([studentId, val]) => ({
      studentId,
      status: val.status,
      notes: val.notes,
    }));
    markStudentAttendance(records, selectedDate);
  };

  const presentCount = Object.values(attendanceForm).filter((v) => v.status === 'Present').length;
  const lateCount = Object.values(attendanceForm).filter((v) => v.status === 'Late').length;
  const absentCount = Object.values(attendanceForm).filter((v) => v.status === 'Absent').length;
  const leaveCount = Object.values(attendanceForm).filter((v) => v.status === 'Leave').length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Student Daily Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage class-wise roll call attendance registers</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'sheet' ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Daily Sheet
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'report' ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className} ({c.classCode})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Section:</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Sections</option>
            {currentClass?.sections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Date:</label>
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="ml-auto">
          <Button variant="primary" size="sm" icon={Save} onClick={handleSaveAttendance}>
            Save Sheet
          </Button>
        </div>
      </div>

      {activeTab === 'sheet' ? (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Present Students" value={presentCount} icon={CheckCircle2} colorTheme="emerald" />
            <StatCard title="Late Arrivals" value={lateCount} icon={Clock} colorTheme="amber" />
            <StatCard title="Absent" value={absentCount} icon={XCircle} colorTheme="rose" />
            <StatCard title="Excused Leave" value={leaveCount} icon={Coffee} colorTheme="sky" />
          </div>

          {/* Student Table */}
          <Card
            title={`${currentClass?.className} - Section ${selectedSection} Attendance`}
            subtitle={`Total ${classStudents.length} enrolled students found`}
            icon={GraduationCap}
            action={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" icon={CheckCheck} onClick={() => handleMarkAll('Present')}>
                  All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleMarkAll('Absent')}>
                  All Absent
                </Button>
              </div>
            }
          >
            {classStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No students registered in this class/section yet.</p>
                <p className="text-xs mt-1">Please select Class 10 (SSC Batch) to see enrolled students, or admit new students.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-[#172554] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-16 text-center">Roll</th>
                      <th className="px-4 py-3">Student Name & ID</th>
                      <th className="px-4 py-3">Guardian Contact</th>
                      <th className="px-4 py-3 text-center">Mark Status</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((st) => {
                      const cur = attendanceForm[st.studentId] || { status: 'Present', notes: '' };

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50/50">
                            {st.rollNumber}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img src={st.photo} alt={st.fullName} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                              <div>
                                <p className="font-bold text-[#172554]">{st.fullName}</p>
                                <p className="text-xs text-slate-400 font-mono">{st.studentId}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="text-xs font-semibold text-slate-700">{st.fatherName || st.guardianName}</p>
                            <p className="text-xs text-slate-400 font-mono">{st.fatherPhone || st.guardianPhone}</p>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              {(['Present', 'Late', 'Leave', 'Absent'] as AttendanceStatus[]).map((status) => {
                                const isSelected = cur.status === status;
                                const activeStyles = {
                                  Present: 'bg-emerald-600 text-white font-bold',
                                  Late: 'bg-amber-500 text-white font-bold',
                                  Leave: 'bg-blue-600 text-white font-bold',
                                  Absent: 'bg-rose-600 text-white font-bold',
                                };

                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(st.studentId, status)}
                                    className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                                      isSelected
                                        ? activeStyles[status]
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <input
                              type="text"
                              placeholder="Reason if absent..."
                              value={cur.notes}
                              onChange={(e) => handleNotesChange(st.studentId, e.target.value)}
                              className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="primary" icon={Save} onClick={handleSaveAttendance}>
                Submit & Record Attendance
              </Button>
            </div>
          </Card>
        </>
      ) : (
        /* Monthly Attendance Report View */
        <Card
          title={`Monthly Attendance Summary (${currentClass?.className})`}
          subtitle="Overall attendance percentages and working days calculated"
          icon={FileSpreadsheet}
        >
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-[#172554] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Roll</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3 text-center">Total Days</th>
                  <th className="px-4 py-3 text-center text-emerald-700">Present</th>
                  <th className="px-4 py-3 text-center text-amber-700">Late</th>
                  <th className="px-4 py-3 text-center text-rose-700">Absent</th>
                  <th className="px-4 py-3 text-center font-bold">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((st, i) => {
                  const pres = 24 - (i % 3);
                  const late = i % 2;
                  const abs = 26 - pres - late;
                  const rate = Math.round((pres / 26) * 100);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{st.rollNumber}</td>
                      <td className="px-4 py-3 font-semibold text-[#172554]">{st.fullName}</td>
                      <td className="px-4 py-3 text-center text-slate-500">26</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{pres}</td>
                      <td className="px-4 py-3 text-center font-semibold text-amber-600">{late}</td>
                      <td className="px-4 py-3 text-center font-semibold text-rose-600">{abs}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            rate >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
