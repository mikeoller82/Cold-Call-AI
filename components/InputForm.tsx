import React, { useState } from 'react';
import { ScriptFormData, CompanySize, CallObjective, Tone, ScriptLength } from '../types';
import { RefreshIcon, LoadingSpinner, LightbulbIcon } from './Icons';
import { MOCK_DATA } from '../constants';
import { analyzeCompany } from '../services/geminiService';

interface InputFormProps {
  formData: ScriptFormData;
  setFormData: (data: ScriptFormData) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isValid: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ formData, setFormData, onGenerate, isLoading, isValid }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzingProspect, setIsAnalyzingProspect] = useState(false);
  const [prospectAnalysisError, setProspectAnalysisError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      const empty: any = {};
      Object.keys(formData).forEach(key => empty[key] = '');
      // Reset dropdowns to defaults
      empty.companySize = CompanySize.SIZE_1_50;
      empty.callObjective = CallObjective.DISCOVERY;
      empty.tone = Tone.PROFESSIONAL;
      empty.scriptLength = ScriptLength.MEDIUM;
      setFormData(empty as ScriptFormData);
    }
  };

  const handleFillExample = () => {
    setFormData(MOCK_DATA);
  };

  const handleAnalyzeCaller = async () => {
    if (!formData.callerWebsite) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      // Analyze Caller: Focus on Solution, Value Prop, Social Proof
      const result = await analyzeCompany(formData.callerWebsite, 'caller');
      setFormData({
        ...formData,
        // Update Caller Fields
        solution: result.solution || formData.solution,
        valueProposition: result.valueProposition || formData.valueProposition,
        socialProof: result.socialProof || formData.socialProof,
        // Only update painPoint if it's currently empty (don't overwrite specific prospect pain if set)
        painPoint: formData.painPoint || result.painPoint || "",
      });
    } catch (err) {
      setAnalysisError("Could not analyze website. Please fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeProspect = async () => {
    const target = formData.prospectWebsite || formData.prospectCompany;
    if (!target) return;
    
    setIsAnalyzingProspect(true);
    setProspectAnalysisError(null);
    try {
      // Analyze Prospect: Focus on Pain Point and Context
      const result = await analyzeCompany(target, 'prospect');
      setFormData({
        ...formData,
        // Update Prospect Fields
        painPoint: result.painPoint || formData.painPoint, // Prospect's pain takes precedence
        prospectContext: result.prospectContext || formData.prospectContext,
        // Do NOT overwrite solution/valueProp with Prospect's data, as we sell TO them, not sell THEM
      });
    } catch (err) {
      setProspectAnalysisError("Could not analyze prospect.");
    } finally {
      setIsAnalyzingProspect(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-800">Script Configuration</h2>
          <div className="flex space-x-3 text-sm">
             <button onClick={handleFillExample} className="text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
              Load Example
            </button>
            <button onClick={handleReset} className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors">
              Clear
            </button>
          </div>
        </div>

        {/* Section 1: Caller Information - Blue/Indigo Theme */}
        <section className="relative">
          <div className="flex items-center mb-4">
             <span className="flex items-center justify-center bg-indigo-600 text-white font-bold h-8 w-8 rounded-full shadow-md mr-3 text-sm">1</span>
             <h3 className="text-lg font-bold text-gray-900">Caller Profile (You)</h3>
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="callerName"
                value={formData.callerName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title/Role</label>
                <input
                  type="text"
                  name="callerTitle"
                  value={formData.callerTitle}
                  onChange={handleChange}
                  placeholder="e.g. Sales Manager"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="callerCompany"
                  value={formData.callerCompany}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                />
              </div>
            </div>
            
            {/* Caller Website Analysis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Website (for Auto-Fill)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="callerWebsite"
                  value={formData.callerWebsite || ''}
                  onChange={handleChange}
                  placeholder="e.g. https://www.acme.com"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeCaller}
                  disabled={!formData.callerWebsite || isAnalyzing}
                  className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                >
                  {isAnalyzing ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <>
                       ✨ Analyze Me
                    </>
                  )}
                </button>
              </div>
              {analysisError && <p className="text-xs text-red-500 mt-1">{analysisError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                We'll extract your <strong>Solution</strong>, <strong>Value Prop</strong>, and <strong>Social Proof</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Target Prospect - Purple Theme */}
        <section className="relative">
          <div className="flex items-center mb-4">
             <span className="flex items-center justify-center bg-purple-600 text-white font-bold h-8 w-8 rounded-full shadow-md mr-3 text-sm">2</span>
             <h3 className="text-lg font-bold text-gray-900">Prospect Profile (Them)</h3>
          </div>
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Industry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="targetIndustry"
                  value={formData.targetIndustry}
                  onChange={handleChange}
                  placeholder="e.g. Healthcare, SaaS"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. CTO, VP of Sales"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Company
                </label>
                <input
                  type="text"
                  name="prospectCompany"
                  value={formData.prospectCompany || ''}
                  onChange={handleChange}
                  placeholder="e.g. Globex Inc."
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Website
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="prospectWebsite"
                    value={formData.prospectWebsite || ''}
                    onChange={handleChange}
                    placeholder="e.g. www.globex.com"
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeProspect}
                    disabled={(!formData.prospectWebsite && !formData.prospectCompany) || isAnalyzingProspect}
                    className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                  >
                    {isAnalyzingProspect ? (
                      <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      <>
                        ✨ Analyze Them
                      </>
                    )}
                  </button>
                </div>
                {prospectAnalysisError && <p className="text-xs text-red-500 mt-1">{prospectAnalysisError}</p>}
                <p className="text-xs text-gray-500 mt-1">
                   We'll find <strong>Context/News</strong> and <strong>Pain Points</strong>.
                </p>
              </div>
            </div>

            {/* Research Results Area */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                 Research Insights / Context
                 <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Used for Hook</span>
              </label>
              <textarea
                name="prospectContext"
                rows={2}
                value={formData.prospectContext || ''}
                onChange={handleChange}
                placeholder="e.g. Just opened a new facility in Austin..."
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white transition-colors"
              >
                {Object.values(CompanySize).map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Value Proposition - Emerald Theme */}
        <section className="relative">
          <div className="flex items-center mb-4">
             <span className="flex items-center justify-center bg-emerald-600 text-white font-bold h-8 w-8 rounded-full shadow-md mr-3 text-sm">3</span>
             <h3 className="text-lg font-bold text-gray-900">The Pitch (Value Prop)</h3>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Pain Point <span className="text-red-500">*</span>
              </label>
              <textarea
                name="painPoint"
                rows={2}
                value={formData.painPoint}
                onChange={handleChange}
                placeholder="What strategic problem do they have? (Filled by Prospect Analysis)"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Solution (Product/Service) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="solution"
                rows={2}
                value={formData.solution}
                onChange={handleChange}
                placeholder="What is the vehicle for the result? (Filled by Caller Analysis)"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefit (Value Prop)</label>
              <textarea
                name="valueProposition"
                rows={2}
                value={formData.valueProposition}
                onChange={handleChange}
                placeholder="Quantifiable results (e.g. Reduce waste by 40%)"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Proof (Optional)</label>
              <input
                type="text"
                name="socialProof"
                value={formData.socialProof}
                onChange={handleChange}
                placeholder="e.g. We work with Amazon and Google"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-white transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Call Configuration - Amber Theme */}
        <section className="relative">
          <div className="flex items-center mb-4">
             <span className="flex items-center justify-center bg-amber-500 text-white font-bold h-8 w-8 rounded-full shadow-md mr-3 text-sm">4</span>
             <h3 className="text-lg font-bold text-gray-900">Call Strategy</h3>
          </div>
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Objective</label>
                <select
                  name="callObjective"
                  value={formData.callObjective}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white transition-colors"
                >
                  {Object.values(CallObjective).map((obj) => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desired Tone</label>
                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white transition-colors"
                >
                  {Object.values(Tone).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Script Length</label>
                <select
                  name="scriptLength"
                  value={formData.scriptLength}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white transition-colors"
                >
                  {Object.values(ScriptLength).map((len) => (
                    <option key={len} value={len}>{len}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
        
        <div className="pt-4">
          <button
            onClick={onGenerate}
            disabled={!isValid || isLoading}
            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
              !isValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-5 w-5 mr-3" />
                Generating Script...
              </>
            ) : (
              'Generate Cold Call Script'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;