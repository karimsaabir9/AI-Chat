'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  RotateCcw,
  ImageIcon,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { Streamdown } from 'streamdown';

export const GUEST_MESSAGES_STORAGE_KEY = 'guest-chat-messages';

export default function GuestChat() {
  const [conversationId] = useState(() => nanoid());
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: '/api/chat/guest',
    }),
  });

  // Keep the in-progress guest conversation around so it can be restored
  // if the user signs in.
  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem(GUEST_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-rose-100 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">AI Chat</h1>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Guest mode
                </span>
              </div>
              <p className="text-sm text-rose-500">Chatting without an account</p>
            </div>
          </div>
          <Link href="/signin?from=guest">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex-shrink-0">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          </Link>
        </div>
      </div>

      {/* Guest mode notice */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 sm:px-6">
        <p className="text-xs text-amber-800 text-center">
          You&apos;re chatting as a guest — this conversation won&apos;t be saved.{' '}
          <Link href="/signin?from=guest" className="font-medium underline hover:text-amber-900">
            Log in
          </Link>{' '}
          to save your history and generate images.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500">
                Ask me anything! I&apos;m here to help — no account needed.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-in fade-in slide-in-from-bottom-1 duration-300 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className="h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center bg-rose-100">
                  {message.role === 'user' ? (
                    <User className="h-3 w-3 text-rose-500" />
                  ) : (
                    <Bot className="h-3 w-3 text-rose-500" />
                  )}
                </div>

                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-50 text-gray-900 border border-gray-100'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {message.parts.map((part, i) => {
                      if (part.type !== 'text') return null;
                      return message.role === 'assistant' ? (
                        <Streamdown
                          key={i}
                          className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-rose-600 prose-code:bg-rose-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200"
                          parseIncompleteMarkdown={true}
                        >
                          {part.text}
                        </Streamdown>
                      ) : (
                        <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(status === 'submitted' || status === 'streaming') && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex items-start space-x-3 max-w-2xl">
                <div className="h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center bg-rose-100">
                  <Bot className="h-3 w-3 text-rose-500" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {status === 'submitted' && (
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                    <span className="text-gray-500 text-sm">
                      {status === 'submitted' ? 'AI is thinking...' : 'AI is responding...'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => stop()}
                      className="ml-2 h-5 px-2 text-xs text-rose-500 hover:bg-rose-50"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-2xl">
                <div className="h-7 w-7 flex-shrink-0 rounded-full flex items-center justify-center bg-red-100">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-800 font-medium text-sm">Something went wrong</p>
                      <p className="text-red-600 text-xs">Please try again</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="ml-2 h-6 px-2 text-xs border-red-200 text-red-600 hover:bg-red-100"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-rose-100 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && status === 'ready') {
              sendMessage({ text: input });
              setInput('');
            }
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              disabled
              title="Sign in to generate images"
              aria-label="Sign in to generate images"
              className="px-3 rounded-xl border-rose-200 text-rose-300 cursor-not-allowed"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <input
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
              value={input}
              placeholder="Type your message..."
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready'}
              aria-label="Message"
            />
            <Button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              aria-label="Send message"
              className="px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
