import { getUserConversations } from "@/lib/chat";
import { getUser } from "@/server/user";
import ChatShell from "@/components/ChatShell";

const ChatLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser();

  // Guests get the full-page guest chat experience with no account
  // sidebar/history - rendered as-is by the page below.
  if (!user) {
    return <>{children}</>;
  }

  const conversations = await getUserConversations(user.user.id);

  return <ChatShell conversations={conversations}>{children}</ChatShell>;
};

export default ChatLayout;
