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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      <div className="p-6 space-y-8">
        <div className="flex justify-end space-x-4 text-sm">
           <button onClick={handleFillExample} className="text-indigo-600 hover:text-indigo-800 font-medium">
            Load Example
          </button>
          <button onClick={handleReset} className="text-gray-500 hover:text-gray-700">
            Clear Form
          </button>
        </div>

        {/* Section 1: Caller Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded mr-2">1</span>
            Caller Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

        {/* Section 2: Target Prospect */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded mr-2">2</span>
            Target Prospect
          </h3>
          <div className="grid grid-cols-1 gap-4">
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect Website (Optional)
                </label>
                <input
                  type="text"
                  name="prospectWebsite"
                  value={formData.prospectWebsite || ''}
                  onChange={handleChange}
                  placeholder="e.g. www.globex.com"
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Object.values(CompanySize).map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Value Proposition */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded mr-2">3</span>
            Value Proposition
          </h3>
          <div className="space-y-4">
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Call Configuration */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded mr-2">4</span>
            Call Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Call Objective</label>
              <select
                name="callObjective"
                value={formData.callObjective}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Object.values(CallObjective).map((obj) => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
              <select
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Object.values(Tone).map((tone) => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={onGenerate}
            disabled={isLoading || !isValid}
            className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
              ${isLoading || !isValid 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              }`}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-5 w-5 mr-3 text-white" />
                Generating Script...
              </>
            ) : (
              <>
                <RefreshIcon className="h-5 w-5 mr-2" />
                Generate Cold Call Script
              </>
            )}
          </button>
          {!isValid && (
            <p className="mt-2 text-center text-sm text-red-500">
              Please fill in all required fields marked with *
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputForm;
