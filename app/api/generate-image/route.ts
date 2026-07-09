import { openai } from "@ai-sdk/openai";
import { generateImage } from "ai";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getUserConversationById } from "@/lib/chat";
import { generateConversationTitle, DEFAULT_CONVERSATION_TITLE } from "@/lib/chat/title";
import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { prompt, conversationId } = await req.json();

  if (!prompt || !conversationId) {
    return new Response("prompt and conversationId are required", { status: 400 });
  }

  const conv = await getUserConversationById(conversationId, session.user.id);
  if (!conv) {
    return new Response("Conversation not found", { status: 404 });
  }

  const { image } = await generateImage({
    model: openai.image("gpt-image-1"),
    prompt,
  });

  const dataUrl = `data:${image.mediaType};base64,${image.base64}`;

  const userMessageId = nanoid();
  const assistantMessageId = nanoid();

  await db.insert(message).values([
    {
      id: userMessageId,
      content: prompt,
      role: "user",
      conversationId,
      userId: session.user.id,
    },
    {
      id: assistantMessageId,
      content: dataUrl,
      role: "assistant",
      conversationId,
      userId: session.user.id,
    },
  ]);

  const generatedTitle =
    conv.title === DEFAULT_CONVERSATION_TITLE
      ? await generateConversationTitle(prompt)
      : undefined;

  await db
    .update(conversation)
    .set({
      updatedAt: new Date(),
      ...(generatedTitle ? { title: generatedTitle } : {}),
    })
    .where(eq(conversation.id, conversationId));

  revalidatePath('/chat', 'layout');

  return Response.json({ userMessageId, assistantMessageId, image: dataUrl });
}
