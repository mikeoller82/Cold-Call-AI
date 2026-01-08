import React, { useEffect, useState } from 'react';
import { ScriptAnalysisResult } from '../types';
import { analyzeScript } from '../services/geminiService';
import { LoadingSpinner, SparklesIcon } from './Icons';

interface ScriptAnalysisProps {
  scriptContent: string;
  onImprove: (suggestions: string[]) => void;
}

const ProgressBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-bold text-gray-900">{score}/100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

const ScriptAnalysis: React.FC<ScriptAnalysisProps> = ({ scriptContent, onImprove }) => {
  const [analysis, setAnalysis] = useState<ScriptAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const result = await analyzeScript(scriptContent);
        setAnalysis(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (scriptContent) {
      fetchAnalysis();
    }
  }, [scriptContent]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner className="h-10 w-10 text-indigo-600 mb-4" />
        <p className="text-gray-500">Analyzing script effectiveness...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white text-center shadow-md">
        <h3 className="text-lg font-medium opacity-90">Overall Impact Score</h3>
        <div className="text-5xl font-bold mt-2">{analysis.overallScore}</div>
        <p className="text-sm opacity-80 mt-2">Based on Voss, SPIN, & Hormozi principles</p>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
        <ProgressBar label="Hook & Pattern Interrupt" score={analysis.hookScore} color="bg-pink-500" />
        <ProgressBar label="Tactical Empathy" score={analysis.empathyScore} color="bg-blue-500" />
        <ProgressBar label="Value Clarity" score={analysis.clarityScore} color="bg-emerald-500" />
      </div>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <span className="mr-2">👍</span> Strengths
          </h4>
          <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
            {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
            <span className="mr-2">⚡</span> Opportunities
          </h4>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions & Regenerate */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
        <h4 className="font-semibold text-indigo-900 mb-3">💡 Optimization Suggestions</h4>
        <div className="space-y-3 mb-6">
          {analysis.suggestions.map((tip, i) => (
            <div key={i} className="flex items-start">
              <span className="flex-shrink-0 bg-indigo-200 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 mr-3">
                {i + 1}
              </span>
              <p className="text-sm text-indigo-800">{tip}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => onImprove(analysis.suggestions)}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Apply Suggestions & Regenerate Script
        </button>
      </div>
    </div>
  );
};

export default ScriptAnalysis;
