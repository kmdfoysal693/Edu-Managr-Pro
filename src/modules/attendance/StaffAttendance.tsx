import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import {
  UserCheck,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  Filter,
} from 'lucide-react';

export const StaffAttendance: React.FC = () => {
  const { staff, staffAttendance, markStaffAttendance, showToast, departments: schoolDepts } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  const syncMapForDate = (targetDate: string) => {
    const map: Record<string, { status: AttendanceStatus; notes: string }> = {};
    staff.forEach((s) => {
      const existing = staffAttendance.find((a) => a.staffId === s.staffId && a.date === targetDate);
      map[s.staffId] = {
        status: existing ? existing.status : 'Present',
        notes: existing?.notes || '',
      };
    });
    return map;
  };

  // Attendance state for current selected date
  const [attendanceForm, setAttendanceForm] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >(() => syncMapForDate(todayStr));

  React.useEffect(() => {
    setAttendanceForm(syncMapForDate(selectedDate));
  }, [staff, selectedDate, staffAttendance]);

  // When selectedDate changes, load existing records if any
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const updatedMap: Record<string, { status: AttendanceStatus; notes: string }> = {};
    staff.forEach((s) => {
      const existing = staffAttendance.find((a) => a.staffId === s.staffId && a.date === newDate);
      updatedMap[s.staffId] = {
        status: existing ? existing.status : 'Present',
        notes: existing?.notes || '',
      };
    });
    setAttendanceForm(updatedMap);
  };

  const filteredStaff = useMemo(() => {
    if (departmentFilter === 'All') return staff;
    return staff.filter((s) => s.department === departmentFilter);
  }, [staff, departmentFilter]);

  const departments = [
    'All',
    ...Array.from(
      new Set([...schoolDepts.map((d) => d.name), ...staff.map((s) => s.department)])
    ),
  ];

  const handleStatusChange = (staffId: string, status: AttendanceStatus) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        status,
      },
    }));
  };

  const handleNotesChange = (staffId: string, notes: string) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        notes,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (filteredStaff.length === 0) {
      showToast('warning', 'No Staff Found', 'No staff members match the selected department filter.');
      return;
    }
    const updated = { ...attendanceForm };
    filteredStaff.forEach((s) => {
      updated[s.staffId] = {
        ...updated[s.staffId],
        status,
      };
    });
    setAttendanceForm(updated);
    showToast('info', 'Batch Updated', `Marked all ${filteredStaff.length} visible staff as ${status}.`);
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(attendanceForm).map(([staffId, val]) => ({
      staffId,
      status: val.status,
      notes: val.notes,
    }));
    if (records.length === 0) {
      showToast('warning', 'No Staff Registered', 'Please add staff members before saving attendance.');
      return;
    }
    markStaffAttendance(records, selectedDate);
  };

  // Compute daily metrics
  const presentCount = Object.values(attendanceForm).filter((v) => v.status === 'Present').length;
  const lateCount = Object.values(attendanceForm).filter((v) => v.status === 'Late').length;
  const leaveCount = Object.values(attendanceForm).filter((v) => v.status === 'Leave').length;
  const absentCount = Object.values(attendanceForm).filter((v) => v.status === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Staff Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">Record and monitor daily faculty & staff presence</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-xs text-xs font-semibold">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none"
            />
          </div>

          <Button variant="primary" icon={Save} onClick={handleSaveAttendance}>
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Present" value={presentCount} icon={CheckCircle2} colorTheme="emerald" />
        <StatCard title="Late Check-in" value={lateCount} icon={Clock} colorTheme="amber" />
        <StatCard title="On Leave" value={leaveCount} icon={Coffee} colorTheme="sky" />
        <StatCard title="Absent" value={absentCount} icon={XCircle} colorTheme="rose" />
      </div>

      {/* Main Sheet */}
      <Card
        title={`Staff Attendance Sheet (${selectedDate})`}
        subtitle="Select status for each faculty and administrative staff member"
        icon={UserCheck}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick Mark:</span>
            <Button variant="outline" size="sm" onClick={() => handleMarkAll('Present')}>
              All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkAll('Absent')}>
              All Absent
            </Button>
          </div>
        }
      >
        {/* Department Filter Bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Department:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                departmentFilter === dept
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-[#172554] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-4 py-3 text-center">Attendance Status</th>
                <th className="px-4 py-3">Remark / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-xs text-slate-400">
                    No staff members registered yet. Add faculty or administrative staff to record attendance.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((st) => {
                const current = attendanceForm[st.staffId] || { status: 'Present', notes: '' };

                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={st.photo} alt={st.fullName} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                        <div>
                          <p className="font-bold text-[#172554]">{st.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{st.staffId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-slate-700">{st.designation}</p>
                      <p className="text-[11px] text-slate-400">{st.department}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {(['Present', 'Late', 'Leave', 'Absent'] as AttendanceStatus[]).map((status) => {
                          const isSelected = current.status === status;
                          const activeStyles = {
                            Present: 'bg-emerald-600 text-white font-bold shadow-xs',
                            Late: 'bg-amber-500 text-white font-bold shadow-xs',
                            Leave: 'bg-blue-600 text-white font-bold shadow-xs',
                            Absent: 'bg-rose-600 text-white font-bold shadow-xs',
                          };

                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(st.staffId, status)}
                              className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? activeStyles[status]
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
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
                        placeholder="Optional remarks (e.g. morning gate duty, traffic)"
                        value={current.notes}
                        onChange={(e) => handleNotesChange(st.staffId, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
                      />
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="primary" icon={Save} onClick={handleSaveAttendance}>
            Save All Attendance Records
          </Button>
        </div>
      </Card>
    </div>
  );
};
