import { useState } from 'react';
import {
  Building2, Phone, MessageSquare, Bell, Users, Code, Save, Eye, EyeOff,
} from 'lucide-react';

const settingsSections = [
  { id: 'college', label: 'College Information', icon: <Building2 className="w-4 h-4" /> },
  { id: 'voice', label: 'Voice Agent Settings', icon: <Phone className="w-4 h-4" /> },
  { id: 'chat', label: 'Chat Assistant Settings', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'team', label: 'Team Members', icon: <Users className="w-4 h-4" /> },
  { id: 'api', label: 'API Integrations', icon: <Code className="w-4 h-4" /> },
];

function CollegeInfoSection() {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'University Name (Demo)', value: 'Cochin University of Science and Technology' },
          { label: 'Short Name', value: 'CUSAT' },
          { label: 'Contact Email', value: 'admissions@admissionai.in' },
          { label: 'Contact Phone', value: '+91 48442 00000' },
          { label: 'Website', value: 'www.cusat.ac.in' },
          { label: 'City', value: 'Kalamassery, Kochi, Kerala' },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">{field.label}</label>
            <input type="text" defaultValue={field.value} className="input" />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">College Description (for AI context)</label>
        <textarea
          defaultValue="Cochin University of Science and Technology (CUSAT) is a premier technical university in Kerala, India, offering programs in Engineering, Science, Management, and Applied Sciences. Established in 1971, CUSAT is located in Kalamassery, Kochi. Admission is through the CUSAT Common Admission Test (CAT)."
          rows={3}
          className="input resize-none"
        />
      </div>
      <button className="btn-primary flex items-center gap-2 text-sm">
        <Save className="w-4 h-4" />
        Save Changes
      </button>
    </div>
  );
}

function VoiceAgentSection() {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Active Phone Number</label>
          <input type="text" defaultValue="+91 48442 00000 (Demo)" className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">AI Agent Name</label>
          <input type="text" defaultValue="Priya" className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Primary Language</label>
          <select className="input">
            <option>English</option>
            <option>Hindi</option>
            <option>Tamil</option>
            <option>Telugu</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Voice Tone</label>
          <select className="input">
            <option>Friendly & Professional</option>
            <option>Formal</option>
            <option>Casual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Max Call Duration (minutes)</label>
          <input type="number" defaultValue={10} min={2} max={30} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Call Hours</label>
          <div className="flex items-center gap-2">
            <input type="time" defaultValue="08:00" className="input" />
            <span className="text-sm text-slate-400">to</span>
            <input type="time" defaultValue="20:00" className="input" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Opening Greeting</label>
        <textarea
          defaultValue="Welcome to Cochin University of Science and Technology Admissions. How may I assist you today?"
          rows={3}
          className="input resize-none"
        />
      </div>
      <div className="space-y-3">
        {[
          { label: 'Enable call recording', checked: true },
          { label: 'Auto-create lead from call', checked: true },
          { label: 'Send SMS follow-up after call', checked: false },
          { label: 'Multilingual auto-detection', checked: true },
        ].map((toggle) => (
          <label key={toggle.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <span className="text-sm text-slate-700 font-medium">{toggle.label}</span>
            <div className={`relative w-10 h-5 rounded-full transition-colors ${toggle.checked ? 'bg-[#003B7A]' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${toggle.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        ))}
      </div>
      <button className="btn-primary flex items-center gap-2 text-sm">
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}

function ChatAssistantSection() {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Widget Title</label>
          <input type="text" defaultValue="CUSAT Admission Assistant" className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Widget Position</label>
          <select className="input">
            <option>Bottom Right</option>
            <option>Bottom Left</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Theme Color</label>
          <div className="flex items-center gap-2">
            <input type="color" defaultValue="#003B7A" className="w-10 h-9 rounded-lg border border-slate-200 p-1 cursor-pointer" />
            <input type="text" defaultValue="#003B7A" className="input flex-1" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Response Language</label>
          <select className="input">
            <option>Auto-detect</option>
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Welcome Message</label>
        <textarea
          defaultValue="Hello! I am the CUSAT Admission Assistant. I can answer questions about courses, fees, scholarships, hostels, CAT eligibility, and the admission process. How can I help you?"
          rows={3}
          className="input resize-none"
        />
      </div>
      <div className="space-y-3">
        {[
          { label: 'Show suggested questions', checked: true },
          { label: 'Collect student contact info', checked: true },
          { label: 'Show knowledge base badge', checked: true },
          { label: 'Enable file attachments', checked: false },
        ].map((toggle) => (
          <label key={toggle.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <span className="text-sm text-slate-700 font-medium">{toggle.label}</span>
            <div className={`relative w-10 h-5 rounded-full transition-colors ${toggle.checked ? 'bg-[#003B7A]' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${toggle.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        ))}
      </div>
      <button className="btn-primary flex items-center gap-2 text-sm">
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-4">
      {[
        { category: 'Leads', items: [
          { label: 'New lead created', sub: 'Get notified when AI captures a new lead', checked: true },
          { label: 'Lead status change', sub: 'When a lead\'s status is updated', checked: true },
          { label: 'Lead converted', sub: 'Celebrate conversions', checked: true },
        ]},
        { category: 'Calls', items: [
          { label: 'Missed call alert', sub: 'When AI can\'t handle a call', checked: true },
          { label: 'Daily call summary', sub: 'End-of-day call digest', checked: false },
          { label: 'Long call alert', sub: 'Calls exceeding 10 minutes', checked: false },
        ]},
        { category: 'System', items: [
          { label: 'Document processed', sub: 'When AI finishes processing a document', checked: true },
          { label: 'Weekly analytics report', sub: 'Sent every Monday morning', checked: true },
          { label: 'Agent downtime alert', sub: 'If AI agent goes offline', checked: true },
        ]},
      ].map((group) => (
        <div key={group.category} className="card p-4">
          <h4 className="font-semibold text-slate-900 text-sm mb-3">{group.category}</h4>
          <div className="space-y-2">
            {group.items.map((item) => (
              <label key={item.label} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
                <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${item.checked ? 'bg-[#003B7A]' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApiSection() {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h4 className="font-semibold text-slate-900 text-sm mb-4">API Keys</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Production API Key</label>
            <div className="relative flex items-center gap-2">
              <input type={showKey ? 'text' : 'password'} defaultValue="sk-live-EBU2024xxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="input font-mono text-xs flex-1" readOnly />
              <button onClick={() => setShowKey(!showKey)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
                {showKey ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h4 className="font-semibold text-slate-900 text-sm mb-4">Integrations</h4>
        <div className="space-y-3">
          {[
            { name: 'CRM Integration', desc: 'Push leads to your CRM automatically', connected: true, logo: 'CRM' },
            { name: 'WhatsApp Business', desc: 'Send follow-up messages via WhatsApp', connected: false, logo: 'WA' },
            { name: 'Google Sheets', desc: 'Export leads to Google Sheets', connected: true, logo: 'GS' },
            { name: 'Zapier', desc: 'Connect with 3000+ apps via Zapier', connected: false, logo: 'ZP' },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 flex-shrink-0">
                {integration.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{integration.name}</p>
                <p className="text-xs text-slate-400">{integration.desc}</p>
              </div>
              <button className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${integration.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'btn-outline'}`}>
                {integration.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('college');

  const renderSection = () => {
    switch (activeSection) {
      case 'college': return <CollegeInfoSection />;
      case 'voice': return <VoiceAgentSection />;
      case 'chat': return <ChatAssistantSection />;
      case 'notifications': return <NotificationsSection />;
      case 'api': return <ApiSection />;
      default: return null;
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="card p-3 space-y-0.5">
          {settingsSections.filter((s) => s.id !== 'team').map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-[#003B7A] text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-5 text-base">
            {settingsSections.find((s) => s.id === activeSection)?.label}
          </h2>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
