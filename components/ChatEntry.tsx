'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { GUEST_MESSAGES_STORAGE_KEY } from '@/components/GuestChat';

// Renders when a signed-in user lands on the bare /chat route. Creates a
// new conversation - importing any in-progress guest conversation found in
// localStorage - then redirects into it.
export default function ChatEntry() {
  const router = useRouter();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const guestMessagesRaw = localStorage.getItem(GUEST_MESSAGES_STORAGE_KEY);
    const messages = guestMessagesRaw ? JSON.parse(guestMessagesRaw) : undefined;

    fetch('/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
      .then((res) => res.json())
      .then(({ conversationId }) => {
        localStorage.removeItem(GUEST_MESSAGES_STORAGE_KEY);
        router.replace(`/chat/${conversationId}`);
      });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
        <p className="text-sm">Setting up your chat...</p>
      </div>
    </div>
  );
}
