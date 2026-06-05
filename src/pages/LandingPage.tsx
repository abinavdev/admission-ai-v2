import { useState } from 'react';
import {
  GraduationCap, Phone, MessageSquare, BookOpen, Check, Star,
  ArrowRight, Users, Zap, Shield,
  TrendingUp, Clock, Award, Building2, Globe, Menu, X,
  Bot, FileText, BarChart3, ChevronDown, AlertCircle,
} from 'lucide-react';
import { Page } from '../types';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const features = [
  { icon: <MessageSquare className="w-6 h-6 text-[#003B7A]" />, title: 'AI Chat Assistant', description: 'Answer student queries 24/7 with intelligent responses powered by your university knowledge base. No staff needed.' },
  { icon: <Phone className="w-6 h-6 text-[#003B7A]" />, title: 'AI Voice Agent', description: 'Handle inbound admission calls automatically. The AI speaks naturally, answers questions, and captures leads.' },
  { icon: <BookOpen className="w-6 h-6 text-[#003B7A]" />, title: 'Knowledge Base', description: 'Upload your prospectus, fee structure, and documents. The AI learns everything and answers from it instantly.' },
  { icon: <Users className="w-6 h-6 text-[#003B7A]" />, title: 'Lead Management', description: 'Every enquiry becomes a tracked lead. Monitor status, follow up, and convert more students effortlessly.' },
  { icon: <BarChart3 className="w-6 h-6 text-[#003B7A]" />, title: 'Advanced Analytics', description: 'Real-time dashboards showing call volumes, chat trends, lead conversion rates, and course popularity.' },
  { icon: <Shield className="w-6 h-6 text-[#003B7A]" />, title: 'Enterprise Security', description: 'SOC 2 compliant infrastructure with end-to-end encryption, role-based access, and audit logs.' },
];

const steps = [
  { step: '01', title: 'Upload Documents', desc: 'Upload your prospectus, fee structure, hostel info, and course catalog to the AI Knowledge Base.' },
  { step: '02', title: 'Configure AI Agents', desc: 'Set up your AI Chat and Voice agents with your university name, tone, and preferred response style.' },
  { step: '03', title: 'Go Live in Minutes', desc: 'Embed the chat widget on your website and connect your phone number. AI starts handling enquiries immediately.' },
  { step: '04', title: 'Monitor & Convert', desc: 'Track all leads, view transcripts, and get analytics to optimise your admission conversion funnel.' },
];

const testimonials = [
  {
    name: 'Dr. Anand Krishnamurthy',
    role: 'Director of Admissions, Meridian University',
    text: 'AdmissionAI reduced our admission office workload by 60%. The AI handles 500+ enquiries per day and our conversion rate has jumped from 18% to 34%.',
    avatar: 'AK',
    stars: 5,
  },
  {
    name: 'Prof. Rekha Sharma',
    role: 'Principal, Horizon Engineering College',
    text: 'The voice AI is incredibly natural. Students often don\'t realise they\'re speaking to an AI. Lead capture has become completely automated.',
    avatar: 'RS',
    stars: 5,
  },
  {
    name: 'Suresh Iyer',
    role: 'Admission Head, Pinnacle Business School',
    text: 'Implementation took just 2 days. The knowledge base is powerful — it answers scholarship, hostel, and fee queries perfectly every time.',
    avatar: 'SI',
    stars: 5,
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹9,999',
    period: '/month',
    description: 'Perfect for smaller colleges just getting started',
    features: ['AI Chat Assistant', '500 chat sessions/month', '100 AI voice calls/month', '5 documents in Knowledge Base', 'Basic Lead Management', 'Email Support'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₹24,999',
    period: '/month',
    description: 'For growing institutions with high enquiry volume',
    features: ['Everything in Starter', 'Unlimited chat sessions', '1,000 AI voice calls/month', '50 documents in Knowledge Base', 'Advanced Analytics', 'CRM Integration', 'Priority Support', 'Custom AI Persona'],
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For large universities with multiple campuses',
    features: ['Everything in Professional', 'Unlimited voice calls', 'Unlimited documents', 'Multi-campus support', 'SSO & Advanced Security', 'Dedicated Account Manager', 'SLA Guarantee', 'API Access'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const stats = [
  { value: '200+', label: 'Colleges & Universities' },
  { value: '2M+', label: 'Student Enquiries Handled' },
  { value: '94%', label: 'Satisfaction Rate' },
  { value: '3x', label: 'Increase in Conversion' },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How quickly can we go live?', a: 'Most universities are live within 48 hours. Upload your documents, configure your AI agent, and embed the widget. Our team assists every step of the way.' },
    { q: 'Does the AI sound robotic on calls?', a: 'No. We use advanced neural text-to-speech with natural pauses and intonation. 90% of students in our surveys thought they were speaking to a human.' },
    { q: 'What languages are supported?', a: 'English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, and Marathi. More languages are added regularly.' },
    { q: 'Is student data secure?', a: 'Absolutely. We are SOC 2 Type II compliant with data hosted on Indian servers. All data is encrypted at rest and in transit.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Demo Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            <span className="font-bold">Demo Deployment using CUSAT Admission Data.</span>{' '}
            AdmissionAI is an independent SaaS platform and is not affiliated with or endorsed by Cochin University of Science and Technology.
          </p>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#003B7A] rounded-xl flex items-center justify-center">
                <GraduationCap className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base leading-none">AdmissionAI</span>
                <span className="block text-[10px] text-amber-600 font-semibold leading-none mt-0.5">Demo — CUSAT Data</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-7">
              {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-slate-600 hover:text-[#003B7A] transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => onNavigate('login')} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg transition-colors">
                Sign In
              </button>
              <button onClick={() => onNavigate('student-portal')} className="btn-secondary text-sm px-4 py-2">
                Student Portal
              </button>
              <button onClick={() => onNavigate('dashboard')} className="btn-primary text-sm px-4 py-2">
                Request Demo
              </button>
            </div>

            <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-slide-up">
            {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2">
                {item}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <button onClick={() => { onNavigate('student-portal'); setMobileMenuOpen(false); }} className="w-full btn-secondary text-sm">Student Portal</button>
              <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="w-full btn-outline text-sm">Sign In</button>
              <button onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }} className="w-full btn-primary text-sm">Request Demo</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003B7A] via-[#00458f] to-[#0059b3] py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4B400] rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/20 backdrop-blur-sm rounded-full text-amber-200 text-sm font-medium mb-4 border border-amber-400/30">
              <AlertCircle className="w-4 h-4 text-amber-300" />
              <span>Demo Deployment using CUSAT Admission Data</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
              <Zap className="w-4 h-4 text-[#F4B400]" />
              <span>Trusted by 200+ colleges across India</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Automate University Admissions{' '}
              <span className="text-[#F4B400]">with AI</span>
            </h1>

            <p className="text-lg lg:text-xl text-blue-100 leading-relaxed mb-6 max-w-3xl mx-auto">
              See how AI can answer admission enquiries, capture student leads, and reduce workload using CUSAT admission information.
            </p>

            <p className="text-sm text-blue-200/70 mb-10 max-w-2xl mx-auto">
              This demo uses publicly available CUSAT admission data to showcase AdmissionAI capabilities. AdmissionAI is not affiliated with Cochin University of Science and Technology.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => onNavigate('dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#F4B400] hover:bg-[#e0a500] text-slate-900 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]">
                Request Demo
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigate('student-portal')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 backdrop-blur-sm">
                <Bot className="w-4 h-4" />
                Try Student Portal
              </button>
            </div>

            <p className="mt-5 text-sm text-blue-200">No credit card required · 14-day free trial · Setup in 48 hours</p>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="bg-amber-50 border-y border-amber-100 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 text-sm mb-1">About This Demo</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                AdmissionAI is an independent AI SaaS platform demonstrated using publicly available CUSAT (Cochin University of Science and Technology) admission information. This application is <strong>not affiliated with, endorsed by, or officially connected to CUSAT</strong> in any way. The CUSAT information used here is sourced from publicly available documents for demonstration purposes only. All AI responses are generated automatically and may not reflect current CUSAT policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">Platform Features</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Everything you need to automate admissions</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">One platform combining AI chat, voice calling, and knowledge management to transform how your university handles student enquiries.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 border border-slate-100 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-[#003B7A] transition-colors duration-200">
                  <div className="group-hover:[&>svg]:text-white transition-colors duration-200">{f.icon}</div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">Simple Setup</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Up and running in 48 hours</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] right-[-50%] h-px bg-gradient-to-r from-slate-200 to-slate-100 z-0" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003B7A] to-[#0059b3] text-white text-xl font-bold flex items-center justify-center mx-auto mb-5 shadow-lg">
                  {step.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Voice Demo */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-[#003B7A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#F4B400] font-semibold text-sm uppercase tracking-wider">AI Voice Agent</span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-white mb-6">Never miss an admission call again</h2>
              <p className="text-blue-100 leading-relaxed mb-8">
                Our AI Voice Agent picks up every call, speaks naturally in the student's preferred language, answers questions from your knowledge base, and captures student details automatically.
              </p>
              <div className="space-y-3">
                {['Handles 100+ concurrent calls simultaneously', 'Captures student name, phone, email, and course interest', 'Integrates with your existing phone number', 'Multilingual support: English, Malayalam, Hindi, and more', 'Real-time transcripts and automatic lead creation'].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#F4B400] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-slate-900" />
                    </div>
                    <span className="text-sm text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-medium text-sm">Live AI Voice Call — CUSAT Admissions Demo</span>
              </div>
              <div className="space-y-3">
                {[
                  { who: 'AI', msg: 'Welcome to Cochin University of Science and Technology Admissions. How may I assist you today?' },
                  { who: 'Student', msg: 'Hi, I want to know about the MCA admission process.' },
                  { who: 'AI', msg: 'MCA at CUSAT is a 3-year program. Eligibility requires a Bachelor\'s degree with Mathematics. Admission is through CUSAT CAT. Shall I tell you more about the exam pattern?' },
                  { who: 'Student', msg: 'Yes. Also are scholarships available?' },
                  { who: 'AI', msg: 'Yes! Merit scholarships, government category scholarships, and need-based aid are available. Would you like me to capture your details for a counsellor follow-up?' },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.who === 'Student' ? 'justify-end' : ''}`}>
                    <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${msg.who === 'AI' ? 'bg-white/15 text-white' : 'bg-[#F4B400] text-slate-900'}`}>
                      <span className={`text-xs font-bold block mb-1 ${msg.who === 'AI' ? 'text-blue-300' : 'text-slate-700'}`}>{msg.who}</span>
                      {msg.msg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Demo */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden order-2 lg:order-1">
              <div className="bg-[#003B7A] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white text-sm font-medium">CUSAT Admission Assistant</span>
                </div>
                <span className="text-xs text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">Powered by Knowledge Base</span>
              </div>
              <div className="p-4 h-72 overflow-y-auto space-y-3">
                {[
                  { role: 'ai', msg: 'Hello! I am the CUSAT Admission Assistant. I can help you with courses, admissions, fees, scholarships, hostels, placements, eligibility requirements, and application procedures.' },
                  { role: 'user', msg: 'What courses are available?' },
                  { role: 'ai', msg: 'CUSAT offers B.Tech, M.Tech, MCA, MBA, BBA, B.Sc, M.Sc, Integrated M.Sc, and research programs across departments including Engineering, Science, Management, and Applied Sciences.' },
                  { role: 'user', msg: 'Are scholarships available?' },
                  { role: 'ai', msg: 'Yes. Various merit-based, category-based, and government-supported scholarships are available for eligible students including GATE fellowship for M.Tech scholars.' },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${msg.role === 'ai' ? 'bg-slate-100 text-slate-700' : 'bg-[#003B7A] text-white'}`}>
                      {msg.msg}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">AI Chat Assistant</span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Answer every student question, instantly</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Embed our AI chat widget on your university website and it instantly starts answering questions about courses, fees, scholarships, hostels, and more — all from your own uploaded documents.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Clock className="w-4 h-4" />, label: '24/7 Availability', sub: 'Never offline' },
                  { icon: <Zap className="w-4 h-4" />, label: 'Instant Response', sub: 'Under 1 second' },
                  { icon: <Globe className="w-4 h-4" />, label: '8 Languages', sub: 'Incl. Malayalam' },
                  { icon: <Award className="w-4 h-4" />, label: '98% Accuracy', sub: 'From your docs' },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-card">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#003B7A] mb-2">{item.icon}</div>
                    <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">Knowledge Base</span>
              <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Train AI on your university documents in minutes</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Upload your CUSAT prospectus, fee structure, scholarship handbook, hostel guide — and the AI learns everything. Updates automatically when you upload new documents.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <FileText className="w-4 h-4" />, title: 'Prospectus & Brochures', desc: 'Course details, eligibility, duration, CAT exam info' },
                  { icon: <BookOpen className="w-4 h-4" />, title: 'Fee Structure & Scholarships', desc: 'Tuition fees, hostel charges, GATE fellowship, financial aid' },
                  { icon: <Building2 className="w-4 h-4" />, title: 'Hostel & Campus Facilities', desc: 'Infrastructure, labs, sports, hostel, amenities' },
                  { icon: <Users className="w-4 h-4" />, title: 'Admission Process', desc: 'CAT exam, application steps, important dates' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-[#003B7A] flex items-center justify-center text-white flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">CUSAT Knowledge Base — Demo Status</h3>
              <div className="space-y-3">
                {[
                  { name: 'CUSAT_Prospectus_2025.pdf', size: '5.8 MB', status: 'Processed' },
                  { name: 'CUSAT_Fee_Structure.pdf', size: '1.4 MB', status: 'Processed' },
                  { name: 'CUSAT_Scholarship_Handbook.pdf', size: '1.9 MB', status: 'Processed' },
                  { name: 'CUSAT_Hostel_Guide.pdf', size: '2.1 MB', status: 'Processed' },
                  { name: 'CUSAT_Course_Catalog.pdf', size: '4.6 MB', status: 'Processing' },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 truncate">{doc.name}</div>
                      <div className="text-xs text-slate-400">{doc.size}</div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.status === 'Processed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 text-xs text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="font-medium">Demo data — not official CUSAT documents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">Benefits</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Why universities love AdmissionAI</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: '3x More Conversions', desc: 'AI follows up instantly while interest is high, converting 3x more enquiries into enrolments.' },
              { icon: <Clock className="w-5 h-5" />, title: '70% Less Staff Time', desc: 'Admission officers focus on high-value tasks while AI handles repetitive enquiry calls and chats.' },
              { icon: <Zap className="w-5 h-5" />, title: 'Zero Response Delay', desc: 'Every student gets an instant, accurate response — no queue, no wait, no missed opportunity.' },
              { icon: <Users className="w-5 h-5" />, title: 'Handle Peak Season', desc: 'Process thousands of simultaneous enquiries during admission season without extra hiring.' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Deep Insights', desc: 'Understand which courses have most interest, peak enquiry times, and student demographics.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Compliance Ready', desc: 'UGC & AICTE compliant data handling with full audit trail and DPDP Act compliance.' },
            ].map((benefit) => (
              <div key={benefit.title} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#003B7A] flex items-center justify-center text-white flex-shrink-0">{benefit.icon}</div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{benefit.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{benefit.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Loved by admission teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {Array(t.stars).fill(0).map((_, i) => (<Star key={i} className="w-4 h-4 fill-[#F4B400] text-[#F4B400]" />))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#003B7A] text-white flex items-center justify-center text-xs font-bold">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#003B7A] font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-slate-500">Start with a 14-day free trial. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 border ${plan.highlighted ? 'bg-[#003B7A] border-[#003B7A] shadow-2xl scale-105' : 'bg-white border-slate-200 shadow-card'}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F4B400] text-slate-900 text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                  </div>
                )}
                <h3 className={`font-bold text-lg ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-xs mt-1 mb-4 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{plan.description}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
                <button onClick={() => onNavigate('dashboard')} className={`w-full py-2.5 rounded-xl font-semibold text-sm mb-6 transition-all ${plan.highlighted ? 'bg-[#F4B400] text-slate-900 hover:bg-[#e0a500]' : 'bg-[#003B7A] text-white hover:bg-[#002f61]'}`}>
                  {plan.cta}
                </button>
                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#F4B400]' : 'text-emerald-500'}`} />
                      <span className={`text-xs ${plan.highlighted ? 'text-blue-100' : 'text-slate-600'}`}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#003B7A] to-[#0059b3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to transform your admissions?</h2>
          <p className="text-blue-100 text-lg mb-10">Join 200+ colleges already automating their admission process with AdmissionAI.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNavigate('dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#F4B400] hover:bg-[#e0a500] text-slate-900 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg">
              Request Demo <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('student-portal')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
              Try Student Portal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[#003B7A] rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="font-bold text-white text-sm">AdmissionAI</span>
              </div>
              <p className="text-xs leading-relaxed mb-3">AI-powered university admission automation for modern educational institutions.</p>
              <p className="text-xs text-amber-500/70">Demo deployment using CUSAT data. Not affiliated with CUSAT.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'API Docs'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (<li key={link}><a href="#" className="text-xs hover:text-white transition-colors">{link}</a></li>))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2025 AdmissionAI Technologies Pvt. Ltd. All rights reserved.</p>
            <p className="text-xs">Made with dedication for Indian higher education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
