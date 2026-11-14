import React, { useState, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StudentIdCardModal } from './StudentIdCardModal';
import {
  UserPlus,
  Eye,
  Edit,
  Trash2,
  FileCheck2,
  Save,
  Filter,
  Contact,
  BookOpen,
  Upload,
} from 'lucide-react';

export const StudentList: React.FC = () => {
  const {
    students,
    classes,
    getSubjectsForClassAndGroup,
    studentAttendance,
    transactions,
    examResults,
    updateStudent,
    deleteStudent,
    setCurrentRoute,
    schoolSettings,
    showToast,
  } = useSchool();
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [modalTab, setModalTab] = useState<'profile' | 'attendance' | 'fees' | 'exams'>('profile');

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = classFilter === 'All' || s.classId === classFilter || s.className.includes(classFilter);
      const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
      return matchClass && matchSection;
    });
  }, [students, classFilter, sectionFilter]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStudent) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid Image File', 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
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
            setEditingStudent((prev) => (prev ? { ...prev, photo: canvas.toDataURL('image/jpeg', 0.85) } : prev));
          } else {
            setEditingStudent((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
          }
        };
        img.src = dataUrl;
      } else {
        setEditingStudent((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
      }
    };
    reader.readAsDataURL(file);
  };

  const fmtBDT = (val: number) => `BDT ${val.toLocaleString('en-BD')}`;

  const columns: Column<Student>[] = [
    {
      key: 'rollNumber',
      header: 'Roll',
      sortable: true,
      className: 'w-16 text-center font-bold text-slate-700',
      render: (s) => <span className="font-mono">{s.rollNumber}</span>,
    },
    {
      key: 'fullName',
      header: 'Student Name & ID',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <img src={s.photo} alt={s.fullName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200" />
          <div>
            <p
              className="font-bold text-[#172554] hover:text-[#2563EB] cursor-pointer"
              onClick={() => {
                setSelectedStudent(s);
                setModalTab('profile');
              }}
            >
              {s.fullName}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>{s.studentId}</span>
              <span>•</span>
              <span className="text-slate-500">{s.bloodGroup}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Class & Section',
      sortable: true,
      render: (s) => {
        const studentGroup =
          s.group ||
          (/sci/i.test(s.className)
            ? 'Science'
            : /com|bus/i.test(s.className)
            ? 'Commerce'
            : /art|hum/i.test(s.className)
            ? 'Humanities'
            : undefined);

        return (
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 text-xs">{s.className}</span>
              {studentGroup && studentGroup !== 'General' && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    studentGroup === 'Science'
                      ? 'bg-emerald-100 text-emerald-800'
                      : studentGroup === 'Commerce'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {studentGroup}
                </span>
              )}
            </div>
            <span className="text-[11px] text-blue-600 font-bold block">Sec: {s.section}</span>
          </div>
        );
      },
    },
    {
      key: 'fatherName',
      header: 'Parent Contact',
      render: (s) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700">{s.fatherName || s.guardianName}</p>
          <p className="text-slate-400 font-mono">{s.fatherPhone || s.guardianPhone}</p>
        </div>
      ),
    },
    {
      key: 'admissionNumber',
      header: 'Admission No',
      sortable: true,
      render: (s) => <span className="font-mono text-xs text-slate-500">{s.admissionNumber}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <Badge variant={getStatusBadgeVariant(s.status)}>{s.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedStudent(s);
              setModalTab('profile');
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Full Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentRoute('student-admit-card')}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Print Admit Card"
          >
            <FileCheck2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedStudentForIdCard(s)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Student ID Card"
          >
            <Contact className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => setEditingStudent(s)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Details"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStudentToDelete(s)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Student Directory & Roll</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive student records, parent contacts, academic profiles & admit cards</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon={FileCheck2} onClick={() => setCurrentRoute('student-admit-card')}>
            Admit Cards
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={() => setCurrentRoute('student-add')}>
            Admit Student
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Class:
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="All">All Classes ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Section:</label>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search student by name, student ID, roll, or admission number..."
        exportFileName="Students_Roster"
      />

      {/* View Student Modal with 4 Comprehensive Tabs */}
      {selectedStudent && (
        <Modal
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.fullName}
          subtitle={`Student ID: ${selectedStudent.studentId} • Admission: ${selectedStudent.admissionNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Header Identity Badge */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedStudent.photo}
                alt={selectedStudent.fullName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#172554]">{selectedStudent.fullName}</h4>
                  <Badge variant={getStatusBadgeVariant(selectedStudent.status)}>{selectedStudent.status}</Badge>
                </div>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  {selectedStudent.className} • Section {selectedStudent.section} (Roll: {selectedStudent.rollNumber})
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Blood Group: {selectedStudent.bloodGroup}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setModalTab('profile')}
                className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'profile' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                Profile & Family
              </button>
              <button
                onClick={() => setModalTab('attendance')}
                className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'attendance' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                Attendance Logs
              </button>
              <button
                onClick={() => setModalTab('fees')}
                className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'fees' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                Fee Ledger
              </button>
              <button
                onClick={() => setModalTab('exams')}
                className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'exams' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                Exam Results
              </button>
            </div>

            {/* Tab 1: Profile & Family */}
            {modalTab === 'profile' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Date of Birth</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.dateOfBirth}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Gender</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.gender}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Father&apos;s Name & Phone</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedStudent.fatherName} ({selectedStudent.fatherPhone})
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Mother&apos;s Name & Phone</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedStudent.motherName} ({selectedStudent.motherPhone || 'N/A'})
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Present Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.presentAddress}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400">Permanent Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.permanentAddress}</p>
                </div>

                {selectedStudent.previousSchool && (
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Previous School</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.previousSchool}</p>
                  </div>
                )}

                {/* Assigned Textbooks & Curriculum Books */}
                {(() => {
                  const studentGroup =
                    selectedStudent.group ||
                    (/sci/i.test(selectedStudent.className)
                      ? 'Science'
                      : /com|bus/i.test(selectedStudent.className)
                      ? 'Commerce'
                      : /art|hum/i.test(selectedStudent.className)
                      ? 'Humanities'
                      : 'General');

                  const studentBooks = getSubjectsForClassAndGroup(
                    selectedStudent.classId || selectedStudent.className,
                    studentGroup
                  );

                  return (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          Assigned Curriculum Textbooks
                        </span>
                        <div className="flex items-center gap-1.5">
                          {studentGroup && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                studentGroup === 'Science'
                                  ? 'bg-emerald-600 text-white'
                                  : studentGroup === 'Commerce'
                                  ? 'bg-blue-600 text-white'
                                  : studentGroup === 'Humanities'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {studentGroup} Group
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-blue-700 border border-blue-200">
                            {studentBooks.length} Books
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pt-1">
                        {studentBooks.map((b) => (
                          <div
                            key={b.id}
                            className="p-2 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-1.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[9px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {b.code}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                                    b.group === 'Science'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : b.group === 'Commerce'
                                      ? 'bg-blue-100 text-blue-800'
                                      : b.group === 'Humanities'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {b.group}
                                </span>
                              </div>
                              <p className="font-bold text-slate-800 text-[11px] truncate mt-0.5">{b.name}</p>
                              {b.bengaliName && (
                                <p className="text-[10px] text-slate-500 truncate">{b.bengaliName}</p>
                              )}
                              <p className="text-[9px] text-slate-400 truncate">{b.textbookTitle}</p>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                              {b.totalMarks}M
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Tab 2: Attendance Records */}
            {modalTab === 'attendance' && (
              <div className="space-y-3">
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendance
                        .filter((a) => a.studentId === selectedStudent.studentId || a.studentId === selectedStudent.id)
                        .map((att) => (
                          <tr key={att.id}>
                            <td className="px-3 py-2 font-mono text-slate-600">{att.date}</td>
                            <td className="px-3 py-2">
                              <Badge variant={getStatusBadgeVariant(att.status)} size="sm">
                                {att.status}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{att.notes || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Fee Payment History */}
            {modalTab === 'fees' && (
              <div className="space-y-3">
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Receipt</th>
                        <th className="px-3 py-2">Fee Description</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions
                        .filter(
                          (t) =>
                            t.partyId === selectedStudent.studentId ||
                            t.partyName.toLowerCase().includes(selectedStudent.fullName.toLowerCase())
                        )
                        .map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-3 py-2 font-mono font-bold text-blue-600">{tx.receiptNumber}</td>
                            <td className="px-3 py-2 text-slate-700">{tx.title}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{fmtBDT(tx.amount)}</td>
                            <td className="px-3 py-2">
                              <Badge variant={getStatusBadgeVariant(tx.status)} size="sm">
                                {tx.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Exam Results */}
            {modalTab === 'exams' && (
              <div className="space-y-3 text-xs">
                {examResults
                  .filter(
                    (r) =>
                      r.studentId === selectedStudent.studentId ||
                      r.studentName.toLowerCase() === selectedStudent.fullName.toLowerCase()
                  )
                  .map((res) => (
                    <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#172554] text-sm">{res.examName}</span>
                        <span className="font-black px-2 py-0.5 rounded bg-blue-600 text-white text-xs">
                          GPA: {res.gpa.toFixed(2)} ({res.letterGrade})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] mb-2 text-slate-600">
                        <div>
                          Total Obtained: <span className="font-bold">{res.totalObtained} / {res.maxTotal}</span>
                        </div>
                        <div>
                          Percentage: <span className="font-bold">{res.percentage}%</span>
                        </div>
                        <div>
                          Result: <span className="font-bold text-emerald-600">PASSED</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">Teacher remark: {res.remarks}</p>
                    </div>
                  ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileCheck2}
                  onClick={() => {
                    setSelectedStudent(null);
                    setCurrentRoute('student-admit-card');
                  }}
                >
                  Generate Admit Card
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Contact}
                  onClick={() => {
                    const st = selectedStudent;
                    setSelectedStudent(null);
                    setSelectedStudentForIdCard(st);
                  }}
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold"
                >
                  Student ID Card
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit}
                  onClick={() => {
                    setEditingStudent(selectedStudent);
                    setSelectedStudent(null);
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          title="Edit Student Information"
          subtitle={`Editing profile for ${editingStudent.fullName}`}
          maxWidth="xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Student Photo Upload */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
              <img
                src={editingStudent.photo || schoolSettings.logo}
                alt={editingStudent.fullName}
                className="w-16 h-20 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
              />
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-[#172554]">Student Photo</p>
                <input
                  ref={editPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Upload}
                    onClick={() => editPhotoInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  {editingStudent.photo && editingStudent.photo !== schoolSettings.logo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        setEditingStudent({ ...editingStudent, photo: schoolSettings.logo });
                        if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Roll Number</label>
                <input
                  type="text"
                  required
                  value={editingStudent.rollNumber}
                  onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father&apos;s Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.fatherName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father&apos;s Phone</label>
                <input
                  type="tel"
                  required
                  value={editingStudent.fatherPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fatherPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value as 'Active' | 'Suspended' | 'Alumni' | 'Transferred',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={editingStudent.bloodGroup}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      bloodGroup: e.target.value as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Present Address</label>
                <input
                  type="text"
                  required
                  value={editingStudent.presentAddress}
                  onChange={(e) => setEditingStudent({ ...editingStudent, presentAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingStudent(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {studentToDelete && (
        <ConfirmDialog
          isOpen={Boolean(studentToDelete)}
          onClose={() => setStudentToDelete(null)}
          onConfirm={() => deleteStudent(studentToDelete.id)}
          title="Delete Student Record"
          message={`Are you sure you want to remove ${studentToDelete.fullName} (${studentToDelete.studentId}) from the student roll?`}
          confirmLabel="Delete Student"
        />
      )}

      {/* Student ID Card Modal */}
      {selectedStudentForIdCard && (
        <StudentIdCardModal
          student={selectedStudentForIdCard}
          onClose={() => setSelectedStudentForIdCard(null)}
        />
      )}
    </div>
  );
};
