export type Page =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'chat'
  | 'voice'
  | 'leads'
  | 'call-logs'
  | 'chat-history'
  | 'knowledge-base'
  | 'analytics'
  | 'settings'
  | 'ai-agent'
  | 'team'
  | 'student-portal';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  status: 'New' | 'Contacted' | 'Interested' | 'Follow-Up' | 'Converted';
  source: 'Chat' | 'Voice';
  date: string;
}

export interface CallLog {
  id: string;
  studentName: string;
  phone: string;
  duration: string;
  status: 'Completed' | 'Missed' | 'Voicemail';
  date: string;
  transcript: string;
}

export interface ChatSession {
  id: string;
  studentName: string;
  date: string;
  messageCount: number;
  courseInterest: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export interface Document {
  id: string;
  name: string;
  size: string;
  status: 'Processed' | 'Processing' | 'Queued';
  uploadDate: string;
  type: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Admission Officer' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar: string;
}
