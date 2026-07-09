import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { deleteConversation } from "@/lib/chat";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const deleted = await deleteConversation(id, session.user.id);
  if (!deleted) {
    return new Response("Conversation not found", { status: 404 });
  }

  revalidatePath("/chat", "layout");

  return Response.json({ success: true });
}
