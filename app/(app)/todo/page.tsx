
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ListTodo, CheckSquare, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TodoPage() {
    const run = await prisma.run.findFirst({
        where: { jobs: { some: { agent: 'PLANNER', status: { in: ['DONE', 'RUNNING'] } } } },
        orderBy: { createdAt: 'desc' },
        include: { artifacts: true }
    });

    const planArtifact = run?.artifacts.find(a => a.fileName.includes('PLAN'));
    const content = planArtifact?.contentText || "";

    // Naive parsing: Look for bullet points
    const lines = content.split('\n').filter(l => l.trim().startsWith('- [ ]') || l.trim().startsWith('- '));

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <ListTodo className="h-6 w-6 text-indigo-400" />
                İş Listesi
            </h1>

            {!run ? (
                <div className="p-12 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center space-y-4">
                    <p className="text-slate-400">Henüz aktif bir proje yok.</p>
                    <Link href="/planner" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-bold transition-colors">
                        Plan Oluştur
                    </Link>
                </div>
            ) : !planArtifact ? (
                <div className="p-12 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-center space-y-4">
                    <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto opacity-50" />
                    <h3 className="text-lg font-bold text-white">İş Listesi Bulunamadı</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        &quot;{run.projectId}&quot; için yapılacaklar listesini (Todo) çıkarabileceğimiz bir PLAN.md dosyası henüz oluşmadı.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                        <Link href={`/projects/${run.id}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors">
                            Run Durumunu Kontrol Et
                        </Link>
                        <Link href="/planner" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-bold transition-colors">
                            Yeni Plan Oluştur
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Proje: {run.projectId}
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {lines.length > 0 ? lines.slice(0, 10).map((line, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-slate-800/50">
                                <CheckSquare className="h-5 w-5 text-slate-600" />
                                <span className="text-slate-300 text-sm">{line.replace(/^- \[ \]/, '').replace(/^- /, '')}</span>
                            </div>
                        )) : (
                            <div className="text-slate-500 italic">Plan dosyasında madde işareti bulunamadı.</div>
                        )}
                        {lines.length > 10 && (
                            <div className="text-xs text-slate-500 text-center pt-2">... ve {lines.length - 10} madde daha.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
