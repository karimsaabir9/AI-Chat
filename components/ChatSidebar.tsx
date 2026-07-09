'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageSquare, MessageSquareDashed, Plus, X } from 'lucide-react';

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ChatSidebarProps {
  conversations: ConversationSummary[];
  onNavigate?: () => void;
  onClose?: () => void;
}

export default function ChatSidebar({ conversations, onNavigate, onClose }: ChatSidebarProps) {
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;

  return (
    <aside className="w-64 flex-shrink-0 h-screen border-r border-rose-100 bg-rose-50/40 flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <Link
          href="/chat"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-medium py-2.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav aria-label="Conversations" className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center px-4 py-10">
            <MessageSquareDashed className="h-8 w-8 text-rose-200" />
            <p className="text-sm text-gray-400">No conversations yet</p>
          </div>
        )}

        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            onClick={onNavigate}
            aria-current={activeId === conv.id ? 'page' : undefined}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm truncate transition-colors ${
              activeId === conv.id
                ? 'bg-rose-500 text-white'
                : 'text-gray-700 hover:bg-rose-100'
            }`}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{conv.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
