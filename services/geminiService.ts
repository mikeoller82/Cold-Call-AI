import { GoogleGenAI, SchemaType, Type } from "@google/genai";
import { ScriptFormData, ScriptAnalysisResult } from "../types";

const buildPrompt = (data: ScriptFormData): string => {
  return `
You are a world-class expert sales copywriter and negotiation strategist (Voss, SPIN, Sandler, Hormozi, Belfort).

Your task is to generate a highly personalized cold call script.

*** INPUT DATA ***
- **Caller**: ${data.callerName}, ${data.callerTitle} at ${data.companyName}
- **Caller Website**: ${data.callerWebsite || "N/A"}
- **Prospect**: ${data.targetRole} ${data.prospectCompanyName ? `at ${data.prospectCompanyName}` : ''} in the ${data.targetIndustry} industry.
- **Prospect Website**: ${data.prospectWebsite || "N/A"}
- **Company Size**: ${data.companySize}
- **Core Pain Point**: ${data.painPoint}
- **Solution**: ${data.solution}
- **Value Proposition**: ${data.valueProposition}
- **Social Proof**: ${data.socialProof}
- **Objective**: ${data.callObjective}
- **Tone**: ${data.tone}

*** RESEARCH INSTRUCTIONS ***
If a Prospect Website or Company Name is provided, use Google Search to find 1-2 specific, recent news items, initiatives, or public challenges to reference in the "Pre-Game Mindset" or "The Hook" section. Make it sound like you've done your homework.

*** IMPORTANT FORMATTING RULES FOR RENDERING ***
1. **Dialogue**: Prefix EVERY line of actual spoken dialogue with a greater-than sign (>). Example: > Hello, this is John.
2. **Coaching Notes**: Put all coaching/tonality/context notes in [Square Brackets].
3. **Options**: If providing options (A/B), prefix the line with "Option: ".
4. **Placeholders**: Keep dynamic placeholders in brackets like [Prospect Name].

*** SCRIPT STRUCTURE ***
1. **PRE-GAME MINDSET**
   - 2-3 bullet points on psychological stance.
   - *Specific research insight if found.*

2. **GATEKEEPER BYPASS**
   - Authoritative ambiguity.

3. **THE OPENING (Pattern Interrupt)**
   - NO "How are you". Use permission-based or "I'm lost" approach.

4. **THE HOOK (Loss Aversion)**
   - Bridge to ${data.targetIndustry}. Frame ${data.painPoint} via loss aversion.
   - *Reference specific company news if found.*

5. **QUALIFYING (SPIN)**
   - 3 probing questions moving from Problem to Implication.

6. **THE PITCH (Hormozi Offer)**
   - ${data.solution} + ${data.valueProposition} (Speed/Ease).
   - Truth Statement (${data.socialProof}).

7. **OBJECTION HANDLING (The Loop)**
   - Responses for: "Send email", "Have vendor", "Not interested".

8. **THE CLOSE**
   - Assumptive "When" or "Soft Close".

9. **VOICEMAIL**
   - Open loop.

Ensure the Tone is strictly: ${data.tone}.
`;
};

export const generateScript = async (formData: ScriptFormData): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(formData);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.75,
        maxOutputTokens: 2500,
        tools: [{googleSearch: {}}], // Enable search for prospect research
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated from Gemini.");
    return text;
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

export const analyzeBusinessUrl = async (url: string): Promise<Partial<ScriptFormData>> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    // Prompt designed to force site-specific search
    const prompt = `
      TARGET URL: ${url}

      You are a specialized B2B Web Scraper and Analyst.
      
      TASK: Perform a live search on the specific TARGET URL provided to extract their sales messaging. 
      
      INSTRUCTIONS:
      1. **VERIFY DOMAIN**: First, confirm the company name matches the URL.
      2. **SEARCH COMMANDS**: Execute searches equivalent to "site:${url} homepage", "site:${url} about", "site:${url} customers", "site:${url} case studies".
      3. **EXTRACTION**:
         - **Pain Point**: What expensive problem do they explicitly say they solve? (e.g., "We eliminate data silos").
         - **Solution**: What is the name of their product/service?
         - **Value Proposition**: Find a specific number or claim (e.g. "Save 20%", "3x faster").
         - **Social Proof**: List specific client names or awards found on the site.

      CONSTRAINTS:
      - If the URL is generic (e.g., gmail.com), return generic info.
      - If specific data isn't found, infer logically based *only* on the page title and meta description found in search results.
      - Do not make up clients. If none found, say "Industry leaders".

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            painPoint: { type: Type.STRING },
            solution: { type: Type.STRING },
            valueProposition: { type: Type.STRING },
            socialProof: { type: Type.STRING },
          },
          required: ["painPoint", "solution", "valueProposition"]
        },
        tools: [{googleSearch: {}}], 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated.");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing business URL:", error);
    throw error;
  }
};

export const analyzeScript = async (scriptContent: string): Promise<ScriptAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Analyze the following cold call script based on modern sales standards (Hormozi, Voss, Sandler).
      Return the response in JSON format.
      
      Script:
      ${scriptContent}
      
      Evaluate on:
      - Hook Strength (Pattern Interrupt)
      - Tactical Empathy & Tone
      - Clarity of Value Proposition
      
      JSON Schema:
      {
        "overallScore": number (0-100),
        "hookScore": number (0-100),
        "empathyScore": number (0-100),
        "clarityScore": number (0-100),
        "strengths": string[] (max 3),
        "weaknesses": string[] (max 3),
        "suggestions": string[] (max 3 actionable tips)
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated.");
    
    return JSON.parse(text) as ScriptAnalysisResult;
  } catch (error) {
    console.error("Error analyzing script:", error);
    throw error;
  }
};

export const getPracticeResponse = async (
  history: { role: 'user' | 'model'; text: string }[], 
  formData: ScriptFormData
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      You are roleplaying as a prospect in the ${formData.targetIndustry} industry.
      Role: ${formData.targetRole} at ${formData.prospectCompanyName || "a company"}.
      Company Size: ${formData.companySize}.
      Current Pain: ${formData.painPoint}.
      
      Your personality: Skeptical, busy, professional, but open to genuine value.
      Do not be easily sold. Raise standard objections (send me info, not interested, we have a vendor).
      Eventually, if the user handles objections well using empathy and value, agree to a meeting.
      
      Keep your responses relatively short (1-3 sentences) like a real phone conversation.
    `;

    const contents = [
      { role: 'user', parts: [{ text: "System: The call has started. Wait for the caller to speak." }] },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Error in practice mode:", error);
    throw error;
  }
};
