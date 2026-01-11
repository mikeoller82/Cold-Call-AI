export enum CompanySize {
  SIZE_1_50 = "1-50 employees",
  SIZE_51_200 = "51-200 employees",
  SIZE_201_1000 = "201-1000 employees",
  SIZE_1000_PLUS = "1000+ employees"
}

export enum CallObjective {
  DISCOVERY = "5-Min Fit Call (Low Friction)",
  DEMO = "Schedule Product Demo (Visual)",
  STRATEGY = "Strategic Consult (High Value)",
  REFERRAL = "Internal Referral (Navigation)"
}

export enum Tone {
  PROFESSIONAL = "Professional",
  CASUAL_FRIENDLY = "Casual & Friendly",
  CONSULTATIVE = "Consultative",
  DIRECT_CONCISE = "Direct & Concise"
}

export enum ScriptLength {
  SHORT = "Short (30-60 sec)",
  MEDIUM = "Medium (60-90 sec)",
  LONG = "Long (90+ sec)"
}

export interface ScriptFormData {
  callerName: string;
  callerTitle: string;
  callerCompany: string;
  callerWebsite?: string;
  targetIndustry: string;
  targetRole: string;
  prospectCompany?: string;
  prospectWebsite?: string;
  companySize: CompanySize | string;
  painPoint: string; // Specific pain point for the prospect
  prospectContext?: string; // New: Recent news or findings about the prospect
  solution: string; // Caller's solution
  valueProposition: string; // Caller's value prop
  socialProof: string; // Caller's social proof
  callObjective: CallObjective | string;
  tone: Tone | string;
  scriptLength: ScriptLength | string;
}

export interface GeneratedScript {
  content: string;
  timestamp: string;
}

export interface ScriptAnalysisResult {
  overallScore: number;
  hookScore: number;
  empathyScore: number;
  clarityScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
