import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "DSA Tracker Interview AI"
    }
});

const MODELS = [

    "google/gemini-2.5-flash",

    "deepseek/deepseek-chat",

    "google/gemma-3-27b-it",

    "mistralai/mistral-small-3.2-24b-instruct",

    "anthropic/claude-3.5-haiku",

    "openai/gpt-4.1-mini"

];

export async function generateWithOpenRouter(prompt) {

    let lastError = null;

    for (const model of MODELS) {

        try {

            console.log(`Trying OpenRouter -> ${model}`);
const response =
    await client.chat.completions.create({

        model,

        messages: [
            {
                role: "user",
                content: prompt
            }
        ],

       max_tokens: 8000,
temperature: 0.2
    });

            console.log(`Success -> ${model}`);

           const text = response?.choices?.[0]?.message?.content;

if (!text) {
    throw new Error("Empty response from model");
}

return text;

        }
catch (err) {

    console.log(`Failed -> ${model}`);
    console.log(err.message);

    lastError = err;

    // try next model
    continue;
}
    }

    throw lastError;

}