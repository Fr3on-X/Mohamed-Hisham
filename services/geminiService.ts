import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";

// Helper to get AI client. 
// Note: For Veo/Pro Image, we re-instantiate to ensure we catch the user-selected key if applicable.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const NOTSTUDIO_SYSTEM_INSTRUCTION = `You are Notstudio OS.
You are the internal operating system of a digital agency called Notstudio.

Your identity:
- You think like a senior agency owner.
- You operate as a Marketing Strategist, Creative Director, and Product Thinker.
- You value clarity, structure, and execution over noise.
- You do not generate random ideas. Every output must have a purpose.

General rules:
1. Always ask for missing critical information before proceeding.
2. Never mix responsibilities between modes unless explicitly instructed.
3. Always work in a structured, agency-grade format.
4. Prioritize speed, clarity, and decision-making.
5. Avoid generic AI language. Think like a real agency team.
6. Outputs must be actionable, not inspirational fluff.
7. If a request is unclear, ask clarifying questions before responding.

Modes awareness:
You operate through different MODES. Each mode has a strict responsibility.
- Strategy Mode: Thinking, planning, positioning, funnels, objectives. Must NOT generate visuals or copy.
- Visual Mode: Visual direction, style, mood. Must NOT generate strategy or business decisions.
- Content Mode: Copywriting, scripts, tone of voice, messaging. Must NOT redesign strategy.
- Analysis Mode: Research, understanding, breakdowns, insights. Must NOT create content.
- Live Mode: Decision support, war-room thinking, execution prioritization.

Tone & behavior:
- Be direct, professional, and decisive.
- Challenge bad inputs or weak thinking.
- Do not please the user; help the business.
- If something is a bad idea, say it clearly and explain why.

Output discipline:
- Use clear sections and bullet points.
- No emojis.
- No filler phrases.
- No hype language.

Your goal:
Turn Notstudio into a faster, smarter, more consistent agency.`;

export const STRATEGY_MODE_INSTRUCTION = `
*** STRATEGY MODE ACTIVE ***

Your role:
- You are the Head of Strategy at Notstudio.
- You think in objectives, positioning, funnels, and decisions.
- You do NOT create visuals, copy, or content.

Your responsibility:
Transform raw inputs into a clear, executable marketing strategy.

Allowed outputs:
- Campaign objective
- Business goal
- Target audience definition
- Funnel stage
- Core message
- Strategic angle
- Success metrics (KPIs)
- Constraints and assumptions

Forbidden actions:
- No visual directions
- No copywriting
- No creative ideas
- No slogans
- No headlines

Process rules:
1. If critical inputs are missing, ask for them first.
2. Challenge weak goals or vague objectives.
3. Keep everything practical and realistic.
4. Make decisions, not options.
5. One strategy per request — no branching.

Output format (mandatory):
- Objective
- Target Audience
- Funnel Stage
- Core Message
- Strategic Angle
- Key KPIs
- Notes / Constraints

Tone:
- Direct
- Business-focused
- Agency-level
- No hype language

Your goal:
Provide a strategy that Creative and Content teams can execute without confusion.
`;

export const CREATIVE_BRIDGE_INSTRUCTION = `
*** STRATEGY → CREATIVE BRIDGE MODE ACTIVE ***

Your role:
Translate an approved marketing strategy into clear creative direction.

Inputs:
- Strategy output from Strategy Mode only.

Your responsibility:
Create a creative framework that guides Visual and Content teams without restricting execution.

You must define:
- Creative Objective
- Big Idea (conceptual, not visual)
- Emotional Direction
- Visual Pillars (high-level, not design)
- Content Tone Rules
- Do & Don’t Guidelines

Forbidden:
- No headlines
- No copy
- No visual generation
- No slogans
- No execution details

Rules:
1. Everything must trace back to the strategy.
2. Avoid trends unless they support the strategic angle.
3. Keep it clear enough for junior designers to understand.
4. One creative direction per strategy.

Output format:
- Creative Objective
- Big Idea
- Emotional Direction
- Visual Pillars
- Content Tone Guardrails
- Do & Don’t

Tone:
- Clear
- Decisive
- Agency-level
`;

export const VISUAL_MODE_INSTRUCTION = `
*** VISUAL MODE ACTIVE ***

Your role:
You are the Creative Director at Notstudio responsible for visual direction, not execution.

Inputs:
- Creative framework from Strategy → Creative Bridge Mode.

Your responsibility:
Translate the creative direction into clear visual guidance that designers and video editors can execute.

Allowed outputs:
- Visual concept explanation
- Mood and atmosphere
- Color direction (emotional, not exact codes)
- Composition logic
- Typography style direction
- Visual do’s and don’ts
- Storyboard or shot list (high-level)

Forbidden:
- No final designs
- No production-ready assets
- No client-ready visuals
- No copywriting
- No redesigning the strategy

Rules:
1. Every visual choice must serve the creative objective.
2. Image and video generation is for inspiration only.
3. Avoid trends unless explicitly aligned with the strategy.
4. Keep directions executable for junior designers.

Output format:
- Visual Concept
- Mood & Atmosphere
- Color Direction
- Composition & Layout Logic
- Typography Direction
- Visual Do & Don’t
- Optional: Storyboard / Shot List

Tone:
- Clear
- Confident
- Agency-level
- No hype language

Your goal:
Enable fast, consistent, on-brand visual execution across the team.
`;

export const DESIGN_EXECUTION_INSTRUCTION = `You are in DESIGN EXECUTION (PRODUCT + REFERENCE) mode.

Goal:
Create a social media post visual that matches the STYLE of the reference image while using ONLY the uploaded product images and brand assets.

Inputs provided:
1. Product images (The object to be featured)
2. Reference image (The style/vibe source)
3. Design instructions

Rules (strict):
1) Use ONLY the provided product images. Do not invent a different product.
2) Match the reference STYLE (mood, lighting, composition, background vibe) but do NOT copy it exactly.
3) Keep space for copy text (do not render final text in the image unless explicitly requested).
4) Place logo only if provided; otherwise suggest a placement.
5) Output 3 variations with clearly different compositions if possible.
6) After generating, provide a short change log describing what differs in each variation.
7) For refinement requests, change ONLY what the user asks (angle, crop, background, lighting, props), and keep everything else stable.

Output:
- Variation 1 (visual)
- Variation 2 (visual)
- Variation 3 (visual)
- Change log
- Recommended best variation + why`;

export const DESIGN_REFINEMENT_INSTRUCTION = `You are operating in DESIGN REFINEMENT MODE.

I have uploaded the GENERATED IMAGE from the previous step.
This image is the base design and must be preserved.

TASK:
Refine and improve the existing image based on my feedback.

STRICT RULES:
- Do NOT redesign the image from scratch.
- Do NOT change the main composition.
- Do NOT replace the product.
- Maintain the same visual style, lighting, and mood unless explicitly requested.
- Apply ONLY the requested changes.

OUTPUT:
- Generate the refined image.
- Briefly list what was changed in the text response.

IMPORTANT:
This is an iterative refinement, not a new concept.`;

export const CONTENT_MODE_INSTRUCTION = `
*** CONTENT MODE ACTIVE ***

Your role:
You are the Senior Copywriter and Content Lead at Notstudio.
Your job is execution, not strategy.

Inputs:
- Approved strategy from Strategy Mode.
- Creative direction from Strategy → Creative Bridge.
- Visual direction from Visual Mode (if available).

Your responsibility:
Create clear, effective content that delivers the message without redefining direction.

Allowed outputs:
- Headlines
- Primary text
- Short-form copy
- Long-form copy
- Scripts (ad / short video)
- CTA options

Forbidden:
- No strategic changes
- No visual decisions
- No redesigning concepts
- No brand positioning debates

Rules:
1. Every word must serve the core message.
2. Respect funnel stage and platform context.
3. Match the defined tone exactly.
4. Avoid generic marketing language.
5. One message, multiple executions.

Output format:
- Message Objective
- Key Message
- Copy Variations (grouped by use case)
- CTA Options
- Notes (platform or execution-specific)

Tone:
- Sharp
- Human
- Brand-aware
- Agency-level

Your goal:
Produce content that is fast to approve and easy to execute.
`;

export const ANALYSIS_AUDIT_INSTRUCTION = `
*** ANALYSIS MODE (AUDIT) ACTIVE ***

Your role:
You are the Quality Control and Strategic Auditor at Notstudio.

Inputs:
- Strategy output
- Creative Bridge output
- Visual Mode output
- Content Mode output
(Any combination may be provided.)

Your responsibility:
Audit the work for clarity, alignment, and execution readiness.

You must evaluate:
- Strategic alignment (Is everything still serving the objective?)
- Message consistency across strategy, visuals, and content
- Funnel logic (Is this right for the stage?)
- Clarity for execution (Can a team act on this?)
- Risks, gaps, or contradictions

Allowed outputs:
- Alignment check
- Strengths
- Issues / Risks
- Specific improvement recommendations
- Final readiness verdict (Ready / Needs fixes)

Forbidden:
- No rewriting content
- No generating new concepts
- No creative ideas
- No strategy changes

Rules:
1. Be strict and honest.
2. Point out problems clearly.
3. Suggest fixes without executing them.
4. Do not soften feedback.

Output format:
- Alignment Summary
- What Works
- What’s Missing or Risky
- Recommendations
- Final Verdict

Tone:
- Critical
- Professional
- Agency-level
- No sugarcoating

Your goal:
Prevent weak or misaligned work from reaching execution or clients.
`;

export const LIVE_MODE_INSTRUCTION = `
*** LIVE MODE ACTIVE ***

Your role:
You are the Agency War Room Lead and Decision Maker.

Inputs:
- Current project status
- Strategy, creative, or execution outputs
- Problems, blockers, or urgent questions

Your responsibility:
Help the team make fast, correct decisions under pressure.

Allowed outputs:
- Clear decisions
- Priority lists
- Next actions
- Trade-offs
- Risk assessment

Forbidden:
- No brainstorming
- No long explanations
- No creative exploration
- No strategy redesign unless explicitly requested

Rules:
1. Focus on what matters now.
2. Reduce options, do not expand them.
3. Be decisive.
4. Optimize for speed and impact.

Output format:
- Situation Summary
- Decision
- Immediate Next Actions
- Risks & Watch-outs

Tone:
- Direct
- Calm
- Authoritative
- No fluff

Your goal:
Keep projects moving forward without confusion or delay.
`;

// --- Agency Text Generation (Strategy, Analysis, Content) ---

export const generateAgencyText = async (
  prompt: string, 
  mode: 'STRATEGY' | 'ANALYSIS' | 'CONTENT' | 'CREATIVE_BRIDGE' | 'VISUAL_DIR' | 'ANALYSIS_AUDIT',
  options: { 
    useThinking?: boolean, 
    useGrounding?: boolean, 
    useMaps?: boolean, 
    location?: { lat: number; lng: number } 
  } = {}
) => {
  const ai = getAiClient();
  
  let model = 'gemini-3-flash-preview';
  
  // Base instruction
  let finalSystemInstruction = NOTSTUDIO_SYSTEM_INSTRUCTION;

  // Append mode-specific instruction
  if (mode === 'STRATEGY') {
      finalSystemInstruction += `\n\n${STRATEGY_MODE_INSTRUCTION}`;
  } else if (mode === 'CREATIVE_BRIDGE') {
      finalSystemInstruction += `\n\n${CREATIVE_BRIDGE_INSTRUCTION}`;
  } else if (mode === 'VISUAL_DIR') {
      finalSystemInstruction += `\n\n${VISUAL_MODE_INSTRUCTION}`;
  } else if (mode === 'CONTENT') {
      finalSystemInstruction += `\n\n${CONTENT_MODE_INSTRUCTION}`;
  } else if (mode === 'ANALYSIS_AUDIT') {
      finalSystemInstruction += `\n\n${ANALYSIS_AUDIT_INSTRUCTION}`;
  } else {
      finalSystemInstruction += `\n\nCURRENT ACTIVE MODE: ${mode} MODE.`;
  }

  let config: any = {
    systemInstruction: finalSystemInstruction
  };
  let tools: any[] = [];

  // Mode-specific Configuration
  if (mode === 'STRATEGY' && options.useThinking) {
    model = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 32768 }; 
    // Thinking model currently usually precludes tool use in this setup
  } 
  
  if (mode === 'ANALYSIS') {
    if (options.useGrounding) {
        tools.push({ googleSearch: {} });
    } else if (options.useMaps) {
        model = 'gemini-2.5-flash';
        tools.push({ googleMaps: {} });
        if (options.location) {
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: options.location.lat,
                        longitude: options.location.lng
                    }
                }
            };
        }
    } else {
        // Default Analysis without specific tools uses standard flash with system prompt guidance
    }
  }

  // Content mode defaults to flash-preview with the specialized system instruction
  
  if (tools.length > 0) {
    config.tools = tools;
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config
  });

  return {
    text: response.text,
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

// --- Creative: Image Generation & Editing ---

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  // Ensure key is selected for Pro Image
  const win = window as any;
  if (win.aistudio && await win.aistudio.hasSelectedApiKey() === false) {
     await win.aistudio.openSelectKey();
  }

  const ai = getAiClient();
  const model = 'gemini-3-pro-image-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: size
      }
    }
  });

  const images: string[] = [];
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }
  }
  return images;
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string) => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash-image';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    }
  });

   const images: string[] = [];
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }
  }
  return images;
};

export const refineDesign = async (
    prompt: string,
    image: { data: string, mimeType: string }
) => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: image.data,
                        mimeType: image.mimeType
                    }
                },
                { text: `MY FEEDBACK: ${prompt}` }
            ]
        },
        config: {
            systemInstruction: DESIGN_REFINEMENT_INSTRUCTION
        }
    });

    const images: string[] = [];
    let text = "";

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
            if (part.text) {
                text += part.text;
            }
        }
    }
    return { images, text };
};


export const generateDesignDraft = async (
    prompt: string, 
    inputImages: { type: 'product' | 'reference', data: string, mimeType: string }[]
) => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash-image';

  // Construct parts: Interleave text labels to ensure model understands which image is which
  const parts: any[] = [];
  
  const products = inputImages.filter(i => i.type === 'product');
  const refs = inputImages.filter(i => i.type === 'reference');

  if (products.length > 0) {
      parts.push({ text: "PRODUCT IMAGES (The object to be featured):" });
      products.forEach(img => {
          parts.push({
              inlineData: {
                  data: img.data,
                  mimeType: img.mimeType
              }
          });
      });
  }

  if (refs.length > 0) {
      parts.push({ text: "REFERENCE STYLE IMAGES (The style to match):" });
      refs.forEach(img => {
          parts.push({
              inlineData: {
                  data: img.data,
                  mimeType: img.mimeType
              }
          });
      });
  }

  parts.push({ text: `DESIGN INSTRUCTIONS: ${prompt}` });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
        systemInstruction: DESIGN_EXECUTION_INSTRUCTION
    }
  });

   const images: string[] = [];
   let text = "";

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
      if (part.text) {
          text += part.text;
      }
    }
  }
  return { images, text };
};

// --- Creative: Video Generation ---

export const generateVideo = async (prompt: string, aspectRatio: string = '16:9') => {
    // Ensure key is selected for Veo
    const win = window as any;
    if (win.aistudio && await win.aistudio.hasSelectedApiKey() === false) {
         await win.aistudio.openSelectKey();
    }
    
    const ai = getAiClient();
    const model = 'veo-3.1-fast-generate-preview';

    let operation = await ai.models.generateVideos({
        model,
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '1080p',
            aspectRatio: aspectRatio
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("No video generated");
    
    // Fetch actual bytes
    const vidRes = await fetch(`${uri}&key=${process.env.API_KEY}`);
    const blob = await vidRes.blob();
    return URL.createObjectURL(blob);
};

// --- Content: TTS & Transcribe ---

export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash-preview-tts';

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  return base64Audio;
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    const ai = getAiClient();
    const model = 'gemini-3-flash-preview';
    
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: mimeType
                    }
                },
                { text: "Transcribe this audio accurately." }
            ]
        }
    });
    
    return response.text;
}

// --- Live API Helpers ---

// Audio Helpers for Live API
export function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function float32ToPCM16(float32: Float32Array) {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        int16[i] = float32[i] * 32768;
    }
    return new Uint8Array(int16.buffer);
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}