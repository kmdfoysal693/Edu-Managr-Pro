import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Badge, getStatusBadgeVariant } from './Badge';
import { Button } from './Button';
import {
  X,
  Bell,
  Calendar,
  Pin,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Users,
  Sparkles,
} from 'lucide-react';

export const NoticePopupModal: React.FC = () => {
  const {
    notices,
    schoolSettings,
    isNoticePopupOpen,
    openNoticePopup,
    closeNoticePopup,
    setCurrentRoute,
  } = useSchool();

  const [activeIndex, setActiveIndex] = useState(0);
  const noticesRef = useRef(notices);

  useEffect(() => {
    noticesRef.current = notices;
  }, [notices]);

  // Sort published notices so most recently updated or created notice appears first
  const publishedNotices = useMemo(() => {
    const active = notices.filter((n) => n.publishStatus === 'Published');
    return [...active].sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.publishDate).getTime();
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.publishDate).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    });
  }, [notices]);

  // Launch timer: open popup 5 seconds after application starts when Notice Board has published notices
  useEffect(() => {
    const launchTimer = window.setTimeout(() => {
      const hasPublished = noticesRef.current.some((n) => n.publishStatus === 'Published');
      if (hasPublished) {
        setActiveIndex(0);
        openNoticePopup();
      }
    }, 5000);

    return () => window.clearTimeout(launchTimer);
    // Run strictly once on app launch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset index when popup opens
  useEffect(() => {
    if (isNoticePopupOpen) {
      setActiveIndex(0);
    }
  }, [isNoticePopupOpen]);

  // Handle Escape key & body scroll lock while popup is visible
  useEffect(() => {
    if (!isNoticePopupOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNoticePopup();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNoticePopupOpen, closeNoticePopup]);

  if (!isNoticePopupOpen) return null;

  const safeIndex = Math.min(activeIndex, Math.max(0, publishedNotices.length - 1));
  const currentNotice = publishedNotices[safeIndex];

  const handleGoToNoticeBoard = () => {
    closeNoticePopup();
    setCurrentRoute('notice-board');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-popup-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeNoticePopup}
      />

      {/* Popup Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Top-Right Corner Cross (X) Button */}
        <button
          type="button"
          onClick={closeNoticePopup}
          aria-label="Close Notice Popup"
          title="Close"
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#2563EB] text-white px-6 py-4 pr-14">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/95 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <img
                src={schoolSettings.logo}
                alt={schoolSettings.schoolName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                  <Sparkles className="w-3 h-3" />
                  Notice Board Update
                </span>
                {publishedNotices.length > 1 && (
                  <span className="text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded-full text-blue-100">
                    {safeIndex + 1} of {publishedNotices.length} Notices
                  </span>
                )}
              </div>
              <h2 id="notice-popup-title" className="text-base sm:text-lg font-extrabold truncate mt-1">
                {schoolSettings.schoolName}
              </h2>
            </div>
          </div>
        </div>

        {/* Popup Body */}
        {currentNotice ? (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Badges & Dates */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {currentNotice.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Pin className="w-3 h-3 fill-current" />
                    Pinned
                  </span>
                )}
                <Badge variant={getStatusBadgeVariant(currentNotice.priority)} size="sm">
                  {currentNotice.priority} Priority
                </Badge>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {currentNotice.category}
                </span>
              </div>

              <span className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Issued: {currentNotice.publishDate}
              </span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#172554] leading-snug">
                {currentNotice.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Audience: <strong className="text-slate-700">{currentNotice.targetAudience}</strong>
                </span>
                <span>•</span>
                <span>
                  Posted by: <strong className="text-slate-700">{currentNotice.author}</strong>
                </span>
                {currentNotice.expiryDate && (
                  <>
                    <span>•</span>
                    <span>
                      Valid until: <strong className="text-slate-700 font-mono">{currentNotice.expiryDate}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Notice Description Box */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {currentNotice.description}
            </div>

            {/* Attachment Banner if present */}
            {currentNotice.attachmentName && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                <Paperclip className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="truncate">Attachment: {currentNotice.attachmentName}</span>
              </div>
            )}

            {/* Multi-Notice Switcher */}
            {publishedNotices.length > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + publishedNotices.length) % publishedNotices.length)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Notice
                </button>

                <div className="flex items-center gap-1.5">
                  {publishedNotices.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`View notice ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === safeIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % publishedNotices.length)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Next Notice
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#172554]">No Published Notice Updates</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Publish a circular or announcement on the Notice Board and it will appear automatically in this popup 5 seconds after opening the app.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGoToNoticeBoard}
            className="flex items-center gap-1.5 font-bold text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Notice Board
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={closeNoticePopup}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
