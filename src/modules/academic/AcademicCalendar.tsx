import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicEvent, EventCategory } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  CalendarDays,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Filter,
  Edit,
  Trash2,
  Save,
} from 'lucide-react';

export const AcademicCalendar: React.FC = () => {
  const { academicEvents, addAcademicEvent, updateAcademicEvent, deleteAcademicEvent } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AcademicEvent | null>(null);

  // Form State for Add Event
  const [formData, setFormData] = useState({
    title: '',
    category: 'Examination' as EventCategory,
    startDate: todayStr,
    endDate: todayStr,
    time: '09:00 AM - 12:30 PM',
    location: '',
    description: '',
    status: 'Upcoming' as 'Upcoming' | 'Ongoing' | 'Completed',
    targetAudience: 'All' as 'All' | 'Students' | 'Teachers' | 'Parents',
  });

  const categories: Array<{ name: EventCategory; color: string; bg: string; text: string }> = [
    { name: 'Examination', color: '#2563EB', bg: 'bg-blue-100', text: 'text-blue-800' },
    { name: 'Holiday', color: '#EF4444', bg: 'bg-rose-100', text: 'text-rose-800' },
    { name: 'School Event', color: '#10B981', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { name: 'Parent Meeting', color: '#F59E0B', bg: 'bg-amber-100', text: 'text-amber-800' },
    { name: 'Academic Deadline', color: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-800' },
  ];

  const getCategoryTheme = (cat: string) => {
    return categories.find((c) => c.name === cat) || {
      name: 'School Event' as EventCategory,
      color: '#2563EB',
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    };
  };

  const filteredEvents = academicEvents.filter(
    (e) => selectedCategory === 'All' || e.category === selectedCategory
  );

  // Month Calendar Grid Calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAcademicEvent(formData);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      category: 'Examination',
      startDate: todayStr,
      endDate: todayStr,
      time: '09:00 AM - 12:30 PM',
      location: '',
      description: '',
      status: 'Upcoming',
      targetAudience: 'All',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateAcademicEvent(editingEvent.id, editingEvent);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Academic Calendar & Events</h2>
          <p className="text-xs text-slate-500 mt-0.5">Examinations, institutional holidays, science fairs, and parent meetings</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'agenda' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda List
            </button>
          </div>

          <Button variant="primary" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#172554] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Events ({academicEvents.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.name
                ? `${cat.bg} ${cat.text} ring-2 ring-current font-bold shadow-xs`
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
          </button>
        ))}
      </div>

      {viewMode === 'month' ? (
        /* Calendar View */
        <Card noPadding>
          {/* Calendar Header Navigation */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172554]">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Current Month
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-2.5">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[105px] bg-slate-50/60 p-2" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter((e) => {
                return dateStr >= e.startDate && dateStr <= e.endDate;
              });

              const isToday = dateStr === todayStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[105px] bg-white p-2 transition-colors hover:bg-blue-50/20 flex flex-col ${
                    isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">{dayEvents.length} event</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayEvents.map((evt) => {
                      const theme = getCategoryTheme(evt.category);
                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`px-1.5 py-1 rounded text-[10px] font-semibold truncate cursor-pointer transition-transform hover:scale-[1.02] ${theme.bg} ${theme.text}`}
                          title={`${evt.title} (${evt.category})`}
                        >
                          {evt.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Agenda List View */
        <div className="space-y-3">
          {filteredEvents.length === 0 && (
            <Card className="py-10 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">No academic events scheduled yet</p>
              <p className="text-xs mt-1">Click &quot;Schedule Event&quot; to add examinations, holidays, or parent meetings.</p>
            </Card>
          )}
          {filteredEvents.map((evt) => {
            const theme = getCategoryTheme(evt.category);

            return (
              <Card
                key={evt.id}
                className="hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setSelectedEvent(evt)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text} shrink-0`}>
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${theme.bg} ${theme.text}`}>
                          {evt.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {evt.startDate} {evt.endDate !== evt.startDate ? `to ${evt.endDate}` : ''}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#172554] mt-1">{evt.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{evt.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 self-end sm:self-auto">
                    {evt.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {evt.time}
                      </span>
                    )}
                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {evt.location}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Event Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          subtitle={`Category: ${selectedEvent.category}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded ${getCategoryTheme(selectedEvent.category).bg} ${getCategoryTheme(selectedEvent.category).text}`}>
                {selectedEvent.category}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Audience: {selectedEvent.targetAudience}
              </span>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">
                  {selectedEvent.startDate} {selectedEvent.endDate !== selectedEvent.startDate ? `through ${selectedEvent.endDate}` : ''}
                </span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 border border-slate-100 rounded-lg">
              {selectedEvent.description || 'No additional event instructions.'}
            </p>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="!text-rose-600"
                icon={Trash2}
                onClick={() => {
                  setEventToDelete(selectedEvent);
                  setSelectedEvent(null);
                }}
              >
                Delete Event
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit}
                  onClick={() => {
                    setEditingEvent(selectedEvent);
                    setSelectedEvent(null);
                  }}
                >
                  Edit Event
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Academic Event"
        subtitle="Add examinations, holidays, workshops or parent sessions"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Final Examination 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as 'All' | 'Students' | 'Teachers' | 'Parents' })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All School Community</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Faculty & Staff Only</option>
                <option value="Parents">Parents & Guardians</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Schedule</label>
              <input
                type="text"
                placeholder="e.g. 09:30 AM - 02:00 PM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Venue</label>
              <input
                type="text"
                placeholder="e.g. School Auditorium"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Description & Instructions</label>
            <textarea
              rows={3}
              placeholder="Detailed guidelines, syllabus coverage, or parent instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={Save}>
              Save Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Event Modal */}
      {editingEvent && (
        <Modal
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          title="Edit Academic Event"
          subtitle={`Editing ${editingEvent.title}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editingEvent.category}
                  onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as EventCategory })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                <select
                  value={editingEvent.targetAudience}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      targetAudience: e.target.value as 'All' | 'Students' | 'Teachers' | 'Parents',
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                >
                  <option value="All">All</option>
                  <option value="Students">Students</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Parents">Parents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={editingEvent.startDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={editingEvent.endDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingEvent(null)}>
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
      {eventToDelete && (
        <ConfirmDialog
          isOpen={Boolean(eventToDelete)}
          onClose={() => setEventToDelete(null)}
          onConfirm={() => deleteAcademicEvent(eventToDelete.id)}
          title="Delete Event"
          message={`Are you sure you want to delete "${eventToDelete.title}"?`}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
};
