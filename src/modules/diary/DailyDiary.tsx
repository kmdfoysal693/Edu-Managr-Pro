import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { BookOpen, Save, ArrowLeft } from 'lucide-react';

export const DailyDiary: React.FC = () => {
  const { classes, staff, addDiaryEntry, setCurrentRoute } = useSchool();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    classId: classes[9]?.id || classes[0]?.id || 'cls-10',
    section: 'A',
    subject: 'Higher Mathematics',
    teacherName: staff[0]?.fullName || 'Dr. Ashraful Kabir',
    lessonTitle: '',
    homework: '',
    instructions: '',
    submissionDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  const selectedClass = classes.find((c) => c.id === formData.classId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDiaryEntry({
      date: formData.date,
      classId: formData.classId,
      className: selectedClass?.className || 'Class',
      section: formData.section,
      subject: formData.subject,
      teacherName: formData.teacherName,
      lessonTitle: formData.lessonTitle,
      homework: formData.homework,
      instructions: formData.instructions,
      submissionDate: formData.submissionDate,
    });
    setCurrentRoute('diary-list');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Create Daily Digital Diary</h2>
          <p className="text-xs text-slate-500 mt-0.5">Assign lessons, homework tasks, and guidelines for students & guardians</p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setCurrentRoute('diary-list')}>
          Back to Diary List
        </Button>
      </div>

      <Card title="Daily Homework & Classwork Diary Entry" icon={BookOpen}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Diary Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                {selectedClass?.sections.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Higher Mathematics"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher *</label>
              <select
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.fullName}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Due Date *</label>
              <input
                type="date"
                required
                value={formData.submissionDate}
                onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Topic / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 11: Coordinate Geometry - Distance Formula & Exercises"
              value={formData.lessonTitle}
              onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Homework Details *</label>
            <textarea
              rows={3}
              required
              placeholder="Specify questions, problems, copy assignments, or book exercises to solve..."
              value={formData.homework}
              onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Instructions & Guidelines</label>
            <textarea
              rows={2}
              placeholder="e.g. Bring scientific calculator and geometry set; parent signature required in notebook."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCurrentRoute('diary-list')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Publish Diary Entry
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
