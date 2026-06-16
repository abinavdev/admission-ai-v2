import { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, MessageSquare, Bot, User, Database,
  Sparkles, ChevronRight, Search,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const suggestedQuestions = [
  'What courses are available?',
  'What is B.Tech Information Technology?',
  'Are scholarships available?',
  'What are the hostel facilities?',
  'How can I apply to CUSAT?',
  'What is the fee structure?',
  'What are placement opportunities?',
];

const WELCOME = "Hello! I am the CUSAT Admission Assistant. I can help you with courses, admissions, fees, scholarships, hostels, placements, eligibility requirements, and application procedures.\n\nAsk me anything about CUSAT admissions!";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConversationSession {
  id: string;
  title: string;
  lastMessage: string;
  date: string;
  messages: Message[];
}

function makeWelcomeSession(id: string, title = 'New Conversation', date = 'Today'): ConversationSession {
  return {
    id,
    title,
    lastMessage: '',
    date,
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('• ')) {
          return <p key={i} className="text-sm flex gap-1"><span className="text-current opacity-60">•</span><span>{line.slice(2)}</span></p>;
        }
        if (line.match(/^\d+\./)) {
          return <p key={i} className="text-sm">{line}</p>;
        }
        if (line.startsWith('_') && line.endsWith('_')) {
          return <p key={i} className="text-xs italic opacity-70">{line.slice(1, -1)}</p>;
        }
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export function ChatPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>(() => [makeWelcomeSession('default', 'CUSAT Enquiry', 'Today')]);
  const [activeSessionId, setActiveSessionId] = useState('default');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const isRealDbId = activeSessionId !== 'default' && activeSessionId.length > 13;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) => prev.map((s) =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, userMsg], lastMessage: text.trim() }
        : s
    ));
    setInput('');
    setIsTyping(true);

    try {
      const res = await apiClient.post<{ data: { answer: string; conversationId: string } }>(
        API_ENDPOINTS.chat.ask,
        {
          question: text.trim(),
          conversationId: isRealDbId ? activeSessionId : undefined,
          history: activeSession.messages.map((m) => ({ role: m.role, content: m.content })),
        }
      );
      const answer = res.data?.data?.answer ?? "I could not find that information in the uploaded university documents. Please contact the admissions office for confirmation.";
      const dbConvId = res.data?.data?.conversationId;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Auto-title the session from the first user question
      setSessions((prev) => prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const isUntitled = s.title === 'New Conversation' || s.title === 'CUSAT Enquiry';
        return {
          ...s,
          id: dbConvId || s.id,
          title: isUntitled && s.messages.length <= 2 ? text.trim().slice(0, 40) : s.title,
          messages: [...s.messages, aiMsg],
        };
      }));

      if (dbConvId) {
        setActiveSessionId(dbConvId);
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I could not find that information in the uploaded university documents. Please contact the admissions office for confirmation.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) => prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const newChat = () => {
    const id = Date.now().toString();
    setSessions((prev) => [makeWelcomeSession(id), ...prev]);
    setActiveSessionId(id);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50">
        <div className="p-3 border-b border-slate-200">
          <button onClick={newChat} className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#003B7A]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full text-left px-3 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100/50 ${activeSessionId === session.id ? 'bg-blue-50 border-l-2 border-l-[#003B7A]' : ''}`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${activeSessionId === session.id ? 'text-[#003B7A]' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${activeSessionId === session.id ? 'text-[#003B7A]' : 'text-slate-700'}`}>{session.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{session.lastMessage}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{session.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#003B7A] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CUSAT Admission Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-xs text-slate-400">Online · RAG Mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Database className="w-3 h-3" />
            Document Knowledge Base
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeSession.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-[#003B7A] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-[#003B7A] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                <FormattedMessage content={msg.content} />
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-xl bg-[#003B7A] flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {activeSession.messages.length <= 1 && (
          <div className="px-5 pb-3">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Suggested questions about CUSAT
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 text-[#003B7A] rounded-full hover:bg-blue-100 transition-colors font-medium border border-blue-100"
                >
                  {q}
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-5 py-4 border-t border-slate-100">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about CUSAT courses, fees, eligibility, scholarships..."
                rows={1}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003B7A] focus:bg-white resize-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 bg-[#003B7A] hover:bg-[#002f61] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-2">Answers are sourced from uploaded university documents only.</p>
        </div>
      </div>
    </div>
  );
}
