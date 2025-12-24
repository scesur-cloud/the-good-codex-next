import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config'; // Ensure env vars are loaded

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.warn("Missing GEMINI_API_KEY in process.env");

const modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";
// Safe init - if key missing, methods will fail gracefully or we handle it
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function genText(prompt: string) {
    if (!genAI) throw new Error("GEMINI_API_KEY not configured");
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.generateContent(prompt);
        return (res.response.text() || "").trim();
    } catch (e: any) {
        console.error("Gemini GenText Error:", e.message);
        throw e;
    }
}

export type PlannerItem = { title: string; goal: string; acceptance: string[] };

function extractJsonObject(text: string): any | null {
    const fence = text.match(/```json\s*([\s\S]*?)```/i);
    const raw = fence?.[1]?.trim();
    if (raw) { try { return JSON.parse(raw); } catch { } }

    const a = text.indexOf("{");
    const b = text.lastIndexOf("}");
    if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch { } }

    return null;
}

export async function planner(runTitle: string, userPrompt: string) {
    const prompt = [
        "ROLE: PLANNER agent.",
        "Return: (1) Markdown plan, (2) JSON tasks in ```json``` fence.",
        'JSON schema: { "items": [ { "title": string, "goal": string, "acceptance": string[] } ] }',
        "Rules: items length 5..9. Clear, actionable.",
        "",
        `RunTitle: ${runTitle}`,
        `UserPrompt:\n${userPrompt || "(empty)"}`,
    ].join("\n");

    let text = "";
    let items: PlannerItem[] = [];

    try {
        text = await genText(prompt);
        const parsed = extractJsonObject(text);
        items = Array.isArray(parsed?.items) ? parsed.items : [];
    } catch (e) {
        console.warn("Planner Agent failed to generate via LLM, falling back to safe defaults.", e);
        text = "# Fallback Plan\n\n(LLM Error or Key Missing)";
    }

    // hard fallback (DoD min 5)
    const safeItems =
        items.length >= 5
            ? items.slice(0, 9)
            : [
                { title: "M1 Outline", goal: "Create outline", acceptance: ["Has sections", "Clear flow"] },
                { title: "Checklist", goal: "Create DoD checklist", acceptance: ["Actionable", "Bulleted"] },
                { title: "Example", goal: "Add at least one example", acceptance: ["Concrete", "Relevant"] },
                { title: "FAQ", goal: "Add FAQ", acceptance: ["3+ Q/A", "Concise"] },
                { title: "Summary", goal: "Recap + next steps", acceptance: ["Short", "Practical"] },
            ];

    return { planMarkdown: text, items: safeItems };
}

export async function producer(task: { title: string; goal: string; acceptance: string[] }, userPrompt: string) {
    const prompt = [
        "ROLE: PRODUCER agent.",
        "Output MUST be Markdown only.",
        "Include: headings (##), bullets, a checklist section, and at least 1 concrete example.",
        "",
        `TaskTitle: ${task.title}`,
        `Goal: ${task.goal}`,
        task.acceptance?.length ? `Acceptance:\n- ${task.acceptance.join("\n- ")}` : "",
        "",
        `UserPrompt:\n${userPrompt || "(empty)"}`,
    ].join("\n");

    try {
        return await genText(prompt);
    } catch (e) {
        return `# Error Generating Content\n\nCould not generate content for ${task.title} due to provider error.`;
    }
}
