'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, MessageSquare, MessageSquareDashed, Plus, Trash2, X } from 'lucide-react';

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
  const router = useRouter();
  const activeId = params?.id;

  // Local copy so a deletion can be reflected instantly, without waiting on
  // the server round-trip that refreshes the `conversations` prop.
  const [items, setItems] = useState(conversations);
  useEffect(() => {
    setItems(conversations);
  }, [conversations]);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async (id: string) => {
    setPendingDeleteId(null);
    setDeletingId(id);
    setItems((prev) => prev.filter((conv) => conv.id !== id));

    try {
      const res = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete conversation');

      if (activeId === id) {
        router.push('/chat');
      }
      router.refresh();
    } catch {
      // Restore on failure
      setItems(conversations);
    } finally {
      setDeletingId(null);
    }
  };

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
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center px-4 py-10">
            <MessageSquareDashed className="h-8 w-8 text-rose-200" />
            <p className="text-sm text-gray-400">No conversations yet</p>
          </div>
        )}

        {items.map((conv) => {
          const isActive = activeId === conv.id;
          const isPendingDelete = pendingDeleteId === conv.id;
          const isDeleting = deletingId === conv.id;

          return (
            <div key={conv.id} className="group relative">
              <Link
                href={`/chat/${conv.id}`}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 pl-3 py-2.5 rounded-lg text-sm truncate transition-colors ${
                  isPendingDelete ? 'pr-16' : 'pr-9'
                } ${
                  isActive
                    ? 'bg-rose-500 text-white'
                    : 'text-gray-700 hover:bg-rose-100'
                } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{conv.title}</span>
              </Link>

              {isPendingDelete ? (
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      confirmDelete(conv.id);
                    }}
                    aria-label={`Confirm delete "${conv.title}"`}
                    title="Confirm delete"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPendingDeleteId(null);
                    }}
                    aria-label="Cancel delete"
                    title="Cancel"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPendingDeleteId(conv.id);
                  }}
                  disabled={isDeleting}
                  aria-label={`Delete "${conv.title}"`}
                  title="Delete conversation"
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 ${
                    isActive
                      ? 'text-white/70 hover:bg-white/20 hover:text-white'
                      : 'text-gray-400 hover:bg-red-100 hover:text-red-600'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
