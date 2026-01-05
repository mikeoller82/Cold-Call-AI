export enum CompanySize {
  SIZE_1_50 = "1-50 employees",
  SIZE_51_200 = "51-200 employees",
  SIZE_201_1000 = "201-1000 employees",
  SIZE_1000_PLUS = "1000+ employees"
}

export enum CallObjective {
  DISCOVERY = "Discovery Call",
  SCHEDULE_DEMO = "Schedule Demo",
  BOOK_MEETING = "Book Meeting",
  QUALIFY_LEAD = "Qualify Lead"
}

export enum Tone {
  PROFESSIONAL = "Professional",
  CASUAL_FRIENDLY = "Casual & Friendly",
  CONSULTATIVE = "Consultative",
  DIRECT_CONCISE = "Direct & Concise"
}

export interface ScriptFormData {
  callerName: string;
  callerTitle: string;
  companyName: string;
  callerWebsite?: string; // New field
  targetIndustry: string;
  targetRole: string;
  prospectCompanyName?: string; // New field
  prospectWebsite?: string; // New field
  companySize: CompanySize | string;
  painPoint: string;
  solution: string;
  valueProposition: string;
  socialProof: string;
  callObjective: CallObjective | string;
  tone: Tone | string;
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
