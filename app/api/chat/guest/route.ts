import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages, validateUIMessages } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Stateless chat for guests: no auth, no persistence. The client keeps the
// full message history and resends it on every turn.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages as UIMessage[] | undefined;

    if (!messages) {
      return new Response("No messages provided", { status: 400 });
    }

    let validatedMessages: UIMessage[];
    try {
      validatedMessages = await validateUIMessages({ messages });
    } catch (error) {
      console.error("Guest message validation failed:", error);
      validatedMessages = messages;
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: "You are a helpful AI assistant. Be concise and helpful in your responses.",
      messages: await convertToModelMessages(validatedMessages),
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Guest chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
