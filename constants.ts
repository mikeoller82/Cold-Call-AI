import { ScriptFormData, CompanySize, CallObjective, Tone, ScriptLength } from './types';

export const INITIAL_FORM_DATA: ScriptFormData = {
  callerName: "",
  callerTitle: "",
  callerCompany: "",
  callerWebsite: "",
  targetIndustry: "",
  targetRole: "",
  prospectCompany: "",
  prospectWebsite: "",
  companySize: CompanySize.SIZE_1_50,
  painPoint: "",
  prospectContext: "",
  solution: "",
  valueProposition: "",
  socialProof: "",
  callObjective: CallObjective.STRATEGY,
  tone: Tone.PROFESSIONAL,
  scriptLength: ScriptLength.MEDIUM
};

export const MOCK_DATA: ScriptFormData = {
  callerName: "Sarah Jenkins",
  callerTitle: "Senior Account Executive",
  callerCompany: "CloudScale Solutions",
  callerWebsite: "https://www.google.com/cloud", 
  targetIndustry: "Manufacturing",
  targetRole: "VP of Operations",
  prospectCompany: "Apex Manufacturing",
  prospectWebsite: "",
  companySize: CompanySize.SIZE_201_1000,
  painPoint: "Inefficient supply chain tracking leading to 15% inventory loss annually.",
  prospectContext: "Just opened a new distribution center in Ohio and is aggressively hiring logistics managers.",
  solution: "AI-driven inventory management dashboard that predicts shortages before they happen.",
  valueProposition: "Reduce inventory waste by 40% in the first quarter.",
  socialProof: "We helped Ford and General Electric streamline their logistics.",
  callObjective: CallObjective.DEMO,
  tone: Tone.CONSULTATIVE,
  scriptLength: ScriptLength.MEDIUM
};
