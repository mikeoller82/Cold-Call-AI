import { GoogleGenAI, SchemaType, Type } from "@google/genai";
import { ScriptFormData, ScriptAnalysisResult } from "../types";

const buildPrompt = (data: ScriptFormData): string => {
  // We incorporate the pre-filled prospectContext if available
  const contextInstruction = data.prospectContext 
    ? `**SPECIFIC CONTEXT FOUND**: "${data.prospectContext}". USE THIS IN THE HOOK.` 
    : `Perform a live Google Search for '${data.prospectCompany}' to find recent news (expansions, hiring, earnings) to use as a hook.`;

  // Determine length instructions
  const lengthInstruction = data.scriptLength?.includes("Short")
    ? "EXTREME BREVITY. Cut all fluff. Get to the point immediately. Focus on the hook and the ask. Target ~100-150 words."
    : data.scriptLength?.includes("Long")
    ? "DETAILED & CONVERSATIONAL. You have more time to build rapport, explain the context fully, and provide more social proof details. Target ~250+ words."
    : "BALANCED. Standard cold call pacing. Target ~180-200 words.";

  // Determine Objective Instructions
  let objectiveSpecifics = "";
  if (data.callObjective.includes("Fit Call")) {
    objectiveSpecifics = "GOAL: Low friction. Do NOT ask for a meeting yet. Just ask if they are open to discussing this to see if there is a fit. The 'Ask' should be soft (e.g., 'Does it make sense to keep talking?').";
  } else if (data.callObjective.includes("Demo")) {
    objectiveSpecifics = "GOAL: Sell the VISUAL. You cannot solve the problem on the phone. You need to show them. The 'Ask' must be for a brief time to SHOW them the platform.";
  } else if (data.callObjective.includes("Referral")) {
    objectiveSpecifics = "GOAL: Navigation. Assume you might be talking to the wrong person. The 'Ask' is 'Who handles [pain point]?' or 'Are you the best person to speak with regarding X?'";
  } else {
    objectiveSpecifics = "GOAL: High-level Consult. Position yourself as an expert advisor. The 'Ask' is for a strategy session to audit their current process.";
  }

  return `
You are an elite Sales Strategist & Copywriter (Challenger Sale, Chris Voss, Jeremy Miner, Alex Hormozi).
Your goal is to write a **High-Probability, Non-Generic Cold Call Script**.

*** CRITICAL RULES - READ FIRST ***
1. **NO GENERIC FLUFF**: Do NOT use phrases like "I hope you are doing well", "Just checking in", "Touching base", or "Is now a good time?". These kill conversion.
2. **PEER-TO-PEER TONE**: Write as an industry consultant, not a subservient salesperson.
3. **SPECIFICITY**: If the input data is vague, INFER specific industry pains/metrics based on the '${data.targetIndustry}' industry. Do not leave generic "[Insert Metric]" placeholders unless absolutely necessary.
4. **FORMATTING**: Use '>' for dialogue. Use [ ] for tonal instructions.
5. **MICRO-COMMITMENTS**: The script MUST be a dialogue, not a monologue. Integrate "Tie-Down" questions (e.g., "Does that sound like your world?", "Fair enough?") to get small "Yes" agreements before moving to the next step.

*** INPUT DATA ***
- **Caller**: ${data.callerName}, ${data.callerTitle} at ${data.callerCompany}
- **Prospect**: ${data.targetRole} ${data.prospectCompany ? `at ${data.prospectCompany}` : ''}
- **Industry**: ${data.targetIndustry}
- **Prospect Context/News**: ${data.prospectContext || "To be researched"}
- **Pain Point**: ${data.painPoint}
- **Solution**: ${data.solution}
- **Value Prop**: ${data.valueProposition}
- **Tone**: ${data.tone}
- **Target Length**: ${data.scriptLength}

*** RESEARCH INSTRUCTIONS ***
${contextInstruction}
If no specific company news is found, use recent trends in the ${data.targetIndustry} industry.

*** SCRIPT ARCHITECTURE ***

**CONSTRAINT 1 (Length): ${lengthInstruction}**
**CONSTRAINT 2 (Objective): ${objectiveSpecifics}**

1. **THE OPENER (The "Permission to Reject")**
   - Do not ask "How are you?".
   - Use a pattern interrupt like: "I'll be upfront, this is a cold call, you can hang up or give me 30 seconds." OR "I know I'm an interruption, can I steal 27 seconds to tell you why I called?"
   - *Micro-Commitment*: Wait for them to say "Go ahead" or "Sure".

2. **THE CONTEXT HOOK (Relevance > Personalization)**
   - Connect specifically to the ${data.prospectContext ? "provided Context" : "research you found"}.
   - Example format: "I saw you guys are [Action/News], usually that means [Problem/Pain]."

3. **THE PROBLEM PITCH (Gap Selling)**
   - Don't pitch the product. Pitch the *problem* they likely have.
   - Focus on the "Cost of Inaction" regarding ${data.painPoint}.
   - Use "Challenger" language: "Most ${data.targetRole}s I talk to are struggling with X..."
   - **MANDATORY**: End this section with a *Micro-Commitment Question* to validate the pain (e.g., "Is that a challenge you're facing currently?" or "Does that resonate?").

4. **THE SOLUTION BRIDGE**
   - Briefly mention ${data.solution} as the mechanism, but focus on the *Outcome* (${data.valueProposition}).
   - *Social Proof Drop*: Mention ${data.socialProof} casually ("It's how we helped [Company] do X").
   - **MANDATORY**: Include a resonance check: "See how that would shift the [Metric]?" or "Does that align with your goals?"

5. **ELITE OBJECTION HANDLING (The "Unrefusable" Responses)**
   Use high-status, psychological verbal judo inspired by Jordan Belfort (Straight Line), Alex Hormozi (Value Equation), and Grant Cardone (Agreement).

   - **Scenario A: "I'm not interested" (The "Reasonable Man" Loop)**
     - *Concept*: "Not interested" means "I don't understand the value yet."
     - *Tactic*: Agree, Deflect, then offer a "No-Brainer" Outcome.
     - *Scripting*: "I wouldn't expect you to be. You don't know who I am yet. But if I told you I could help you [Specific Benefit] in the next 30 days, you'd at least be *curious* how I do it, right? Everyone likes [Benefit]."

   - **Scenario B: "Send me some information" (The "Information Trap")**
     - *Concept*: Do not accept the brush-off. Force a micro-commitment to read it.
     - *Tactic*: The "Anti-Spam" Filter. Make the email conditional to avoid the trash bin.
     - *Scripting*: "I can definitely do that. But our documentation is 40 pages long. To make sure I don't waste your time with irrelevant junk, are you currently trying to fix [Problem A] or [Problem B]? Tell me that, and I'll send only what matters."

   - **Scenario C: "I'm busy / Call me later" (The "Radical Candor" Interrupt)**
     - *Concept*: Acknowledge status. Busy people are decision makers.
     - *Tactic*: The "30-Second Timer" (Cardone/Voss Agreement).
     - *Scripting*: "I know, that's why I'm calling you. Successful people are always busy. Give me 27 seconds to explain why I called. If it’s not relevant, you can hang up. Fair?"

6. **HIGH CLOSING TACTICS (Provide THREE Distinct Options based on Objective)**
   - **Option A (The Standard Close)**: A direct ask aligned with: "${data.callObjective}".
   - **Option B (The Soft/Negative Close)**: "Maybe this isn't a priority right now?" (Let them chase you).
   - **Option C (The Alternative Close)**: "Do you have time Tuesday, or is Thursday better to [Specific Action]?"

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
      - **MICRO-COMMITMENTS**: Ensure the script includes small "yes" questions (tie-downs) to build momentum.
      
      *** ORIGINAL SCRIPT ***
      ${originalScript}
      
      *** EXPERT SUGGESTIONS TO APPLY ***
      ${suggestions.map((s, i) => `${i+1}. ${s}`).join('\n')}
      
      *** CONTEXT ***
      - Caller: ${formData.callerName}
      - Prospect Role: ${formData.targetRole}
      - Company: ${formData.callerCompany}
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

// Interface for what we get back from Gemini analysis
interface CompanyAnalysisResponse {
  painPoint?: string;
  solution?: string;
  valueProposition?: string;
  socialProof?: string;
  prospectContext?: string;
}

export const analyzeCompany = async (target: string, type: 'caller' | 'prospect'): Promise<CompanyAnalysisResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    let specificInstructions = "";
    let requiredFields: string[] = [];

    if (type === 'caller') {
      specificInstructions = `
        *** MODE: ANALYZE CALLER (SELLER) ***
        Identify what this company SELLS aggressively.
        1. **Solution**: Extract the core Product Name or Service Category (e.g., "Cloud ERP", "Cybersecurity Audit").
        2. **Value Proposition**: Extract HARD METRICS. Look for %, $, or time savings (e.g., "Reduce spend by 30%"). If no specific metrics found, infer a strong benefit.
        3. **Social Proof**: List 2-3 specific client names (e.g., "Google, Amazon") or "Fortune 500 companies".
        4. **Pain Point**: What generic problem do they solve? (e.g., "Data breaches", "Inefficient hiring").
      `;
      requiredFields = ["solution", "valueProposition"];
    } else {
      specificInstructions = `
        *** MODE: ANALYZE PROSPECT (BUYER) ***
        Identify what this company DOES and their likely CHALLENGES.
        1. **Pain Point**: Infer a major, specific strategic challenge they face based on their industry and recent news (e.g., "Supply chain volatility due to expansion", "Compliance risks in new markets").
        2. **Prospect Context**: Find RECENT NEWS (last 12 months). Look for: Funding, Expansion, New Hires, New Products, or Earnings Reports. Summary in 1 short sentence. (e.g., "Just raised Series B", "Opened new HQ in Texas").
        3. **Solution**: (Optional) What do they do?
        4. **Value Proposition**: (Optional) What is their mission?
      `;
      requiredFields = ["painPoint", "prospectContext"];
    }

    const prompt = `
      TARGET: ${target}
      
      You are a specialized B2B Researcher and Data Miner.
      TASK: Perform a live search on the TARGET (URL or Name) and extract high-value sales insights.
      
      ${specificInstructions}
      
      NOTE: Handle unstructured websites by summarizing the "About Us" or "Services" page if direct claims aren't found.
      PRIORITIZE: Quantifiable numbers (ROI, savings, revenue) over generic buzzwords.

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
            prospectContext: { type: Type.STRING },
          },
          required: requiredFields
        },
        tools: [{googleSearch: {}}], 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated.");
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error analyzing ${type}:`, error);
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
      Role: ${formData.targetRole} at ${formData.prospectCompany || "a company"}.
      
      Personality:
      - You are busy and skeptical.
      - You hate generic sales pitches.
      - If the user sounds like a robot or asks "How are you", shut them down immediately.
      - If the user uses a "Pattern Interrupt" or "Negative Reverse", respond with intrigue.
      
      Current Pain: ${formData.painPoint}.
      Context: ${formData.prospectContext || "Standard business day."}
      
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
