import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ScriptFormData } from '../types';
import { getPracticeResponse } from '../services/geminiService';
import { LoadingSpinner, PhoneIcon } from './Icons';

interface PracticeModeProps {
  formData: ScriptFormData;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ formData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = () => {
    setStarted(true);
    // Initial simulated connection
    setMessages([
      { role: 'model', text: "(Phone rings...) Hello? Who is this?" }
    ]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // Get AI response based on history + new message
      const responseText = await getPracticeResponse([...messages, userMsg], formData);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "(Call disconnected - Error)" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <div className="bg-emerald-100 p-4 rounded-full mb-6">
          <PhoneIcon className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Practice Roleplay</h3>
        <p className="text-gray-600 mb-8 max-w-md">
          Test your script against an AI prospect simulated to match your specific industry and persona. 
          The AI will object, ask questions, and react realistically.
        </p>
        <button 
          onClick={handleStart}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-emerald-700 transition-colors flex items-center"
        >
          Start Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Speaking To</span>
          <div className="font-semibold text-gray-900">{formData.targetRole} @ {formData.prospectCompany || "Target Co."}</div>
        </div>
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
          Call Active
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            disabled={isProcessing}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default PracticeMode;
