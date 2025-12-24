
import React, { useState, useMemo } from 'react';
import { RACI_TABLE, ROLES } from '../constants';
import { Storage } from '../storage';
import {
  LayoutDashboard,
  GitPullRequest,
  ArrowRight,
  User,
  Shield,
  Info,
  Users,
  CheckCircle2,
  Link,
  Share2,
  Target,
  Package,
  Forward,
  Zap,
  Network,
  ArrowDown,
  Box
} from 'lucide-react';

interface RACIVisualizerProps {
  projectId?: string;
}

export const RACIVisualizer: React.FC<RACIVisualizerProps> = ({ projectId }) => {
  const [viewMode, setViewMode] = useState<'heatmap' | 'flow' | 'nexus'>('flow');
  const [highlightRole, setHighlightRole] = useState<string | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  const projectPhases = useMemo(() => {
    if (!projectId) return null;
    return Storage.getPhases(projectId);
  }, [projectId]);

  const project = useMemo(() => {
    if (!projectId) return null;
    return Storage.getProjects().find(p => p.id === projectId);
  }, [projectId]);

  const allRoles = useMemo(() => Storage.getRoles(), []);
  const activeRoles = useMemo(() =>
    allRoles.filter(r => !project || project.selectedRoleIds.includes(r.id)),
    [allRoles, project]
  );

  const getStatus = (phaseNo: string, roleId: string) => {
    if (projectPhases) {
      const msgNo = parseInt(phaseNo.replace('M', ''));
      const phase = projectPhases.find(p => p.messageNo === msgNo);
      if (phase) {
        if (phase.ownerRole === roleId) return 'R';
        if (roleId === 'GM_PM') return 'A';
        if (phase.consultedRoles?.includes(roleId)) return 'C';
        if (phase.informedRoles?.includes(roleId)) return 'I';
      }
      return null;
    }

    const entry = RACI_TABLE.find(r => r.messageId === phaseNo);
    if (!entry) return null;
    if (entry.responsible === roleId) return 'R';
    if (entry.accountable === roleId) return 'A';
    if (entry.handoff.receiver === roleId) return 'I';
    return null;
  };

  const statusColors: Record<string, string> = {
    'R': 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-100',
    'A': 'bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-100',
    'C': 'bg-indigo-500 text-white border-indigo-600 shadow-sm',
    'I': 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const statusLabels: Record<string, string> = {
    'R': 'RESPONSIBLE',
    'A': 'ACCOUNTABLE',
    'C': 'CONSULTED',
    'I': 'INFORMED'
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Network className="h-7 w-7 text-indigo-600" />
            {project ? `${project.name} - Operasyonel Nexus` : 'God Codex RACI & Handoff Pipeline'}
          </h3>
          <p className="text-sm text-slate-500 font-medium max-w-2xl">
            M1&apos;den M10&apos;a artifact akışı, rol transferleri ve sorumluluk hiyerarşisi.
            <strong> Belirsizliğin operasyonel bir suç olduğu </strong> prensibiyle tasarlandı.
          </p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden shrink-0">
          <button
            onClick={() => setViewMode('flow')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center transition-all ${viewMode === 'flow' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <GitPullRequest className="h-4 w-4 mr-2" /> PIPELINE
          </button>
          <button
            onClick={() => setViewMode('nexus')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center transition-all ${viewMode === 'nexus' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Share2 className="h-4 w-4 mr-2" /> NEXUS
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center transition-all ${viewMode === 'heatmap' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" /> MATRİS
          </button>
        </div>
      </div>

      {
        viewMode === 'flow' && (
          <div className="space-y-0 relative animate-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto py-12">
            {RACI_TABLE.map((row, idx) => {
              const responsibleRole = allRoles.find(r => r.id === (projectPhases?.find(p => p.messageNo === idx + 1)?.ownerRole || row.responsible));
              const receiverRole = allRoles.find(r => r.id === row.handoff.receiver);
              const status = projectPhases?.find(p => p.messageNo === idx + 1)?.status;
              const isLast = idx === RACI_TABLE.length - 1;

              return (
                <React.Fragment key={row.messageId}>
                  <div className="flex flex-col md:flex-row items-stretch gap-8 relative">
                    {/* Step Number Badge */}
                    <div className="flex flex-col items-center shrink-0 w-20">
                      <div className={`h-16 w-16 rounded-[2rem] flex items-center justify-center font-black text-white text-xl shadow-2xl z-10 transition-all hover:scale-110 border-4 border-white ${status === 'Done' ? 'bg-emerald-500' :
                        status === 'Blocked' ? 'bg-red-600 animate-pulse' :
                          'bg-slate-900'
                        }`}>
                        {row.messageId}
                      </div>
                      {!isLast && (
                        <div className="w-1 bg-slate-200 flex-1 min-h-[100px] mt-2 mb-2 rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-indigo-500 animate-pulse opacity-20"></div>
                        </div>
                      )}
                    </div>

                    {/* Flowchart Card */}
                    <div className="flex-1 pb-12">
                      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all">
                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Phase Info */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 uppercase tracking-widest">{row.phase}</span>
                              {status === 'Done' && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[8px] font-black">VALIDATED</span>}
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{row.title}</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{row.dod}</p>
                          </div>

                          {/* Handoff Diagram */}
                          <div className="lg:w-72 space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 relative shadow-inner">
                            {/* Sender */}
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-md">
                                {responsibleRole?.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sorumlu (R)</p>
                                <p className="text-[11px] font-bold text-slate-900 truncate">{responsibleRole?.name}</p>
                              </div>
                            </div>

                            {/* Connector */}
                            <div className="flex flex-col items-center py-2">
                              <div className="w-px h-8 bg-indigo-200"></div>
                              <div className="bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm -my-1 z-10">
                                <Box className="h-3 w-3 text-indigo-600" />
                              </div>
                              <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mt-2">
                                {row.handoff.artifacts.map((art, artIdx) => (
                                  <span key={artIdx} className="text-[8px] font-black bg-white border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-lg shadow-sm">
                                    {art}
                                  </span>
                                ))}
                              </div>
                              <div className="w-px h-8 bg-indigo-200 mt-2"></div>
                              <ArrowDown className="h-3 w-3 text-indigo-400 -mt-1" />
                            </div>

                            {/* Receiver */}
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-indigo-400 font-black text-[10px] shadow-md border border-white/10">
                                {receiverRole?.name.split(' ').map(n => n[0]).join('') || '?'}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Alıcı (Receiver)</p>
                                <p className="text-[11px] font-bold text-slate-900 truncate">{receiverRole?.name || 'Gelecek Aşama'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )
      }

      {
        viewMode === 'nexus' && (
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-10 shadow-inner relative overflow-hidden min-h-[700px] animate-in fade-in zoom-in-95 duration-700">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Left Column: Roles */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 ml-4 flex items-center gap-3">
                  <Users className="h-4 w-4 text-indigo-500" /> Operasyonel Roller
                </h4>
                <div className="space-y-3">
                  {activeRoles.map(role => (
                    <div
                      key={role.id}
                      onMouseEnter={() => setHighlightRole(role.id)}
                      onMouseLeave={() => setHighlightRole(null)}
                      className={`p-4 bg-white border rounded-2xl transition-all cursor-pointer shadow-sm group ${highlightRole === role.id ? 'border-indigo-500 scale-105 shadow-xl -translate-x-2' :
                        highlightRole ? 'opacity-40 scale-95' : 'border-slate-100 hover:border-indigo-300'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${role.id === 'GM_PM' ? 'bg-indigo-600 shadow-lg' : 'bg-slate-800 shadow-md'}`}>
                          {role.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{role.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{role.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Phases */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 mr-4 text-right flex items-center justify-end gap-3">
                  İş Akışı (M1-M10) <Target className="h-4 w-4 text-indigo-500" />
                </h4>
                <div className="space-y-3">
                  {RACI_TABLE.map(row => {
                    const isActive = hoveredPhase === row.messageId;
                    const phaseStatus = getStatus(row.messageId, highlightRole || '');

                    return (
                      <div
                        key={row.messageId}
                        onMouseEnter={() => setHoveredPhase(row.messageId)}
                        onMouseLeave={() => setHoveredPhase(null)}
                        className={`p-4 bg-white border rounded-2xl transition-all cursor-pointer shadow-sm text-right group ${isActive ? 'border-indigo-500 scale-105 shadow-xl translate-x-2' :
                          hoveredPhase ? 'opacity-40 scale-95' : 'border-slate-100 hover:border-indigo-300'
                          }`}
                      >
                        <div className="flex items-center justify-end gap-4">
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{row.title}</p>
                            <div className="flex gap-2 items-center mt-1">
                              {highlightRole && phaseStatus && (
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${statusColors[phaseStatus]}`}>
                                  {statusLabels[phaseStatus]}
                                </span>
                              )}
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{row.phase}</p>
                            </div>
                          </div>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${isActive ? 'bg-indigo-600 shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                            {row.messageId}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Role Context Overlay */}
            {highlightRole && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-2xl font-black">
                    {activeRoles.find(r => r.id === highlightRole)?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xl font-black">{activeRoles.find(r => r.id === highlightRole)?.name}</h5>
                    <p className="text-xs text-slate-400 mt-1">{activeRoles.find(r => r.id === highlightRole)?.definition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Nexus Bağlantı</p>
                    <div className="flex gap-2">
                      {['R', 'A', 'C', 'I'].map(tag => {
                        const count = RACI_TABLE.filter(row => getStatus(row.messageId, highlightRole) === tag).length;
                        if (count === 0) return null;
                        return (
                          <div key={tag} className="flex flex-col items-center">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${statusColors[tag]}`}>{tag}</span>
                            <span className="text-[8px] font-bold mt-1 text-slate-500">{count} Faz</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      {
        viewMode === 'heatmap' && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-left sticky left-0 bg-slate-900 z-20 min-w-[200px] border-r border-white/5">FAZ / MESAJ</th>
                    {activeRoles.map(role => (
                      <th key={role.id} className={`p-6 text-[10px] font-black uppercase tracking-widest text-center min-w-[120px] transition-opacity ${highlightRole && highlightRole !== role.id ? 'opacity-30' : 'opacity-100'}`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs ${role.id === 'GM_PM' ? 'bg-indigo-500' : 'bg-white/10'}`}>
                            {role.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="max-w-[100px] truncate">{role.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RACI_TABLE.map(row => (
                    <tr key={row.messageId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6 sticky left-0 bg-white z-10 border-r border-slate-100 min-w-[200px] shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{row.messageId}</span>
                          <span className="text-xs font-black text-slate-800 tracking-tight">{row.title}</span>
                        </div>
                      </td>
                      {activeRoles.map(role => {
                        const status = getStatus(row.messageId, role.id);
                        const isHighlighted = highlightRole === role.id;
                        return (
                          <td key={role.id} className={`p-4 text-center transition-all ${highlightRole && !isHighlighted ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                            {status ? (
                              <div className={`mx-auto w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 cursor-help group-hover:scale-110 transition-transform ${statusColors[status]}`} title={statusLabels[status]}>
                                {status}
                              </div>
                            ) : (
                              <div className="mx-auto w-1.5 h-1.5 bg-slate-200 rounded-full group-hover:scale-150 transition-transform"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div >
  );
};
