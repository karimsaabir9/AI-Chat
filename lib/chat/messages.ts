import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { UIMessage } from "@ai-sdk/react";
import { eq } from "drizzle-orm";
import { isImageDataUrl, extractImageMediaType } from "@/lib/chat/image";

// load message for a specific conversation
export async function loadChat(conversationId: string): Promise<UIMessage[]> {
  const messages = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(message.createdAt);

  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant",
    parts: isImageDataUrl(message.content)
      ? [{ type: "file", mediaType: extractImageMediaType(message.content), url: message.content }]
      : [{ type: "text", text: message.content }],
  }));
}

// save chat to the database

export const saveChat = async ({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> => {
  // get the conversationId from the userId
  const conv = await db
    .select({ userId: conversation.userId })
    .from(conversation)
    .where(eq(conversation.id, chatId))
    .limit(1);

  if (conv.length === 0) {
    throw new Error("Conversation not found");
  }

  // getting existing messages to avoid duplicates

  const existingMessages = await db
    .select({ id: message.id })
    .from(message)
    .where(eq(message.conversationId, chatId));

  const existingMessageIds = existingMessages.map((m) => m.id);
  // only save new messages
  const newMessages = messages.filter(
    (msg) => !existingMessageIds.includes(msg.id),
  );

  if (newMessages.length > 0) {
    // transform messages to db format
    const messageData = newMessages.map((msg) => {
      // find the text part in the message
      const textPart = msg.parts.find((part) => part.type === "text");
      const content = textPart?.text || "";
      return {
        id: msg.id,
        content,
        role: msg.role,
        conversationId: chatId,
        userId: conv[0].userId,
      };
    });

    await db.insert(message).values(messageData);
  }

  // update the conversation tittle
  await db
    .update(conversation)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(conversation.id, chatId));
};
