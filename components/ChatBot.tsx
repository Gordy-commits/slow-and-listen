import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, MessageCircle, X, Loader2 } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Format history for Gemini API (excluding the latest user message which is sent as 'message')
      const chatHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

      const responseText = await generateChatResponse(chatHistory, userMsg);
      setHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e) {
      setHistory(prev => [...prev, { role: 'model', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-warm-800 rotate-90 scale-0' : 'bg-warm-800 hover:bg-warm-900 scale-100'}`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-warm-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-warm-100 p-4 flex justify-between items-center border-b border-warm-200">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-warm-800" />
              <h3 className="font-serif font-bold text-warm-900">Exhibition Guide</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-warm-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-warm-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-50/50">
            {history.length === 0 && (
              <div className="text-center text-warm-400 mt-10 p-6">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-sans text-sm">Hello. I am here to discuss listening, rhythm, and silence. Ask me anything about the exhibition.</p>
              </div>
            )}
            {history.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm font-sans leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-warm-800 text-white rounded-br-none' 
                      : 'bg-white border border-warm-100 text-warm-900 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-warm-100 p-3 rounded-lg rounded-bl-none shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-warm-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-warm-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about the stories..."
                className="flex-1 px-4 py-2 bg-warm-50 border border-warm-200 rounded-full focus:outline-none focus:ring-2 focus:ring-warm-300 font-sans text-sm placeholder:text-warm-300 text-warm-800"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-warm-800 text-white rounded-full hover:bg-warm-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
