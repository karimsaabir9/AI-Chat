'use client';

import { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import { ChatSidebarContext } from '@/components/chat-sidebar-context';

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

export default function ChatShell({
  conversations,
  children,
}: {
  conversations: ConversationSummary[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatSidebarContext.Provider value={{ openSidebar: () => setIsOpen(true) }}>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile overlay */}
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-30 bg-gray-900/40 transition-opacity duration-200 md:hidden ${
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />

        {/* Sidebar: static on desktop, sliding drawer on mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-out md:static md:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <ChatSidebar
            conversations={conversations}
            onNavigate={() => setIsOpen(false)}
            onClose={() => setIsOpen(false)}
          />
        </div>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </ChatSidebarContext.Provider>
  );
}
