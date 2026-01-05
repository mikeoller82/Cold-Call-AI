import React from 'react';

interface ScriptRendererProps {
  content: string;
}

const ScriptRenderer: React.FC<ScriptRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-4" />;

    // 1. Headers (bold markdown)
    if (line.includes('**') && !line.includes('>')) {
      // Remove markdown chars for cleaner display
      const cleanHeader = line.replace(/\*\*/g, '');
      return (
        <h4 key={index} className="text-gray-900 font-bold mt-6 mb-2 text-lg border-b border-gray-200 pb-1">
          {cleanHeader}
        </h4>
      );
    }

    // 2. Options (Orange)
    if (trimmed.startsWith('Option:') || trimmed.match(/^Option [A-Z]:/)) {
      return (
        <div key={index} className="my-2 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r text-gray-800 text-sm">
          <span className="font-bold text-orange-700 uppercase text-xs tracking-wider block mb-1">Alternative Approach</span>
          {processText(trimmed)}
        </div>
      );
    }

    // 3. Coaching/Notes (Purple)
    // Matches lines starting with [ or lines that are entirely inside [] or ()
    if (trimmed.startsWith('[') || trimmed.startsWith('(') || trimmed.startsWith('Note:')) {
      return (
        <div key={index} className="my-2 text-purple-600 text-sm italic font-medium px-4 flex items-start">
          <span className="inline-block mr-2 mt-1">💡</span>
          <span>{processText(trimmed.replace(/^\[|\]$/g, ''))}</span>
        </div>
      );
    }

    // 4. Spoken Dialogue (Green) - Defined by > prefix from prompt
    if (trimmed.startsWith('>')) {
      const dialogue = trimmed.substring(1).trim(); // Remove the >
      return (
        <div key={index} className="my-3 pl-4 border-l-4 border-emerald-500 bg-emerald-50 py-3 pr-3 rounded-r shadow-sm">
           <div className="font-mono text-base text-gray-900 leading-relaxed">
             {processText(dialogue)}
           </div>
        </div>
      );
    }

    // 5. Default/Fallback
    return (
      <div key={index} className="text-gray-700 text-sm py-1 px-2">
        {processText(trimmed)}
      </div>
    );
  };

  // Helper to highlight [Placeholders] in Blue
  const processText = (text: string) => {
    // Regex to find content within square brackets that looks like a placeholder
    // We assume placeholders are usually short-ish, e.g. [Prospect Name]
    const parts = text.split(/(\[.*?\])/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Check if it's likely a placeholder (not a long instruction)
        return (
          <span key={i} className="inline-block bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded text-xs mx-0.5 border border-blue-200 transform -translate-y-px shadow-sm">
            {part.replace(/[\[\]]/g, '')}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1">
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  );
};

export default ScriptRenderer;
