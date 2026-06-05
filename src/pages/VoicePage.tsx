import React, { useState } from 'react';
import {
  Phone, PhoneCall, PhoneOff, Clock, Users, TrendingUp,
  Activity, Mic, Database, Bot, ChevronRight, Play,
  CheckCircle, ArrowRight,
} from 'lucide-react';
import { callLogs } from '../data/mockData';
import { Modal } from '../components/ui/Modal';
import { CallStatusBadge } from '../components/ui/Badge';

const workflowSteps = [
  { icon: <Phone className="w-4 h-4" />, label: 'Student Calls', color: 'bg-blue-500' },
  { icon: <Mic className="w-4 h-4" />, label: 'Speech Recognition', color: 'bg-indigo-500' },
  { icon: <Database className="w-4 h-4" />, label: 'Knowledge Base Retrieval', color: 'bg-purple-500' },
  { icon: <Bot className="w-4 h-4" />, label: 'AI Response Generation', color: 'bg-[#003B7A]' },
  { icon: <Users className="w-4 h-4" />, label: 'Lead Collection', color: 'bg-amber-500' },
  { icon: <CheckCircle className="w-4 h-4" />, label: 'Dashboard Storage', color: 'bg-emerald-500' },
];

export function VoicePage() {
  const [selectedCall, setSelectedCall] = useState<typeof callLogs[0] | null>(null);

  const completedCalls = callLogs.filter((c) => c.status === 'Completed').length;
  const totalCalls = callLogs.length;

  return (
    <div className="space-y-6">
      {/* Agent Status Card */}
      <div className="bg-gradient-to-r from-[#003B7A] to-[#0059b3] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-300 font-medium text-sm">Voice Agent Active — Demo Mode</span>
              </div>
              <h2 className="text-white font-bold text-xl">CUSAT Admission Voice Agent</h2>
              <p className="text-blue-200 text-sm">Active Number: <span className="text-white font-medium">+91 48442 00000</span> (Demo)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Calls Today', value: '47', icon: <PhoneCall className="w-4 h-4" /> },
              { label: 'Avg Duration', value: '3:42', icon: <Clock className="w-4 h-4" /> },
              { label: 'Leads Created', value: '31', icon: <Users className="w-4 h-4" /> },
              { label: 'Conv. Rate', value: '66%', icon: <TrendingUp className="w-4 h-4" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
                <div className="text-white/70 flex justify-center mb-1">{stat.icon}</div>
                <div className="text-white font-bold text-lg">{stat.value}</div>
                <div className="text-blue-200 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Workflow Diagram */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#003B7A]" />
            AI Call Workflow
          </h3>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 to-emerald-500 opacity-30" />
            <div className="space-y-5">
              {workflowSteps.map((step, i) => (
                <div key={step.label} className="relative flex items-center gap-4 pl-3">
                  <div className={`relative z-10 w-9 h-9 ${step.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-800">{step.label}</span>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <div className="absolute left-[2.25rem] top-9 flex justify-center w-0">
                      <ArrowRight className="w-3 h-3 text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-5">Agent Performance</h3>
          <div className="space-y-4">
            {[
              { label: 'Call Answer Rate', value: 98, color: '#003B7A' },
              { label: 'Lead Capture Rate', value: 66, color: '#F4B400' },
              { label: 'Avg Satisfaction', value: 92, color: '#22c55e' },
              { label: 'First Call Resolution', value: 78, color: '#0ea5e9' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900">{completedCalls}</p>
              <p className="text-xs text-slate-400 mt-0.5">Completed</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-500">{totalCalls - completedCalls}</p>
              <p className="text-xs text-slate-400 mt-0.5">Missed / VM</p>
            </div>
          </div>
        </div>

        {/* Knowledge Base & Lead Status */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">AI Knowledge Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Knowledge Base', status: 'Active', icon: <Database className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
                { label: 'Speech Recognition', status: 'Active', icon: <Mic className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
                { label: 'Lead Capture', status: 'Active', icon: <Users className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
                { label: 'Call Recording', status: 'Active', icon: <Phone className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-slate-400">{item.icon}</span>
                    {item.label}
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${item.color}`}>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Today's Summary</h3>
            <div className="space-y-2">
              {[
                { label: 'Total Calls', value: '47', color: 'text-[#003B7A]' },
                { label: 'Leads Generated', value: '31', color: 'text-amber-600' },
                { label: 'Avg Duration', value: '3:42', color: 'text-slate-700' },
                { label: 'Peak Hour', value: '11 AM - 12 PM', color: 'text-slate-700' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Call Records */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Recent Call Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {['Call ID', 'Student', 'Duration', 'Status', 'Date', 'Transcript'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {callLogs.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{call.id}</td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-xs font-medium text-slate-900">{call.studentName}</p>
                      <p className="text-xs text-slate-400">{call.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="w-3 h-3" />
                      {call.duration}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><CallStatusBadge status={call.status} /></td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{call.date}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="flex items-center gap-1 text-xs text-[#003B7A] hover:underline font-medium"
                    >
                      <Play className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Modal */}
      <Modal isOpen={!!selectedCall} onClose={() => setSelectedCall(null)} title={`Call Transcript — ${selectedCall?.studentName}`} size="lg">
        {selectedCall && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Duration', value: selectedCall.duration },
                { label: 'Status', value: selectedCall.status },
                { label: 'Date', value: selectedCall.date },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Transcript</h4>
              <div className="space-y-2">
                {selectedCall.transcript.split('\n').map((line, i) => {
                  if (!line.trim()) return null;
                  const isAI = line.startsWith('AI:');
                  const isStudent = line.startsWith('Student:');
                  const content = line.replace(/^(AI:|Student:)\s*/, '');
                  return (
                    <div key={i} className={`flex gap-2 ${isStudent ? 'justify-end' : ''}`}>
                      {isAI && (
                        <div className="w-5 h-5 rounded-full bg-[#003B7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${isAI ? 'bg-white border border-slate-200 text-slate-700' : isStudent ? 'bg-[#003B7A] text-white' : 'text-slate-500 italic'}`}>
                        {isAI || isStudent ? content : line}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
