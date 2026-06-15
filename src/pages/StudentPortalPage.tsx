import { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Bot, User, Send, Check,
  Coins, ClipboardList, Briefcase, Home, Award,
  Phone, Mail, MapPin, ChevronDown,
} from 'lucide-react';
import { Page } from '../types';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { useAuthContext } from '../contexts/AuthContext';

interface StudentPortalProps {
  onNavigate: (page: Page) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface LeadForm {
  name: string;
  phone: string;
  email: string;
  course: string;
}

// Configurable generic university portal settings
const PORTAL_CONFIG = {
  universityName: 'AdmissionAI University',
  assistantTitle: 'AI Admission Assistant',
  assistantWelcome: "Hello! I am your University Admission Assistant. I can help you with courses, admissions, fees, scholarships, hostels, placements, eligibility requirements, and application procedures.",
  contactEmail: 'admissions@university.edu',
  contactPhone: '+91 98765 43210',
  contactAddress: 'Admissions Office, Main Campus, Tech City, India',
  courseOptions: [
    'B.Tech Computer Science & Engineering',
    'B.Tech Electronics & Communication',
    'B.Tech Mechanical Engineering',
    'B.Tech Civil Engineering',
    'M.Tech Artificial Intelligence',
    'M.Tech VLSI Design',
    'MCA (Master of Computer Applications)',
    'MBA (Master of Business Administration)',
    'BBA',
    'M.Sc Computer Science',
    'M.Sc Mathematics',
    'Integrated M.Sc Physics',
    'Ph.D Research Program',
  ],
  faqs: [
    { q: 'How do I apply for admissions?', a: 'Applications can be submitted online through our admissions portal. You will need to register, fill out the application form, upload required academic documents, and pay the registration fee.' },
    { q: 'What is the eligibility for the MCA program?', a: 'Candidates must have a Bachelor\'s degree in Computer Applications, Computer Science, or a related discipline with Mathematics as a subject at the 10+2 or graduation level, with minimum 50% aggregate marks.' },
    { q: 'Are hostel facilities available for all students?', a: 'Yes, on-campus boys and girls hostel facilities are available. Hostel allotment is merit-based and subject to seat availability. Applications can be submitted after confirming admission.' },
    { q: 'Are scholarships offered?', a: 'Yes, we offer various merit-based scholarships, financial aid for economically weaker sections, and government-sponsored category scholarships.' },
  ],
  suggestedQuestions: [
    'What courses are available?',
    'What is MCA eligibility?',
    'What are the placement opportunities?',
    'What scholarships are available?',
  ]
};

function FormattedMessage({ content }: { content: string }) {
  return (
    <div className="space-y-1">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
        if (line.startsWith('• ')) return <p key={i} className="text-sm flex gap-1.5"><span className="opacity-60 flex-shrink-0">•</span><span>{line.slice(2)}</span></p>;
        if (line.match(/^\d+\./)) return <p key={i} className="text-sm">{line}</p>;
        if (line.startsWith('_') && line.endsWith('_')) return <p key={i} className="text-xs italic opacity-70 mt-1">{line.slice(1, -1)}</p>;
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export function StudentPortalPage({ onNavigate }: StudentPortalProps) {
  const { isAuthenticated } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: PORTAL_CONFIG.assistantWelcome },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: '', phone: '', email: '', course: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.chat.ask,
        {
          question: text.trim(),
          conversationId: conversationId || undefined,
        }
      );

      const dbConvId = response.data?.data?.conversationId;
      if (dbConvId) {
        setConversationId(dbConvId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.data?.answer || 'No answer found.',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I could not connect to the knowledge base.',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (question: string) => {
    sendMessage(question);
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      await apiClient.post(API_ENDPOINTS.leads.public, {
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        course: leadForm.course,
      });
      setLeadSubmitted(true);
      setTimeout(() => {
        setLeadSubmitted(false);
        setLeadForm({ name: '', phone: '', email: '', course: '' });
      }, 3000);
    } catch (err) {
      console.error('Failed to submit lead:', err);
    } finally {
      setSubmittingLead(false);
    }
  };

  const quickActions = [
    { label: 'Courses', icon: <GraduationCap className="w-5 h-5 text-blue-600" />, question: 'What courses are available?' },
    { label: 'Fees', icon: <Coins className="w-5 h-5 text-emerald-600" />, question: 'What is the fee structure?' },
    { label: 'Eligibility', icon: <ClipboardList className="w-5 h-5 text-amber-600" />, question: 'What are the eligibility criteria for admissions?' },
    { label: 'Placements', icon: <Briefcase className="w-5 h-5 text-indigo-600" />, question: 'What are the placement opportunities?' },
    { label: 'Hostel', icon: <Home className="w-5 h-5 text-rose-600" />, question: 'What hostel facilities are available?' },
    { label: 'Scholarships', icon: <Award className="w-5 h-5 text-purple-600" />, question: 'What scholarships are available?' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Minimal Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#003B7A] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm leading-none block">{PORTAL_CONFIG.universityName}</span>
              <span className="text-[10px] text-emerald-600 font-semibold leading-none flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                AI Admission Desk Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => faqSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} 
              className="hidden sm:inline text-xs font-medium text-slate-500 hover:text-[#003B7A] transition-colors"
            >
              FAQs
            </button>
            <button 
              onClick={() => contactSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} 
              className="hidden sm:inline text-xs font-medium text-slate-500 hover:text-[#003B7A] transition-colors"
            >
              Contact Desk
            </button>
            {isAuthenticated ? (
              <button onClick={() => onNavigate('dashboard')} className="btn-primary text-xs px-3 py-2">
                Admin Dashboard
              </button>
            ) : (
              <button onClick={() => onNavigate('login')} className="btn-primary text-xs px-3 py-2">
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Sections */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-12 w-full">
        {/* 1. Hero Section */}
        <section className="bg-gradient-to-br from-[#003B7A] to-[#0059b3] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-blue-100 text-xs font-medium border border-white/15">
              <Bot className="w-3.5 h-3.5" />
              <span>Admission Counseling Assistant</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Interactive Admission Center
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Explore academic options, check entry requirements, calculate fees, and get instant counseling support 24/7.
            </p>
          </div>
        </section>

        {/* 2. Quick Actions */}
        <section className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-base font-bold text-slate-900">Explore Admissions</h2>
            <p className="text-xs text-slate-500">Click any action to ask our AI assistant immediately.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.question)}
                className="flex flex-col items-center sm:items-start p-5 bg-white border border-slate-100 rounded-2xl text-center sm:text-left shadow-card hover:shadow-card-hover hover:border-[#003B7A]/30 active:scale-[0.98] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-[#003B7A]/5 transition-colors">
                  {action.icon}
                </div>
                <span className="font-semibold text-slate-900 text-sm">{action.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 hidden sm:inline truncate w-full">Ask about {action.label.toLowerCase()}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3 & 4. Chat Assistant & Suggested Questions */}
        <section ref={chatSectionRef} className="bg-white border border-slate-100 rounded-3xl shadow-card overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#003B7A] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{PORTAL_CONFIG.assistantTitle}</p>
                <p className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  24/7 Online Desk
                </p>
              </div>
            </div>
          </div>

          {/* Messages Box */}
          <div className="h-[400px] overflow-y-auto p-5 space-y-4 bg-slate-50/50 flex flex-col">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#003B7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#003B7A] text-white rounded-tr-sm' 
                    : 'bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100'
                }`}>
                  <FormattedMessage content={msg.content} />
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-[#003B7A] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-5 py-3 border-t border-slate-50 bg-white">
            <div className="flex flex-wrap gap-2">
              {PORTAL_CONFIG.suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickAction(q)}
                  disabled={isTyping}
                  className="text-xs px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 text-[#003B7A] rounded-full border border-blue-100/50 transition-colors font-medium disabled:opacity-50 animate-fade-in"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Type your question about admissions, fees, or courses..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003B7A] focus:bg-white resize-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 bg-[#003B7A] hover:bg-[#002f61] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* 5. FAQ Section */}
        <section ref={faqSectionRef} className="space-y-4 pt-4">
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 mt-1">Get quick answers to the most common queries.</p>
          </div>
          <div className="grid gap-3 max-w-3xl mx-auto">
            {PORTAL_CONFIG.faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. Lead Capture Section */}
        <section className="bg-slate-900 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl text-white">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Need Personal Guidance?</h2>
              <p className="text-xs text-slate-400">Fill in your details and an admission counselor will contact you shortly.</p>
            </div>

            {leadSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-fade-in">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm">Request Submitted!</h3>
                <p className="text-xs text-slate-300 mt-1">Thank you. An admissions representative will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={submitLead} className="space-y-4 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Arjun Nair" 
                      value={leadForm.name} 
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} 
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+91 98765 43210" 
                      value={leadForm.phone} 
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} 
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/10 transition-all" 
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="you@example.com" 
                      value={leadForm.email} 
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} 
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/10 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 mb-1">Program of Interest *</label>
                    <select 
                      required 
                      value={leadForm.course} 
                      onChange={(e) => setLeadForm({ ...leadForm, course: e.target.value })} 
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/10 transition-all"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Select a program</option>
                      {PORTAL_CONFIG.courseOptions.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingLead} 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {submittingLead ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : 'Request Admission Assistance'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* 7. Contact Information & Footer */}
      <footer ref={contactSectionRef} className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
        <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#003B7A] rounded-xl flex items-center justify-center text-white">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-white text-sm">{PORTAL_CONFIG.universityName}</span>
            </div>
            <p className="text-xs leading-relaxed">AI-powered university admissions support desk. Find courses, check eligibility, and submit counseling requests instantly.</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Admissions Desk</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>{PORTAL_CONFIG.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{PORTAL_CONFIG.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <a href={`mailto:${PORTAL_CONFIG.contactEmail}`} className="hover:text-white transition-colors">{PORTAL_CONFIG.contactEmail}</a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Top</button>
              </li>
              <li>
                <button onClick={() => faqSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">FAQs</button>
              </li>
              <li>
                {isAuthenticated ? (
                  <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors font-medium">Admin Dashboard</button>
                ) : (
                  <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors font-medium">Admin Login</button>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
          <p>© {new Date().getFullYear()} {PORTAL_CONFIG.universityName}. All rights reserved.</p>
          <p>Powered by AdmissionAI</p>
        </div>
      </footer>
    </div>
  );
}
