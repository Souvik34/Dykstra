import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODELS = [
    "gemini-3.5-flash",
    "gemini-flash-latest"
];

export async function generateWithGemini(prompt) {

    let lastError = null;

    for (const model of MODELS) {

        try {

            console.log(`Trying ${model}`);

            const result =
                await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        temperature: 0.2,
                        responseMimeType: "application/json"
                    }
                });

            console.log(`Success: ${model}`);

            const text = result?.text;

            if (!text) {
                throw new Error(`Empty response from Gemini: ${model}`);
            }

            return text;

        } catch (err) {

            console.log(`Failed: ${model}`);
            console.log(err?.message);

            lastError = err;

            if ([404, 429, 500, 503].includes(err?.status)) {
                continue;
            }

            throw err;
        }
    }

    throw lastError;
}