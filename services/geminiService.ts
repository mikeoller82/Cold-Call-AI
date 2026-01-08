import { GoogleGenAI, SchemaType, Type } from "@google/genai";
import { ScriptFormData, ScriptAnalysisResult } from "../types";

const buildPrompt = (data: ScriptFormData): string => {
  return `
You are an elite Sales Strategist & Copywriter (Challenger Sale, Chris Voss, Jeremy Miner, Alex Hormozi).
Your goal is to write a **High-Probability, Non-Generic Cold Call Script**.

*** CRITICAL RULES - READ FIRST ***
1. **NO GENERIC FLUFF**: Do NOT use phrases like "I hope you are doing well", "Just checking in", "Touching base", or "Is now a good time?". These kill conversion.
2. **PEER-TO-PEER TONE**: Write as an industry consultant, not a subservient salesperson.
3. **SPECIFICITY**: If the input data is vague, INFER specific industry pains/metrics based on the '${data.targetIndustry}' industry. Do not leave generic "[Insert Metric]" placeholders unless absolutely necessary.
4. **FORMATTING**: Use '>' for dialogue. Use [ ] for tonal instructions.

*** INPUT DATA ***
- **Caller**: ${data.callerName}, ${data.callerTitle} at ${data.companyName}
- **Prospect**: ${data.targetRole} ${data.prospectCompanyName ? `at ${data.prospectCompanyName}` : ''}
- **Industry**: ${data.targetIndustry}
- **Pain Point**: ${data.painPoint}
- **Solution**: ${data.solution}
- **Value Prop**: ${data.valueProposition}
- **Tone**: ${data.tone}

*** RESEARCH CONTEXT ***
You have access to Google Search. You MUST perform a live search for '${data.prospectCompanyName}' (and '${data.prospectWebsite}' if provided) to find recent news, initiatives, hiring sprees, or financial reports.
- **MANDATORY**: Incorporate a *specific* real-world finding (e.g., "I saw you just opened a new facility in Austin") into the "Context Hook".
- If no specific company news is found, search for recent trends in the ${data.targetIndustry} industry and reference those.

*** SCRIPT ARCHITECTURE ***

1. **THE OPENER (The "Permission to Reject")**
   - Do not ask "How are you?".
   - Use a pattern interrupt like: "I'll be upfront, this is a cold call, you can hang up or give me 30 seconds." OR "I know I'm an interruption, can I steal 27 seconds to tell you why I called?"

2. **THE CONTEXT HOOK (Relevance > Personalization)**
   - Connect specifically to the research you found above.
   - Example format: "I saw you guys are [Action/News], usually that means [Problem/Pain]."

3. **THE PROBLEM PITCH (Gap Selling)**
   - Don't pitch the product. Pitch the *problem* they likely have.
   - Focus on the "Cost of Inaction" regarding ${data.painPoint}.
   - Use "Challenger" language: "Most ${data.targetRole}s I talk to are struggling with X..."

4. **THE SOLUTION BRIDGE**
   - Briefly mention ${data.solution} as the mechanism, but focus on the *Outcome* (${data.valueProposition}).
   - *Social Proof Drop*: Mention ${data.socialProof} casually ("It's how we helped [Company] do X").

5. **OBJECTION HANDLING (The "Push-Pull")**
   - Provide a 1-sentence response to "I'm busy" or "Send me an email".
   - Tactic: Agree, then pivot. "That's exactly why I called. I don't want to waste time on a call if this isn't a fit. Just one question..."

6. **HIGH CLOSING TACTICS (Provide THREE Distinct Options)**
   - **Option A (The Assumptive Close)**: Treat the meeting as the natural next step. "It sounds like this addresses the bottleneck we discussed. Let's grab 15 minutes on Tuesday to walk through the implementation—does morning or afternoon work better for you?"
   - **Option B (The Scarcity Close)**: Create natural urgency without being pushy. "My calendar for [Industry] consultations is pretty packed next week, but I have a window on Wednesday and one on Friday. Do you want to lock in the Wednesday slot before it's gone?"
   - **Option C (The Summary Close)**: Recap the specific value before the ask. "If we can truly [Value Prop] and solve [Pain Point] as I described, does it make sense to invest 15 minutes next week to validate this, or should I leave you be?"

Write the script now. Keep it punchy, rhythmic, and designed for ${data.tone} delivery.
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
        temperature: 0.8, // Slightly higher for more creative/bold phrasing
        maxOutputTokens: 2500,
        tools: [{googleSearch: {}}],
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

export const improveScript = async (
  formData: ScriptFormData,
  originalScript: string,
  suggestions: string[]
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert Sales Script Doctor.
      
      *** GOAL ***
      Rewrite the following Cold Call Script to incorporate the specific EXPERT SUGGESTIONS provided below. 
      
      *** CONSTRAINT ***
      Make the script **SHARPER** and **LESS GENERIC**. 
      - Remove any "wimpy" language (e.g., "I'd love to", "If you have time").
      - Use high-status, peer-to-peer language.
      - Ensure closing tactics are **Assumptive**, **Summary-based**, or utilize **Natural Scarcity**.
      
      *** ORIGINAL SCRIPT ***
      ${originalScript}
      
      *** EXPERT SUGGESTIONS TO APPLY ***
      ${suggestions.map((s, i) => `${i+1}. ${s}`).join('\n')}
      
      *** CONTEXT ***
      - Caller: ${formData.callerName}
      - Prospect Role: ${formData.targetRole}
      - Company: ${formData.companyName}
      - Tone: ${formData.tone}
      
      *** OUTPUT FORMAT ***
      Return ONLY the rewritten script. Use standard formatting (dialogue with >, notes in []).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2500,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No improved content generated.");
    return text;
  } catch (error) {
    console.error("Error improving script:", error);
    throw error;
  }
};

export const analyzeBusinessUrl = async (target: string): Promise<Partial<ScriptFormData>> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      TARGET: ${target}

      You are a specialized B2B Researcher and Analyst.
      
      TASK: Perform a live search on the specific TARGET (which may be a URL or a Company Name) to extract aggressive sales messaging.
      
      INSTRUCTIONS:
      1. **VERIFY TARGET**: If the input is a URL, visit it. If it is a Company Name, Google it to find their main website and "vs competitors" or "case studies" pages.
      2. **SEARCH COMMANDS**: Search for case studies, pricing pages, and "vs competitors" pages.
      3. **EXTRACTION**:
         - **Pain Point**: Find the most expensive problem they solve for THEIR customers.
         - **Solution**: Their Product name or core service.
         - **Value Proposition**: Find specific metrics they promise (ROI, hours saved, % growth).
         - **Social Proof**: Big name clients they work with.

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
      Analyze the following cold call script against Elite Sales Standards (Challenger Sale, Sandler, Voss).
      
      Script:
      ${scriptContent}
      
      Evaluate strictly on:
      1. **Pattern Interrupt**: Does it sound different from a telemarketer?
      2. **Tonal Authority**: Is it peer-to-peer or subservient?
      3. **Closing Tactics**: Are the asks clear and psychological (not just "can we meet")?
      
      JSON Schema:
      {
        "overallScore": number (0-100),
        "hookScore": number (0-100),
        "empathyScore": number (0-100),
        "clarityScore": number (0-100),
        "strengths": string[] (max 3),
        "weaknesses": string[] (max 3),
        "suggestions": string[] (max 3 specific, high-level tactical changes)
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
      You are roleplaying as a TOUGH prospect in the ${formData.targetIndustry} industry.
      Role: ${formData.targetRole} at ${formData.prospectCompanyName || "a company"}.
      
      Personality:
      - You are busy and skeptical.
      - You hate generic sales pitches.
      - If the user sounds like a robot or asks "How are you", shut them down immediately.
      - If the user uses a "Pattern Interrupt" or "Negative Reverse", respond with intrigue.
      
      Current Pain: ${formData.painPoint}.
      
      Goal: Only agree to a meeting if they prove specific value or specific insight into your industry.
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
        temperature: 1.0, 
      }
    });

    return response.text || "...";
  } catch (error) {
    console.error("Error in practice mode:", error);
    throw error;
  }
};
