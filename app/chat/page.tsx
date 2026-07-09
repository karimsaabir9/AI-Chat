import { createConversation } from "@/lib/chat";
import { getUser } from "@/server/user";
import { redirect } from "next/navigation";
import GuestChat from "@/components/GuestChat";
import ChatEntry from "@/components/ChatEntry";

interface PageProps {
  searchParams: Promise<{ importGuest?: string }>;
}

const NewChatPage = async ({ searchParams }: PageProps) => {
  const user = await getUser();

  if (!user) {
    return <GuestChat />;
  }

  // Coming straight from a guest login: import their in-progress
  // conversation (stored client-side) instead of starting a blank one.
  const { importGuest } = await searchParams;
  if (importGuest) {
    return <ChatEntry />;
  }

  const conversationId = await createConversation(user.user.id);
  redirect(`/chat/${conversationId}`);
};

export default NewChatPage;
