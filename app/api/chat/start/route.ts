import { UIMessage } from "ai";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { createConversation } from "@/lib/chat";
import { generateConversationTitle, DEFAULT_CONVERSATION_TITLE } from "@/lib/chat/title";
import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { eq } from "drizzle-orm";

// Creates a conversation for the signed-in user. If guest messages are
// passed in, they're imported into it so a guest who logs in doesn't lose
// what they were chatting about.
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const guestMessages = (body.messages as UIMessage[] | undefined) ?? [];

  const conversationId = await createConversation(session.user.id);

  if (guestMessages.length > 0) {
    const messageData = guestMessages
      .map((msg) => {
        const textPart = msg.parts.find((part) => part.type === "text");
        return {
          id: nanoid(),
          content: textPart?.text ?? "",
          role: msg.role,
          conversationId,
          userId: session.user.id,
        };
      })
      .filter((msg) => msg.content.trim().length > 0);

    if (messageData.length > 0) {
      await db.insert(message).values(messageData);

      const firstUserMessage = guestMessages.find((msg) => msg.role === "user");
      const firstUserText = firstUserMessage?.parts.find((part) => part.type === "text")?.text;

      const title = firstUserText
        ? await generateConversationTitle(firstUserText)
        : DEFAULT_CONVERSATION_TITLE;

      await db
        .update(conversation)
        .set({ title, updatedAt: new Date() })
        .where(eq(conversation.id, conversationId));
    }
  }

  return Response.json({ conversationId });
}
