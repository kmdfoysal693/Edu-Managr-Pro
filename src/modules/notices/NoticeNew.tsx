import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NoticeCategory, NoticePriority } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Bell, Save, ArrowLeft, Pin } from 'lucide-react';

export const NoticeNew: React.FC = () => {
  const { addNotice, userProfile, setCurrentRoute } = useSchool();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic' as NoticeCategory,
    description: '',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    targetAudience: 'All' as 'All' | 'Teachers & Staff' | 'Students & Parents' | 'Shareholders',
    priority: 'Normal' as NoticePriority,
    publishStatus: 'Published' as 'Published' | 'Draft' | 'Archived',
    isPinned: false,
    attachmentName: '',
  });

  const categories: NoticeCategory[] = [
    'Academic',
    'Administrative',
    'Examination',
    'Holiday',
    'Sports & Events',
    'Emergency',
  ];

  const priorities: NoticePriority[] = ['Normal', 'Medium', 'High', 'Urgent'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const added = addNotice({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      publishDate: formData.publishDate,
      expiryDate: formData.expiryDate,
      targetAudience: formData.targetAudience,
      priority: formData.priority,
      publishStatus: formData.publishStatus,
      isPinned: formData.isPinned,
      attachmentName: formData.attachmentName || undefined,
      author: userProfile.title || 'Office of Principal',
    });
    if (added) {
      setCurrentRoute('notice-board');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">Publish New Notice / Circular</h2>
          <p className="text-xs text-slate-500 mt-0.5">Post official administrative announcements and academic circulars</p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => setCurrentRoute('notice-board')}>
          Back to Notice Board
        </Button>
      </div>

      <Card title="Official Notice Drafting Form" icon={Bell}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Official Academic Notice & Examination Guidelines"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeCategory })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as NoticePriority })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience *</label>
              <select
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: e.target.value as 'All' | 'Teachers & Staff' | 'Students & Parents' | 'Shareholders',
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="All">All School Community</option>
                <option value="Students & Parents">Students & Parents</option>
                <option value="Teachers & Staff">Teachers & Faculty Staff</option>
                <option value="Shareholders">Shareholders & Trustees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Publish Date *</label>
              <input
                type="date"
                required
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Publish Status</label>
              <select
                value={formData.publishStatus}
                onChange={(e) =>
                  setFormData({ ...formData, publishStatus: e.target.value as 'Published' | 'Draft' | 'Archived' })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              >
                <option value="Published">Publish Immediately</option>
                <option value="Draft">Save as Draft</option>
                <option value="Archived">Archive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content & Full Description *</label>
            <textarea
              rows={6}
              required
              placeholder="Compose detailed official circular text with all requirements, dates, and instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment File Name</label>
              <input
                type="text"
                placeholder="e.g. Final_Exam_Schedule_Guidelines.pdf"
                value={formData.attachmentName}
                onChange={(e) => setFormData({ ...formData, attachmentName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin this notice to the top of notice boards
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setCurrentRoute('notice-board')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Publish Notice
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
