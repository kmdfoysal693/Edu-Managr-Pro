import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Notice, NoticeCategory } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Bell,
  PlusCircle,
  Pin,
  Eye,
  Edit,
  Trash2,
  Printer,
  Calendar,
  FileText,
  School,
  Save,
  Filter,
  Paperclip,
  LayoutGrid,
  List,
  Palette,
} from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { notices, updateNotice, deleteNotice, togglePinNotice, setCurrentRoute, schoolSettings } = useSchool();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  const categories: string[] = [
    'All',
    'Academic',
    'Administrative',
    'Examination',
    'Holiday',
    'Sports & Events',
    'Emergency',
  ];

  const filteredNotices = useMemo(() => {
    let list = notices;
    if (categoryFilter !== 'All') {
      list = list.filter((n) => n.category === categoryFilter);
    }
    // Sort pinned to top
    return [...list].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notices, categoryFilter]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    updateNotice(editingNotice.id, editingNotice);
    setEditingNotice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#172554]">Digital Bulletin & Notice Board</h2>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs"
              style={{ backgroundColor: '#99A1AF', borderColor: '#7E8795', color: '#0F172A' }}
              title="Checkerboard Cross Pattern: White (#FFFFFF) & #99A1AF"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Cross Grid: #99A1AF & White</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Central repository of circulars, emergency announcements, and term notifications</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-100 text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
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

          <Button variant="primary" icon={PlusCircle} onClick={() => setCurrentRoute('notice-new')}>
            Draft Notice
          </Button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="no-print flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              categoryFilter === cat
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat} ({cat === 'All' ? notices.length : notices.filter((n) => n.category === cat).length})
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        /* Notice Cards Grid: Cross / Checkerboard pattern between White (#FFFFFF) and #99A1AF */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotices.map((n, index) => {
            // Cross / Checkerboard pattern for 2-column grid:
            // Row 0: [White, #99A1AF]
            // Row 1: [#99A1AF, White]
            // Row 2: [White, #99A1AF]
            // Row 3: [#99A1AF, White]
            const row = Math.floor(index / 2);
            const col = index % 2;
            const isColored = (row + col) % 2 === 1;

            return (
              <div
                key={n.id}
                style={isColored ? { backgroundColor: '#99A1AF' } : { backgroundColor: '#FFFFFF' }}
                className={`rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between p-5 ${
                  isColored
                    ? 'border-[#7E8795] text-slate-950'
                    : n.isPinned
                    ? 'border-amber-300 ring-1 ring-amber-200/50 bg-gradient-to-b from-amber-50/20 to-white text-slate-700'
                    : 'border-slate-200/90 text-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePinNotice(n.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          n.isPinned
                            ? isColored
                              ? 'text-amber-950 bg-amber-300 font-bold'
                              : 'text-amber-600 bg-amber-100'
                            : isColored
                            ? 'text-slate-900 hover:text-black hover:bg-white/30'
                            : 'text-slate-300 hover:text-slate-600'
                        }`}
                        title={n.isPinned ? 'Unpin Notice' : 'Pin Notice'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <Badge
                        variant={getStatusBadgeVariant(n.priority)}
                        size="sm"
                        className={isColored ? 'border-black/20 shadow-xs' : ''}
                      >
                        {n.priority}
                      </Badge>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isColored
                            ? 'bg-white/80 text-slate-900 border border-white/60'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {n.category}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono flex items-center gap-1 ${
                        isColored ? 'text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> {n.publishDate}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedNotice(n)}
                    className={`text-base font-bold cursor-pointer line-clamp-2 leading-snug transition-colors ${
                      isColored
                        ? 'text-slate-950 hover:text-blue-950'
                        : 'text-[#172554] hover:text-[#2563EB]'
                    }`}
                  >
                    {n.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-xs line-clamp-3 leading-relaxed ${
                      isColored ? 'text-slate-900 font-medium' : 'text-slate-600'
                    }`}
                  >
                    {n.description}
                  </p>
                </div>

                {/* Bottom Attachment & Actions */}
                <div className="mt-4 pt-3 space-y-3">
                  {n.attachmentName && (
                    <div
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${
                        isColored
                          ? 'bg-white/85 text-slate-900 border-white/50 font-semibold'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{n.attachmentName}</span>
                    </div>
                  )}

                  <div
                    className={`pt-3 border-t flex items-center justify-between text-xs ${
                      isColored ? 'border-slate-800/20 text-slate-900 font-semibold' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <span className="truncate">By {n.author}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedNotice(n)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          isColored
                            ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Read
                      </button>

                      <button
                        onClick={() => setEditingNotice(n)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          isColored
                            ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xs border border-white/70'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => setNoticeToDelete(n)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isColored
                            ? 'text-slate-950 hover:text-rose-900 hover:bg-white/40'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View: Alternating row colors between #FFFFFF and #99A1AF */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-[#172554] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">Pin</th>
                  <th className="px-4 py-3.5">Title & Description</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredNotices.map((n, index) => {
                  const isColored = index % 2 === 1;

                  return (
                    <tr
                      key={n.id}
                      style={isColored ? { backgroundColor: '#99A1AF' } : { backgroundColor: '#FFFFFF' }}
                      className={`transition-colors ${isColored ? 'text-slate-950 font-medium' : 'text-slate-700 hover:bg-slate-50/70'}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => togglePinNotice(n.id)}
                          className={`cursor-pointer ${
                            n.isPinned
                              ? 'text-amber-500 font-bold'
                              : isColored
                              ? 'text-slate-700 hover:text-slate-950'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          <Pin className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <p
                          onClick={() => setSelectedNotice(n)}
                          className={`font-bold cursor-pointer line-clamp-1 ${
                            isColored ? 'text-slate-950 hover:underline' : 'text-[#172554] hover:text-[#2563EB]'
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className={`text-xs line-clamp-1 mt-0.5 ${isColored ? 'text-slate-900' : 'text-slate-500'}`}>
                          {n.description}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isColored
                              ? 'bg-white/80 text-slate-900 border border-white/60'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {n.category}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(n.priority)} size="sm">
                          {n.priority}
                        </Badge>
                      </td>

                      <td className={`px-4 py-3 font-mono text-xs ${isColored ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>
                        {n.publishDate}
                      </td>

                      <td className={`px-4 py-3 text-xs ${isColored ? 'text-slate-950 font-semibold' : 'text-slate-500'}`}>
                        {n.author}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedNotice(n)}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              isColored ? 'hover:bg-white/40 text-slate-950' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                            title="Read"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingNotice(n)}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              isColored ? 'hover:bg-white/40 text-slate-950' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setNoticeToDelete(n)}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              isColored ? 'hover:bg-rose-100 text-rose-950' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notice Detail & Printable View Modal */}
      {selectedNotice && (
        <Modal
          isOpen={Boolean(selectedNotice)}
          onClose={() => setSelectedNotice(null)}
          title="Official Circular Detail"
          subtitle={`Reference ID: ${selectedNotice.id} • Category: ${selectedNotice.category}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Letterhead Print Area */}
            <div className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-8 print-page relative">
              <div className="border-b-2 border-slate-800 pb-4 mb-5 text-center">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-full bg-white p-0.5 ring-1 ring-slate-300 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={schoolSettings.logo}
                      alt={schoolSettings.schoolName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase text-[#172554] tracking-tight">
                      {schoolSettings.schoolName}
                    </h2>
                    <p className="text-xs text-slate-500">{schoolSettings.address} • Estd: {schoolSettings.establishedYear} • EIIN: {schoolSettings.eiin}</p>
                  </div>
                  <div className="w-12 h-12" />
                </div>
                <span className="px-4 py-1 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">
                  OFFICIAL NOTICE & CIRCULAR
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3 mb-4">
                <span>
                  <strong>Date Issued: </strong>
                  {selectedNotice.publishDate}
                </span>
                <span>
                  <strong>Audience: </strong>
                  {selectedNotice.targetAudience}
                </span>
                <span>
                  <strong>Priority: </strong>
                  {selectedNotice.priority}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-[#172554] mb-4 leading-snug">
                {selectedNotice.title}
              </h3>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap space-y-3 mb-6">
                {selectedNotice.description}
              </div>

              {selectedNotice.attachmentName && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800 mb-6">
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span>Enclosed Document: {selectedNotice.attachmentName}</span>
                </div>
              )}

              <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-400">Notice Reference:</p>
                  <p className="font-mono text-slate-700">ABC/ACAD/2026-{selectedNotice.id.replace('not-', '')}</p>
                </div>
                <div className="text-center">
                  <div className="font-script text-base text-blue-900 italic font-bold">M. Rahman</div>
                  <div className="w-32 border-b border-slate-800 mb-1" />
                  <p className="font-bold text-[#172554]">{selectedNotice.author}</p>
                  <p className="text-[10px] text-slate-400">{schoolSettings.schoolName}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Official Notice
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Notice Modal */}
      {editingNotice && (
        <Modal
          isOpen={Boolean(editingNotice)}
          onClose={() => setEditingNotice(null)}
          title="Edit Official Notice"
          subtitle={`Editing ${editingNotice.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={editingNotice.title}
                onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={editingNotice.priority}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, priority: e.target.value as Notice['priority'] })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={editingNotice.expiryDate}
                  onChange={(e) => setEditingNotice({ ...editingNotice, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Description</label>
              <textarea
                rows={5}
                required
                value={editingNotice.description}
                onChange={(e) => setEditingNotice({ ...editingNotice, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingNotice(null)}>
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
      {noticeToDelete && (
        <ConfirmDialog
          isOpen={Boolean(noticeToDelete)}
          onClose={() => setNoticeToDelete(null)}
          onConfirm={() => deleteNotice(noticeToDelete.id)}
          title="Delete Notice"
          message={`Are you sure you want to delete notice "${noticeToDelete.title}"?`}
          confirmLabel="Delete Notice"
        />
      )}
    </div>
  );
};
