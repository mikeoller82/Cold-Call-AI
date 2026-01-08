import React, { useState } from 'react';
import { ScriptFormData, CompanySize, CallObjective, Tone } from '../types';
import { RefreshIcon, LoadingSpinner, LightbulbIcon } from './Icons';
import { MOCK_DATA } from '../constants';
import { analyzeBusinessUrl } from '../services/geminiService';

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
      setFormData(empty as ScriptFormData);
    }
  };

  const handleFillExample = () => {
    setFormData(MOCK_DATA);
  };

  const handleAnalyzeWebsite = async () => {
    if (!formData.callerWebsite) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeBusinessUrl(formData.callerWebsite);
      setFormData({
        ...formData,
        painPoint: result.painPoint || formData.painPoint,
        solution: result.solution || formData.solution,
        valueProposition: result.valueProposition || formData.valueProposition,
        socialProof: result.socialProof || formData.socialProof,
      });
    } catch (err) {
      setAnalysisError("Could not analyze website. Please fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeProspectWebsite = async () => {
    const target = formData.prospectWebsite || formData.prospectCompanyName;
    if (!target) return;
    
    setIsAnalyzingProspect(true);
    setProspectAnalysisError(null);
    try {
      const result = await analyzeBusinessUrl(target);
      setFormData({
        ...formData,
        // Pre-fill based on prospect's website content as requested
        painPoint: result.painPoint || formData.painPoint,
        solution: result.solution || formData.solution,
        valueProposition: result.valueProposition || formData.valueProposition,
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
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
            <span className="flex items-center justify-center bg-white text-indigo-700 font-bold h-6 w-6 rounded-full text-xs shadow-sm mr-3 border border-indigo-200">1</span>
            Caller Information
          </h3>
          <div className="grid grid-cols-1 gap-4 pl-2">
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            {/* Website Analysis Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Website (for Research)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="callerWebsite"
                  value={formData.callerWebsite || ''}
                  onChange={handleChange}
                  placeholder="e.g. https://www.acme.com"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeWebsite}
                  disabled={!formData.callerWebsite || isAnalyzing}
                  className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                >
                  {isAnalyzing ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <>
                       ✨ Auto-fill
                    </>
                  )}
                </button>
              </div>
              {analysisError && <p className="text-xs text-red-500 mt-1">{analysisError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Enter your website URL to auto-fill the Value Proposition section below.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Target Prospect - Purple Theme */}
        <section className="relative">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
            <span className="flex items-center justify-center bg-white text-purple-700 font-bold h-6 w-6 rounded-full text-xs shadow-sm mr-3 border border-purple-200">2</span>
            Target Prospect
          </h3>
          <div className="grid grid-cols-1 gap-4 pl-2">
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Company Name (Optional)
                </label>
                <input
                  type="text"
                  name="prospectCompanyName"
                  value={formData.prospectCompanyName || ''}
                  onChange={handleChange}
                  placeholder="e.g. Globex Inc."
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Website (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="prospectWebsite"
                    value={formData.prospectWebsite || ''}
                    onChange={handleChange}
                    placeholder="e.g. www.globex.com"
                    className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAnalyzeProspectWebsite}
                    disabled={(!formData.prospectWebsite && !formData.prospectCompanyName) || isAnalyzingProspect}
                    className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                  >
                    {isAnalyzingProspect ? (
                      <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      <>
                        ✨ Auto-fill
                      </>
                    )}
                  </button>
                </div>
                {prospectAnalysisError && <p className="text-xs text-red-500 mt-1">{prospectAnalysisError}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Research using Website or Company Name to auto-fill details.
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
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
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-500">
            <span className="flex items-center justify-center bg-white text-emerald-700 font-bold h-6 w-6 rounded-full text-xs shadow-sm mr-3 border border-emerald-200">3</span>
            Value Proposition
          </h3>
          <div className="space-y-4 pl-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Pain Point <span className="text-red-500">*</span>
              </label>
              <textarea
                name="painPoint"
                rows={2}
                value={formData.painPoint}
                onChange={handleChange}
                placeholder="What problem are they facing?"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Solution <span className="text-red-500">*</span>
              </label>
              <textarea
                name="solution"
                rows={2}
                value={formData.solution}
                onChange={handleChange}
                placeholder="How do you solve it?"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unique Value (Optional)</label>
              <textarea
                name="valueProposition"
                rows={2}
                value={formData.valueProposition}
                onChange={handleChange}
                placeholder="Quantifiable results (e.g. 30% faster)"
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Call Configuration - Amber Theme */}
        <section className="relative">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
            <span className="flex items-center justify-center bg-white text-amber-700 font-bold h-6 w-6 rounded-full text-xs shadow-sm mr-3 border border-amber-200">4</span>
            Call Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Call Objective</label>
              <select
                name="callObjective"
                value={formData.callObjective}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-gray-50/50 focus:bg-white transition-colors"
              >
                {Object.values(Tone).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
        
        <div className="pt-4">
          <button
            onClick={onGenerate}
            disabled={!isValid || isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
              !isValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-0.5'
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
