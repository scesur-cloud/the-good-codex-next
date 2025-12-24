
import React from 'react';

export const CadencePlan: React.FC = () => {
  const plans = [
    {
      title: "GÜN 1: Ship Plan (P0)",
      description: "Tüm stratejik altyapı ve kalkanların (M1, M2, M3) teslimi. Kritik blokajların temizlenmesi ve hattın kurulması.",
      items: ["Psycho Map Onayı", "Market Intel Validasyonu", "Shield Kurulumu (KVKK/Risk)"]
    },
    {
      title: "GÜN 2-7: Lansman Sekansı",
      description: "7 günlük lansman planının (M8) devreye alınması. Trafik akışının başlatılması ve ürünün ilk kullanıcılarla buluşması.",
      items: ["Aha-moment Takibi", "Landing Page A/B Testleri", "Upsell Verimlilik Analizi"]
    },
    {
      title: "HAFTA 2: Optimizasyon Fazı (Omega)",
      description: "Veri toplama ve iyileştirme backlog'unun (M10) işlenmesi. Skala için veriye dayalı pivot veya devam kararları.",
      items: ["Cohort Analizleri", "Support Otomasyonu Denetimi", "Pazar Geri Bildirimiyle İyileştirme"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Yürütme Kadansı</h3>
        <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full border border-indigo-200">
          ALPHA TO OMEGA DÖNGÜSÜ
        </span>
      </div>

      <div className="space-y-6">
        {plans.map((plan, idx) => (
          <div key={idx} className="relative pl-8 border-l-4 border-slate-200">
            <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
              <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{plan.title}</h4>
              <p className="text-sm text-slate-500 mb-4 font-medium leading-relaxed">{plan.description}</p>
              <div className="flex flex-wrap gap-2">
                {plan.items.map((item, i) => (
                  <span key={i} className="text-[10px] font-black px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 uppercase tracking-widest">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h4 className="text-lg font-black mb-4 uppercase tracking-widest text-red-400">Escalation & Karar Protokolü</h4>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
            Eğer bir metrik (KPI) hedefin %30 altındaysa veya &apos;Stop-the-line&apos; tetiklendiyse, GM 2 saat içinde &apos;War Room&apos; çağrısı yapar.
            Tüm Sorumlu (R) roller, çözüm odaklı &apos;Pivotal Suggestion&apos; raporuyla toplantıya katılır.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 p-8 opacity-5">
          <svg className="h-48 w-48 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-7h2v5h-2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
