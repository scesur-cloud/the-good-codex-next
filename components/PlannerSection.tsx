
import React, { useState } from 'react';
import { Send, Sparkles, Loader2, FileJson, CheckCircle, AlertTriangle, Rocket, ArrowRight } from 'lucide-react';
import { getGeminiResponse } from '../services/gemini';
import { Storage } from '../storage';
import { Project, Phase, TaskStatus } from '../types';
import { PHASE_TEMPLATES } from '../constants';
import { RoleEngine } from '../role_engine';

interface PlannerSectionProps {
  onProjectCreated?: (projectId: string) => void;
}

export const PlannerSection: React.FC<PlannerSectionProps> = ({ onProjectCreated }) => {
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleGenerate = async () => {
    if (!brief.trim()) return;
    setIsGenerating(true);

    const prompt = `GÖREV: Aşağıdaki proje özeti (brief) için "The God Codex" standartlarında 10 fazlık tam operasyonel plan oluştur.
    
    PROJE ÖZETİ:
    ${brief}
    
    LÜTFEN ŞUNLARI ÜRET:
    1. Her Mesaj (M1-M10) için sorumlu rol, 3 kritik çıktı ve 5 somut DoD maddesi.
    2. RACI dağılımı.
    3. Bu projeye özel 3 'Stop-the-line' kuralı.
    
    FORMAT: Markdown formatında profesyonel ve yapılandırılmış bir rapor sun.`;

    const response = await getGeminiResponse(prompt);
    setPlan(response);
    setIsGenerating(false);
  };

  const handleApproveAndStart = () => {
    if (!brief.trim()) return;
    setIsStarting(true);

    const projectId = 'proj_ai_' + Date.now();
    const availableRoles = Storage.getRoles();

    // Create project object
    const newProject: Project = {
      id: projectId,
      name: brief.split('.')[0].slice(0, 40) + "...",
      goal: brief.slice(0, 100) + "...",
      targetAudience: "Belirleniyor (Plan içeriğine bakınız)",
      channel: 'Web',
      productType: 'App',
      constraints: "Planlayıcı tarafından oluşturuldu",
      existingAssets: "Yok",
      createdAt: Date.now(),
      autoAssignRoles: true,
      selectedRoleIds: [] // Will be populated below
    };

    // Use RoleEngine to select roles based on the plan/brief
    const selectedRoleIds = RoleEngine.selectRoles(newProject, availableRoles, 8);
    newProject.selectedRoleIds = selectedRoleIds;

    // Initialize phases from templates
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
        consultedRoles: consulted,
        informedRoles: informed
      };
    });

    Storage.saveProject(newProject);
    Storage.savePhases(phases);

    setTimeout(() => {
      setIsStarting(false);
      if (onProjectCreated) {
        onProjectCreated(projectId);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Operasyonel Planlayıcı</h3>
            <p className="text-slate-500 text-sm">Proje özetinizi girin, God Codex standartlarında tam planınızı oluşturun.</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Proje Özeti (Brief)</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Örn: Müdürler için yapay zeka araçlarını öğreten bir dijital eğitim platformu..."
            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm leading-relaxed"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !brief.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Plan Oluşturuluyor...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                God Codex Planını Başlat
              </>
            )}
          </button>
        </div>
      </div>

      {plan && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-slate-900 flex items-center">
              <FileJson className="mr-2 h-5 w-5 text-indigo-500" />
              Oluşturulan Operasyonel Plan
            </h4>
            <div className="flex gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-200 uppercase">Hazır</span>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-xl border border-slate-100">
            {plan}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Onay Mekanizması</p>
                <p className="text-xs text-blue-700 leading-relaxed">Yukarıdaki stratejik planı operasyonel hale getirmek için aşağıdaki onay butonunu kullanın.</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 mb-1 uppercase tracking-wider">Kritik Uyarı</p>
                <p className="text-xs text-amber-700 leading-relaxed">Onay sonrası M1 (Psycho Map) fazı otomatik olarak &apos;Üretim&apos; durumuna alınacaktır.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl">
            <button
              onClick={handleApproveAndStart}
              disabled={isStarting}
              className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  PROJE BAŞLATILIYOR...
                </>
              ) : (
                <>
                  <Rocket className="h-6 w-6 text-indigo-400" />
                  GOD CODEX: PLANI ONAYLA VE PROJEYİ BAŞLAT
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
