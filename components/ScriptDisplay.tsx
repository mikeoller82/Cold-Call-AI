import React, { useState, useEffect } from 'react';
import { CopyIcon, DownloadIcon, RefreshIcon, InfoIcon, DocumentTextIcon, ChartBarIcon, ChatBubbleLeftRightIcon } from './Icons';
import { GeneratedScript, ScriptFormData } from '../types';
import ScriptRenderer from './ScriptRenderer';
import ScriptAnalysis from './ScriptAnalysis';
import PracticeMode from './PracticeMode';

interface ScriptDisplayProps {
  scriptData: GeneratedScript | null;
  formData: ScriptFormData;
  onRegenerate: () => void;
  onImprove: (suggestions: string[]) => void;
  isLoading: boolean;
}

type Tab = 'script' | 'analysis' | 'practice';

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ scriptData, formData, onRegenerate, onImprove, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('script');
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-switch to script tab when new data arrives
  useEffect(() => {
    if (scriptData) {
      setActiveTab('script');
    }
  }, [scriptData?.timestamp]);

  const handleCopy = async () => {
    if (scriptData?.content) {
      await navigator.clipboard.writeText(scriptData.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    if (scriptData?.content) {
      const element = document.createElement("a");
      const file = new Blob([scriptData.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      element.download = `cold-call-script-${timestamp}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (!scriptData && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 h-full min-h-[600px] flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <div className="bg-indigo-50 p-4 rounded-full mb-4">
          <InfoIcon className="h-12 w-12 text-indigo-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to Generate</h3>
        <p className="max-w-md">
          Fill out the form on the left to create a personalized, AI-powered cold call script tailored to your prospect.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col h-full min-h-[600px] overflow-hidden">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center flex-wrap gap-2 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900 hidden md:block flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-500 rounded-sm"></span>
            Generated Script
          </h3>
          
          <div className="flex space-x-2">
             <button
              onClick={handleCopy}
              disabled={isLoading || activeTab !== 'script'}
              className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading || activeTab !== 'script' ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
            >
              {copySuccess ? <span className="text-green-600 flex items-center">Copied!</span> : <><CopyIcon className="h-4 w-4 mr-1.5 text-gray-500" /> Copy</>}
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading || activeTab !== 'script'}
              className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading || activeTab !== 'script' ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
            >
              <DownloadIcon className="h-4 w-4 mr-1.5 text-gray-500" /> Download
            </button>
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshIcon className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Professional Segmented Style */}
        <div className="flex border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'script'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DocumentTextIcon className={`h-5 w-5 ${activeTab === 'script' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Script Output
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'analysis'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChartBarIcon className={`h-5 w-5 ${activeTab === 'analysis' ? 'text-indigo-600' : 'text-gray-400'}`} />
            AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'practice'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChatBubbleLeftRightIcon className={`h-5 w-5 ${activeTab === 'practice' ? 'text-indigo-600' : 'text-gray-400'}`} />
            Practice Roleplay
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-indigo-600 font-medium">Crafting your script...</p>
            <p className="text-gray-500 text-sm mt-2">This usually takes 10-20 seconds</p>
          </div>
        ) : null}
        
        {activeTab === 'script' && scriptData && (
          <div className="p-6 bg-white min-h-full">
            <ScriptRenderer content={scriptData.content} />
          </div>
        )}

        {activeTab === 'analysis' && scriptData && (
          <div className="min-h-full bg-white">
            <ScriptAnalysis 
              scriptContent={scriptData.content} 
              onImprove={onImprove}
            />
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="h-full">
            <PracticeMode formData={formData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptDisplay;
