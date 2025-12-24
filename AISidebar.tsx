import React, { useState } from 'react';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { analyzeInventoryWithGemini } from '../services/geminiService';
import { AnalysisResult, Product } from '../types';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult[];
  products: Product[];
}

export const AISidebar: React.FC<AISidebarProps> = ({ isOpen, onClose, analysis, products }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I can analyze your inventory health, suggest optimization strategies, or explain why certain minimums are high. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await analyzeInventoryWithGemini(analysis, products, userMessage);
      setMessages(prev => [...prev, { role: 'ai', text: response || "No response generated." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error connecting to the analysis engine." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-semibold text-lg">AI Analyst</h2>
        </div>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-100'
              }`}
            >
             {msg.role === 'ai' ? (
                 <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
                     __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                 }} />
             ) : (
                 msg.text
             )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span className="text-xs text-gray-500">Analyzing data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border focus-within:ring-2 ring-indigo-500 ring-offset-1 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            placeholder="Ask about inventory..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setInput("Identify overstocked items")} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition">Overstock?</button>
            <button onClick={() => setInput("Show high risk stockouts")} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition">Stockouts?</button>
            <button onClick={() => setInput("How much money can I save?")} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition">Savings?</button>
        </div>
      </div>
    </div>
  );
};
