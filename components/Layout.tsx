
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Table2, 
  CheckSquare, 
  Users, 
  CalendarClock,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Archive,
  Bell,
  Check,
  AlertTriangle,
  Clock,
  Trash2,
  ChevronDown,
  XCircle
} from 'lucide-react';
import { Storage } from '../storage';
import { ROLES } from '../constants';
import { Notification, TaskStatus } from '../types';

interface LayoutProps {
  // Fix: Changed React.Node to React.ReactNode as 'Node' is not a member of the React namespace.
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  currentUserRole: string;
  onRoleChange: (role: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, currentUserRole, onRoleChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      const allNotifs = Storage.getNotifications();
      setNotifications(allNotifs);
      
      const projects = Storage.getProjects();
      let totalBlocked = 0;
      projects.forEach(p => {
        const phases = Storage.getPhases(p.id);
        totalBlocked += phases.filter(ph => ph.status === TaskStatus.BLOCKED).length;
      });
      setBlockedCount(totalBlocked);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    Storage.markNotificationRead(id);
    setNotifications(Storage.getNotifications());
  };

  const clearAll = () => {
    Storage.clearAllNotifications();
    setNotifications([]);
  };

  const activeRoleObj = ROLES.find(r => r.id === currentUserRole) || ROLES[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 z-20 shadow-2xl">
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter text-indigo-400">THE GOD CODEX</h1>
          <p className="text-[10px] text-slate-500 mt-1 font-black uppercase tracking-[0.3em]">İş İndeksi v1.1</p>
        </div>
        <nav className="mt-4 px-3 space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-4 w-4 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto p-8 bg-slate-950/40 border-t border-white/5">
          <div className="flex items-center text-[10px] text-amber-500 font-black mb-3 uppercase tracking-widest">
            <ShieldAlert className="h-4 w-4 mr-2" />
            STOP-THE-LINE QA
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
            Herhangi bir fazda kritik hata tespit edilirse üretim GM/PM onayıyla durdurulur.
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {blockedCount > 0 && (
          <div className="bg-red-600 text-white px-8 py-3 flex items-center justify-between sticky top-0 z-30 animate-pulse border-b border-red-700 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">KRİTİK: {blockedCount} FAZ BLOKLANDI! SİSTEM DURDURULDU.</span>
            </div>
            <button onClick={() => onTabChange('projects')} className="text-[10px] font-black bg-white text-red-600 px-4 py-1.5 rounded-lg uppercase hover:bg-red-50 transition-colors shadow-lg">FAZLARI DENETLE</button>
          </div>
        )}

        <header className={`bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky ${blockedCount > 0 ? 'top-[48px]' : 'top-0'} z-10 transition-all shadow-sm`}>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
            {menuItems.find(i => i.id === activeTab)?.label || 'Panel'}
          </h2>
          <div className="flex items-center gap-6">
            
            <button 
              onClick={() => onTabChange('faq')}
              title="Hızlı Yardım & SSS"
              className={`p-2.5 rounded-xl transition-all border ${activeTab === 'faq' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'text-slate-400 hover:bg-slate-100 border-slate-200'}`}
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 bg-white shadow-sm"
              >
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-inner ${activeRoleObj.isAccountable ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                  {activeRoleObj.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5">{activeRoleObj.name}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">{activeRoleObj.id}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Rol Değiştir (Görünüm)</div>
                  <div className="max-h-80 overflow-y-auto py-2">
                    {ROLES.map(role => (
                      <button 
                        key={role.id}
                        onClick={() => {
                          onRoleChange(role.id);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 flex items-center gap-4 transition-all ${currentUserRole === role.id ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}
                      >
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-[9px] font-black shadow-sm ${role.isAccountable ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                          {role.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className={`text-xs font-black ${currentUserRole === role.id ? 'text-indigo-600' : 'text-slate-800'}`}>{role.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{role.isAccountable ? 'Hesap Verebilir (A)' : 'Sorumlu (R)'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all border ${isNotifOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'text-slate-400 hover:bg-slate-100 border-slate-200'}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[9px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Sistem Bildirimleri</span>
                    <button onClick={clearAll} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-5 border-b border-slate-50 flex gap-4 hover:bg-slate-50 transition-all ${!n.read ? 'bg-indigo-50/20' : ''}`}
                        >
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                            n.status === TaskStatus.BLOCKED ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {n.status === TaskStatus.BLOCKED ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-900 truncate mb-1 uppercase tracking-tight">{n.projectName}</p>
                            <p className="text-xs text-slate-600 font-bold mb-2 leading-snug">{n.phaseTitle}: {n.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</p>
                              {!n.read && (
                                <button onClick={() => markRead(n.id)} className="text-indigo-600 hover:text-indigo-800 font-black text-[9px] uppercase tracking-widest flex items-center gap-1">
                                  <Check className="h-3 w-3" /> OKUNDU İŞARETLE
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-300">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Bildirim bulunmuyor.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

const menuItems = [
  { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'projects', label: 'Projeler', icon: Archive },
  { id: 'planner', label: 'Planlayıcı', icon: Sparkles },
  { id: 'raci', label: 'RACI Matrisi', icon: Table2 },
  { id: 'checklist', label: 'İş Listesi', icon: CheckSquare },
  { id: 'roles', label: 'Rol Tanımları', icon: Users },
  { id: 'cadence', label: 'Zaman Çizelgesi', icon: CalendarClock },
  { id: 'faq', label: 'SSS', icon: HelpCircle },
];
