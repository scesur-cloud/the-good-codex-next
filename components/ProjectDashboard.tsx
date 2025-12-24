
import React, { useState, useEffect } from 'react';
import { Storage } from '../storage';
import { Project, Phase, TaskStatus, Notification } from '../types';
import { generateArtifact } from '../generator';
import { RACI_TABLE, ROLES } from '../constants';
import { RoleEngine } from '../role_engine';
import { LayoutDashboard, CheckCircle2, Circle, ArrowRight, FileText, Lock, Forward, Tag, SearchCheck, Clock, AlertTriangle } from 'lucide-react';

export const ProjectDashboard: React.FC<{ projectId: string, onSelectPhase: (msgNo: number) => void }> = ({ projectId, onSelectPhase }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);

  useEffect(() => {
    const allProj = Storage.getProjects();
    const current = allProj.find(p => p.id === projectId);
    if (current) {
      setProject(current);
      setPhases(Storage.getPhases(projectId));

      const corpus = `${current.name} ${current.goal} ${current.targetAudience} ${current.constraints} ${current.existingAssets}`.toLowerCase();
      setDetectedTags(RoleEngine.extractTags(corpus, current));
    }
  }, [projectId]);

  const notifyGM = (phase: Phase, status: TaskStatus, message: string) => {
    if (!project) return;
    const notification: Notification = {
      id: 'notif_dash_' + Date.now() + '_' + phase.id,
      projectId: project.id,
      projectName: project.name,
      phaseId: phase.id,
      phaseTitle: phase.phaseTitle,
      status,
      message,
      createdAt: Date.now(),
      read: false
    };
    Storage.saveNotification(notification);
  };

  const handleQuickGenerate = (phase: Phase) => {
    if (!project) return;
    const artifact = generateArtifact(project, phase);
    Storage.saveArtifact(artifact);

    const updatedPhase = {
      ...phase,
      artifacts: [...phase.artifacts, artifact.id],
      status: phase.status === TaskStatus.NOT_STARTED ? TaskStatus.IN_PROGRESS : phase.status
    };
    Storage.updatePhase(updatedPhase);
    setPhases(Storage.getPhases(projectId));
  };

  const handleQuickReview = (phase: Phase) => {
    if (!project) return;

    // In "The God Codex", only specialists or GM can move to review
    const updatedPhase: Phase = {
      ...phase,
      status: TaskStatus.REVIEW
    };

    Storage.updatePhase(updatedPhase);
    setPhases(Storage.getPhases(projectId));

    notifyGM(
      updatedPhase,
      TaskStatus.REVIEW,
      `FAZ İNCELEME TALEBİ: ${phase.phaseTitle} için tüm çalışmalar tamamlandı. GM onayı bekleniyor.`
    );
  };

  if (!project) return null;

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">{project.name}</h2>
              <p className="text-slate-400 text-sm font-medium">{project.goal}</p>
            </div>

            {detectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest mr-2">
                  <Tag className="h-3 w-3 mr-1" /> Algılanan Etiketler:
                </div>
                {detectedTags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-white/10 rounded-lg text-[9px] font-bold text-slate-300 border border-white/5 uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 flex gap-4">
            <div className="text-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Teslimat</p>
              <p className="text-2xl font-black">{phases.filter(p => p.status === TaskStatus.DONE).length}/10</p>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Ekip</p>
              <p className="text-2xl font-black">{project.selectedRoleIds.length}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
          <LayoutDashboard className="h-64 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {phases.sort((a, b) => a.messageNo - b.messageNo).map((phase) => {
          const isDone = phase.status === TaskStatus.DONE;
          const isReview = phase.status === TaskStatus.REVIEW;
          const isBlocked = phase.status === TaskStatus.BLOCKED;
          const dodCount = (phase.dod || []).filter(d => d.checked).length;
          const raciEntry = RACI_TABLE.find(r => r.messageId === `M${phase.messageNo}`);
          const receiverRole = ROLES.find(r => r.id === raciEntry?.handoff.receiver);

          return (
            <div key={phase.id} className={`bg-white border ${isBlocked ? 'border-red-500 ring-2 ring-red-50' : isReview ? 'border-amber-400 ring-2 ring-amber-50' : 'border-slate-200'} p-5 rounded-2xl shadow-sm group hover:border-indigo-400 transition-all flex flex-col h-full relative`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">M{phase.messageNo}</span>
                {isDone ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : isReview ? <Clock className="h-4 w-4 text-amber-500" /> : isBlocked ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <Circle className="h-4 w-4 text-slate-300" />}
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight">{phase.phaseTitle}</h4>
              <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase">{phase.ownerRole}</p>

              {receiverRole && (
                <div className="mb-4 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter flex items-center mb-1">
                    <Forward className="h-2 w-2 mr-1" /> Handoff Alıcı
                  </p>
                  <p className="text-[10px] font-bold text-blue-700 truncate">{receiverRole.name}</p>
                </div>
              )}

              <div className="mt-auto space-y-3">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all" style={{ width: `${(dodCount / ((phase.dod || []).length || 1)) * 100}%` }}></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => onSelectPhase(phase.messageNo)} className="flex-1 py-2 bg-slate-50 hover:bg-indigo-50 text-[10px] font-black uppercase rounded-xl border border-slate-200 text-slate-600 transition-colors">
                    Detaylar
                  </button>
                  {!isDone && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleQuickReview(phase)}
                        title="İncelemeye Gönder"
                        disabled={isReview}
                        className={`p-2 rounded-xl border transition-all shadow-sm ${isReview ? 'bg-amber-500 text-white border-amber-600 opacity-80' : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-500 hover:text-white'}`}
                      >
                        <SearchCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleQuickGenerate(phase)}
                        title="Hızlı Çıktı Üret"
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
