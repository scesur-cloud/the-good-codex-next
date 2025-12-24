
import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, CheckCircle, AlertTriangle, Play, Loader2 } from 'lucide-react';
import { QueueService, QueueItem } from '../services/queue';
import { parsePromptQueue } from '../multiPromptParser';

interface ImageGeneratorPanelProps {
  projectId: string;
  phaseId: string;
  onArtifactGenerated?: () => void;
}

const ImageGeneratorPanel: React.FC<ImageGeneratorPanelProps> = (props) => {
  const [input, setInput] = useState('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  // Poll for Queue Changes
  useEffect(() => {
    const update = () => {
      const allQueue = QueueService.getQueue();
      const myQueue = allQueue.filter(q => q.phaseId === props.phaseId);
      setQueue(myQueue);

      // If anything is running, we are busy
      const isRunning = myQueue.some(q => q.status === 'running');
      setBusy(isRunning);

      // If something finished, notify (but QueueService saves result, AutoRunner might notify context? 
      // Here we just notify so PhaseDetail reloads artifacts)
      const hasDone = myQueue.some(q => q.status === 'done');
      if (hasDone && props.onArtifactGenerated) {
        // This triggers too often? Just rely on AutoRunner loop or manual check?
        // For now, let's just trigger.
      }
    };

    update();
    const interval = setInterval(update, 1000); // 1s polling view
    return () => clearInterval(interval);
  }, [props.phaseId, props.onArtifactGenerated]);

  const handleEnqueue = () => {
    if (!input.trim()) return;
    const parsed = parsePromptQueue(input);
    const newItems = parsed.map(p => ({
      ...p,
      projectId: props.projectId,
      phaseId: props.phaseId,
      agent: 'PRODUCER' as const // v0.8 Default
    }));
    QueueService.enqueue(newItems);
    setInput('');
    // Trigger tick
    QueueService.processTick();
  };

  const handleRetry = () => {
    QueueService.retryAllFailed();
    QueueService.processTick();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="Promptlarınızı buraya satır satır yapıştırın. (Her satır ayrı bir iş olarak kuyruğa alınır)"
            className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl resize-none font-mono text-xs leading-relaxed focus:ring-4 focus:ring-indigo-100 outline-none transition-all disabled:opacity-50"
          />
          <div className="absolute top-4 right-4 bg-white/50 backdrop-blur px-3 py-1 rounded-lg border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
            Batch Mode
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleEnqueue}
            disabled={!input.trim()}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
          >
            <Terminal className="h-4 w-4" /> Kuyruğa Al
          </button>

          <button
            onClick={() => QueueService.processTick()}
            className="px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl"
            title="Processing Tetikle (Force Run)"
          >
            <Play className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-400" /> Üretim Kuyruğu
          </h4>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-slate-500">{queue.filter(x => x.status === 'pending').length} Bekleyen</span>
            <button onClick={handleRetry} className="text-[10px] font-bold text-amber-500 hover:text-amber-400">Retry Failed</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4 opacity-50">
              <Terminal className="h-12 w-12" />
              <p className="text-xs font-black uppercase tracking-widest">Kuyruk Boş</p>
            </div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 group hover:bg-slate-800 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate font-mono">{item.raw}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
                    <span>#{item.index}</span>
                    <span className="text-slate-600">•</span>
                    <span>{item.purpose || 'GENERİC'}</span>
                  </p>
                </div>
                <div className="shrink-0">
                  {item.status === 'done' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : item.status === 'running' ? (
                    <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                  ) : item.status === 'error' ? (
                    <div className="group/err relative">
                      <AlertTriangle className="h-5 w-5 text-red-500 cursor-help" />
                      <div className="absolute right-0 top-6 w-48 p-2 bg-red-900 text-red-100 text-[10px] rounded shadow-xl hidden group-hover/err:block z-10">
                        {item.error}
                      </div>
                    </div>
                  ) : (
                    <div className="h-2 w-2 bg-slate-600 rounded-full" />
                  )}
                </div>
                {/* Preview Img if done logic could go here but redundant with PhaseDetail */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorPanel;
