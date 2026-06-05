import { Lead, CallLog, ChatSession, Document, TeamMember } from '../types';

export const leads: Lead[] = [
  { id: 'L001', name: 'Arjun Nair', phone: '+91 98765 43210', email: 'arjun.nair@gmail.com', course: 'B.Tech Computer Science', status: 'Converted', source: 'Chat', date: '2025-01-15' },
  { id: 'L002', name: 'Anjali Menon', phone: '+91 87654 32109', email: 'anjali.menon@yahoo.com', course: 'MCA', status: 'Interested', source: 'Voice', date: '2025-01-16' },
  { id: 'L003', name: 'Rahul Krishna', phone: '+91 76543 21098', email: 'rahul.krishna@gmail.com', course: 'MBA', status: 'Follow-Up', source: 'Chat', date: '2025-01-16' },
  { id: 'L004', name: 'Athira Suresh', phone: '+91 65432 10987', email: 'athira.suresh@gmail.com', course: 'M.Tech Artificial Intelligence', status: 'Contacted', source: 'Voice', date: '2025-01-17' },
  { id: 'L005', name: 'Nikhil Raj', phone: '+91 54321 09876', email: 'nikhil.raj@gmail.com', course: 'B.Tech Electronics & Communication', status: 'New', source: 'Chat', date: '2025-01-17' },
  { id: 'L006', name: 'Devika Pillai', phone: '+91 43210 98765', email: 'devika.pillai@gmail.com', course: 'M.Sc Computer Science', status: 'Interested', source: 'Voice', date: '2025-01-18' },
  { id: 'L007', name: 'Arun Vijayan', phone: '+91 32109 87654', email: 'arun.v@gmail.com', course: 'BBA', status: 'Follow-Up', source: 'Chat', date: '2025-01-18' },
  { id: 'L008', name: 'Sreelakshmi T', phone: '+91 21098 76543', email: 'sreelakshmi.t@yahoo.com', course: 'Integrated M.Sc Mathematics', status: 'New', source: 'Voice', date: '2025-01-19' },
  { id: 'L009', name: 'Vishnu Kumar', phone: '+91 10987 65432', email: 'vishnu.k@gmail.com', course: 'MBA', status: 'Converted', source: 'Chat', date: '2025-01-19' },
  { id: 'L010', name: 'Preethi Chandran', phone: '+91 09876 54321', email: 'preethi.c@gmail.com', course: 'B.Tech Mechanical Engineering', status: 'Contacted', source: 'Voice', date: '2025-01-20' },
  { id: 'L011', name: 'Sooraj Mohan', phone: '+91 98654 32107', email: 'sooraj.m@gmail.com', course: 'M.Tech VLSI Design', status: 'Interested', source: 'Chat', date: '2025-01-20' },
  { id: 'L012', name: 'Kavya Arun', phone: '+91 87543 21096', email: 'kavya.a@gmail.com', course: 'MCA', status: 'New', source: 'Voice', date: '2025-01-21' },
];

export const callLogs: CallLog[] = [
  {
    id: 'CL001', studentName: 'Arjun Nair', phone: '+91 98765 43210', duration: '4:32', status: 'Completed', date: '2025-01-20 10:15 AM',
    transcript: `AI: Welcome to Cochin University of Science and Technology Admissions. How may I assist you today?\nStudent: Hi, I want to know about the B.Tech Computer Science admission.\nAI: CUSAT offers B.Tech in Computer Science & Engineering through the CAT (CUSAT Common Admission Test). The program is 4 years. Eligibility requires a pass in 10+2 with Physics, Chemistry, and Mathematics. Admission is rank-based via CAT. Shall I capture your details for the admission team?\nStudent: Yes, please do. Also, what is the fee?\nAI: The annual tuition fee for B.Tech at CUSAT is approximately ₹25,000 for government seats. Additional fees may apply for self-financing seats. An admission officer will call you within 24 hours with precise details.\nStudent: Sure, thank you.\nAI: Thank you, Arjun. We look forward to assisting you with your CUSAT admission.`,
  },
  {
    id: 'CL002', studentName: 'Anjali Menon', phone: '+91 87654 32109', duration: '3:18', status: 'Completed', date: '2025-01-20 11:30 AM',
    transcript: `AI: Welcome to Cochin University of Science and Technology Admissions. How may I assist you?\nStudent: I'm interested in the MCA program. What are the eligibility requirements?\nAI: For MCA at CUSAT, you need a Bachelor's degree with Mathematics as a subject either at the degree level or at the 10+2 level. Admission is through the CUSAT CAT. The program duration is 3 years.\nStudent: What about placements?\nAI: CUSAT has a strong placement cell. MCA graduates have been placed at companies including TCS, Infosys, Wipro, and Cognizant. The university is located in the Kochi tech corridor which provides excellent industry exposure.\nStudent: Great. How do I apply?\nAI: You can apply online through the official CUSAT admissions portal during the CAT registration window. I can register your interest for our counselling team to follow up.`,
  },
  {
    id: 'CL003', studentName: 'Rahul Krishna', phone: '+91 76543 21098', duration: '0:00', status: 'Missed', date: '2025-01-20 02:45 PM',
    transcript: 'Call was not answered.',
  },
  {
    id: 'CL004', studentName: 'Athira Suresh', phone: '+91 65432 10987', duration: '2:55', status: 'Completed', date: '2025-01-21 09:20 AM',
    transcript: `AI: Welcome to CUSAT Admissions. How may I help you?\nStudent: Are there any scholarships available for M.Tech?\nAI: Yes. CUSAT students are eligible for various scholarships. The Kerala government offers merit-cum-means scholarships. Additionally, SC/ST students receive central government scholarships. Research scholars may apply for GATE-based fellowships. The University also has emergency financial assistance.\nStudent: I belong to the OBC category.\nAI: OBC students are eligible for the Post-Matric Scholarship from the State Backward Classes Development Corporation. I'll note your interest and have a counsellor provide detailed guidance.\nStudent: Please do. Thank you.\nAI: Your query has been recorded. An advisor will contact you shortly.`,
  },
  {
    id: 'CL005', studentName: 'Nikhil Raj', phone: '+91 54321 09876', duration: '5:10', status: 'Completed', date: '2025-01-21 03:00 PM',
    transcript: `AI: Welcome to CUSAT Admissions. How may I assist you?\nStudent: Tell me about hostel facilities at CUSAT.\nAI: CUSAT provides separate hostel facilities for male and female students on the main campus. Hostels have 24-hour internet connectivity, a dining hall, common rooms, sports facilities, and medical care. A nominal fee is charged for accommodation and meals.\nStudent: Is it safe for girls?\nAI: Yes. The ladies' hostel has 24-hour security, biometric entry, CCTV surveillance, and a resident warden. The CUSAT campus is a safe residential campus environment.\nStudent: What is the hostel fee approximately?\nAI: Hostel fees at CUSAT vary by room type. Approximately ₹2,000 to ₹4,000 per month inclusive of meals. Exact figures are released each academic year. Shall I arrange a callback from the hostel office?`,
  },
  {
    id: 'CL006', studentName: 'Devika Pillai', phone: '+91 43210 98765', duration: '1:42', status: 'Voicemail', date: '2025-01-21 05:30 PM',
    transcript: 'Voicemail left with callback information and CUSAT admissions portal details.',
  },
];

export const chatSessions: ChatSession[] = [
  {
    id: 'CH001', studentName: 'Arun Vijayan', date: '2025-01-20', messageCount: 12, courseInterest: 'B.Tech Computer Science',
    messages: [
      { role: 'user', content: 'What courses are available at CUSAT?' },
      { role: 'assistant', content: "CUSAT offers a wide range of programs across multiple schools and departments:\n\n**Engineering & Technology**\n• B.Tech (CSE, ECE, ME, Civil, Chemical, Polymer)\n• M.Tech (AI, VLSI, Marine Technology, Environmental Engineering)\n\n**Science**\n• Integrated M.Sc (5 years)\n• M.Sc (Physics, Chemistry, Maths, Computer Science, Photonics)\n\n**Management**\n• MBA (Full-time, 2 years)\n• BBA (3 years)\n\n**Computer Applications**\n• MCA (3 years)\n\n**Research Programs**\n• Ph.D across all departments\n\nWhich program would you like to explore further?" },
      { role: 'user', content: 'What is the eligibility for B.Tech CSE?' },
      { role: 'assistant', content: "For B.Tech Computer Science & Engineering at CUSAT:\n\n**Academic Eligibility**\n• 10+2 or equivalent with Physics, Chemistry, and Mathematics\n• Minimum 50% aggregate in PCM (45% for reserved categories)\n\n**Entrance Requirement**\n• CUSAT CAT (Common Admission Test) — mandatory\n• Kerala Keam score also considered for some seats\n\n**Admission Process**\n• Register for CUSAT CAT online\n• Appear for the entrance exam\n• Rank-based allotment through centralised counselling\n\nWould you like details about the CAT exam pattern?" },
      { role: 'user', content: 'What about scholarships?' },
      { role: 'assistant', content: "CUSAT students have access to several scholarship programs:\n\n🏆 **Merit-Based**\n• University merit scholarships for top rankers\n• Departmental awards for academic excellence\n\n💰 **Government Scholarships**\n• Kerala State Merit Scholarship\n• Post-Matric Scholarship (SC/ST/OBC)\n• Central Sector Scholarship\n\n🎯 **Special Scholarships**\n• GATE Fellowship for M.Tech students (₹12,400/month)\n• Physically Challenged student scholarships\n• Sports quota scholarships\n\nShall I connect you with our scholarship guidance team?" },
    ],
  },
  {
    id: 'CH002', studentName: 'Sreelakshmi T', date: '2025-01-20', messageCount: 8, courseInterest: 'MCA',
    messages: [
      { role: 'user', content: 'What is the fee for MCA at CUSAT?' },
      { role: 'assistant', content: "The MCA program at CUSAT:\n\n• **Duration:** 3 years (6 semesters)\n• **Approx. Annual Fee:** ₹20,000–₹35,000 (government aided seats)\n• **Self-financing seats:** Higher fees apply\n\nFees are subject to revision each academic year. University fee, lab fee, and development fee are charged separately. Would you like information about scholarships that can offset these costs?" },
      { role: 'user', content: 'What are the placement opportunities?' },
      { role: 'assistant', content: "CUSAT MCA graduates are well-placed in the IT industry:\n\n📊 **Recent Placement Highlights**\n• Companies visiting campus: TCS, Infosys, Wipro, Cognizant, UST Global, IBS Software\n• CUSAT's Kochi location provides direct access to the Infopark and SmartCity tech clusters\n\n🏢 **Sectors**\n• IT Services & Product Development\n• BFSI Technology\n• Government IT Projects\n• Startups and SMEs\n\nCUSAT's placement cell actively coordinates industry interactions, internships, and placement drives." },
    ],
  },
  {
    id: 'CH003', studentName: 'Vishnu Kumar', date: '2025-01-19', messageCount: 6, courseInterest: 'MBA',
    messages: [
      { role: 'user', content: 'What is the MBA admission process at CUSAT?' },
      { role: 'assistant', content: "MBA admissions at CUSAT typically follow this process:\n\n1. Appear for CAT / MAT / CMAT / KMAT\n2. Apply through the CUSAT MBA admission portal\n3. Shortlisted candidates are called for Group Discussion and Personal Interview\n4. Merit list published based on entrance score + GD/PI performance\n\nThe MBA program at CUSAT's School of Management Studies is 2 years (4 semesters). Would you like eligibility details?" },
    ],
  },
];

export const documents: Document[] = [
  { id: 'D001', name: 'CUSAT_Prospectus_2025.pdf', size: '5.8 MB', status: 'Processed', uploadDate: '2025-01-10', type: 'pdf' },
  { id: 'D002', name: 'CUSAT_Fee_Structure.pdf', size: '1.4 MB', status: 'Processed', uploadDate: '2025-01-10', type: 'pdf' },
  { id: 'D003', name: 'CUSAT_Admission_Brochure.pdf', size: '3.2 MB', status: 'Processed', uploadDate: '2025-01-11', type: 'pdf' },
  { id: 'D004', name: 'CUSAT_Hostel_Guide.pdf', size: '2.1 MB', status: 'Processed', uploadDate: '2025-01-12', type: 'pdf' },
  { id: 'D005', name: 'CUSAT_Scholarship_Handbook.pdf', size: '1.9 MB', status: 'Processed', uploadDate: '2025-01-13', type: 'pdf' },
  { id: 'D006', name: 'CUSAT_Course_Catalog.pdf', size: '4.6 MB', status: 'Processing', uploadDate: '2025-01-20', type: 'pdf' },
  { id: 'D007', name: 'CUSAT_Placement_Report_2024.pdf', size: '3.1 MB', status: 'Queued', uploadDate: '2025-01-21', type: 'pdf' },
];

export const teamMembers: TeamMember[] = [
  { id: 'T001', name: 'Dr. Suresh Kumar P', email: 'suresh.k@admissionai.in', role: 'Admin', status: 'Active', lastLogin: '2025-01-21 09:30 AM', avatar: 'SK' },
  { id: 'T002', name: 'Anitha Krishnan', email: 'anitha.k@admissionai.in', role: 'Admin', status: 'Active', lastLogin: '2025-01-21 08:45 AM', avatar: 'AK' },
  { id: 'T003', name: 'Rajeev Mohan', email: 'rajeev.m@admissionai.in', role: 'Admission Officer', status: 'Active', lastLogin: '2025-01-20 05:15 PM', avatar: 'RM' },
  { id: 'T004', name: 'Sindhu Nair', email: 'sindhu.n@admissionai.in', role: 'Admission Officer', status: 'Active', lastLogin: '2025-01-20 04:30 PM', avatar: 'SN' },
  { id: 'T005', name: 'Biju Thomas', email: 'biju.t@admissionai.in', role: 'Admission Officer', status: 'Inactive', lastLogin: '2025-01-15 11:00 AM', avatar: 'BT' },
  { id: 'T006', name: 'Meera Vijay', email: 'meera.v@admissionai.in', role: 'Viewer', status: 'Active', lastLogin: '2025-01-21 10:00 AM', avatar: 'MV' },
];

export const dashboardStats = {
  totalCalls: 12847,
  totalChats: 48392,
  totalLeads: 7214,
  documentsUploaded: 42,
  conversionRate: 18.6,
  activeAgents: 2,
};

export const dailyCallsData = [
  { day: 'Mon', calls: 312 }, { day: 'Tue', calls: 489 }, { day: 'Wed', calls: 421 },
  { day: 'Thu', calls: 567 }, { day: 'Fri', calls: 503 }, { day: 'Sat', calls: 218 }, { day: 'Sun', calls: 142 },
];

export const dailyChatsData = [
  { day: 'Mon', chats: 1124 }, { day: 'Tue', chats: 1456 }, { day: 'Wed', chats: 1243 },
  { day: 'Thu', chats: 1789 }, { day: 'Fri', chats: 1572 }, { day: 'Sat', chats: 798 }, { day: 'Sun', chats: 545 },
];

export const courseInterestData = [
  { course: 'MCA', count: 1842, color: '#003B7A' },
  { course: 'MBA', count: 1204, color: '#F4B400' },
  { course: 'B.Tech CSE', count: 987, color: '#0ea5e9' },
  { course: 'M.Tech AI', count: 764, color: '#22c55e' },
  { course: 'BBA', count: 612, color: '#f59e0b' },
  { course: 'M.Sc CS', count: 489, color: '#8b5cf6' },
  { course: 'Others', count: 1316, color: '#94a3b8' },
];

export const recentActivity = [
  { id: 1, type: 'lead', text: 'New lead captured: Arjun Nair — B.Tech Computer Science', time: '3 min ago', icon: 'user' },
  { id: 2, type: 'call', text: 'Voice call completed with Anjali Menon — MCA enquiry (3:18 min)', time: '18 min ago', icon: 'phone' },
  { id: 3, type: 'chat', text: 'Chat session: Arun Vijayan — B.Tech CSE eligibility query (12 messages)', time: '34 min ago', icon: 'message' },
  { id: 4, type: 'doc', text: 'Document processed: CUSAT_Course_Catalog.pdf', time: '1 hr ago', icon: 'file' },
  { id: 5, type: 'lead', text: 'Lead converted: Vishnu Kumar — MBA admission confirmed', time: '2 hr ago', icon: 'check' },
  { id: 6, type: 'call', text: 'Missed call from +91 76543 21098 — Rahul Krishna', time: '3 hr ago', icon: 'phone-missed' },
];

export const leadsTimelineData = [
  { month: 'Aug', leads: 412 }, { month: 'Sep', leads: 687 }, { month: 'Oct', leads: 923 },
  { month: 'Nov', leads: 1102 }, { month: 'Dec', leads: 1387 }, { month: 'Jan', leads: 1703 },
];

export const conversionFunnelData = [
  { stage: 'Total Enquiries', count: 7214, color: '#003B7A' },
  { stage: 'Contacted', count: 5312, color: '#0369a1' },
  { stage: 'Interested', count: 3487, color: '#0ea5e9' },
  { stage: 'Application Initiated', count: 2103, color: '#F4B400' },
  { stage: 'Converted', count: 1342, color: '#22c55e' },
];
