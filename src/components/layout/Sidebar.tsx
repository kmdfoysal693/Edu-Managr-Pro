import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NAVIGATION_ITEMS, MenuItem } from '../../config/navigation';
import { ChevronDown, ChevronRight, School, PanelLeftClose, PanelLeft, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    setCurrentRoute,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    notices,
    transactions,
    schoolSettings,
    t,
  } = useSchool();

  // Find which parent menu the currentRoute belongs to and open it by default
  const getParentMenuId = (route: string) => {
    const parent = NAVIGATION_ITEMS.find((item) => item.subItems.some((sub) => sub.id === route));
    return parent ? parent.id : 'dashboard';
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialParent = getParentMenuId(currentRoute);
    return { [initialParent]: true };
  });

  useEffect(() => {
    const parentId = getParentMenuId(currentRoute);
    setOpenMenus((prev) => ({ ...prev, [parentId]: true }));
  }, [currentRoute]);

  const toggleSubMenu = (menuId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      toggleSubMenu(item.id);
      if (item.defaultSubItem) {
        setCurrentRoute(item.defaultSubItem);
      }
      return;
    }

    toggleSubMenu(item.id);
    if (item.subItems.length === 1) {
      setCurrentRoute(item.subItems[0].id);
      setIsMobileSidebarOpen(false);
    }
  };

  const handleSubItemClick = (subId: string) => {
    setCurrentRoute(subId);
    setIsMobileSidebarOpen(false);
  };

  // Dynamic badges for pending things
  const pendingNoticesCount = notices.filter((n) => n.priority === 'Urgent').length;
  const pendingFeesCount = transactions.filter((t) => t.status === 'Pending').length;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/90 bg-white shrink-0">
        <div
          onClick={() => setCurrentRoute('dashboard-overview')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={schoolSettings.logo}
              alt={`${schoolSettings.schoolName} Logo`}
              className="w-full h-full object-contain"
            />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <span className="block text-base font-black text-[#172554] tracking-tight leading-tight truncate">
                {schoolSettings.schoolName}
              </span>
              <span className="block text-xs font-semibold text-blue-600 truncate">
                {schoolSettings.tagline} • {schoolSettings.establishedYear}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {!isSidebarCollapsed && (
          <p className="px-3 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Main Management
          </p>
        )}

        {NAVIGATION_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          const isParentActive = item.subItems.some((sub) => sub.id === currentRoute);
          const isOpen = openMenus[item.id];

          return (
            <div key={item.id} className="relative">
              {/* Parent Navigation Item */}
              <button
                type="button"
                onClick={() => handleMenuItemClick(item)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${
                  isParentActive && !isOpen
                    ? 'bg-blue-50 text-[#2563EB]'
                    : isParentActive
                    ? 'text-[#2563EB]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ItemIcon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isParentActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{t('nav.' + item.id, item.label)}</span>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.id === 'notice' && pendingNoticesCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                        {pendingNoticesCount}
                      </span>
                    )}
                    {item.id === 'finances' && pendingFeesCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                        {pendingFeesCount}
                      </span>
                    )}
                    {item.subItems.length > 1 && (
                      <div className="text-slate-400">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                )}
              </button>

              {/* Submenu Accordion */}
              {!isSidebarCollapsed && isOpen && item.subItems.length > 0 && (
                <div className="mt-1 ml-4 pl-3.5 border-l-2 border-slate-150 space-y-1 transition-all duration-200">
                  {item.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = currentRoute === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubItemClick(sub.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all duration-150 cursor-pointer ${
                          isSubActive
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{t(sub.id, sub.label)}</span>
                        </div>

                        {sub.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider shrink-0 ${
                              sub.badgeColor || 'bg-blue-100 text-[#2563EB]'
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer System Info */}
      {!isSidebarCollapsed && (
        <div className="p-3.5 border-t border-slate-200/90 bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">System Version</span>
            <span className="px-2 py-0.5 bg-slate-200/70 rounded text-xs font-mono font-bold text-slate-700">v3.4.0 (2026)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">Currency: Bangladeshi Taka (BDT)</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
