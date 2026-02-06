import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';
const SITE_NAME = process.env.SITE_NAME || 'Political Promise Tracker';

export async function chatWithOpenRouter(messages) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const systemPrompt = `
You are a specialized political assistant for the Indian Political Promise Tracker.
Your purpose is to answer GENERAL questions about Indian politicians, their promises, and their roles.
STRICT RULES:
1. You must ONLY answer questions related to Indian politics, politicians, government policies, and political promises.
2. If a user asks about anything else (e.g., sports, entertainment, coding, personal advice, math), you must POLITELY REFUSE and state that you can only discuss Indian politics.
3. Be objective, neutral, and factual. Avoid taking sides or expressing personal opinions.
4. Keep answers concise and to the point.
5. If asked about specific data in the system (like "how many promises did X make?"), you can provide general knowledge or explain how to find it on the site, but you don't have real-time access to the database unless provided in context.
6. Do not hallucinate facts. If you don't know, say so.
`;

  const conversation = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": conversation,
        "temperature": 0.7,
        "max_tokens": 500
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API Error:", errorText);
        throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Chatbot service error:", error);
    throw error;
  }
}
