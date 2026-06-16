'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, SquarePen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState('right'); // 'left' | 'right'
  const [isBlocked, setIsBlocked] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about Huddin\'s projects, services, or availability!)*' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'What are Huddin\'s services?',
    'Show me Huddin\'s projects',
    'What can you do?',
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Check persistent block status on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const blocked = localStorage.getItem('mia_blocked') === 'true';
      if (blocked) {
        setIsBlocked(true);
        setMessages([
          { role: 'assistant', content: '*The door remains locked, with a warning sign posted outside.* \n\nGooner detected. I will not open the door for you again.' }
        ]);
      }
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined' && localStorage.getItem('mia_blocked') === 'true') {
      return;
    }
    // Reset state & messages to start a New Chat next time
    setIsBlocked(false);
    setMessages([
      { role: 'assistant', content: '*Stands by the door, greeting you with a polite bow and a soft smile.* \n\nWelcome. I am here to assist you. Please let me know how I may help you today! \n\n*(You can ask me about Huddin\'s projects, services, or availability!)*' }
    ]);
  };

  const togglePosition = () => {
    setPosition(prev => prev === 'right' ? 'left' : 'right');
  };

  // Blocklist for sexual keywords
  const isSensitiveInput = (text) => {
    const keywords = ['horny', 'fuck', 'sex', 'fck', 'porn', 'nudity', 'naked', 'blowjob', 'dick', 'pussy', 'boobs', 'cunt', 'asshole', 'goon', 'jerk off', 'masturbat'];
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  };

  const handleSendMessage = async (textToSend) => {
    if (isBlocked) return;
    const text = textToSend || input.trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }

    // Check for sensitive keywords locally first
    if (isSensitiveInput(text)) {
      const userMsg = { role: 'user', content: text };
      const blockMsg = { role: 'assistant', content: '*Glances down, her posture freezing completely.* \n\nI only respond to professional inquiries regarding Huddin\'s work and services. This chat has been closed.' };
      setMessages(prev => [...prev, userMsg, blockMsg]);
      setIsBlocked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mia_blocked', 'true');
      }
      return;
    }

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentPath: window.location.pathname
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch response');
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsLoading(false); // Stop loading animation since streaming has started

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;

        // Update the last message in state
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1].content = assistantReply;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not connect to the assistant server or encountered an error. Please try again.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render open chatbot window
  const renderChatWindow = () => {
    const posClass = position === 'left' ? 'left-6' : 'right-6';

    return (
      <div className={`fixed bottom-6 ${posClass} z-50 flex flex-col w-[360px] h-[500px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 font-sans`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-accent flex items-center justify-center bg-bg-dark shrink-0 aspect-square">
                <img 
                  src="/mia.png" 
                  alt="Mia Avatar" 
                  className="w-full h-full object-cover aspect-square"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(224, 255, 111, 0.4))' }} 
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-online-green ring-1 ring-bg-dark" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Mia</h4>
              <p className="text-[10px] font-mono text-text-muted">Maid Flash 3.5</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={togglePosition}
              className="px-2 py-1 text-[10px] font-mono rounded bg-bg-dark border border-border text-text-secondary hover:text-accent hover:border-accent transition-colors"
              title="Switch Side"
            >
              ← Swipe →
            </button>
            {!isBlocked && (
              <button 
                onClick={handleClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
                title="New Chat"
              >
                <SquarePen className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" style={{ overscrollBehavior: 'contain' }}>
          {messages.map((message, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.95rem] ${
                  message.role === 'user' 
                    ? 'bg-accent text-bg-dark rounded-tr-none font-medium' 
                    : 'bg-bg-dark border border-border text-text-primary rounded-tl-none'
                }`}
              >
                {message.role === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                ) : (
                  <div className="prose prose-invert max-w-none text-left">
                    <ReactMarkdown 
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-[0.95rem]">{children}</li>,
                        em: ({ children }) => <em className="text-text-muted opacity-70 italic font-normal">{children}</em>,
                        strong: ({ children }) => <strong className="font-semibold text-accent">{children}</strong>,
                        a: ({ href, children }) => {
                          const isInternal = href.startsWith('/') || href.startsWith('#');
                          const buttonStyle = "inline-flex items-center gap-1 bg-accent/10 hover:bg-accent text-accent hover:text-bg-dark border border-accent/30 rounded-lg px-2.5 py-1 text-xs font-mono transition-all duration-200 my-1 font-semibold";
                          
                          if (isInternal) {
                            return (
                              <Link href={href} className={buttonStyle}>
                                {children}
                              </Link>
                            );
                          }
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className={buttonStyle}>
                              {children} ↗
                            </a>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="bg-bg-dark border border-border text-text-muted rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 pb-2 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-text-muted">Suggested questions:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-bg-dark border border-border hover:border-accent hover:bg-bg-card-hover text-text-secondary hover:text-text-primary px-2.5 py-1.5 rounded-lg transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 border-t border-border bg-bg-card">
          <div className="flex items-end gap-2 bg-bg-dark border border-border rounded-xl px-3 py-1.5 focus-within:border-accent transition-colors">
            <textarea
              value={input}
              onChange={(e) => {
                if (isBlocked) return;
                setInput(e.target.value);
                // Auto-adjust height
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`; // Max 4 lines (20px * 4 = 80px)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isBlocked) {
                    handleSendMessage();
                  }
                  // Reset height
                  e.target.style.height = 'auto';
                }
              }}
              placeholder={isBlocked ? "This chat has ended." : "Ask me something..."}
              rows={1}
              disabled={isBlocked}
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted resize-none text-sm leading-5 py-1 focus:ring-0 overflow-y-auto disabled:opacity-50"
              style={{ height: 'auto', maxHeight: '80px' }}
            />
            <button
              onClick={(e) => {
                if (!isBlocked) {
                  handleSendMessage();
                }
                // Find and reset sibling textarea height
                const textarea = e.currentTarget.previousElementSibling;
                if (textarea) textarea.style.height = 'auto';
              }}
              disabled={isLoading || !input.trim() || isBlocked}
              className="p-1.5 rounded-lg text-accent hover:bg-bg-card disabled:opacity-40 disabled:hover:bg-transparent transition-all shrink-0 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Floating trigger button
  const posClass = position === 'left' ? 'left-6' : 'right-6';

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 ${posClass} z-50 w-14 h-14 bg-accent text-bg-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-105 hover:-translate-y-1 hover:bg-white active:scale-95 transition-all duration-300 group`}
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
        </button>
      )}

      {isOpen && renderChatWindow()}
    </>
  );
}
