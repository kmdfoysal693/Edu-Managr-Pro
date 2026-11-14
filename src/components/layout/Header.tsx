import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  Clock,
  ChevronDown,
  User,
  Settings,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  RefreshCw,
  Upload,
  RotateCcw,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Check,
  CheckCheck,
  BellRing,
  Trash2,
  Info,
} from 'lucide-react';
import { InstitutionSettings } from '../../types';
import { DEFAULT_SCHOOL_SETTINGS } from '../../constants/school';
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_TIMEZONES,
  formatZonedDate,
  formatZonedTime,
} from '../../i18n/translations';

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export const Header: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    isSidebarCollapsed,
    setIsMobileSidebarOpen,
    userProfile,
    updateUserProfile,
    schoolSettings,
    updateSchoolSettings,
    resetSchoolSettings,
    notices,
    students,
    staff,
    classes,
    showToast,
    resetToDemoData,
    t,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useSchool();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for profile actions
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Institution & System Settings State
  const [settingsForm, setSettingsForm] = useState<InstitutionSettings>(schoolSettings);
  const [settingsTab, setSettingsTab] = useState<'general' | 'contact' | 'portal' | 'language'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live timer for live timezone clock
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep settingsForm in sync with schoolSettings when modal opens
  useEffect(() => {
    if (isSettingsModalOpen) {
      setSettingsForm(schoolSettings);
    }
  }, [isSettingsModalOpen, schoolSettings]);

  // Profile Edit form states
  const [profileForm, setProfileForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    title: userProfile.title,
    institution: userProfile.institution,
  });

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep profileForm in sync with userProfile when modal opens
  useEffect(() => {
    if (isMyProfileModalOpen) {
      setProfileForm({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        title: userProfile.title,
        institution: userProfile.institution,
      });
    }
  }, [isMyProfileModalOpen, userProfile]);

  // Global keyboard shortcut (Ctrl/Cmd + K to toggle search, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Breadcrumb / Page Title
  let currentParentTitle = 'Dashboard';
  let currentSubTitle = 'Dashboard Overview';

  if (currentRoute === 'activity-log') {
    currentParentTitle = 'System';
    currentSubTitle = 'Activity & Audit Log';
  } else {
    for (const item of NAVIGATION_ITEMS) {
      const match = item.subItems.find((s) => s.id === currentRoute);
      if (match) {
        currentParentTitle = t('nav.' + item.id, item.label);
        currentSubTitle = t(match.id, match.label);
        break;
      }
    }
  }

  // Format Current Date & Time with selected Timezone & Language
  const activeTimezone = schoolSettings.timezone || 'Asia/Dhaka';
  const activeLang = schoolSettings.language || 'en';
  const formattedDate = formatZonedDate(liveTime, activeTimezone, activeLang);
  const formattedTime = formatZonedTime(liveTime, activeTimezone, activeLang);
  const currentTimezoneObj = SUPPORTED_TIMEZONES.find((tz) => tz.id === activeTimezone) || SUPPORTED_TIMEZONES[0];

  // Global search matching
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{ title: string; subtitle: string; category: string; route: string }> = [];

    // Search students
    students.forEach((s) => {
      if (s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.admissionNumber.toLowerCase().includes(q)) {
        results.push({
          title: s.fullName,
          subtitle: `${s.studentId} • ${s.className} (Roll ${s.rollNumber})`,
          category: 'Student',
          route: 'student-list',
        });
      }
    });

    // Search staff
    staff.forEach((st) => {
      if (st.fullName.toLowerCase().includes(q) || st.staffId.toLowerCase().includes(q) || st.designation.toLowerCase().includes(q)) {
        results.push({
          title: st.fullName,
          subtitle: `${st.staffId} • ${st.designation}`,
          category: 'Staff',
          route: 'staff-list',
        });
      }
    });

    // Search classes
    classes.forEach((c) => {
      if (c.className.toLowerCase().includes(q) || c.classCode.toLowerCase().includes(q)) {
        results.push({
          title: c.className,
          subtitle: `Code: ${c.classCode} • Room: ${c.roomNumber}`,
          category: 'Class',
          route: 'class-list',
        });
      }
    });

    // Search notices
    notices.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)) {
        results.push({
          title: n.title,
          subtitle: `${n.category} • Priority: ${n.priority}`,
          category: 'Notice',
          route: 'notice-board',
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, students, staff, classes, notices]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    setIsMyProfileModalOpen(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'Password Mismatch', 'The new passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    showToast('success', 'Password Updated', 'Your administrative password was changed.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(false);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSettingsForm((prev) => ({ ...prev, logo: event.target!.result as string }));
        showToast('info', 'Logo Loaded', 'Logo preview updated. Click "Save Settings" to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setSettingsForm((prev) => ({
      ...prev,
      logo: DEFAULT_SCHOOL_SETTINGS.logo,
    }));
    showToast('info', 'Default Logo Restored', 'Reverted back to standard crest.');
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings(settingsForm);
    setIsSettingsModalOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
        }`}
      >
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                <span className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setCurrentRoute('dashboard-overview')}>
                  {schoolSettings.schoolName}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-600">{currentParentTitle}</span>
              </nav>
              <h1 className="text-lg sm:text-2xl font-black text-[#172554] tracking-tight leading-tight truncate">
                {currentSubTitle}
              </h1>
            </div>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Quick Search Button */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 transition-colors cursor-pointer group"
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                <span className="hidden sm:inline">{t('action.search', 'Search...')}</span>
                <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Live Timezone Clock & Date Badge */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 bg-blue-50/80 border border-blue-200/80 rounded-xl text-sm font-bold text-blue-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formattedDate}</span>
              <span className="text-blue-300">•</span>
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-mono font-extrabold text-slate-900">{formattedTime}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-md font-extrabold">
                {currentTimezoneObj.countryCode} ({currentTimezoneObj.offset.split('/')[0].trim()})
              </span>
            </div>

            {/* Live Time Notifications Menu */}
            <div className="relative" ref={notificationMenuRef}>
              <button
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Live Time Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 ? (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[20px] text-center text-[11px] font-extrabold bg-rose-600 text-white rounded-full ring-2 ring-white animate-pulse">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                ) : (
                  notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                  )
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-88 sm:w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 text-[#2563EB] rounded-lg">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#172554] tracking-tight">
                          Live Notifications
                        </h4>
                        <p className="text-xs font-medium text-slate-500">
                          {unreadNotificationsCount} unread • {notifications.length} total events
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="px-2.5 py-1 text-xs font-bold text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex border-b border-slate-100 bg-white px-3 pt-2">
                    <button
                      onClick={() => setNotificationTab('all')}
                      className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        notificationTab === 'all'
                          ? 'border-[#2563EB] text-[#2563EB]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All Events ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotificationTab('unread')}
                      className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        notificationTab === 'unread'
                          ? 'border-[#2563EB] text-[#2563EB]'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Unread</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                    {(() => {
                      const displayedList = notificationTab === 'unread'
                        ? notifications.filter((n) => !n.read)
                        : notifications;

                      if (displayedList.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400">
                            <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
                            <p className="text-sm font-semibold text-slate-600">No notifications to show</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {notificationTab === 'unread' ? 'All caught up! No unread events.' : 'No system activity logged yet.'}
                            </p>
                          </div>
                        );
                      }

                      return displayedList.map((item) => {
                        const isAlert = item.type === 'alert';
                        const isWarning = item.type === 'warning';
                        const isSuccess = item.type === 'success';

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              markNotificationAsRead(item.id);
                              if (item.actionRoute) {
                                setCurrentRoute(item.actionRoute);
                                setIsNotificationOpen(false);
                              }
                            }}
                            className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 ${
                              !item.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isAlert ? (
                                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              ) : isWarning ? (
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              ) : isSuccess ? (
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                  <Info className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 tracking-wide">
                                  {item.module}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {formatRelativeTime(item.timestamp)}
                                </span>
                              </div>
                              <h5 className={`text-xs sm:text-sm mt-1 line-clamp-1 font-bold ${
                                !item.read ? 'text-[#172554]' : 'text-slate-700'
                              }`}>
                                {item.title}
                              </h5>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {item.message}
                              </p>
                            </div>

                            {!item.read && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="text-slate-400 text-[11px]">⚡ Real-time system monitoring</span>
                    <button
                      onClick={() => {
                        setCurrentRoute('activity-log');
                        setIsNotificationOpen(false);
                      }}
                      className="text-[#2563EB] hover:underline font-bold cursor-pointer"
                    >
                      Full Audit Log →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick System & Account Settings Shortcut */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="System & Account Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile Bar & Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
              >
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div className="hidden sm:block text-left min-w-0">
                  <span className="block text-xs font-bold text-[#172554] truncate leading-tight">
                    {userProfile.name}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-400 truncate">
                    {userProfile.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                  {/* Dropdown Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={userProfile.avatar}
                        alt={userProfile.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#172554] truncate">{userProfile.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB]">
                          {userProfile.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <div className="p-1.5 space-y-0.5 text-xs font-medium text-slate-700">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsMyProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsSettingsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        resetToDemoData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer text-left"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Clear All Data</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        showToast('info', 'Logged Out', 'Administrator session ended.');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search students, staff, classes, notices, roll numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 text-slate-800"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Type at least 2 characters to search across Students, Staff, Classes, and School Notices.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matches found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentRoute(res.route);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#172554] group-hover:text-[#2563EB]">
                            {res.title}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {res.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{res.subtitle}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: My Profile */}
      <Modal
        isOpen={isMyProfileModalOpen}
        onClose={() => setIsMyProfileModalOpen(false)}
        title="Administrative Profile"
        subtitle="Manage your personal administrator identity and contact details"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <img src={userProfile.avatar} alt={userProfile.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/20" />
            <div>
              <h4 className="text-sm font-bold text-[#172554]">{userProfile.name}</h4>
              <p className="text-xs text-slate-500">{userProfile.title}</p>
              <p className="text-xs text-blue-600 font-semibold">{userProfile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Title</label>
              <input
                type="text"
                value={profileForm.title}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name</label>
            <input
              type="text"
              value={profileForm.institution}
              onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsMyProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: System & Account Settings */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="System & Account Settings"
        subtitle="Manage School/College name, logo, legal institution identity, and portal configuration"
        maxWidth="2xl"
      >
        <form onSubmit={handleSettingsSubmit} className="space-y-5">
          {/* Settings Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSettingsTab('general')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settingsTab === 'general'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Identity & Logo</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('contact')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settingsTab === 'contact'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Address & Contact</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('portal')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settingsTab === 'portal'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Session & Defaults</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsTab('language')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settingsTab === 'language'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('settings.tab_language', 'Language & Timezone')}</span>
            </button>
          </div>

          {/* TAB 1: General & Logo */}
          {settingsTab === 'general' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              {/* Institution Logo Section */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs font-bold text-[#172554]">
                      Institution Logo
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload from device/gallery or paste an image link. Reflects instantly across all ID cards, receipts, and menus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#2563EB] cursor-pointer transition-colors"
                    title="Reset to default logo"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Logo</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Logo Preview */}
                  <div className="w-20 h-20 rounded-2xl bg-white p-1.5 border-2 border-slate-200 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={settingsForm.logo}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Actions & File Input */}
                  <div className="flex-1 w-full space-y-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File / Upload Image</span>
                      </Button>
                      <span className="text-[11px] text-slate-400">JPG, PNG, WebP, SVG</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-500 shrink-0">Or URL:</span>
                      <input
                        type="text"
                        value={settingsForm.logo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Names & Identity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    School / College Name (Display Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.schoolName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                    placeholder="e.g. ABC School or ABC College"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Displays on Sidebar, Header bar, ID card front badges, and table headers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Full Name (Official Legal Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.institutionName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                    placeholder="e.g. ABC School & College"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Official legal name printed on Admit Cards, Fee Receipts, and Legal Registers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institution Type
                  </label>
                  <select
                    value={settingsForm.institutionType}
                    onChange={(e) => setSettingsForm({ ...settingsForm, institutionType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="School & College">School & College</option>
                    <option value="Madrasah">Madrasah</option>
                    <option value="University">University</option>
                    <option value="Academy / Training">Academy / Institute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motto / Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    placeholder="e.g. Learning for Life"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="text"
                    value={settingsForm.establishedYear}
                    onChange={(e) => setSettingsForm({ ...settingsForm, establishedYear: e.target.value })}
                    placeholder="e.g. 1985"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    EIIN / Registration Code
                  </label>
                  <input
                    type="text"
                    value={settingsForm.eiin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, eiin: e.target.value })}
                    placeholder="e.g. 134215"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Address & Contact */}
          {settingsTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Address
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  placeholder="e.g. Road 27, Dhanmondi Academic Enclave, Dhaka-1209"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Printed on student & staff ID cards, admit cards, receipts, and shareholder registers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Telephone / Hotline
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+880 2 9612345"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="info@abcschool.edu.bd"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Website
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={settingsForm.website}
                      onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                      placeholder="www.abcschool.edu.bd"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settingsForm.currency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                    placeholder="BDT"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Session & Defaults */}
          {settingsTab === 'portal' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Academic Session
                  </label>
                  <input
                    type="text"
                    value={settingsForm.academicSession}
                    onChange={(e) => setSettingsForm({ ...settingsForm, academicSession: e.target.value })}
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Currency Display
                  </label>
                  <input
                    type="text"
                    value={settingsForm.currency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <p className="font-semibold text-slate-800">QR Attendance Strict Duplicate Protection</p>
                    <p className="text-slate-400">Prevent scanning student or staff member more than once per day</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <p className="font-semibold text-slate-800">Automated Receipt Numbering</p>
                    <p className="text-slate-400">Auto-generate RCP-YYYY-XXXX sequences on payment collection</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <p className="font-semibold text-slate-800">Admit Card Principal Digital Stamp</p>
                    <p className="text-slate-400">Embed verified administrative crest on printable student admit cards</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Language & Regional Timezone */}
          {settingsTab === 'language' && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              {/* Language Selection */}
              <div>
                <div className="mb-3">
                  <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider">
                    {t('settings.lang_heading', 'Interface Language')}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {t('settings.lang_subheading', 'Choose the display language for menus, labels, forms, and statements.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SUPPORTED_LANGUAGES.map((langItem) => {
                    const isSelected = settingsForm.language === langItem.code;
                    return (
                      <div
                        key={langItem.code}
                        onClick={() => setSettingsForm((prev) => ({ ...prev, language: langItem.code }))}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{langItem.flag}</span>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <p className="font-bold text-sm text-[#172554]">{langItem.name}</p>
                        <p className="text-xs text-blue-700 font-semibold">{langItem.nativeName}</p>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          {langItem.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Country & Timezone Selection */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider mb-1">
                    {t('settings.tz_heading', 'Country & Regional Timezone')}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {t('settings.tz_subheading', 'Select your country and regional timezone to sync live clocks, timestamps, and reports.')}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Country & Timezone <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={settingsForm.timezone}
                      onChange={(e) => setSettingsForm((prev) => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {SUPPORTED_TIMEZONES.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.flag} {tz.country} — {tz.city} ({tz.offset})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Timezone Clock Preview */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {t('settings.preview_time', 'Current Time in Selected Timezone:')}
                      </p>
                      <p className="text-base font-extrabold text-[#172554] font-mono">
                        {formatZonedTime(liveTime, settingsForm.timezone, settingsForm.language, true)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-200/60">
                      {SUPPORTED_TIMEZONES.find((z) => z.id === settingsForm.timezone)?.offset || 'GMT+6'}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {formatZonedDate(liveTime, settingsForm.timezone, settingsForm.language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live System Preview Banner */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 rounded-2xl border border-blue-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Real-Time Institutional Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Session: {settingsForm.academicSession}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={settingsForm.logo}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-[#172554] truncate">
                    {settingsForm.schoolName || 'Institution Name'}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#2563EB]">
                    {settingsForm.institutionType}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 truncate">
                  {settingsForm.institutionName}
                </p>
                <p className="text-[10.5px] text-slate-400 truncate">
                  {settingsForm.address} • Estd: {settingsForm.establishedYear} • EIIN: {settingsForm.eiin}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                resetSchoolSettings();
                setSettingsForm(DEFAULT_SCHOOL_SETTINGS);
              }}
              className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Defaults</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Settings & Apply Across System</span>
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Change Password */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Security Password"
        subtitle="Ensure your administrative account uses a strong password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
