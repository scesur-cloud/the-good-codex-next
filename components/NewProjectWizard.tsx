
import React, { useState } from 'react';
import { Storage } from '../storage';
import { Project, Phase, TaskStatus } from '../types';
import { PHASE_TEMPLATES } from '../constants';
import { EDU_LEVELS, EDU_MODES } from '../edu_constants';
import { RoleEngine } from '../role_engine';
import { Sparkles, ArrowRight, Loader2, Settings, Info, GraduationCap, Layout } from 'lucide-react';

export const NewProjectWizard: React.FC<{ onComplete: (projectId: string) => void }> = ({ onComplete }) => {
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'createdAt' | 'selectedRoleIds'>>({
    name: '',
    goal: '',
    targetAudience: '',
    channel: 'LinkedIn',
    productType: 'PDF',
    constraints: '',
    existingAssets: '',
    autoAssignRoles: true,
    maxRoles: null,
    eduLevel: '',
    eduMode: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const projectId = 'proj_' + Date.now();
    const availableRoles = Storage.getRoles();
    
    // Taxonomy-driven extraction
    const mockProj: Project = { ...formData, id: projectId, createdAt: Date.now(), selectedRoleIds: [] };
    const selectedRoleIds = formData.autoAssignRoles 
      ? RoleEngine.selectRoles(mockProj, availableRoles, formData.maxRoles)
      : Array.from(new Set([...Object.values(PHASE_TEMPLATES).map(t => t.ownerRole), 'GM_PM']));

    const newProject: Project = {
      ...formData,
      id: projectId,
      createdAt: Date.now(),
      selectedRoleIds
    };

    // Initialize phases
    const phases: Phase[] = Object.entries(PHASE_TEMPLATES).map(([no, template]) => {
      let owner = template.ownerRole;
      if (!selectedRoleIds.includes(owner)) {
        owner = 'GM_PM';
      }

      const { consulted, informed } = RoleEngine.getPhaseInvolvement(owner, selectedRoleIds);

      return {
        id: `phase_${projectId}_${no}`,
        projectId,
        messageNo: parseInt(no),
        phaseTitle: template.phaseTitle,
        subtitle: template.subtitle,
        ownerRole: owner,
        status: TaskStatus.NOT_STARTED,
        dependencies: template.dependencies,
        dod: template.dodItems.map((text, idx) => ({ id: `dod_${no}_${idx}`, text, checked: false })),
        artifacts: [],
        handoffChecks: [false, false, false, false, false],
        consultedRoles: consulted,
        informedRoles: informed
      };
    });

    Storage.saveProject(newProject);
    Storage.savePhases(phases);

    setTimeout(() => {
      setLoading(false);
      onComplete(projectId);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-8">
        <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Yeni Proje Başlat</h2>
          <p className="text-slate-500 text-sm font-medium">God Codex standartlarında 10 fazlık planı otomatik oluşturun.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Proje Adı</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Örn: Müdürler İçin AI" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Kanal</label>
            <select value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value as any})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
              <option value="LinkedIn">LinkedIn</option><option value="IG">IG</option><option value="WhatsApp">WhatsApp</option><option value="Web">Web</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Layout className="h-3 w-3 text-indigo-500" /> EDU Modu
            </label>
            <select value={formData.eduMode} onChange={e => setFormData({...formData, eduMode: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
              <option value="">Genel Proje</option>
              {EDU_MODES.map(m => <option key={m.id} value={m.id}>{m.label_tr}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap className="h-3 w-3 text-indigo-500" /> Eğitim Seviyesi
            </label>
            <select value={formData.eduLevel} onChange={e => setFormData({...formData, eduLevel: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none">
              <option value="">Belirtilmedi</option>
              {EDU_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label_tr}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Hedef (Tek Cümle)</label>
          <input required value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Örn: 100 yöneticiye AI paketi satmak" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Hedef Kitle</label>
          <input required value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Örn: Kurumsal Müdürler" />
        </div>

        {/* Role Assignment Settings */}
        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-900">Otomatik Rol Tayin Sistemi (v2)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.autoAssignRoles} onChange={e => setFormData({...formData, autoAssignRoles: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {formData.autoAssignRoles && (
            <div className="animate-in fade-in duration-300 space-y-3">
              <div>
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Maksimum Uzman Sayısı</label>
                <input 
                  type="number" 
                  value={formData.maxRoles || ''} 
                  onChange={e => setFormData({...formData, maxRoles: e.target.value ? parseInt(e.target.value) : null})} 
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-300" 
                  placeholder="Örn: 100" 
                />
                <div className="mt-2 flex items-start gap-2">
                  <Info className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-indigo-400 italic font-medium leading-relaxed">
                    Eğitim seviyesi ve modu seçildiğinde, sistem o alandaki uzmanlara (Örn: {formData.eduLevel === 'okul_oncesi' ? 'Oyun Temelli Uzmanlar' : 'Müfredat Mimarları'}) öncelik verecektir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:bg-slate-300">
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <><Sparkles className="h-5 w-5 mr-2" /> God Codex Planını Başlat <ArrowRight className="ml-2 h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
};
