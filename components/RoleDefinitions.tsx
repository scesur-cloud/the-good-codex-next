
import React, { useState } from 'react';
import { Storage } from '../storage';
import { Role } from '../types';
import { TagPicker } from './TagPicker';
import { User, Shield, Briefcase, Search, Plus, Trash2, Edit2, X, Check, Star, Settings } from 'lucide-react';

export const RoleDefinitions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(Storage.getRoles());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [newRole, setNewRole] = useState<Role>({
    id: '',
    name: '',
    definition: '',
    capabilities: [],
    isAccountable: false,
    authorityLevel: 1
  });

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.capabilities || []).some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const systemRoles = filteredRoles.filter(r => r.isSystem);
  const customRoles = filteredRoles.filter(r => !r.isSystem);

  const handleSave = () => {
    if (!newRole.id || !newRole.name) return;
    if ((newRole.capabilities || []).length === 0) {
      alert("Lütfen en az bir yetkinlik etiketi seçin.");
      return;
    }
    Storage.addRole(newRole);
    setRoles(Storage.getRoles());
    setIsAdding(false);
    setNewRole({ id: '', name: '', definition: '', capabilities: [], isAccountable: false, authorityLevel: 1 });
  };

  const handleUpdate = () => {
    if (!editingRole || !editingRole.name) return;
    if ((editingRole.capabilities || []).length === 0) {
      alert("Lütfen en az bir yetkinlik etiketi seçin.");
      return;
    }
    Storage.updateRole(editingRole);
    setRoles(Storage.getRoles());
    setEditingRole(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu rolü silmek istediğinize emin misiniz?')) {
      Storage.deleteRole(id);
      setRoles(Storage.getRoles());
    }
  };

  const renderRoleCard = (role: Role) => (
    <div key={role.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full hover:border-indigo-300 transition-all group relative hover:shadow-xl hover:shadow-indigo-50/50">
      <div className="flex items-center mb-4">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm ${role.isSystem ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
          {role.isSystem ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 leading-tight">{role.name}</h4>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${role.isSystem ? 'text-purple-600' : 'text-indigo-600'}`}>
            {role.id}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingRole(role)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {!role.isSystem && (
            <button
              onClick={() => handleDelete(role.id)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium flex-1">
        {role.definition}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-slate-50">
        {(role.capabilities || []).map((cap, i) => (
          <span
            key={i}
            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${role.isSystem
              ? 'bg-purple-50 text-purple-600 border-purple-100'
              : 'bg-indigo-50 text-indigo-500 border-indigo-100'
              }`}
          >
            {cap}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Rol Kütüphanesi</h2>
          <p className="text-sm text-slate-500 font-medium">Sistemde kayıtlı {roles.length} uzman rolü bulunmaktadır.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rol veya yetkinlik ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium w-full focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {(isAdding || editingRole) && (
        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-500 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">
              {editingRole ? 'Rolü Düzenle' : 'Yeni Rol Tanımla'}
            </h3>
            <button onClick={() => { setIsAdding(false); setEditingRole(null); }}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol ID</label>
              <input
                disabled={!!editingRole}
                placeholder="Örn: AI_ENGINEER"
                value={editingRole ? editingRole.id : newRole.id}
                onChange={e => {
                  const val = e.target.value.toUpperCase().replace(/\s/g, '_');
                  if (editingRole) setEditingRole({ ...editingRole, id: val });
                  else setNewRole({ ...newRole, id: val });
                }}
                className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 ${editingRole ? 'opacity-50' : ''}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol Adı</label>
              <input
                placeholder="Örn: AI Geliştirme Mühendisi"
                value={editingRole ? editingRole.name : newRole.name}
                onChange={e => {
                  if (editingRole) setEditingRole({ ...editingRole, name: e.target.value });
                  else setNewRole({ ...newRole, name: e.target.value });
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol Tanımı</label>
            <textarea
              placeholder="Rolün ana sorumluluklarını ve operasyonel katkısını tanımlayın..."
              value={editingRole ? editingRole.definition : newRole.definition}
              onChange={e => {
                if (editingRole) setEditingRole({ ...editingRole, definition: e.target.value });
                else setNewRole({ ...newRole, definition: e.target.value });
              }}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-24 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yetkinlik Etiketleri (Taxonomy v2)</label>
            <TagPicker
              value={editingRole ? (editingRole.capabilities || []) : (newRole.capabilities || [])}
              onChange={(next) => {
                if (editingRole) setEditingRole({ ...editingRole, capabilities: next });
                else setNewRole({ ...newRole, capabilities: next });
              }}
            />
          </div>

          <button
            onClick={editingRole ? handleUpdate : handleSave}
            className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <Check className="h-5 w-5" />
            {editingRole ? 'Değişiklikleri Kaydet' : 'Rolü Kütüphaneye Ekle'}
          </button>
        </div>
      )}

      <div className="space-y-12">
        {/* System Roles Section */}
        {systemRoles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">God Codex Sistem Rolleri</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemRoles.map(renderRoleCard)}
            </div>
          </section>
        )}

        {/* Custom Roles Section */}
        {customRoles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
              <Star className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Operasyonel Özel Roller</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customRoles.map(renderRoleCard)}
            </div>
          </section>
        )}

        {filteredRoles.length === 0 && (
          <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Arama kriterlerine uygun rol bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};
