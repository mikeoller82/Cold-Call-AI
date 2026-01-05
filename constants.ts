import { ScriptFormData, CompanySize, CallObjective, Tone } from './types';

export const INITIAL_FORM_DATA: ScriptFormData = {
  callerName: "",
  callerTitle: "",
  companyName: "",
  callerWebsite: "",
  targetIndustry: "",
  targetRole: "",
  prospectCompanyName: "",
  prospectWebsite: "",
  companySize: CompanySize.SIZE_1_50,
  painPoint: "",
  solution: "",
  valueProposition: "",
  socialProof: "",
  callObjective: CallObjective.BOOK_MEETING,
  tone: Tone.PROFESSIONAL
};

export const MOCK_DATA: ScriptFormData = {
  callerName: "Sarah Jenkins",
  callerTitle: "Senior Account Executive",
  companyName: "CloudScale Solutions",
  callerWebsite: "https://www.google.com/cloud", 
  targetIndustry: "Manufacturing",
  targetRole: "VP of Operations",
  prospectCompanyName: "Apex Manufacturing",
  prospectWebsite: "",
  companySize: CompanySize.SIZE_201_1000,
  painPoint: "Inefficient supply chain tracking leading to 15% inventory loss annually.",
  solution: "AI-driven inventory management dashboard that predicts shortages before they happen.",
  valueProposition: "Reduce inventory waste by 40% in the first quarter.",
  socialProof: "We helped Ford and General Electric streamline their logistics.",
  callObjective: CallObjective.SCHEDULE_DEMO,
  tone: Tone.CONSULTATIVE
};
