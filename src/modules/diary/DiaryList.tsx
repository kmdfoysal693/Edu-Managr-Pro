import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DiaryEntry } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  BookOpen,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Printer,
  Filter,
  Save,
} from 'lucide-react';
import { printElement } from '../../utils/printUtils';

export const DiaryList: React.FC = () => {
  const { diaryEntries, classes, updateDiaryEntry, deleteDiaryEntry, setCurrentRoute } = useSchool();

  const [classFilter, setClassFilter] = useState('All');
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);
  const [diaryToDelete, setDiaryToDelete] = useState<DiaryEntry | null>(null);

  const filteredEntries = useMemo(() => {
    if (classFilter === 'All') return diaryEntries;
    return diaryEntries.filter((d) => d.classId === classFilter || d.className.includes(classFilter));
  }, [diaryEntries, classFilter]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiary) return;
    updateDiaryEntry(editingDiary.id, editingDiary);
    setEditingDiary(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Digital School Diary Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track daily curriculum logs, homework tasks, and parent notifications</p>
        </div>
        <Button variant="primary" icon={PlusCircle} onClick={() => setCurrentRoute('diary-add')}>
          Create Diary Entry
        </Button>
      </div>

      {/* Class Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Class Filter:
        </span>
        <button
          onClick={() => setClassFilter('All')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            classFilter === 'All'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Classes ({diaryEntries.length})
        </button>
        {classes.slice(0, 6).map((c) => (
          <button
            key={c.id}
            onClick={() => setClassFilter(c.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              classFilter === c.id
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c.className}
          </button>
        ))}
      </div>

      {/* Diary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.map((d) => (
          <Card
            key={d.id}
            className="hover:border-blue-300 transition-colors"
            title={`${d.className} - Sec ${d.section}`}
            subtitle={`Subject: ${d.subject} • Teacher: ${d.teacherName}`}
            icon={BookOpen}
            action={
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {d.date}
              </span>
            }
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[#172554]">{d.lessonTitle}</p>
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-0.5">Assigned Homework:</span>
                  <p className="text-slate-600 leading-relaxed">{d.homework}</p>
                </div>
              </div>

              {d.instructions && (
                <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                  <span className="font-semibold">Notice: </span>
                  {d.instructions}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-600">Due: {d.submissionDate}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" icon={Eye} onClick={() => setSelectedDiary(d)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={Edit} onClick={() => setEditingDiary(d)}>
                    Edit
                  </Button>
                  <button
                    onClick={() => setDiaryToDelete(d)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Detail Modal */}
      {selectedDiary && (
        <Modal
          isOpen={Boolean(selectedDiary)}
          onClose={() => setSelectedDiary(null)}
          title={`Digital Diary - ${selectedDiary.className} (Sec ${selectedDiary.section})`}
          subtitle={`Subject: ${selectedDiary.subject} • Date: ${selectedDiary.date}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div id="printable-diary-slip" className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 print-page">
              <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[#172554]">
                    Digital Class Diary Slip — {selectedDiary.className} (Sec {selectedDiary.section})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Subject: {selectedDiary.subject} • Date: {selectedDiary.date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Class Teacher:</span>
                  <p className="font-bold text-[#172554] mt-0.5">{selectedDiary.teacherName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Submission Due:</span>
                  <p className="font-bold text-rose-600 mt-0.5">{selectedDiary.submissionDate}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#172554] text-sm block mb-1">Lesson Topic</span>
                <p className="text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 font-semibold">
                  {selectedDiary.lessonTitle}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#172554] text-sm block mb-1">Homework Details</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedDiary.homework}
                </p>
              </div>

              {selectedDiary.instructions && (
                <div>
                  <span className="font-bold text-amber-800 block mb-1">Important Instructions</span>
                  <p className="text-slate-700 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                    {selectedDiary.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="no-print pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDiary(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  printElement('printable-diary-slip', {
                    title: `Diary-${selectedDiary.className}-${selectedDiary.subject}`,
                    pageSize: 'A4',
                    orientation: 'portrait',
                  });
                }}
              >
                Print Diary Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Diary Modal */}
      {editingDiary && (
        <Modal
          isOpen={Boolean(editingDiary)}
          onClose={() => setEditingDiary(null)}
          title="Edit Diary Entry"
          subtitle={`Editing for ${editingDiary.className}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={editingDiary.subject}
                  onChange={(e) => setEditingDiary({ ...editingDiary, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={editingDiary.submissionDate}
                  onChange={(e) => setEditingDiary({ ...editingDiary, submissionDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title</label>
              <input
                type="text"
                required
                value={editingDiary.lessonTitle}
                onChange={(e) => setEditingDiary({ ...editingDiary, lessonTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Homework Details</label>
              <textarea
                rows={3}
                required
                value={editingDiary.homework}
                onChange={(e) => setEditingDiary({ ...editingDiary, homework: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
              <textarea
                rows={2}
                value={editingDiary.instructions}
                onChange={(e) => setEditingDiary({ ...editingDiary, instructions: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingDiary(null)}>
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
      {diaryToDelete && (
        <ConfirmDialog
          isOpen={Boolean(diaryToDelete)}
          onClose={() => setDiaryToDelete(null)}
          onConfirm={() => deleteDiaryEntry(diaryToDelete.id)}
          title="Delete Diary Entry"
          message={`Are you sure you want to delete diary entry for "${diaryToDelete.subject}"?`}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
};
