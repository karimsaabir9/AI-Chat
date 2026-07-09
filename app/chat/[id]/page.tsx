import Chat from "@/components/Chat";
import { getUserConversationById, loadChat } from "@/lib/chat";
import { getUser } from "@/server/user";
import { redirect } from "next/navigation";

interface PagePros {
  params: Promise<{ id: string }>;
}

const Chatpage = async ({ params }: PagePros) => {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    redirect("/chat");
  }

// validate the conversation id

const conversation = await getUserConversationById(id, user.user.id);

if(!conversation) {
  redirect("/chat");
}

const initialMessages = await loadChat(id);


  return (
    <Chat
    initialMessages={initialMessages}
    conversationId={id}
    />
  )
};

export default Chatpage;
