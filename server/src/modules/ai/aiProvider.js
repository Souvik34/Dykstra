import { generateWithGemini } from "./providers/gemini.provider.js";
import { generateWithOpenRouter } from "./providers/openrouter.provider.js";

export async function generateAI(prompt) {

    try {

        console.log("========== GEMINI ==========");

        return await generateWithGemini(prompt);

    } catch (err) {

        console.error("========== GEMINI FAILED ==========");
        console.error("Status:", err?.status);
        console.error("Message:", err?.message);
        console.error("===================================");

        console.log("========== OPENROUTER ==========");

        return await generateWithOpenRouter(prompt);
    }
}