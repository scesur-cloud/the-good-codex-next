
import React, { useState, useMemo, useEffect } from 'react';
import { PHASE_CHECKLISTS, ROLES, RACI_TABLE } from '../constants';
import { TaskStatus, Notification } from '../types';
import { Storage } from '../storage';
import { AuthService } from '../services/auth';
import { CheckCircle2, Circle, Clock, AlertCircle, ShieldCheck, Filter, User, Lock, Ban, Gavel } from 'lucide-react';

export const ChecklistSection: React.FC<{ currentUserRole: string }> = ({ currentUserRole }) => {
  const [checklists, setChecklists] = useState(PHASE_CHECKLISTS);
  const [filterRole, setFilterRole] = useState<string>('all');

  const notifyGM = (task: string, status: TaskStatus) => {
    let msg = "";
    if (status === TaskStatus.REVIEW) {
      msg = "UZMAN ONAYI: Görev gözden geçirme bekliyor.";
    } else if (status === TaskStatus.BLOCKED) {
      msg = "ACİL: GÖREV BLOKLANDI! Operasyon durduruldu.";
    }

    const notification: Notification = {
      id: 'notif_chk_' + Date.now(),
      projectId: 'global',
      projectName: 'Global Denetim',
      phaseId: 'checklist',
      phaseTitle: task,
      status,
      message: msg,
      createdAt: Date.now(),
      read: false
    };
    Storage.saveNotification(notification);
  };

  const setStatus = (id: string, roleId: string, newStatus: TaskStatus) => {
    if (newStatus === TaskStatus.DONE && currentUserRole !== 'GM_PM') {
      alert("HATA: Sadece GM/PM bu görevi 'Tamamlandı' olarak işaretleyebilir.");
      return;
    }

    if (currentUserRole !== 'GM_PM' && currentUserRole !== roleId && currentUserRole !== 'QA_GOD') {
      alert("HATA: Bu görevi sadece GM/PM, QA God veya ilgili uzman değiştirebilir.");
      return;
    }

    setChecklists(prevChecklists =>
      prevChecklists.map(phase => ({
        ...phase,
        items: phase.items.map(item => {
          if (item.id === id) {
            if (newStatus === TaskStatus.REVIEW || newStatus === TaskStatus.BLOCKED) {
              notifyGM(item.task, newStatus);
            }
            return { ...item, status: newStatus };
          }
          return item;
        })
      }))
    );
  };

  const toggleStatus = (id: string, roleId: string, currentStatus: TaskStatus) => {
    let nextStatus: TaskStatus;
    if (currentStatus === TaskStatus.NOT_STARTED) nextStatus = TaskStatus.IN_PROGRESS;
    else if (currentStatus === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.REVIEW;
    else if (currentStatus === TaskStatus.REVIEW) nextStatus = TaskStatus.DONE;
    else nextStatus = TaskStatus.NOT_STARTED;

    setStatus(id, roleId, nextStatus);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case TaskStatus.REVIEW: return <Clock className="h-5 w-5 text-amber-500" />;
      case TaskStatus.IN_PROGRESS: return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case TaskStatus.BLOCKED: return <Ban className="h-5 w-5 text-red-500" />;
      default: return <Circle className="h-5 w-5 text-slate-300" />;
    }
  };

  const getRoleName = (id: string) => ROLES.find(r => r.id === id)?.name || id;

  const getApproverForTask = (taskName: string) => {
    const messagePart = taskName.split(':')[0].trim();
    const mapping = RACI_TABLE.find(r => r.messageId === messagePart);
    return mapping ? getRoleName(mapping.accountable) : "GM/PM";
  };

  const filteredChecklists = useMemo(() => {
    if (filterRole === 'all') return checklists;
    return checklists.map(phase => ({
      ...phase,
      items: phase.items.filter(item => item.roleId === filterRole)
    })).filter(phase => phase.items.length > 0);
  }, [checklists, filterRole]);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-3 flex items-center gap-3">
            <Gavel className="h-7 w-7 text-red-500" />
            Work Observation Checklist (Alpha-Omega)
          </h3>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed font-medium">
            <strong>OPERASYONEL KURAL:</strong> Sorumlu (R), statü değişikliği teklif eder (Review);
            Ancak sadece <strong>Hesap Verebilir (A)</strong> otorite &apos;DONE&apos; onayını verebilir.
          </p>
        </div>
        <div className="absolute right-0 top-0 p-8 opacity-5">
          <ShieldCheck className="h-48 w-48" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center text-slate-700 font-black text-xs uppercase tracking-widest">
          <Filter className="h-4 w-4 mr-2 text-indigo-600" />
          Uzman Filtresi
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${filterRole === 'all' ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
          >
            Tümü
          </button>
          {ROLES.filter(r => r.id !== 'GM_PM').map(role => (
            <button
              key={role.id}
              onClick={() => setFilterRole(role.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${filterRole === role.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {filteredChecklists.map((phase, pIdx) => (
          <div key={pIdx} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-50 px-10 py-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-sm">{phase.phase}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Birim Denetleyici: GM/PM Onayı Gerekli</p>
              </div>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                {phase.items.filter(i => i.status === TaskStatus.DONE).length} / {phase.items.length} GÖREV TAMAM
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {phase.items.map((item) => {
                const canChange = currentUserRole === 'GM_PM' || currentUserRole === item.roleId || currentUserRole === 'QA_GOD';
                return (
                  <div
                    key={item.id}
                    className={`px-10 py-6 flex items-center justify-between hover:bg-indigo-50/30 transition-all group ${canChange ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    <div className="flex items-center flex-1 pr-10" onClick={() => canChange && toggleStatus(item.id, item.roleId, item.status)}>
                      <div className="mr-6 flex-shrink-0">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="space-y-2">
                        <p className={`text-base font-bold tracking-tight ${item.status === TaskStatus.DONE ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {item.task}
                        </p>
                        <div className="flex items-center gap-6">
                          <span className="flex items-center text-[10px] text-slate-500 uppercase font-black tracking-widest">
                            <User className="h-3 w-3 mr-1.5 text-blue-500" /> R: {getRoleName(item.roleId)}
                          </span>
                          <span className="flex items-center text-[10px] text-indigo-600 uppercase font-black tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">
                            <ShieldCheck className="h-3 w-3 mr-1.5" /> A: {getApproverForTask(item.task)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2 mb-1">
                        {canChange && item.status !== TaskStatus.BLOCKED && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setStatus(item.id, item.roleId, TaskStatus.BLOCKED); }}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="STOP-THE-LINE"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {!canChange && <Lock className="h-4 w-4 text-slate-300" />}
                      </div>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border uppercase tracking-widest min-w-[140px] text-center transition-all ${item.status === TaskStatus.DONE ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-100' :
                          item.status === TaskStatus.REVIEW ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-100' :
                            item.status === TaskStatus.IN_PROGRESS ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100' :
                              item.status === TaskStatus.BLOCKED ? 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-100 animate-pulse' :
                                'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                        {item.status === TaskStatus.DONE ? 'TAMAM' :
                          item.status === TaskStatus.REVIEW ? 'İNCELENİYOR' :
                            item.status === TaskStatus.IN_PROGRESS ? 'ÜRETİMDE' :
                              item.status === TaskStatus.BLOCKED ? 'STOPPED' : 'BEKLEMEDE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
