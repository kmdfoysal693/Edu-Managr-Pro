import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Exam } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable, Column } from '../../components/common/DataTable';
import {
  Award,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const ManageExam: React.FC = () => {
  const { exams, classes, addExam, updateExam, deleteExam, setCurrentRoute } = useSchool();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    academicYear: '2026',
    startDate: '2026-11-15',
    endDate: '2026-11-28',
    totalMarks: 100,
    passingMarks: 33,
    status: 'Upcoming' as 'Upcoming' | 'Ongoing' | 'Published' | 'Archived',
    description: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({
      name: formData.name,
      academicYear: formData.academicYear,
      classIds: classes.map((c) => c.id),
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
      status: formData.status,
      description: formData.description,
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      academicYear: '2026',
      startDate: '2026-11-15',
      endDate: '2026-11-28',
      totalMarks: 100,
      passingMarks: 33,
      status: 'Upcoming',
      description: '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;
    updateExam(editingExam.id, editingExam);
    setEditingExam(null);
  };

  const columns: Column<Exam>[] = [
    {
      key: 'name',
      header: 'Examination Session',
      sortable: true,
      render: (ex) => (
        <div>
          <p className="font-bold text-[#172554] hover:text-[#2563EB] cursor-pointer" onClick={() => setSelectedExam(ex)}>
            {ex.name}
          </p>
          <p className="text-xs text-slate-400 font-mono">Session: {ex.academicYear}</p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Schedule Period',
      sortable: true,
      render: (ex) => (
        <div className="text-xs font-medium text-slate-700">
          <span>{ex.startDate}</span>
          <span className="text-slate-400"> to </span>
          <span>{ex.endDate}</span>
        </div>
      ),
    },
    {
      key: 'totalMarks',
      header: 'Marks Evaluation',
      render: (ex) => (
        <span className="text-xs">
          Total: <span className="font-bold text-slate-800">{ex.totalMarks}</span> (Pass: {ex.passingMarks})
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (ex) => <Badge variant={getStatusBadgeVariant(ex.status)}>{ex.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (ex) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedExam(ex)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingExam(ex)}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
            title="Edit Exam"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExamToDelete(ex)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Delete Exam"
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
          <h2 className="text-xl font-bold text-[#172554]">Manage Examination Sessions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define academic terms, passing marks, and result publication status</p>
        </div>

        <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
          Create Examination
        </Button>
      </div>

      {/* Exams Table */}
      <DataTable
        columns={columns}
        data={exams}
        searchPlaceholder="Search examinations by name or year..."
        exportFileName="Examinations_List"
      />

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Examination Term"
        subtitle="Set examination grading rules, duration, and pass marks"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Final Examination 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Upcoming' | 'Ongoing' | 'Published' | 'Archived' })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Published">Results Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Total Marks</label>
              <input
                type="number"
                required
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Passing Marks</label>
              <input
                type="number"
                required
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guidelines & Scope</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Save}>
              Save Exam
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Exam Modal */}
      {editingExam && (
        <Modal
          isOpen={Boolean(editingExam)}
          onClose={() => setEditingExam(null)}
          title="Edit Examination"
          subtitle={`Editing ${editingExam.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Name</label>
              <input
                type="text"
                required
                value={editingExam.name}
                onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={editingExam.totalMarks}
                  onChange={(e) => setEditingExam({ ...editingExam, totalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  value={editingExam.passingMarks}
                  onChange={(e) => setEditingExam({ ...editingExam, passingMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingExam.status}
                  onChange={(e) =>
                    setEditingExam({
                      ...editingExam,
                      status: e.target.value as 'Upcoming' | 'Ongoing' | 'Published' | 'Archived',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Published">Results Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={editingExam.academicYear}
                  onChange={(e) => setEditingExam({ ...editingExam, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingExam(null)}>
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
      {examToDelete && (
        <ConfirmDialog
          isOpen={Boolean(examToDelete)}
          onClose={() => setExamToDelete(null)}
          onConfirm={() => deleteExam(examToDelete.id)}
          title="Delete Examination"
          message={`Are you sure you want to delete ${examToDelete.name}?`}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
};
