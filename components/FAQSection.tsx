
import React, { useState } from 'react';
import { FAQ_DATA } from '../constants';
import { HelpCircle, ChevronDown, BookOpen, Users, ShieldAlert, Zap, Search, Sparkles, Cpu } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaq = FAQ_DATA.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(FAQ_DATA.map(f => f.category)));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Metodoloji': return <BookOpen className="h-4 w-4" />;
      case 'Roller & Sorumluluklar': return <Users className="h-4 w-4" />;
      case 'Kalite Kontrol (QA)': return <ShieldAlert className="h-4 w-4" />;
      case 'Operasyon': return <Zap className="h-4 w-4" />;
      case 'Yapay Zeka & Teknik': return <Cpu className="h-4 w-4" />;
      case 'B2B & Kurumsal': return <Sparkles className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl text-white mb-2 shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
          <HelpCircle className="h-10 w-10" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Bilgi Bankası & SSS</h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
          The God Codex operasyonel disiplini, Alpha to Omega geçişi ve yürütme mekanizması hakkında derinlemesine analiz.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto group">
        <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Soru, kategori veya teknik terim ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Left: Quick Access Categories (Desktop) */}
        <div className="hidden lg:block space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Kategoriler</p>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSearchTerm(searchTerm === cat ? '' : cat)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all text-left border-2 ${searchTerm === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                  : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-100'
                }`}
            >
              <div className={`p-2 rounded-xl shrink-0 transition-colors ${searchTerm === cat ? 'bg-white/20' : 'bg-slate-100'}`}>
                {getCategoryIcon(cat)}
              </div>
              <span className="truncate">{cat}</span>
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="w-full mt-6 text-[10px] font-black text-indigo-600 px-4 hover:underline uppercase tracking-widest text-center"
            >
              Tüm Soruları Göster
            </button>
          )}
        </div>

        {/* Right: FAQ Accordion */}
        <div className="lg:col-span-3 space-y-4">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white border-2 transition-all duration-300 overflow-hidden ${isOpen ? 'border-indigo-400 shadow-2xl shadow-indigo-50 ring-8 ring-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                    } rounded-3xl`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-6">
                      <span className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${isOpen ? 'bg-indigo-600 text-white rotate-12' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block flex items-center gap-2 ${isOpen ? 'text-indigo-500' : 'text-slate-400'}`}>
                          {getCategoryIcon(faq.category)} {faq.category}
                        </span>
                        <h4 className={`text-lg font-bold tracking-tight leading-tight ${isOpen ? 'text-slate-900' : 'text-slate-700'}`}>
                          {faq.question}
                        </h4>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </button>

                  <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-8 pb-8 pt-2 pl-24 border-t border-slate-50 mt-2">
                      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-slate-600 leading-relaxed font-semibold">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-24 rounded-[3rem] border-4 border-dashed border-slate-100 text-center animate-in zoom-in-95 duration-300">
              <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-200" />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Bulunamadı</h4>
              <p className="text-slate-500 font-bold mb-8">Aradığınız teknik terim veya kategori mevcut havuzda yer almıyor.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Tüm Bilgi Bankasını Göster
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Support Card */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl mt-20">
        <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none scale-150">
          <BookOpen className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h4 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-indigo-400" />
              Gelişmiş Destek & Analiz
            </h4>
            <p className="text-indigo-100/70 text-lg leading-relaxed font-medium">
              The God Codex disiplini, her zaman bir sonraki adımı önceden tanımlar. Standart SSS havuzunun dışındaki operasyonel blokajlar için GM simülasyonunu kullanın.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="px-5 py-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-300 backdrop-blur-sm">
                Real-time GM Insights
              </div>
              <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 backdrop-blur-sm">
                Standard Ops Protocol
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10">AS</div>
              <div>
                <p className="text-lg font-black text-white leading-none mb-1">AI_STUDIO Asistanı</p>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">General Manager Mode</p>
              </div>
              <div className="ml-auto flex gap-1">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
            <p className="text-sm text-slate-300 italic font-medium leading-relaxed">
              &quot;Stratejik bir kalkan (M3) veya pazar boşluğu (M2) analizi mi gerekiyor? Size özel bir operasyonel rapor hazırlayabilirim.&quot;
            </p>
            <button
              className="w-full py-5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                const chatBtn = document.querySelector('button.bg-slate-900.text-white.rounded-full') as HTMLButtonElement;
                if (chatBtn) chatBtn.click();
                else alert("Sağ alttaki asistan balonunu kullanabilirsiniz.");
              }}
            >
              ASİSTANLA ANALİZE BAŞLA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
