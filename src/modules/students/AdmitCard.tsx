import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  FileCheck2,
  Printer,
  School,
  Download,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  User,
  Calendar,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const AdmitCard: React.FC = () => {
  const { students, exams, examRoutines, classes, schoolSettings } = useSchool();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || 'ex-001');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.studentId || 'STD-2026-001');

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const selectedStudent = students.find((s) => s.studentId === selectedStudentId) || students[0];

  // Routines for this exam
  const routines = examRoutines.filter((r) => r.examId === selectedExam?.id);

  const handlePrint = () => {
    printElement('admit-card-frame', {
      title: `Admit-Card-${selectedStudent?.studentId || 'Student'}-${selectedExam?.name || 'Exam'}`,
      pageSize: 'A4',
      orientation: 'portrait',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Student Admit Card Generator</h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate, preview, and print official examination hall tickets</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Selectors Bar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 min-w-[240px]">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Examination:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[260px]">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
          >
            {students.map((st) => (
              <option key={st.id} value={st.studentId}>
                {st.fullName} ({st.className} - Roll {st.rollNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Admit Card Preview Area */}
      <div className="max-w-3xl mx-auto">
        <div
          id="admit-card-frame"
          className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg print-page relative overflow-hidden"
        >
          {/* Institutional Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <img
              src={schoolSettings.logo}
              alt=""
              className="w-96 h-96 object-contain"
            />
          </div>

          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-5 text-center relative">
            <div className="flex items-center justify-between mb-2">
              <div className="w-14 h-14 rounded-full bg-white p-1 ring-2 ring-blue-600/30 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={schoolSettings.logo}
                  alt={schoolSettings.schoolName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center flex-1 px-4">
                <h1 className="text-xl sm:text-2xl font-black text-[#172554] tracking-tight uppercase">
                  {schoolSettings.institutionName || schoolSettings.schoolName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {schoolSettings.address}
                </p>
                <p className="text-[11px] font-mono text-slate-400">
                  Tel: {schoolSettings.phone} • EIIN: {schoolSettings.eiin} • Estd: {schoolSettings.establishedYear}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                <QrCode className="w-8 h-8 text-slate-700" />
              </div>
            </div>

            <div className="mt-3 inline-block px-5 py-1.5 bg-[#172554] text-white text-xs font-black tracking-widest uppercase rounded-full shadow-xs">
              Official Examination Admit Card
            </div>
            <p className="text-xs font-bold text-blue-700 mt-1">{selectedExam?.name}</p>
          </div>

          {/* Student Profile Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 p-4 bg-slate-50/70 border border-slate-200 rounded-xl mb-6">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={selectedStudent?.photo}
                alt={selectedStudent?.fullName}
                className="w-24 h-28 rounded-lg object-cover ring-2 ring-slate-300 shadow-sm shrink-0 bg-white"
              />
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Candidate Name:</span>
                  <p className="text-base font-extrabold text-[#172554]">{selectedStudent?.fullName}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <p>
                    <span className="text-slate-400">Student ID: </span>
                    <span className="font-mono font-bold text-blue-700">{selectedStudent?.studentId}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Roll No: </span>
                    <span className="font-mono font-bold text-slate-800">{selectedStudent?.rollNumber}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Class: </span>
                    <span className="font-bold text-slate-800">{selectedStudent?.className}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Section: </span>
                    <span className="font-bold text-slate-800">Sec {selectedStudent?.section}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Father: </span>
                    <span className="font-medium text-slate-700">{selectedStudent?.fatherName}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Session: </span>
                    <span className="font-medium text-slate-700">{selectedStudent?.academicYear}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Dues Cleared
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-2">Verified: 2026-10-31</p>
              <p className="text-[10px] font-mono text-slate-400">Seat Hall: Room 401</p>
            </div>
          </div>

          {/* Subject Exam Timetable */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-[#172554] uppercase tracking-wider mb-2">
              Examination Schedule & Subjects
            </h4>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-[#172554] border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Subject Name</th>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Room / Hall</th>
                    <th className="px-3 py-2 text-center">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {routines.length > 0 ? (
                    routines.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-semibold">{r.examDate}</td>
                        <td className="px-3 py-2 font-bold text-slate-800">{r.subject}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {r.startTime} - {r.endTime}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{r.roomNumber}</td>
                        <td className="px-3 py-2 text-center text-slate-300">____________</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                        Exam schedule will be announced soon.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hall Instructions */}
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 mb-6 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-amber-900 uppercase tracking-wider">Candidate Instructions:</p>
            <p>1. Candidates must arrive at the examination center 30 minutes prior to commencement.</p>
            <p>2. Possession of smartphones, programmable smartwatches, or unauthorized papers is strictly prohibited.</p>
            <p>3. This Admit Card must be displayed on the student&apos;s desk throughout the examination session.</p>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-600">Signature of Candidate</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 mx-auto flex items-center justify-center text-[9px] font-bold text-blue-700 uppercase tracking-tighter mb-1">
                INSTITUTION SEAL
              </div>
              <p className="text-[10px] text-slate-400">Verified Stamp</p>
            </div>

            <div className="text-center">
              <div className="font-script text-lg text-blue-900 italic font-bold">M. Rahman</div>
              <div className="w-36 border-b border-slate-800 mb-1" />
              <p className="font-bold text-[#172554]">Principal & Controller</p>
              <p className="text-[10px] text-slate-400">{schoolSettings.schoolName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
