
import React from 'react';
import { FileText, FileJson, Table, ShieldCheck, ArrowRight, Download, CheckCircle2 } from 'lucide-react';

export const ArtifactsSection: React.FC = () => {
  const artifacts = [
    { id: '1', name: 'M1_Shadow_Audit_v1.pdf', type: 'PDF', icon: FileText, size: '2.4 MB', status: 'Approved' },
    { id: '2', name: 'M1_Anti_Incentive_Table.xlsx', type: 'XLSX', icon: Table, size: '1.1 MB', status: 'Approved' },
    { id: '3', name: 'M1_Hook_Library.json', type: 'JSON', icon: FileJson, size: '45 KB', status: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg shadow-blue-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Faz Çıktıları (Artifacts)</h3>
              <p className="text-slate-500 text-sm">M1: Psycho Map - Üretilen operasyonel varlıklar.</p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            Faz Tamamlandı
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {artifacts.map((art) => (
            <div key={art.id} className="border border-slate-100 bg-slate-50 p-4 rounded-xl flex items-center justify-between group hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 mr-3 group-hover:text-blue-500 transition-colors">
                  <art.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{art.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">{art.type} • {art.size}</p>
                </div>
              </div>
              <Download className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">M1: Behavioral Analysis Özeti</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Gölge Yan:</strong> Yöneticilerde &quot;Kontrol Kaybı&quot; ve &quot;AI tarafından yönetilme&quot; korkusu %85 oranında birincil direnç noktası.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Antidot:</strong> AI&apos;yı bir &quot;asistan&quot; değil, yöneticiye stratejik üstünlük sağlayan bir &quot;Exoskeleton&quot; (Dış İskelet) olarak konumlandırma kararı alındı.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Kritik Sürtünme:</strong> Prompt yazma zahmeti (Puan: 9/10). Çözüm: Tek tıkla çıktı üreten &quot;Executive UI&quot; akışı.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-5">
            <ShieldCheck className="h-48 w-48 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-6 flex items-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
          M1 DoD (Definition of Done) Kontrolü
        </h4>
        <div className="space-y-3">
          {[
            "12 adet gölge yan tanımlanmış mı? (PASSED)",
            "Her gölge yan için 1 antidot var mı? (PASSED)",
            "Kancaların duygusal tonu belirlendi mi? (PASSED)",
            "Sürtünme noktaları 1-10 arası puanlandı mı? (PASSED)",
            "Karanlık Üçlü (Dark Triad) analizi yapıldı mı? (PASSED)"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-slate-50 rounded-lg hover:bg-slate-50">
              <span className="text-sm text-slate-600">{item}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ONAYLI</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-indigo-600 font-bold text-sm">
              M4 (Aha Map) Handoff Notu Hazır <ArrowRight className="ml-2 h-4 w-4" />
            </div>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
              Fazı Onayla & Devret
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
