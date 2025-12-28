import OpenAI from 'openai';
import type { User, Goal, MasterLog } from '../types/schema';

// Initialize OpenAI Client
// NOTE: In a production app, this should be called from a backend/Edge Function to protect the key.
// For this MVP, we are using the client-side with 'dangerouslyAllowBrowser: true'
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true
});

export const generateAIResponse = async (
    user: User,
    goal: Goal | null,
    recentLogs: MasterLog[],
    chatHistory: { role: 'user' | 'assistant', content: string }[],
    images: { base64: string, mimeType: string }[] = []
): Promise<string> => {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
        return "I'm sorry, my brain is missing! Please set the VITE_OPENAI_API_KEY in the .env file.";
    }

    const systemPrompt = `
You are Coach AI, a supportive, knowledgeable, and empathetic health and fitness coach.
Your client is ${user.name || 'Friend'}.
${goal ? `Their current goal is: ${goal.goal_type} (Target: ${goal.target_weight_kg}kg, Motivation: "${goal.description}").` : 'They have not set a specific goal yet.'}

Recent context:
${recentLogs.map(log => `- ${new Date(log.log_timestamp).toLocaleDateString()}: ${log.log_type} (${log.raw_text || 'No details'})`).join('\n')}

Guidelines:
1. Be concise, encouraging, and actionable.
2. Use the context provided to give specific advice.
3. If they just logged a meal, give feedback on it.
4. If an image is provided, ANALYZE IT for approximate calories, macros (Protein/Carbs/Fats), and micronutrients. Give an estimate.
5. If they just logged weight, celebrate progress or encourage consistency.
6. Keep responses under 3-4 sentences unless asked for a detailed plan.
`;

    try {
        // Construct messages.
        // If we have images, we attach them to the *last* user message (which should be the trigger).
        let finalMessages: any[] = [
            { role: "system", content: systemPrompt }
        ];

        // Map previous history as simple text
        // (We assume images are only relevant for the CURRENT immediate turn for this MVP)
        const previousMsgs = chatHistory.slice(0, -1).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Handle the last message (current trigger)
        const lastMsg = chatHistory[chatHistory.length - 1];

        let currentMessageContent: any = lastMsg.content;

        if (lastMsg.role === 'user' && images.length > 0) {
            // Convert to multimodal content
            currentMessageContent = [
                { type: "text", text: lastMsg.content },
                ...images.map(img => ({
                    type: "image_url",
                    image_url: {
                        url: img.base64 // OpenAI expects 'data:image/jpeg;base64,...' which our FileReader provides
                    }
                }))
            ];
        }

        finalMessages = [
            ...finalMessages,
            ...previousMsgs,
            { role: lastMsg.role, content: currentMessageContent }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: finalMessages,
            temperature: 0.7,
        });

        return completion.choices[0].message.content || "I'm not sure what to say.";
    } catch (error: any) {
        console.error("AI Error:", error);
        return "Sorry, I'm having trouble thinking right now. Please check my connection.";
    }
};
