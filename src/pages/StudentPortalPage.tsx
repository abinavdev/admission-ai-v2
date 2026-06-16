import { useState, useRef, useEffect } from 'react';
import {
  GraduationCap, Bot, User, Send, Check,
  Coins, ClipboardList, Briefcase, Home, Award,
  Phone, Mail, MapPin, ChevronDown,
  Mic, MicOff, Volume2, VolumeX, Square, RotateCcw, Settings,
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

const TRANSCRIPT_CORRECTION_MAP: Record<string, string> = {
  // CUSAT
  'pusad': 'CUSAT',
  'kusat': 'CUSAT',
  'koosat': 'CUSAT',
  'qsat': 'CUSAT',
  'who sat': 'CUSAT',
  'you sat': 'CUSAT',
  'do sat': 'CUSAT',
  'to sat': 'CUSAT',
  'cusack': 'CUSAT',
  'use of': 'CUSAT',
  
  // SOE
  'soy': 'SOE',
  'so e': 'SOE',
  'so-e': 'SOE',
  's o e': 'SOE',
  'sew': 'SOE',
  'soee': 'SOE',

  // B.Tech / BTech
  'btech': 'B.Tech',
  'b tech': 'B.Tech',
  'b-tech': 'B.Tech',
  'be tech': 'B.Tech',
  'v tech': 'B.Tech',

  // CSE
  'c s e': 'CSE',
  'csa': 'CSE',
  'csc': 'CSE',

  // IT
  'i t': 'IT',
  'i.t.': 'IT',

  // ECE
  'e c e': 'ECE',
  'eca': 'ECE',
  'ecc': 'ECE',

  // EEE
  'e e e': 'EEE',

  // MCA
  'm c a': 'MCA',
  'amca': 'MCA',

  // MBA
  'm b a': 'MBA',

  // Hostel
  'hostile': 'Hostel',
  'hostell': 'Hostel',

  // Placements
  'placments': 'Placements',
  'playsments': 'Placements',
  'placement': 'Placements',

  // Scholarship
  'scholership': 'Scholarship',
  'scholarships': 'Scholarship'
};

const correctTranscript = (text: string): string => {
  if (!text) return '';
  console.log("Original Transcript:", text);
  
  let corrected = text;
  const sortedKeys = Object.keys(TRANSCRIPT_CORRECTION_MAP).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const value = TRANSCRIPT_CORRECTION_MAP[key];
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
    corrected = corrected.replace(regex, value);
  }
  
  console.log("Corrected Transcript:", corrected);
  return corrected;
};

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
  const [voiceResponses, setVoiceResponses] = useState(true);
  const [autoSend, setAutoSend] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Continuous Voice Mode States
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [continuousDuration, setContinuousDuration] = useState(0);
  const [silenceSeconds, setSilenceSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const speakRef = useRef<any>(null);

  // Refs to allow async closures to access fresh state values
  const isContinuousModeRef = useRef(false);
  const voiceStateRef = useRef<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const voiceResponsesRef = useRef(true);

  useEffect(() => {
    isContinuousModeRef.current = isContinuousMode;
  }, [isContinuousMode]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    voiceResponsesRef.current = voiceResponses;
  }, [voiceResponses]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Trigger voice loading and register handler
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Continuous Mode Duration and Silence Tracker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isContinuousMode) {
      interval = setInterval(() => {
        setContinuousDuration((prev) => prev + 1);

        if (voiceState === 'listening') {
          setSilenceSeconds((prev) => {
            const next = prev + 1;
            if (next >= 60) {
              // Pause voice mode after 60 seconds of silence
              pauseVoiceMode();
              return 0;
            }
            return next;
          });
        }
      }, 1000);
    } else {
      setContinuousDuration(0);
      setSilenceSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isContinuousMode, voiceState]);

  const cleanMarkdownForSpeech = (text: string): string => {
    if (!text) return '';
    
    // 1. Process line-by-line first to handle block elements (lists, headers) cleanly
    const lines = text.split('\n');
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      
      // Check for bullet list (*, -, •, +)
      if (/^[•\-*+]\s+/.test(trimmed)) {
        let content = trimmed.replace(/^[•\-*+]\s+/, '');
        if (content && !/[.!?]$/.test(content)) {
          content += '.';
        }
        return content;
      }
      
      // Check for numbered list (e.g. 1. Item)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        let content = numMatch[2];
        if (content && !/[.!?]$/.test(content)) {
          content += '.';
        }
        return `Number ${numMatch[1]}, ${content}`;
      }

      // Check for headings (# headings)
      if (/^#+\s+/.test(trimmed)) {
        let content = trimmed.replace(/^#+\s+/, '');
        if (content && !/[.!?]$/.test(content)) {
          content += '.';
        }
        return content;
      }
      
      return line;
    });

    let cleaned = processedLines.join(' ');

    // 2. Remove markdown links: [link text](url) -> link text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 3. Remove bold emphasis: **bold** or __bold__ -> bold
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

    // 4. Remove italic emphasis: *italic* or _italic_ -> italic
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

    // 5. Remove inline backticks
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // 6. Clean up extra spaces and extra/consecutive periods
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\.+/g, '.')
      .trim();

    return cleaned;
  };

  const selectBestVoice = (): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    console.log("Available Voices:", voices);

    const priorityList = [
      'google uk english female',
      'google us english',
      'microsoft zira',
      'samantha',
      'karen',
      'veena'
    ];

    let selectedVoice: SpeechSynthesisVoice | null = null;

    for (const prefix of priorityList) {
      const found = voices.find(v => v.name.toLowerCase().includes(prefix));
      if (found) {
        selectedVoice = found;
        break;
      }
    }

    if (!selectedVoice) {
      const englishFallback = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (englishFallback) {
        selectedVoice = englishFallback;
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.default) || voices[0] || null;
    }

    console.log("Selected Voice:", selectedVoice?.name);
    return selectedVoice;
  };

  const speak = (text: string, force = false) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    // If not in continuous mode, respect the voiceResponses config (unless forced)
    if (!isContinuousModeRef.current && !voiceResponses && !force) return;

    try {
      const cleaned = cleanMarkdownForSpeech(text);
      if (!cleaned) {
        if (isContinuousModeRef.current) {
          setSilenceSeconds(0);
          setVoiceState('listening');
          startListeningLoop();
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      speakRef.current = utterance;

      const selectedVoice = selectBestVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.25;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (isContinuousModeRef.current) {
          setVoiceState('speaking');
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (isContinuousModeRef.current) {
          setSilenceSeconds(0);
          setVoiceState('listening');
          // Add 500ms delay before restarting listening loop to prevent self-echo
          setTimeout(() => {
            if (isContinuousModeRef.current && voiceStateRef.current === 'listening') {
              startListeningLoop();
            }
          }, 500);
        } else {
          setVoiceState('idle');
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (isContinuousModeRef.current) {
          setSilenceSeconds(0);
          setVoiceState('listening');
          startListeningLoop();
        } else {
          setVoiceState('idle');
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis failed:', err);
      setIsSpeaking(false);
      if (isContinuousModeRef.current) {
        setSilenceSeconds(0);
        setVoiceState('listening');
        startListeningLoop();
      } else {
        setVoiceState('idle');
      }
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (isContinuousMode) {
      setVoiceState('idle');
    }
  };

  const replayLastResponse = () => {
    const assistantMessages = messages.filter((m) => m.role === 'assistant');
    if (assistantMessages.length > 0) {
      const lastMsg = assistantMessages[assistantMessages.length - 1];
      speak(lastMsg.content, true);
    }
  };

  // Continuous Mode Action Handlers
  const startContinuousVoiceMode = () => {
    if (!speechSupported) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }
    
    // Stop any active single recognition or TTS first
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setIsContinuousMode(true);
    setContinuousDuration(0);
    setSilenceSeconds(0);
    setVoiceState('speaking');

    // Add greeting and trigger speak.
    // The onend of this greeting will naturally start the startListeningLoop()
    speak("Hello, I'm the AdmissionAI voice counselor. How can I help you today?", true);
  };

  const stopContinuousVoiceMode = () => {
    setIsContinuousMode(false);
    setVoiceState('idle');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const pauseVoiceMode = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('idle');
  };

  const resumeVoiceMode = () => {
    setSilenceSeconds(0);
    setVoiceState('listening');
    startListeningLoop();
  };

  const interruptSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (isContinuousMode) {
      setSilenceSeconds(0);
      setVoiceState('listening');
      startListeningLoop();
    }
  };

  const startListeningLoop = () => {
    if (!speechSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceState('listening');
        setSilenceSeconds(0);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSilenceSeconds(0);
        if (transcript.trim()) {
          const corrected = correctTranscript(transcript);
          sendContinuousMessage(corrected);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Continuous speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Keep loop alive
          return;
        }
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied.');
          setVoiceState('error');
          setIsContinuousMode(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        // Auto-restart if we are still in continuous mode and listening state
        if (isContinuousModeRef.current && voiceStateRef.current === 'listening') {
          setTimeout(() => {
            if (isContinuousModeRef.current && voiceStateRef.current === 'listening') {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                console.error("Failed to restart speech recognition:", e);
              }
            }
          }, 300);
        }
      };

      rec.start();
    } catch (err) {
      console.error('Failed to start recognition loop:', err);
    }
  };

  const sendContinuousMessage = async (text: string) => {
    if (!text.trim()) return;

    setVoiceState('processing');
    
    // Stop recognition during processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.chat.ask,
        {
          question: text.trim(),
          conversationId: conversationId || undefined,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }
      );

      const dbConvId = response.data?.data?.conversationId;
      if (dbConvId && dbConvId !== 'temp-session') {
        setConversationId(dbConvId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.data?.answer || 'No answer found.',
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      // Speak the response
      setVoiceState('speaking');
      speak(aiMsg.content);
    } catch (err) {
      console.error(err);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I could not connect to the knowledge base.',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setVoiceState('speaking');
      speak(aiMsg.content);
    } finally {
      setIsTyping(false);
    }
  };

  // Push-to-talk Speech Recognition
  const startSpeechRecognition = () => {
    if (!speechSupported) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const corrected = correctTranscript(transcript);
        if (autoSend) {
          sendMessage(corrected);
        } else {
          setInput((prev) => (prev ? prev + ' ' + corrected : corrected));
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied.');
        } else {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setSpeechError('Failed to start speech recognition.');
      setIsListening(false);
    }
  };

  const chatSectionRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (isContinuousMode) {
      stopContinuousVoiceMode();
    }

    // Stop speaking when user sends a new message
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    // Also stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }
      );

      const dbConvId = response.data?.data?.conversationId;
      if (dbConvId && dbConvId !== 'temp-session') {
        setConversationId(dbConvId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.data?.answer || 'No answer found.',
      };

      setMessages((prev) => [...prev, aiMsg]);
      speak(aiMsg.content);
    } catch (err) {
      console.error(err);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I could not connect to the knowledge base.',
      };
      setMessages((prev) => [...prev, aiMsg]);
      speak(aiMsg.content);
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
      const response = await apiClient.post(API_ENDPOINTS.leads.public, {
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        course: leadForm.course,
        chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const dbConvId = response.data?.data?.conversationId;
      if (dbConvId) {
        setConversationId(dbConvId);
      }

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

  const formatDuration = (secs: number): string => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

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
        <section ref={chatSectionRef} className="relative bg-white border border-slate-100 rounded-3xl shadow-card overflow-hidden">
          {/* Continuous Voice Overlay */}
          {isContinuousMode && (
            <div 
              onClick={voiceState === 'speaking' ? interruptSpeaking : undefined}
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white animate-fade-in cursor-default"
            >
              {/* Header with Title and Timer */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase opacity-80 flex items-center gap-1">
                    🎙 Voice Conversation
                  </span>
                </div>
                <div className="font-mono text-sm tracking-widest opacity-80 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/30">
                  {formatDuration(continuousDuration)}
                </div>
              </div>

              {/* Central State Animator */}
              <div className="flex flex-col items-center justify-center space-y-6 my-auto">
                {/* Visual Circle */}
                <div 
                  className={`w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/50 transition-all duration-300 relative ${
                    voiceState === 'listening' ? 'mic-pulse bg-emerald-600/20 border-emerald-500' : ''
                  }`}
                >
                  {voiceState === 'listening' && (
                    <Mic className="w-10 h-10 text-emerald-400 animate-pulse" />
                  )}
                  {voiceState === 'processing' && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  {voiceState === 'speaking' && (
                    <div className="flex items-end gap-1.5 h-12">
                      <div className="w-1.5 bg-indigo-400 rounded-full soundwave-bar" style={{ height: '8px' }} />
                      <div className="w-1.5 bg-indigo-400 rounded-full soundwave-bar" style={{ height: '20px' }} />
                      <div className="w-1.5 bg-indigo-400 rounded-full soundwave-bar" style={{ height: '40px' }} />
                      <div className="w-1.5 bg-indigo-400 rounded-full soundwave-bar" style={{ height: '16px' }} />
                      <div className="w-1.5 bg-indigo-400 rounded-full soundwave-bar" style={{ height: '30px' }} />
                    </div>
                  )}
                  {voiceState === 'idle' && (
                    <VolumeX className="w-10 h-10 text-slate-400" />
                  )}
                  {voiceState === 'error' && (
                    <span className="text-red-400 text-3xl font-bold">!</span>
                  )}
                </div>

                {/* Status Texts */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold capitalize tracking-tight">
                    {voiceState === 'listening' && 'Listening'}
                    {voiceState === 'processing' && 'Thinking'}
                    {voiceState === 'speaking' && 'Speaking'}
                    {voiceState === 'idle' && 'Paused'}
                    {voiceState === 'error' && 'Voice Error'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed mx-auto">
                    {voiceState === 'listening' && (
                      silenceSeconds >= 30 ? 'Still listening...' :
                      silenceSeconds >= 10 ? "I'm listening..." :
                      'Speak now, I am listening...'
                    )}
                    {voiceState === 'processing' && 'Formulating admission response...'}
                    {voiceState === 'speaking' && 'Tap anywhere to interrupt speech'}
                    {voiceState === 'idle' && 'Silence timeout. Tap Resume to continue.'}
                    {voiceState === 'error' && (speechError || 'Speech synthesis/recognition failed.')}
                  </p>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="w-full flex items-center justify-center gap-4">
                {/* Resume Button (Only visible if paused/idle) */}
                {voiceState === 'idle' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resumeVoiceMode();
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Resume Conversation
                  </button>
                )}

                {/* End Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopContinuousVoiceMode();
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  End Conversation
                </button>
              </div>
            </div>
          )}

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

            {/* Voice Controls and Settings Dropdown */}
            <div className="flex items-center gap-2 relative">
              {/* Start Continuous Voice Mode Button */}
              <button
                type="button"
                onClick={startContinuousVoiceMode}
                title="Start Continuous Voice Conversation"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 font-semibold"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice Mode</span>
              </button>
              {/* Voice Responses Auto-Play Indicator/Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  const val = !voiceResponses;
                  setVoiceResponses(val);
                  if (!val) stopSpeaking();
                }}
                title={voiceResponses ? "Mute Voice Responses" : "Unmute Voice Responses"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-white ${
                  voiceResponses ? 'bg-white/15 hover:bg-white/25' : 'bg-red-500/30 text-red-200 hover:bg-red-500/40'
                }`}
              >
                {voiceResponses ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Stop Speaking (Visible when active speech output is running) */}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  title="Stop Speaking"
                  className="w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors animate-pulse"
                >
                  <Square className="w-4 h-4" fill="white" />
                </button>
              )}

              {/* Replay Last Response (Reads the last assistant reply) */}
              <button
                type="button"
                onClick={replayLastResponse}
                title="Replay Last AI Response"
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Voice Settings Dropdown Toggle */}
              <button
                type="button"
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                title="Voice Settings"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-white ${
                  showVoiceSettings ? 'bg-white/30' : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Voice Settings Dropdown */}
              {showVoiceSettings && (
                <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-3 z-50 animate-fade-in text-slate-800">
                  <p className="px-4 pb-2 mb-2 border-b border-slate-100 font-bold text-xs text-slate-500">Voice Settings</p>
                  
                  {/* Voice Responses (ON/OFF) */}
                  <label className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-medium">
                    <span>Voice Responses</span>
                    <input
                      type="checkbox"
                      checked={voiceResponses}
                      onChange={(e) => setVoiceResponses(e.target.checked)}
                      className="rounded border-slate-300 text-[#003B7A] focus:ring-[#003B7A] w-4 h-4"
                    />
                  </label>

                  {/* Auto Send After Speech (ON/OFF) */}
                  <label className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-medium">
                    <span>Auto-send after speech</span>
                    <input
                      type="checkbox"
                      checked={autoSend}
                      onChange={(e) => setAutoSend(e.target.checked)}
                      className="rounded border-slate-300 text-[#003B7A] focus:ring-[#003B7A] w-4 h-4"
                    />
                  </label>
                </div>
              )}
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
            {speechError && (
              <div className="mb-2.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs flex justify-between items-center transition-all animate-fade-in">
                <span>{speechError}</span>
                <button type="button" onClick={() => setSpeechError(null)} className="font-bold hover:text-red-800 text-sm">×</button>
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder={isListening ? "Listening... Speak now..." : "Type your question about admissions, fees, or courses..."}
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003B7A] focus:bg-white resize-none transition-all"
              />

              {/* MICROPHONE BUTTON */}
              <button
                type="button"
                onClick={startSpeechRecognition}
                title={isListening ? "Stop listening" : "Ask using your voice"}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 relative ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                    : speechSupported
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                {speechSupported ? (
                  isListening ? <Mic className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </button>

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
