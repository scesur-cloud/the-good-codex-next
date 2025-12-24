
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FileText, Plus, Play, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
    try {
        const templates = await prisma.projectTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileText className="h-8 w-8 text-indigo-400" />
                            Şablon Kütüphanesi
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Kaydedilmiş başarılı proje şablonları.
                        </p>
                    </div>
                    <Link
                        href="/planner"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Yeni Proje
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                            <p className="text-slate-500">Henüz kaydedilmiş bir şablon yok.</p>
                            <p className="text-slate-600 text-sm mt-1">Başarılı bir projeyi tamamladıktan sonra &quot;Save as Template&quot; diyerek ekleyebilirsiniz.</p>
                        </div>
                    ) : (
                        templates.map(t => (
                            <div key={t.id} className="group relative p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all hover:border-indigo-500/30">
                                <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-4">
                                    <span className="bg-slate-800 px-2 py-1 rounded">{t.rubricId}</span>
                                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                                    <span className="text-xs text-slate-600 italic">
                                        {/* Brief summary logic could be here */}
                                        Hazır Konfigürasyon
                                    </span>
                                    <Link
                                        href={`/planner?templateId=${t.id}`}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-bold transition-all"
                                    >
                                        <Play className="h-3 w-3" />
                                        Başlat
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    } catch (e: any) {
        return <div className="text-red-500 p-10">Error: {e.message} <pre>{e.stack}</pre></div>;
    }
}
