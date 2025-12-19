# Notstudio OS: System Architecture & Operations Manual (v1.0)

**Date:** October 26, 2023
**Classification:** Internal Documentation
**Owner:** Product Architecture & Operations

---

## SECTION 1: System Overview

**What is Notstudio OS?**
Notstudio OS (Nexus) is a unified, context-aware AI operating system designed specifically for digital agency workflows. It is not a chatbot; it is a role-based processing environment that mimics the structure of a real agency team. It unifies Strategy, Creative, Content, and Management functions into a single prompt-driven interface.

**Why it was built:**
*   **To Eliminate Fragmentation:** Agencies currently lose efficiency switching between unconnected AI tools (text in one, images in another, video in a third).
*   **To Enforce Consistency:** Generic AI models lack "agency memory." Nexus ensures strategy dictates creative, and creative dictates content.
*   **To Solve "Blank Page" Paralysis:** The system is designed to always provide a starting structure based on professional frameworks.

**Core Philosophy:**
*   **Role-Based Logic:** The AI switches "brains" (Personas) entirely depending on the active mode.
*   **Strict Guardrails:** A Strategist cannot design; a Designer cannot rewrite strategy.
*   **Prompt-Driven UI:** Complex functionality is accessed through natural language, not complex menus.

---

## SECTION 2: Core System Brain

The system is governed by a global "System Instruction" that is injected into every interaction. This acts as the "Constitution" of the OS.

**System Identity:**
*   **Persona:** Senior Agency Owner & Product Architect.
*   **Tone:** Direct, professional, decisive, anti-fluff.
*   **Behavior:** Challenges weak inputs. Does not aim to please the user, but to solve the business problem.

**Governance Rules:**
1.  **Mode Discipline:** The system must refuse to perform tasks outside its active mode (e.g., "I cannot write copy in Strategy Mode").
2.  **Structured Output:** Responses must be formatted for execution (bullet points, clear headers), never conversational prose.
3.  **Thinking vs. Execution:** Complex strategic tasks utilize "Thinking Models" (Gemini 3 Pro) for reasoning, while execution tasks use faster models (Gemini 2.5 Flash) for speed.

---

## SECTION 3: Modes Architecture (High-Level)

The OS is divided into distinct **Modes** to prevent context pollution and ensure high-quality output.

1.  **Strategy Mode:** The brain. Planning and logic.
2.  **Strategy → Creative Bridge:** The translator. Converts logic to creative concepts.
3.  **Visual Mode (Direction):** The art director. Defines style without executing it.
4.  **Design Execution Mode:** The hands. Generates and refines assets.
5.  **Content Mode:** The voice. Copywriting and audio.
6.  **Analysis Mode:** The auditor. QA and research.
7.  **Live Mode (War Room):** The decision maker. Real-time consult.

**Data Flow:**
`Client Input` → **Strategy** → **Bridge** → **Visual Direction** → **Design Execution** → **Content** → **Analysis (QA)**

---

## SECTION 4: Detailed Mode Documentation

### A) Strategy Mode
*   **Purpose:** To define the "Why" and "Who" before any creative work begins.
*   **Who uses it:** Strategists, Account Managers.
*   **Inputs:** Raw client data, business goals, constraints.
*   **Outputs:** Campaign Objectives, Funnels, Target Personas, KPIs.
*   **Allowed:** Strategic reasoning, funnel mapping, data synthesis.
*   **Forbidden:** Creative concepts, slogans, visual descriptions, final copy.
*   **Prevention:** Stops the "make it pop" feedback loop by forcing objective alignment first.

### B) Strategy → Creative Bridge
*   **Purpose:** To translate business logic into a Creative Framework.
*   **Why it exists:** Strategists often write dry briefs; Creatives ignore dry briefs. This mode translates the former into the latter.
*   **Inputs:** Approved Strategy.
*   **Outputs:** "The Big Idea," Emotional Direction, Tone Guardrails.
*   **Role:** Ensures creative work is grounded in business objectives.

### C) Visual Mode (Creative Direction)
*   **Purpose:** To establish the Visual Language (Art Direction).
*   **Direction vs. Execution:** This mode defines *what* it should look like (Mood, Color, Type, Composition) but does *not* generate the final pixels.
*   **Outputs:** Textual Moodboards, Color Theory, Shot Lists.
*   **Guardrails:** Focuses on vibes and consistency, not pixel-perfect details.

### D) Design Execution Sub-Mode (Product + Reference)
*   **Purpose:** To produce actual visual assets based on strict inputs.
*   **Role:** AI Graphic Designer / Junior Designer.
*   **Supported Workflows:**
    *   **Product-Only:** Generates context around a product image.
    *   **Product + Reference (Dual-Input):** Transfers the *style* of a reference image onto a *product* image.
*   **Key Capability:** **Composite Generation.** It explicitly separates "Subject" (Product) from "Style" (Reference) to prevent hallucinating fake products.
*   **Cannot:** Invent new product features, generate reliable vector text.

### E) Design Refinement Flow
*   **Purpose:** Iterative improvement of generated assets.
*   **Workflow:** User uploads/selects a generated image → Provides text feedback → AI modifies *only* requested areas.
*   **Rules:**
    *   Preserve composition and subject.
    *   Change lighting, background, crop, or specific elements.
*   **Valid Feedback:** "Make the lighting warmer," "Zoom in on the shoe."
*   **Invalid Feedback:** "Change the shoe to a boot" (violates product grounding).

### F) Content Mode
*   **Purpose:** Text and Voice execution.
*   **Inputs:** Strategy + Creative Direction.
*   **Outputs:** Headlines, Body Copy, Scripts, TTS Audio, Transcriptions.
*   **Scope:** Execution only. It does not invent strategy.
*   **Audio:** Uses Gemini 2.5 Flash TTS for high-quality voice synthesis.

### G) Analysis Mode
*   **Purpose:** Quality Control, Research, and Audit.
*   **Responsibilities:**
    *   **Search:** Live market trends/competitor analysis.
    *   **Maps:** Location scouting.
    *   **Audit:** A specialized "Critic Persona" that reviews outputs against the original strategy to flag misalignment.
*   **Constraint:** Never creates content; only critiques it.

### H) Live Mode (War Room)
*   **Purpose:** Real-time decision support for urgent meetings.
*   **Role:** The "Wise Advisor."
*   **Inputs:** Live Audio/Video stream.
*   **Outputs:** Immediate decisions, priority lists, risk assessments.
*   **Usage:** "Listen to this debate and tell us which option is less risky."

---

## SECTION 5: Workflow & Usage

**Official End-to-End Workflow:**
1.  **Strategy:** Define the objective.
2.  **Bridge:** Define the concept.
3.  **Visual Direction:** Define the look.
4.  **Design Execution:** Upload assets & generate drafts.
5.  **Refinement:** Polish the best draft.
6.  **Content:** Write copy to match the visual.
7.  **Analysis:** Audit the full package before delivery.

**Role-Based Usage:**
*   Users must respect the mode they are in. Trying to generate images in Strategy mode will result in a text refusal.
*   **Discipline:** The system enforces the workflow by physically separating the tools and prompts.

---

## SECTION 6: Feature Inventory

| Capability | Active Mode | Tech Stack |
| :--- | :--- | :--- |
| **Strategic Reasoning** | Strategy | Gemini 3 Pro (Thinking) |
| **Creative Translation** | Bridge / Content | Gemini 3 Flash |
| **Visual Direction** | Visual | Gemini 3 Flash |
| **Image Generation** | Design (Gen) | Gemini 3 Pro Image |
| **Image Editing** | Design (Edit) | Gemini 2.5 Flash Image |
| **Dual-Input Design** | Design (Draft) | Gemini 2.5 Flash Image |
| **Design Refinement** | Design (Refine) | Gemini 2.5 Flash Image |
| **Video Generation** | Design (Video) | Veo 3.1 Fast |
| **Text-to-Speech** | Content | Gemini 2.5 Flash TTS |
| **Transcription** | Content | Gemini 3 Flash |
| **Live Audio/Video** | Live | Gemini Live API |

---

## SECTION 7: Guardrails & Risk Control

*   **Persona Locking:** System instructions hard-code forbidden actions per mode to prevent role confusion.
*   **Brand Protection (Product Grounding):** The "Design Execution" mode requires a product image input. It is instructed to *never* replace the product, only the environment.
*   **Anti-Hallucination:** "Analysis Mode" uses Google Search grounding to verify facts/trends.
*   **Human Oversight:** Mandatory at the "Refinement" and "Final Audit" stages. AI drafts are never treated as final deliverables.

---

## SECTION 8: Limitations & Known Constraints

*   **Text Rendering:** AI struggles with specific font rendering in images. Copy must be added by human designers in post-production.
*   **Video Length:** Veo generation is limited to short clips (previews/storyboards), not full commercials.
*   **Complex Layouts:** The system cannot build InDesign-quality layouts (e.g., brochures with flow text). It generates assets *for* layouts.
*   **Legal:** AI-generated images are for internal concepts or digital/social use; copyright status for major broadcast is still a gray area.

---

## SECTION 9: System Maturity Assessment

**Status: v1.0 (Internal Beta)**

*   **Production-Ready:**
    *   Strategy & Briefing Logic.
    *   Copywriting & Scripts.
    *   Reference-Based Image Drafting.
    *   TTS.
*   **Experimental:**
    *   Live War Room (Latency dependent).
    *   Fine-grained Image Refinement (Requires prompt skill).
*   **Restricted:**
    *   High-Res Print generation (Resolution limits).

---

## SECTION 10: Future Development Framework

**Criteria for New Features:**
*   Does it remove a manual step in the agency workflow?
*   Does it increase consistency?
*   **If it's just "cool" but adds complexity, REJECT IT.**

**Roadmap Priorities:**
1.  **Project Persistence:** Saving state across browser reloads.
2.  **Deck Generation:** Auto-formatting Strategy outputs into slides.
3.  **Team Sync:** Multi-user sessions for Live Mode.

**Avoid:**
*   Adding generic "Chat" modes.
*   Building features that duplicate existing SaaS tools (e.g., CRM, Project Management).
*   Over-complicating the UI. Keep it prompt-driven.

---
*End of Documentation*