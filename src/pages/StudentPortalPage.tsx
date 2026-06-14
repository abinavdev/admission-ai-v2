import { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Bot, User, Send, ChevronRight,
  Users, Sparkles, X, Check,
  Database, AlertCircle, ExternalLink,
} from 'lucide-react';
import { Page } from '../types';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface StudentPortalProps {
  onNavigate: (page: Page) => void;
}

const suggestedQuestions = [
  'What courses are available?',
  'What is the MCA eligibility?',
  'Are scholarships available?',
  'What are hostel facilities?',
  'How can I apply?',
  'What is the fee structure?',
  'What are placement opportunities?',
];

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

const courseOptions = [
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
];

const stats = [
  { label: 'Queries Answered', value: '48,392' },
  { label: 'Leads Captured', value: '7,214' },
  { label: 'Avg Response', value: '< 1 sec' },
  { label: 'Availability', value: '24/7' },
];

const faqs = [
  { q: 'When is the CUSAT CAT held?', a: 'CUSAT CAT is typically conducted annually. The official notification with exact dates is released on the CUSAT website. Registration is online through the CUSAT admissions portal.' },
  { q: 'Is there management quota for CUSAT admissions?', a: 'CUSAT is a central university. Admissions are merit-based through CUSAT CAT and centralised counselling. Please refer to the official CUSAT admission notification for current quota details.' },
  { q: 'Is CUSAT a good university for placements?', a: 'CUSAT has an active placement cell and is located in Kochi\'s tech corridor near Infopark and SmartCity. Major IT companies and consulting firms regularly recruit from the campus.' },
  { q: 'What is the hostel fee at CUSAT?', a: 'Hostel fees at CUSAT are approximately ₹2,000–₹4,000/month including meals. Fees are revised annually. Seats are limited and allocated on merit basis after admission.' },
];

export function StudentPortalPage({ onNavigate }: StudentPortalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hello! I am the CUSAT Admission Assistant. I can help you with courses, admissions, fees, scholarships, hostels, placements, eligibility requirements, and application procedures.\n\n_Note: This is a demo assistant. For official information, please visit the CUSAT website._" },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: '', phone: '', email: '', course: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      content:
        response.data?.data?.answer ||
        'No answer found.',
    };

    setMessages((prev) => [...prev, aiMsg]);
  } catch (err) {
    console.error(err);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content:
        'Sorry, I could not connect to the knowledge base.',
    };

    setMessages((prev) => [...prev, aiMsg]);
  } finally {
    setIsTyping(false);
  }
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
        setShowLeadModal(false);
        setLeadSubmitted(false);
        setLeadForm({ name: '', phone: '', email: '', course: '' });
      }, 2500);
    } catch (err) {
      console.error('Failed to submit lead:', err);
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Top disclaimer bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-center">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Demo deployment using publicly available CUSAT data.</span>{' '}
            Not affiliated with or endorsed by CUSAT.{' '}
            <a href="https://www.cusat.ac.in" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5">Official CUSAT website <ExternalLink className="w-3 h-3" /></a>
          </p>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#003B7A] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm leading-none block">AdmissionAI</span>
              <span className="text-xs text-amber-600 font-semibold leading-none">CUSAT Demo Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('landing')} className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Back to Site
            </button>
            <button onClick={() => onNavigate('login')} className="btn-primary text-xs px-3 py-2">
              Admin Login
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#003B7A] to-[#0059b3] rounded-2xl p-8 lg:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4B400]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="relative">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              CUSAT Admission Assistant
            </h1>
            <p className="text-blue-100 text-base max-w-xl mx-auto leading-relaxed mb-6">
              Get instant answers about admissions, eligibility, fees, scholarships, hostels, placements, and application procedures.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setShowLeadModal(true)} className="flex items-center gap-2 bg-[#F4B400] hover:bg-[#e0a500] text-slate-900 font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg">
                <Users className="w-4 h-4" />
                Request Admission Assistance
              </button>
              <a href="https://www.cusat.ac.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-medium px-6 py-3 rounded-xl transition-all text-sm">
                <ExternalLink className="w-4 h-4" />
                Official CUSAT Website
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-card border border-slate-100">
              <div className="text-xl font-bold text-[#003B7A]">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#003B7A] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">CUSAT Admission Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-blue-200 text-xs">Demo Mode · Powered by AI</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
              <Database className="w-3 h-3" />
              <span className="hidden sm:inline">CUSAT Knowledge Base</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#003B7A] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-[#003B7A] text-white rounded-tr-sm' : 'bg-white text-slate-800 rounded-tl-sm shadow-card border border-slate-100'}`}>
                  <FormattedMessage content={msg.content} />
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
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-card border border-slate-100">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-5 py-3 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Try asking:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isTyping}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-[#003B7A] rounded-full hover:bg-blue-100 transition-colors font-medium border border-blue-100 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Ask about CUSAT courses, fees, eligibility, CAT exam..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003B7A] focus:bg-white resize-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-[#003B7A] hover:bg-[#002f61] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-slate-400 text-center mt-2">Demo AI using CUSAT data. Not affiliated with CUSAT.</p>
          </div>
        </div>

        {/* Course Explorer */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 text-lg mb-5">Course Explorer</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'B.Tech Computer Science', duration: '4 years', level: 'Undergraduate', icon: '💻', color: 'bg-blue-50 border-blue-100' },
              { name: 'B.Tech Electronics & Comm.', duration: '4 years', level: 'Undergraduate', icon: '📡', color: 'bg-indigo-50 border-indigo-100' },
              { name: 'MCA', duration: '3 years', level: 'Postgraduate', icon: '🖥️', color: 'bg-emerald-50 border-emerald-100' },
              { name: 'MBA', duration: '2 years', level: 'Postgraduate', icon: '📊', color: 'bg-amber-50 border-amber-100' },
              { name: 'M.Tech Artificial Intelligence', duration: '2 years', level: 'Postgraduate', icon: '🤖', color: 'bg-purple-50 border-purple-100' },
              { name: 'Integrated M.Sc', duration: '5 years', level: 'Integrated', icon: '🔬', color: 'bg-rose-50 border-rose-100' },
            ].map((course) => (
              <button
                key={course.name}
                onClick={() => sendMessage(`Tell me about ${course.name} at CUSAT`)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left hover:shadow-md transition-all ${course.color}`}
              >
                <span className="text-2xl flex-shrink-0">{course.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{course.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course.duration} · {course.level}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 text-lg mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                >
                  <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lead Capture CTA */}
        <div className="bg-gradient-to-r from-[#003B7A] to-[#0059b3] rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Want personalised admission guidance?</h2>
          <p className="text-blue-100 text-sm mb-5">Fill in your details and our team will reach out to help you with your CUSAT admission journey.</p>
          <button onClick={() => setShowLeadModal(true)} className="btn-secondary text-sm px-6 py-3 inline-flex items-center gap-2">
            <Users className="w-4 h-4" />
            Request Admission Assistance
          </button>
        </div>

        {/* Disclaimer Footer */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm mb-1">Important Disclaimer</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                This Student Portal is a <strong>demo deployment of AdmissionAI</strong> using publicly available Cochin University of Science and Technology (CUSAT) admission information for demonstration purposes. This application is <strong>not affiliated with, endorsed by, or officially connected to CUSAT</strong>. AI responses are auto-generated and may not reflect current CUSAT policies or accurate fee figures. For official and authoritative information, always refer to the <strong>official CUSAT website at cusat.ac.in</strong> or contact CUSAT directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { if (!leadSubmitted) setShowLeadModal(false); }} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up">
            {leadSubmitted ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Request Submitted!</h3>
                <p className="text-sm text-slate-500">Thank you. Our admission guidance team will contact you soon.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Request Admission Assistance</h3>
                  <button onClick={() => setShowLeadModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <form onSubmit={submitLead} className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name *</label>
                    <input type="text" required placeholder="e.g. Arjun Nair" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone Number *</label>
                    <input type="tel" required placeholder="+91 98765 43210" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address *</label>
                    <input type="email" required placeholder="you@example.com" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Interested Course *</label>
                    <select required value={leadForm.course} onChange={(e) => setLeadForm({ ...leadForm, course: e.target.value })} className="input">
                      <option value="">Select a program</option>
                      {courseOptions.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    This is a demo form. Submitting will not send your details to CUSAT. This demonstrates AdmissionAI's lead capture capability.
                  </p>
                  <button type="submit" disabled={submittingLead} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                    {submittingLead ? (
                      <>
                        <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ width: 18, height: 18 }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Request Admission Assistance
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
