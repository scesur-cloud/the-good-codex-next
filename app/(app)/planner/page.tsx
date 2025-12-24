
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    PenTool,
    ArrowRight,
    Zap,
    Target,
    Users,
    FileText,
    MessageSquare,
    Loader2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function PlannerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [goal, setGoal] = useState('');
    const [audience, setAudience] = useState('');
    const [format, setFormat] = useState('Marketing Post');
    const [tone, setTone] = useState('Professional');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/runs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: title,
                    brief: {
                        goal,
                        audience,
                        format,
                        tone
                    }
                })
            });

            if (!res.ok) throw new Error("Failed to create run");

            const data = await res.json();
            if (data.redirect) {
                router.push(data.redirect);
            } else {
                router.push('/projects');
            }

        } catch (err) {
            console.error(err);
            alert("Proje oluşturulamadı. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }

    // Load template if present
    useEffect(() => {
        if (!templateId) return;

        async function loadTemplate() {
            setLoading(true);
            try {
                const res = await fetch(`/api/templates/${templateId}`);
                if (res.ok) {
                    const t = await res.json();

                    // Parse briefConfig
                    if (t.briefConfig) {
                        try {
                            const conf = JSON.parse(t.briefConfig);
                            const b = conf.brief || conf;

                            setTitle(conf.projectName || t.name);
                            setGoal(b.goal || "");
                            setAudience(b.audience || "");
                            setFormat(b.format || "Marketing Post");
                            setTone(b.tone || "Professional");
                        } catch (e) { console.error("Parse error", e); }
                    }
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        loadTemplate();
    }, [templateId]);

    const templates = [
        {
            name: "Eğitim İçeriği",
            icon: FileText,
            data: {
                title: "Python 101 Eğitimi",
                goal: "Yazılıma yeni başlayanlara Python'ı sevdirmek ve temel kavramları (değişkenler, döngüler) öğretmek.",
                audience: "Junior Geliştiriciler, Öğrenciler",
                format: "Technical Documentation (Rubric: EDU_V1)",
                tone: "Casual & Friendly"
            }
        },
        {
            name: "Resmi Yazı",
            icon: FileText,
            data: {
                title: "Q3 Performans Duyurusu",
                goal: "Şirket genelindeki Q3 finansal başarısını duyurmak ve çalışanlara teşekkür etmek.",
                audience: "Tüm Şirket Çalışanları",
                format: "Email Newsletter (Rubric: CORP_STD)",
                tone: "Professional & Corporate"
            }
        },
        {
            name: "Sosyal Medya Paket",
            icon: MessageSquare,
            data: {
                title: "Ürün Lansmanı - Instagram",
                goal: "Yeni mobil uygulamanın çıkışını duyurmak ve indirme sayısını artırmak.",
                audience: "Gen Z Kullanıcılar",
                format: "Marketing Post (Rubric: SOCIAL_ENG)",
                tone: "Inspirational"
            }
        },
        {
            name: "Proje Planı",
            icon: Target,
            data: {
                title: "Dijital Dönüşüm Yol Haritası",
                goal: "Fiziksel süreçlerin dijitale aktarılması için 6 aylık plan oluşturmak.",
                audience: "Üst Yönetim (C-Level)",
                format: "Checklist / Policy (Rubric: TECH_SPEC)",
                tone: "Technical & Precise"
            }
        }
    ];

    function applyTemplate(t: typeof templates[0]) {
        setTitle(t.data.title);
        setGoal(t.data.goal);
        setAudience(t.data.audience);
        setFormat(t.data.format);
        setTone(t.data.tone);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <PenTool className="h-8 w-8 text-indigo-400" />
                        Yeni Proje Sihirbazı
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Ajanları çalıştırmak için projenizin detaylarını girin.
                    </p>
                </div>

                {/* Templates */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {templates.map((t) => (
                        <button
                            key={t.name}
                            type="button"
                            onClick={() => applyTemplate(t)}
                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group"
                        >
                            <t.icon className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-300">
                                {t.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Identity */}
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Proje Kimliği
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Proje Adı</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                            placeholder="Örn: Q1 Pazarlama Kampanyası"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* Strategy */}
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Target className="h-4 w-4" /> Strateji
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Amaç / Hedef</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                            placeholder="Bu projenin ana amacı nedir?"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                            <Users className="h-3 w-3" /> Hedef Kitle
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                            placeholder="Örn: KOBİ Yöneticileri, Yazılımcılar..."
                            value={audience}
                            onChange={e => setAudience(e.target.value)}
                        />
                    </div>
                </div>

                {/* Execution */}
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Çıktı Formatı
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Teslimat Tipi</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                value={format}
                                onChange={e => setFormat(e.target.value)}
                            >
                                <option>Marketing Post</option>
                                <option>Blog Article</option>
                                <option>Technical Documentation</option>
                                <option>Email Newsletter</option>
                                <option>Checklist / Policy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Ton ve Dil
                            </label>
                            <select
                                className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                            >
                                <option>Professional & Corporate</option>
                                <option>Casual & Friendly</option>
                                <option>Technical & Precise</option>
                                <option>Inspirational</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Ajanlar Başlatılıyor...' : 'Otomasyonu Başlat'}
                        {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function PlannerPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        }>
            <PlannerContent />
        </Suspense>
    );
}
