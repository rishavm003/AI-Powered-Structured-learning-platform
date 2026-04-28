import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Day } from '../types';
import { askQuestion } from '../agents/qaAgent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  day: Day;
}

function ThinkingDots() {
  return (
    <div className="flex items-center space-x-1 py-2 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-indigo-400 rounded-full inline-block animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export const QAChat: React.FC<Props> = ({ day }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = inputValue.trim();
    if (!q || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const answer = await askQuestion(q, day);
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I couldn't answer that right now. Please try again.\n\n_Error: ${err.message}_` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Ask a question about today's content</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Scoped to: {day.title}</p>
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '300px', minHeight: '80px' }}>
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Ask anything about today's topics and get an instant answer.
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2 rounded-xl text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:text-green-300 prose-code:text-indigo-700 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/30 prose-code:px-1 prose-code:rounded prose-headings:text-gray-900 dark:prose-headings:text-gray-100">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl rounded-bl-none px-4 py-2 shadow-sm">
              <ThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-gray-700 flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask a question…"
          className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 dark:disabled:bg-gray-800"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 transition-colors"
        >
          Ask
        </button>
      </form>
    </div>
  );
};
