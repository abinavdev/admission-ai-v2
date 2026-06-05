import React from 'react';
import {
  Bot, Phone, Mic, Database, Brain, Users, CheckCircle, ArrowDown,
  Activity, Zap, Shield, TrendingUp, Clock, PhoneCall,
} from 'lucide-react';

const workflowSteps = [
  {
    icon: <Phone className="w-5 h-5" />,
    title: 'Student Initiates',
    desc: 'Student calls the dedicated admission number or opens the chat widget on the college website.',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    icon: <Mic className="w-5 h-5" />,
    title: 'Speech Recognition',
    desc: 'AI converts speech to text using advanced NLP with support for 8 Indian languages and accents.',
    color: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Knowledge Base Retrieval',
    desc: 'AI searches through your college documents using semantic search to find the most relevant information.',
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'AI Response Generation',
    desc: 'Large Language Model generates a natural, accurate response tailored to the student\'s specific query.',
    color: 'bg-[#003B7A]',
    lightBg: 'bg-blue-50',
    textColor: 'text-[#003B7A]',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Lead Collection',
    desc: 'AI gathers student details (name, phone, email, course interest) and creates a lead record automatically.',
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: 'Dashboard Storage',
    desc: 'Conversation transcript, student details, and lead data are stored and made available in the dashboard.',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
];

const metrics = [
  { label: 'Active Agent', value: 'Voice + Chat', status: 'Active', color: 'text-emerald-600' },
  { label: 'Knowledge Base', value: '5 Documents', status: 'Ready', color: 'text-emerald-600' },
  { label: 'Lead Capture', value: 'Enabled', status: 'Active', color: 'text-emerald-600' },
  { label: 'Avg Response', value: '0.8 sec', status: 'Optimal', color: 'text-emerald-600' },
];

export function AIAgentPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003B7A] to-[#0059b3] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">AI Agent Control Center</h2>
              <p className="text-blue-200 text-sm mt-0.5">Monitor and manage your AI admission agents</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Calls Today', value: '47' },
              { label: 'Chats Today', value: '132' },
              { label: 'Leads Today', value: '31' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-blue-200 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Workflow Diagram */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#003B7A]" />
            AI Call & Chat Workflow
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {workflowSteps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                      <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i % 2 === 0 && i < workflowSteps.length - 1 && (
                  <div className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center">
                      <ArrowDown className="w-2.5 h-2.5 text-slate-500 -rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          {/* Agent Status */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#003B7A]" />
              Agent Status
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Voice Agent', status: 'Active', uptime: '99.9%' },
                { label: 'Chat Agent', status: 'Active', uptime: '100%' },
                { label: 'Lead Engine', status: 'Active', uptime: '100%' },
                { label: 'Knowledge Base', status: 'Ready', uptime: '5 docs' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.uptime}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-emerald-600">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#003B7A]" />
              Performance
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Call Answer Rate', value: 98, color: '#003B7A' },
                { label: 'Query Resolution', value: 94, color: '#22c55e' },
                { label: 'Lead Capture Rate', value: 66, color: '#F4B400' },
                { label: 'User Satisfaction', value: 92, color: '#0ea5e9' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#003B7A]" />
              Security & Compliance
            </h3>
            <div className="space-y-2">
              {[
                'End-to-end encrypted calls',
                'DPDP Act compliant',
                'SOC 2 Type II certified',
                'Data stored on Indian servers',
                'Full audit logs',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 text-sm mb-5">AI Technology Stack</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Language Model', value: 'GPT-4 Turbo', desc: 'Response generation', color: 'bg-blue-50 text-blue-700' },
            { label: 'Speech Recognition', value: 'Whisper v3', desc: 'Voice-to-text conversion', color: 'bg-purple-50 text-purple-700' },
            { label: 'Vector Search', value: 'Pinecone', desc: 'Knowledge retrieval', color: 'bg-emerald-50 text-emerald-700' },
            { label: 'TTS Engine', value: 'ElevenLabs', desc: 'Natural voice synthesis', color: 'bg-amber-50 text-amber-700' },
          ].map((tech) => (
            <div key={tech.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tech.color}`}>{tech.label}</span>
              <p className="text-base font-bold text-slate-900 mt-2">{tech.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
