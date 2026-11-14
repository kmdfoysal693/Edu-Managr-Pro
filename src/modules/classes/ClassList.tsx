import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolClass } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DataTable, Column } from '../../components/common/DataTable';
import {
  Layers,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  Save,
  X,
  BookOpen,
} from 'lucide-react';

export const ClassList: React.FC = () => {
  const { classes, students, subjects, updateClass, deleteClass, setCurrentRoute } = useSchool();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  // Quick section add inside editing
  const [newSectionVal, setNewSectionVal] = useState('');

  const getStudentCount = (cls: SchoolClass) => {
    return students.filter((s) => s.classId === cls.id || s.className === cls.className).length;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    updateClass(editingClass.id, editingClass);
    setEditingClass(null);
  };

  const columns: Column<SchoolClass>[] = [
    {
      key: 'className',
      header: 'Class Name',
      sortable: true,
      render: (c) => (
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-[#172554] hover:text-[#2563EB] cursor-pointer" onClick={() => setSelectedClass(c)}>
              {c.className}
            </p>
            {c.group && c.group !== 'General' && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  c.group === 'Science'
                    ? 'bg-emerald-100 text-emerald-800'
                    : c.group === 'Commerce'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {c.group}
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-blue-600 font-semibold">{c.classCode}</span>
        </div>
      ),
    },
    {
      key: 'sections',
      header: 'Sections',
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.sections.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
              Sec {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'classTeacher',
      header: 'Class Teacher',
      sortable: true,
      render: (c) => <span className="text-xs font-semibold text-slate-700">{c.classTeacher}</span>,
    },
    {
      key: 'roomNumber',
      header: 'Room',
      render: (c) => <span className="text-xs text-slate-600">{c.roomNumber}</span>,
    },
    {
      key: 'studentsCount',
      header: 'Enrolled / Cap',
      render: (c) => {
        const count = getStudentCount(c);
        const pct = c.maxStudents > 0 ? Math.min(100, (count / c.maxStudents) * 100) : 0;
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-800">{count}</span> / <span className="text-slate-400">{c.maxStudents}</span>
            <div className="w-20 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (c) => <Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedClass(c)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingClass(c)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Class"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setClassToDelete(c)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Class"
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
          <h2 className="text-xl font-bold text-[#172554]">Class & Grade Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage curriculum grades, sections, teacher assignments, and capacities</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-100 text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-100 text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" icon={PlusCircle} onClick={() => setCurrentRoute('class-add')}>
            Add New Class
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        classes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172554]">No Academic Classes Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Create your first class or grade level to assign sections, teachers, textbooks, and enroll students.
            </p>
            <Button variant="primary" icon={PlusCircle} className="mt-4" onClick={() => setCurrentRoute('class-add')}>
              Add New Class
            </Button>
          </div>
        ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => {
            const count = getStudentCount(c);
            const occupancyPct = c.maxStudents > 0 ? Math.min(100, Math.round((count / c.maxStudents) * 100)) : 0;

            return (
              <Card
                key={c.id}
                className="hover:border-blue-300 transition-all cursor-pointer"
                title={c.className}
                subtitle={`Code: ${c.classCode}`}
                icon={Layers}
                action={<Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge>}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">Teacher:</span>
                    <span className="font-bold text-[#172554] truncate max-w-[160px]">{c.classTeacher}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">Assigned Room:</span>
                    <span className="font-bold text-slate-700">{c.roomNumber}</span>
                  </div>

                  {/* Section Badges */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Sections</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.sections.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          Section {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Occupancy:</span>
                      <span className="font-bold text-slate-700">
                        {count} / {c.maxStudents} Students ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => setSelectedClass(c)}>
                      Details
                    </Button>
                    <Button variant="outline" size="sm" icon={Edit} onClick={() => setEditingClass(c)}>
                      Edit
                    </Button>
                    <button
                      onClick={() => setClassToDelete(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )
      ) : (
        /* Table View */
        <DataTable
          columns={columns}
          data={classes}
          searchPlaceholder="Search classes by name, code, teacher, or room..."
          exportFileName="Classes_Directory"
        />
      )}

      {/* View Class Details Modal */}
      {selectedClass && (
        <Modal
          isOpen={Boolean(selectedClass)}
          onClose={() => setSelectedClass(null)}
          title={selectedClass.className}
          subtitle={`Class Code: ${selectedClass.classCode} • Academic Year: ${selectedClass.academicYear}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-slate-500">Class In-Charge</p>
                <p className="text-sm font-bold text-blue-700 mt-0.5">{selectedClass.classTeacher}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">Classroom Location</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedClass.roomNumber}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p className="text-slate-400 font-medium">Class Sections Available</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedClass.sections.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-md font-bold bg-white text-blue-700 border border-slate-200 shadow-xs">
                    Section {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Assigned Textbooks & Curriculum */}
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Assigned Textbooks & Books
                </p>
                {selectedClass.group && selectedClass.group !== 'General' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    Stream: {selectedClass.group}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto">
                {subjects
                  .filter((s) => {
                    if (selectedClass.subjectIds && selectedClass.subjectIds.length > 0) {
                      return selectedClass.subjectIds.includes(s.id);
                    }
                    const is9or10 = /class\s*(9|10)|ix|x/i.test(selectedClass.className);
                    if (is9or10) {
                      if (s.group === 'General') return true;
                      return selectedClass.group ? s.group === selectedClass.group : true;
                    }
                    return s.classIds.includes(selectedClass.id) || (s.classNames && s.classNames.includes(selectedClass.className));
                  })
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-1.5 rounded bg-white border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-[11px] truncate">{sub.name}</p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">Code: {sub.code} • {sub.textbookTitle}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold shrink-0">
                        {sub.totalMarks}M
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {selectedClass.description && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs">
                <p className="text-slate-400 font-medium">Description</p>
                <p className="text-slate-700 mt-0.5">{selectedClass.description}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedClass(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Edit}
                onClick={() => {
                  setEditingClass(selectedClass);
                  setSelectedClass(null);
                }}
              >
                Edit Class
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <Modal
          isOpen={Boolean(editingClass)}
          onClose={() => setEditingClass(null)}
          title="Edit Class Information"
          subtitle={`Editing ${editingClass.className}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={editingClass.className}
                  onChange={(e) => setEditingClass({ ...editingClass, className: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Code</label>
                <input
                  type="text"
                  required
                  value={editingClass.classCode}
                  onChange={(e) => setEditingClass({ ...editingClass, classCode: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Teacher</label>
                <input
                  type="text"
                  required
                  value={editingClass.classTeacher}
                  onChange={(e) => setEditingClass({ ...editingClass, classTeacher: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={editingClass.roomNumber}
                  onChange={(e) => setEditingClass({ ...editingClass, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Students</label>
                <input
                  type="number"
                  required
                  value={editingClass.maxStudents}
                  onChange={(e) => setEditingClass({ ...editingClass, maxStudents: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingClass.status}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, status: e.target.value as 'Active' | 'Inactive' })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Sections Manager in Edit */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manage Sections</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editingClass.sections.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold"
                    >
                      Section {s}
                      {editingClass.sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingClass({
                              ...editingClass,
                              sections: editingClass.sections.filter((x) => x !== s),
                            })
                          }
                          className="hover:text-blue-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-xs">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="New Section (e.g. D)"
                    value={newSectionVal}
                    onChange={(e) => setNewSectionVal(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg uppercase"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      const v = newSectionVal.trim().toUpperCase();
                      if (v && !editingClass.sections.includes(v)) {
                        setEditingClass({
                          ...editingClass,
                          sections: [...editingClass.sections, v],
                        });
                        setNewSectionVal('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingClass(null)}>
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
      {classToDelete && (
        <ConfirmDialog
          isOpen={Boolean(classToDelete)}
          onClose={() => setClassToDelete(null)}
          onConfirm={() => deleteClass(classToDelete.id)}
          title="Delete Class"
          message={`Are you sure you want to delete ${classToDelete.className}? Ensure all enrolled students are relocated first.`}
          confirmLabel="Delete Class"
        />
      )}
    </div>
  );
};
