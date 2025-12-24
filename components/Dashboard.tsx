
import React from 'react';
import { MESSAGES, STOP_THE_LINE_PROTOCOLS } from '../constants';
import { ArrowRight, Target, Zap, ShieldCheck, AlertCircle, Gavel, UserCheck } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Toplam Teslimat</p>
            <p className="text-2xl font-bold text-slate-900">10 Mesaj</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-4">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Operasyonel Faz</p>
            <p className="text-2xl font-bold text-slate-900">Faz 0 - 5</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mr-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">QA Standartı</p>
            <p className="text-2xl font-bold text-slate-900">Sıfır Hata</p>
          </div>
        </div>
      </div>

      {/* Decision-Making & Stop-the-line Protocol */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-black uppercase tracking-widest flex items-center">
            <Gavel className="mr-2 h-5 w-5" /> Stop-the-line Karar Protokolü
          </h3>
          <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded font-bold">ALPHA TO OMEGA</span>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                <strong>The God Codex</strong> disiplininde, bir fazda blokaj yaşandığında hattın kim tarafından ve nasıl çekileceği önceden tanımlanmıştır. Belirsizlik bir operasyonel günahtır.
              </p>
              <div className="space-y-6">
                {STOP_THE_LINE_PROTOCOLS.steps.map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xs shrink-0 border border-red-200">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase">{s.action}</h4>
                      <p className="text-xs text-slate-500 mt-1">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center">
                  <UserCheck className="h-4 w-4 mr-2" /> Yetki Hiyerarşisi
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-sm font-bold text-slate-200">Karar Yetkisi:</span>
                    <span className="text-sm font-black text-white">GM/PM (Level 10)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-sm font-bold text-slate-200">Eskalasyon Süresi:</span>
                    <span className="text-sm font-black text-white">2 Saat (Triage)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-sm font-bold text-slate-200">Blokaj Hakkı:</span>
                    <span className="text-sm font-black text-white">Tüm Uzmanlar (R)</span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5">
                   <AlertCircle className="h-32 w-32" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center uppercase tracking-widest">
                  <AlertCircle className="h-4 w-4 mr-2" /> Karar Matrisi (Aksiyon)
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center p-2 bg-white rounded border border-amber-100 text-[11px] font-bold text-amber-900">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div> Devam: Risk Kabul Edildi
                  </div>
                  <div className="flex items-center p-2 bg-white rounded border border-amber-100 text-[11px] font-bold text-amber-900">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div> Pivot: Strateji/Kaynak Değiştir
                  </div>
                  <div className="flex items-center p-2 bg-white rounded border border-amber-100 text-[11px] font-bold text-amber-900">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div> Durdur: Hattı Kapat / İptal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Sequence */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">God Codex: Teslimat Akışı</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {MESSAGES.map((msg, idx) => (
            <div key={msg.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:border-blue-400 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-slate-200 group-hover:text-blue-100 font-black text-4xl">
                {idx + 1}
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                {msg.phase}
              </span>
              <h4 className="text-sm font-bold text-slate-800 mb-2 relative z-10">{msg.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 relative z-10">{msg.description}</p>
              <div className="flex items-center text-blue-600 text-xs font-semibold">
                Detaylar <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
