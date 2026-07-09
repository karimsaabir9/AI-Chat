"use client";

import { createContext, useContext } from "react";

interface ChatSidebarContextValue {
  openSidebar: () => void;
}

export const ChatSidebarContext = createContext<ChatSidebarContextValue | null>(null);

export function useChatSidebar() {
  return useContext(ChatSidebarContext);
}
