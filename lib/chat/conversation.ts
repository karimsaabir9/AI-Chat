// Create a conversation for a user

import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { and, desc, eq, exists } from "drizzle-orm";
import { nanoid } from "nanoid";

const RECENT_CONVERSATIONS_LIMIT = 50;

export async function createConversation(userId: string, title?: string) {
  const conversationId = nanoid();

  // Insert into conversations (id,title) values (1, test)
  await db.insert(conversation).values({
    id: conversationId,
    title: title || "New Conversation",
    userId,
  });

  return conversationId;
}

export async function getUserConversations(userId: string) {
  return await db
    .select()
    .from(conversation)
    .where(
      and(
        eq(conversation.userId, userId),
        // Only show conversations that actually have at least one message
        exists(
          db
            .select({ id: message.id })
            .from(message)
            .where(eq(message.conversationId, conversation.id)),
        ),
      ),
    )
    .orderBy(desc(conversation.updatedAt))
    .limit(RECENT_CONVERSATIONS_LIMIT);
}

// get user conversations by id
export async function getUserConversationById(
  conversationId: string,
  userId: string,
) {
  const result = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1);

  const conv = result[0];
  // hadii user-ka uu empty yahay isla markaane userka datada dalbanoyo uusan ahayn qofkii lahaay chatka
  if (!conv || conv.userId !== userId) {
    return null;
  }

  return conv;
}

// Delete a conversation (and its messages, via cascade) if it belongs to the user
export async function deleteConversation(conversationId: string, userId: string) {
  const conv = await getUserConversationById(conversationId, userId);
  if (!conv) {
    return false;
  }

  await db.delete(conversation).where(eq(conversation.id, conversationId));
  return true;
}
