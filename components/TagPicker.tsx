
import React, { useState, useMemo } from 'react';
import { TAG_DICTIONARY, TAG_GROUPS } from '../taxonomy';
import { Search, Plus, X, Tag as TagIcon, ChevronRight, ChevronDown } from 'lucide-react';

interface TagPickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  allowCustom?: boolean;
  placeholder?: string;
}

export const TagPicker: React.FC<TagPickerProps> = ({
  value,
  onChange,
  allowCustom = true,
  placeholder = "Yetkinlik ara veya ekle..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(TAG_GROUPS.map(g => g.id));

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return TAG_GROUPS;

    return TAG_GROUPS.map((group: { id: string, name: string, tags: string[] }) => ({
      ...group,
      tags: group.tags.filter((tag: string) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (TAG_DICTIONARY[tag]?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    })).filter((group: { tags: string[] }) => group.tags.length > 0);
  }, [searchTerm]);

  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter(t => t !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleCustomAdd = () => {
    if (!searchTerm.trim()) return;
    const customTag = searchTerm.trim().toLowerCase().replace(/\s+/g, '-');
    if (!value.includes(customTag)) {
      onChange([...value, customTag]);
    }
    setSearchTerm('');
  };

  const isTaxonomyTag = (tag: string) => !!TAG_DICTIONARY[tag];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 min-h-[42px] bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          {value.map(tag => (
            <span
              key={tag}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all ${isTaxonomyTag(tag)
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-slate-200 text-slate-600 border border-slate-300'
                }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium min-w-[150px] px-2"
            placeholder={value.length === 0 ? placeholder : ""}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsMenuOpen(true);
            }}
            onFocus={() => setIsMenuOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomAdd();
              }
              if (e.key === 'Backspace' && !searchTerm && value.length > 0) {
                toggleTag(value[value.length - 1]);
              }
            }}
          />
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest px-2"
            >
              Temizle
            </button>
          )}
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Taksonomi Etiketleri</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-2">
              {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                  <div key={group.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider text-left"
                    >
                      <div className="flex items-center gap-2">
                        {expandedGroups.includes(group.id) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {group.name}
                      </div>
                      <span className="text-[8px] bg-slate-200 px-1.5 rounded-full">{group.tags.length}</span>
                    </button>

                    {expandedGroups.includes(group.id) && (
                      <div className="grid grid-cols-1 gap-1 pl-4">
                        {group.tags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`flex items-center justify-between p-2 rounded-xl text-left transition-all border ${value.includes(tag)
                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                              : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700'
                              }`}
                          >
                            <div>
                              <p className="text-xs font-bold leading-tight">{tag}</p>
                              <p className={`text-[10px] font-medium leading-tight ${value.includes(tag) ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {TAG_DICTIONARY[tag]}
                              </p>
                            </div>
                            {value.includes(tag) && <X className="h-3 w-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <TagIcon className="h-8 w-8 mx-auto mb-2 opacity-10" />
                  <p className="text-xs italic">Sonuç bulunamadı.</p>
                </div>
              )}
            </div>

            {allowCustom && searchTerm && (
              <div className="p-3 bg-indigo-50 border-t border-indigo-100">
                <button
                  type="button"
                  onClick={handleCustomAdd}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-700 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  &quot;{searchTerm}&quot; Etiketini Özel Olarak Ekle
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};
