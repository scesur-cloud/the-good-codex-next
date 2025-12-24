import React from 'react';
import { AgentType } from '../types';

type AgentStatus = 'idle' | 'working' | 'waiting' | 'done' | 'error';

interface AgentLaneProps {
    type: AgentType;
    status: AgentStatus;
    isRunActive: boolean;
    logs: string[];
    counts?: { pending?: number; inFlight?: number; done?: number; failed?: number };
    color: string; // Keep color prop for styling
}

export const AgentLane: React.FC<AgentLaneProps> = ({
    type,
    status,
    isRunActive,
    logs,
    counts,
    color
}) => {
    const isActive = isRunActive && (status === 'working' || status === 'waiting');

    // Status colors mapping
    const statusColors = {
        idle: 'bg-slate-100 text-slate-500 border-slate-200',
        working: `bg-${color}-600 text-white animate-pulse`,
        waiting: 'bg-amber-100 text-amber-700 border-amber-200',
        done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        error: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
        <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isActive ? `ring-2 ring-${color}-500 shadow-xl bg-white` : 'bg-slate-50/50 grayscale-[0.5]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs ${isActive ? `bg-${color}-100 text-${color}-700` : 'bg-slate-200 text-slate-500'}`}>
                        {type[0]}
                    </div>
                    <div className="font-bold text-sm text-slate-700">{type}</div>
                </div>
                <div className="flex items-center gap-3">
                    {counts && (
                        <div className="text-[10px] font-mono opacity-70 flex gap-2">
                            <span title="Pending">P:{counts.pending ?? 0}</span>
                            <span title="In Flight">F:{counts.inFlight ?? 0}</span>
                            <span title="Done" className="text-emerald-600 font-bold">D:{counts.done ?? 0}</span>
                        </div>
                    )}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${statusColors[status] || statusColors.idle}`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="text-[10px] uppercase font-black text-slate-400 mb-2 flex justify-between">
                    <span>LIVE LOGS</span>
                    <span className="opacity-50">{logs.length} events</span>
                </div>
                <div className="h-32 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] font-mono shadow-inner scrollbar-thin scrollbar-thumb-slate-200">
                    {(logs ?? []).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 italic">No activity yet.</div>
                    ) : (
                        logs.slice().reverse().slice(0, 50).map((l, i) => (
                            <div key={i} className="mb-1 last:mb-0 border-l-2 border-slate-300 pl-2 py-0.5">
                                <span className="opacity-40 mr-2">[{i}]</span>
                                {l}
                            </div>
                        ))
                    )}
                </div>

                {/* Processing Bar */}
                {status === 'working' && (
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-${color}-500 animate-progress origin-left w-full`}></div>
                    </div>
                )}
            </div>
        </div>
    );
};
