'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, RotateCcw, ImageIcon, Loader2, Download, Menu } from 'lucide-react';
import { UIMessage } from 'ai';
import { Streamdown } from 'streamdown';
import { isImageDataUrl, extractImageMediaType } from '@/lib/chat/image';
import { useChatSidebar } from '@/components/chat-sidebar-context';

interface ChatProps {
  conversationId: string;
  initialMessages?: UIMessage[];
  conversationTitle?: string;
}

export default function Chat({ conversationId, initialMessages = [], conversationTitle }: ChatProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const sidebar = useChatSidebar();
  const [input, setInput] = useState('');
  const [imageMode, setImageMode] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, setMessages, status, error, stop } = useChat({
    id: conversationId, // Use conversation ID for persistence
    messages: initialMessages, // Load initial messages
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // Optimized: only send the last message to reduce data transfer
      prepareSendMessagesRequest({ messages, id }) {
        return { 
          body: { 
            message: messages[messages.length - 1], 
            id 
          } 
        };
      },
    }),
    onFinish: () => {
      // Refresh the sidebar so a freshly generated conversation title shows up
      router.refresh();
    },
  });

  const handleGenerateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationId }),
      });

      if (!res.ok) {
        throw new Error('Image generation failed');
      }

      const { userMessageId, assistantMessageId, image } = await res.json();

      setMessages([
        ...messages,
        { id: userMessageId, role: 'user', parts: [{ type: 'text', text: prompt }] },
        {
          id: assistantMessageId,
          role: 'assistant',
          parts: [{ type: 'file', mediaType: extractImageMediaType(image), url: image }],
        },
      ]);
      // Refresh the sidebar so a freshly generated conversation title shows up
      router.refresh();
    } catch {
      setImageError('Could not generate the image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-rose-100 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            {sidebar && (
              <button
                type="button"
                onClick={sidebar.openSidebar}
                aria-label="Open conversations"
                className="md:hidden inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={session.user.image || ''} />
              <AvatarFallback className="bg-rose-500 text-white font-medium">
                {session.user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {conversationTitle || 'AI Chat'}
              </h1>
              <p className="text-sm text-rose-500">Chat with AI Assistant</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-rose-200 text-rose-600 hover:bg-rose-50 flex-shrink-0"
          >
            Back to Dashboard
          </Button>
        </div>
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
                Ask me anything! I'm here to help.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-in fade-in slide-in-from-bottom-1 duration-300 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-7 w-7 flex-shrink-0">
                  {message.role === 'user' ? (
                    <>
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback className="bg-rose-500 text-white text-xs">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-rose-100">
                      <Bot className="h-3 w-3 text-rose-500" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-gray-50 text-gray-900 border border-gray-100'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          if (isImageDataUrl(part.text)) {
                            return (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={part.text}
                                alt="Generated"
                                className="rounded-lg max-w-xs"
                              />
                            );
                          }
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
                        case 'file':
                          if (part.mediaType.startsWith('image/')) {
                            const extension = part.mediaType.split('/')[1] || 'png';
                            return (
                              <div key={i} className="inline-block">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={part.url}
                                  alt={part.filename || 'Generated'}
                                  className="rounded-lg max-w-xs"
                                />
                                <a
                                  href={part.url}
                                  download={part.filename || `generated-image.${extension}`}
                                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </a>
                              </div>
                            );
                          }
                          return null;
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(status === 'submitted' || status === 'streaming') && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex items-start space-x-3 max-w-2xl">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="bg-rose-100">
                    <Bot className="h-3 w-3 text-rose-500" />
                  </AvatarFallback>
                </Avatar>
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
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="bg-red-100">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  </AvatarFallback>
                </Avatar>
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
          
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-rose-100 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || isGeneratingImage) return;

            if (imageMode) {
              const prompt = input;
              setInput('');
              handleGenerateImage(prompt);
            } else if (status === 'ready') {
              sendMessage({ text: input });
              setInput('');
            }
          }}
          className="max-w-4xl mx-auto"
        >
          {imageError && (
            <p className="text-xs text-red-500 mb-2">{imageError}</p>
          )}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageMode((prev) => !prev)}
              disabled={isGeneratingImage}
              title="Generate an image with gpt-image-1"
              aria-label={imageMode ? 'Switch to text mode' : 'Switch to image generation mode'}
              aria-pressed={imageMode}
              className={`px-3 rounded-xl border-rose-200 transition-colors ${
                imageMode ? 'bg-rose-500 text-white hover:bg-rose-600' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <input
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors"
              value={input}
              placeholder={imageMode ? 'Describe the image to generate...' : 'Type your message...'}
              onChange={(e) => setInput(e.target.value)}
              disabled={(status !== 'ready' && !imageMode) || isGeneratingImage}
              aria-label={imageMode ? 'Image prompt' : 'Message'}
            />
            <Button
              type="submit"
              disabled={(imageMode ? isGeneratingImage : status !== 'ready') || !input.trim()}
              aria-label={imageMode ? 'Generate image' : 'Send message'}
              className="px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors"
            >
              {isGeneratingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : imageMode ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}