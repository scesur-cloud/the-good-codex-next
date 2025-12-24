
import React from 'react';
import { RACI_TABLE, ROLES } from '../constants';

export const RACITable: React.FC = () => {
  const getRoleName = (id: string) => ROLES.find(r => r.id === id)?.name || id;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mesaj / Faz</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sorumlu (R)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hesap Verebilir (A)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Handoff (Teslim)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">DoD (Done)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {RACI_TABLE.map((item) => (
              <tr key={item.messageId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-blue-600 mb-1">{item.phase}</span>
                    <span className="text-sm font-bold text-slate-800">{item.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {getRoleName(item.responsible)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {getRoleName(item.accountable)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-1">Alıcı: {getRoleName(item.handoff.receiver)}</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {item.handoff.artifacts.slice(0, 2).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-500 italic max-w-xs">{item.dod}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">RACI Gösterge Anahtarı</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center text-xs">
            <span className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3 border border-blue-200">R</span>
            <div>
              <p className="font-bold">Responsible</p>
              <p className="text-slate-500">İşi yapan kişi.</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold mr-3 border border-purple-200">A</span>
            <div>
              <p className="font-bold">Accountable</p>
              <p className="text-slate-500">Nihai onayı veren.</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold mr-3 border border-slate-200">C</span>
            <div>
              <p className="font-bold">Consulted</p>
              <p className="text-slate-500">Danışılan uzmanlar.</p>
            </div>
          </div>
          <div className="flex items-center text-xs">
            <span className="w-8 h-8 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold mr-3 border border-amber-200">I</span>
            <div>
              <p className="font-bold">Informed</p>
              <p className="text-slate-500">Bilgilendirilenler.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
