import React, { useState, useEffect, useCallback } from 'react';
import { ScriptFormData, GeneratedScript } from './types';
import { INITIAL_FORM_DATA } from './constants';
import { generateScript } from './services/geminiService';
import InputForm from './components/InputForm';
import ScriptDisplay from './components/ScriptDisplay';
import { PhoneIcon, LightbulbIcon } from './components/Icons';

const STORAGE_KEY = 'coldcall_ai_form_data';

const App: React.FC = () => {
  // State for Form Data
  const [formData, setFormData] = useState<ScriptFormData>(INITIAL_FORM_DATA);
  // State for Script Output
  const [scriptData, setScriptData] = useState<GeneratedScript | null>(null);
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Validation Logic
  const isValid = useCallback(() => {
    return (
      formData.callerName.trim() !== '' &&
      formData.companyName.trim() !== '' &&
      formData.targetIndustry.trim() !== '' &&
      formData.targetRole.trim() !== '' &&
      formData.painPoint.trim() !== '' &&
      formData.solution.trim() !== ''
    );
  }, [formData]);

  const handleGenerate = async () => {
    if (!isValid()) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = await generateScript(formData);
      setScriptData({
        content,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating the script.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white p-2 rounded-full">
                <PhoneIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="ml-3 text-white text-xl font-bold tracking-tight">ColdCall AI</span>
            </div>
            <div className="hidden md:block text-indigo-100 text-sm">
              Professional Script Generator
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 mb-8 lg:mb-0">
             <div className="sticky top-24">
               <InputForm
                  formData={formData}
                  setFormData={setFormData}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  isValid={isValid()}
                />
             </div>
          </div>

          {/* Right Column: Script Display */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <ScriptDisplay
                scriptData={scriptData}
                formData={formData}
                onRegenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Best Practices */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
             <LightbulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
             <h3 className="text-lg font-semibold text-gray-900">Cold Calling Best Practices</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-600">
             <div className="bg-gray-50 p-4 rounded-lg">
                <strong className="block text-gray-900 mb-1">Research First</strong>
                Spend 3 minutes on LinkedIn. Mentioning a specific detail increases success rates by 30%.
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <strong className="block text-gray-900 mb-1">Tone Matters</strong>
                Match your prospect's energy but stay 10% more enthusiastic. Smile while you dial.
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <strong className="block text-gray-900 mb-1">Listen Actively</strong>
                Don't just wait to talk. Listen for "implied needs" not just explicit statements.
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <strong className="block text-gray-900 mb-1">Handle Objections</strong>
                Acknowledge, empathize, and pivot. Never argue. "I understand" is your best friend.
             </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ColdCall AI. Powered by Google Gemini.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
