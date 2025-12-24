
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '../services/gemini';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Merhaba, ben AI_STUDIO. The God Codex operasyonel yönetiminde size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getGeminiResponse(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold mr-2">AS</div>
              <div>
                <h4 className="text-sm font-bold leading-none">AI_STUDIO Assistant</h4>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">GM Mode Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400 mr-2" />
                  <span className="text-xs text-slate-400 italic">Düşünüyor...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Bir soru sorun veya rapor isteyin..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
