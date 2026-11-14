import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  BellRing,
  CheckCheck,
  Trash2,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  ExternalLink,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const {
    notifications,
    activityLogs,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setCurrentRoute,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'notifications' | 'audit'>('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType === 'unread' && n.read) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.module.toLowerCase().includes(q)
      );
    });
  }, [notifications, filterType, searchQuery]);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((l) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q) ||
        l.user.toLowerCase().includes(q)
      );
    });
  }, [activityLogs, searchQuery]);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#172554]">System Activity & Audit Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time notification feed and institutional audit trail across all modules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => setCurrentRoute('dashboard-overview')}
          >
            Back to Dashboard
          </Button>
          {unreadNotificationsCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCheck}
              onClick={markAllNotificationsAsRead}
            >
              Mark All Read ({unreadNotificationsCount})
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={clearNotifications}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Clear Notifications
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notifications'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Audit Trail ({activityLogs.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'notifications' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer ${
                    filterType === 'all' ? 'bg-white text-[#172554] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('unread')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer ${
                    filterType === 'unread' ? 'bg-white text-[#172554] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Unread ({unreadNotificationsCount})
                </button>
              </div>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by module, title, or detail..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {activeTab === 'notifications' ? (
          filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BellRing className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No matching notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                System actions across students, exams, attendance, and finances appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((item) => {
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
                      }
                    }}
                    className={`p-3.5 rounded-xl transition-colors flex items-start justify-between gap-3 ${
                      item.actionRoute ? 'cursor-pointer' : ''
                    } ${!item.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {isAlert || isWarning ? (
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isAlert ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : isSuccess ? (
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.module}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          {!item.read && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#172554] mt-1">{item.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                      </div>
                    </div>

                    {item.actionRoute && (
                      <span className="shrink-0 text-xs font-semibold text-[#2563EB] flex items-center gap-1 mt-1">
                        Open
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No audit trail records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-[#172554]">{log.action}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.details}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{log.user}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
