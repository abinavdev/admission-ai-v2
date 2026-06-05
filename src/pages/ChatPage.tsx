import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, MessageSquare, Bot, User, Database,
  Sparkles, ChevronRight, Search,
} from 'lucide-react';

const suggestedQuestions = [
  'What courses are available?',
  'What is the MCA eligibility?',
  'Are scholarships available?',
  'What are the hostel facilities?',
  'How can I apply to CUSAT?',
  'What is the fee structure?',
  'What are placement opportunities?',
];

const aiResponses: Record<string, string> = {
  'What courses are available?': "CUSAT offers a wide range of programs across multiple departments:\n\n**Engineering & Technology**\n• B.Tech (CSE, ECE, Mechanical, Civil, Chemical, Polymer Science)\n• M.Tech (Artificial Intelligence, VLSI Design, Marine Technology, Environmental Engineering)\n\n**Science**\n• Integrated M.Sc — 5 years (Physics, Chemistry, Maths, Photonics)\n• M.Sc (Computer Science, Physics, Chemistry, Mathematics, Photonics)\n\n**Management**\n• MBA — Full Time (2 years)\n• BBA (3 years)\n\n**Computer Applications**\n• MCA (3 years)\n\n**Research**\n• Ph.D programs across all departments\n\nWould you like details about any specific program?",
  'What is the MCA eligibility?': "For MCA at CUSAT:\n\n**Academic Eligibility**\n• Bachelor's degree in any discipline with minimum 50% marks\n• Mathematics as a subject either at degree level or at 10+2 level\n\n**Entrance Requirement**\n• CUSAT CAT (Common Admission Test) — mandatory\n• Entrance exam conducted by CUSAT\n\n**Admission Process**\n• Register and appear for CUSAT CAT\n• Rank-based allotment through centralised counselling\n\n**Program Details**\n• Duration: 3 years (6 semesters)\n• Full-time residential program\n\nShall I tell you about the CAT exam pattern or fee structure?",
  'What is the fee structure?': "CUSAT fee structure (approximate, subject to revision):\n\n**Engineering (B.Tech)**\n• Government Seats: ~₹25,000/year\n• Self-Financing Seats: Higher fees apply\n\n**MCA**\n• ~₹20,000–₹35,000/year (aided seats)\n\n**MBA**\n• ~₹50,000–₹75,000/year\n\n**M.Tech**\n• GATE scholars receive ₹12,400/month fellowship\n• Non-GATE: ~₹25,000/year\n\n**Hostel**\n• ~₹2,000–₹4,000/month (meals included)\n\nFees are subject to annual revision. Official CUSAT fee notification is released before admissions. Shall I provide scholarship information that can offset fees?",
  'Are scholarships available?': "Yes! CUSAT students have access to multiple scholarships:\n\n🏆 **Merit-Based**\n• University merit awards for toppers\n• Departmental awards for academic excellence\n\n💰 **Government Scholarships**\n• Kerala State Merit Scholarship\n• Post-Matric Scholarship (SC/ST/OBC categories)\n• Central Sector Scholarship\n• Merit-cum-Means Scholarship\n\n🎯 **Special Awards**\n• GATE Fellowship: ₹12,400/month for M.Tech scholars\n• Physically Challenged student scholarships\n• Sports achievement scholarships\n• Emergency financial assistance from University\n\nEligibility varies by category and academic performance. Shall I connect you with a counsellor for detailed guidance?",
  'What are the hostel facilities?': "CUSAT provides on-campus hostel facilities:\n\n🏠 **Accommodation**\n• Separate hostels for male and female students\n• Multiple hostels on the main Kalamassery campus\n• ~₹2,000–₹4,000/month including meals\n\n✅ **Facilities**\n• 24-hour internet connectivity\n• Dining hall with nutritious meals\n• Common recreation rooms\n• Sports facilities\n• Medical care & first aid\n• 24-hour security\n• CCTV surveillance\n• Resident warden\n\n📍 **Location**\n• Main campus: Kalamassery, Kochi — a safe, residential university campus\n\nHostel seats are allocated on merit and are limited. Early application is recommended. Shall I register your interest?",
  'How can I apply to CUSAT?': "Applying to CUSAT involves the CUSAT CAT (Common Admission Test):\n\n**Step-by-Step Process**\n1. Check eligibility for your desired program\n2. Register online at the CUSAT CAT portal during the notification period\n3. Pay the application fee\n4. Download your hall ticket\n5. Appear for CUSAT CAT on the scheduled date\n6. Check your rank on the results portal\n7. Participate in centralised counselling\n8. Report for admission with original documents\n\n**Required Documents**\n• 10th & 12th marksheets\n• Degree certificate (for PG programs)\n• ID proof (Aadhaar/PAN)\n• Community certificate (if applicable)\n• Passport-size photographs\n\nShall I register your interest so a counsellor can guide you through the process?",
  'What are placement opportunities?': "CUSAT has an active Centre for Career Development & Placement:\n\n🏢 **Major Recruiters (CUSAT Campus)**\n• TCS, Infosys, Wipro, Cognizant\n• UST Global, IBS Software\n• Ernst & Young, KPMG\n• Various Kerala-based tech companies\n\n📍 **Location Advantage**\n• CUSAT is in Kalamassery, Kochi — within the Infopark and SmartCity tech corridor\n• Direct access to major IT companies for internships and placements\n\n🎓 **Program Highlights**\n• Pre-placement training and mock interviews\n• Industry interaction and guest lectures\n• Internship facilitation\n• Entrepreneurship cell for startup opportunities\n\nPlacement statistics vary by program. Shall I connect you with the placement cell for more details?",
};

function getAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('course') || lower.includes('program') || lower.includes('available')) return aiResponses['What courses are available?'];
  if (lower.includes('mca') && (lower.includes('eligib') || lower.includes('qualify'))) return aiResponses['What is the MCA eligibility?'];
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('price') || lower.includes('tuition')) return aiResponses['What is the fee structure?'];
  if (lower.includes('scholarship') || lower.includes('merit') || lower.includes('financial')) return aiResponses['Are scholarships available?'];
  if (lower.includes('hostel') || lower.includes('accommodation') || lower.includes('stay')) return aiResponses['What are the hostel facilities?'];
  if (lower.includes('eligib') || lower.includes('requirement') || lower.includes('qualify')) return aiResponses['What is the MCA eligibility?'];
  if (lower.includes('apply') || lower.includes('cat') || lower.includes('admission process') || lower.includes('how to')) return aiResponses['How can I apply to CUSAT?'];
  if (lower.includes('placement') || lower.includes('job') || lower.includes('recruit') || lower.includes('career')) return aiResponses['What are placement opportunities?'];
  return "Hello! I am the CUSAT Admission Assistant. I can help you with information about:\n\n• Courses & programs offered at CUSAT\n• Fee structure & scholarship options\n• Hostel facilities on campus\n• Eligibility requirements for various programs\n• CUSAT CAT admission process\n• Placement opportunities\n\nPlease note: This is a demo AI assistant. For official and most current information, visit the official CUSAT website. What would you like to know?";
}

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

const WELCOME = "Hello! I am the CUSAT Admission Assistant. I can help you with courses, admissions, fees, scholarships, hostels, placements, eligibility requirements, and application procedures.\n\n_Note: This is a demo assistant. For official information, please refer to the CUSAT website._";

const initialSessions: ConversationSession[] = [
  {
    id: '1',
    title: 'B.Tech CSE Enquiry',
    lastMessage: 'What are the scholarship options?',
    date: 'Today',
    messages: [
      { id: '1', role: 'assistant', content: WELCOME, timestamp: '10:30 AM' },
      { id: '2', role: 'user', content: 'What courses are available?', timestamp: '10:31 AM' },
      { id: '3', role: 'assistant', content: aiResponses['What courses are available?'], timestamp: '10:31 AM' },
      { id: '4', role: 'user', content: 'Are scholarships available?', timestamp: '10:32 AM' },
      { id: '5', role: 'assistant', content: aiResponses['Are scholarships available?'], timestamp: '10:32 AM' },
    ],
  },
  {
    id: '2',
    title: 'MCA Admission Query',
    lastMessage: 'What are the placement opportunities?',
    date: 'Yesterday',
    messages: [
      { id: '1', role: 'assistant', content: WELCOME, timestamp: '3:15 PM' },
      { id: '2', role: 'user', content: 'What is the MCA eligibility?', timestamp: '3:16 PM' },
      { id: '3', role: 'assistant', content: aiResponses['What is the MCA eligibility?'], timestamp: '3:16 PM' },
      { id: '4', role: 'user', content: 'What are placement opportunities?', timestamp: '3:17 PM' },
      { id: '5', role: 'assistant', content: aiResponses['What are placement opportunities?'], timestamp: '3:17 PM' },
    ],
  },
  {
    id: '3',
    title: 'Hostel Facilities Query',
    lastMessage: 'What are the hostel facilities?',
    date: 'Jan 19',
    messages: [
      { id: '1', role: 'assistant', content: WELCOME, timestamp: '11:00 AM' },
      { id: '2', role: 'user', content: 'What are the hostel facilities?', timestamp: '11:01 AM' },
      { id: '3', role: 'assistant', content: aiResponses['What are the hostel facilities?'], timestamp: '11:01 AM' },
    ],
  },
];

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
  const [sessions, setSessions] = useState<ConversationSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

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

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) => prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, aiMsg] }
          : s
      ));
      setIsTyping(false);
    }, 1500);
  };

  const newChat = () => {
    const id = Date.now().toString();
    const newSession: ConversationSession = {
      id,
      title: 'New Conversation',
      lastMessage: '',
      date: 'Today',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: WELCOME,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
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
                <span className="text-xs text-slate-400">Online · Demo Mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Database className="w-3 h-3" />
            CUSAT Knowledge Base
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
          <p className="text-xs text-slate-400 text-center mt-2">Demo assistant using CUSAT admission data. Not affiliated with CUSAT.</p>
        </div>
      </div>
    </div>
  );
}
