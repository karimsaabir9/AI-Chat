import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const DEFAULT_CONVERSATION_TITLE = "New Conversation";

// Generate a short title from the first user message
export async function generateConversationTitle(firstMessage: string): Promise<string> {
  const fallback = firstMessage.trim().slice(0, 50) || DEFAULT_CONVERSATION_TITLE;

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "Generate a short, concise chat title (3-6 words) summarizing the user's message. Respond with only the title text, no quotes and no trailing punctuation.",
      prompt: firstMessage,
    });

    const title = text.trim().replace(/^["']|["']$/g, "").slice(0, 80);
    return title || fallback;
  } catch {
    return fallback;
  }
}

export { DEFAULT_CONVERSATION_TITLE };
