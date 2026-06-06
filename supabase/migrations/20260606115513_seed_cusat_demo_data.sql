-- Seed demo admin user
INSERT INTO users (id, email, password, name, role, status, created_at, updated_at)
VALUES (
  'cusat-admin-001',
  'admin@admissionai.in',
  '$2a$10$N/c/KdWtFt5dZJfO7bdi1.PjrrPiWo2w/dbWx.HH0j7JOdCejz4Di',
  'Dr. Suresh Kumar P',
  'ADMIN',
  'Active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Seed leads
INSERT INTO leads (id, name, phone, email, course, status, source, assigned_to, created_at, updated_at) VALUES
('lead-001', 'Arjun Nair', '+91 98765 43210', 'arjun.nair@gmail.com', 'B.Tech Computer Science', 'CONVERTED', 'CHAT', NULL, NOW() - INTERVAL '6 days', NOW()),
('lead-002', 'Anjali Menon', '+91 87654 32109', 'anjali.menon@yahoo.com', 'MCA', 'INTERESTED', 'VOICE', NULL, NOW() - INTERVAL '5 days', NOW()),
('lead-003', 'Rahul Krishna', '+91 76543 21098', 'rahul.krishna@gmail.com', 'MBA', 'FOLLOW_UP', 'CHAT', NULL, NOW() - INTERVAL '5 days', NOW()),
('lead-004', 'Athira Suresh', '+91 65432 10987', 'athira.suresh@gmail.com', 'M.Tech Artificial Intelligence', 'CONTACTED', 'VOICE', NULL, NOW() - INTERVAL '4 days', NOW()),
('lead-005', 'Nikhil Raj', '+91 54321 09876', 'nikhil.raj@gmail.com', 'B.Tech Electronics & Communication', 'NEW', 'CHAT', NULL, NOW() - INTERVAL '4 days', NOW()),
('lead-006', 'Devika Pillai', '+91 43210 98765', 'devika.pillai@gmail.com', 'M.Sc Computer Science', 'INTERESTED', 'VOICE', NULL, NOW() - INTERVAL '3 days', NOW()),
('lead-007', 'Arun Vijayan', '+91 32109 87654', 'arun.v@gmail.com', 'BBA', 'FOLLOW_UP', 'CHAT', NULL, NOW() - INTERVAL '3 days', NOW()),
('lead-008', 'Sreelakshmi T', '+91 21098 76543', 'sreelakshmi.t@yahoo.com', 'Integrated M.Sc Mathematics', 'NEW', 'VOICE', NULL, NOW() - INTERVAL '2 days', NOW()),
('lead-009', 'Vishnu Kumar', '+91 10987 65432', 'vishnu.k@gmail.com', 'MBA', 'CONVERTED', 'CHAT', NULL, NOW() - INTERVAL '2 days', NOW()),
('lead-010', 'Preethi Chandran', '+91 09876 54321', 'preethi.c@gmail.com', 'B.Tech Mechanical Engineering', 'CONTACTED', 'VOICE', NULL, NOW() - INTERVAL '1 day', NOW()),
('lead-011', 'Sooraj Mohan', '+91 98654 32107', 'sooraj.m@gmail.com', 'M.Tech VLSI Design', 'INTERESTED', 'CHAT', NULL, NOW() - INTERVAL '1 day', NOW()),
('lead-012', 'Kavya Arun', '+91 87543 21096', 'kavya.a@gmail.com', 'MCA', 'NEW', 'VOICE', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed call logs
INSERT INTO call_logs (id, student_name, phone, duration, status, transcript, called_at, created_at) VALUES
('call-001', 'Arjun Nair', '+91 98765 43210', '4:32', 'COMPLETED',
'AI: Welcome to Cochin University of Science and Technology Admissions. How may I assist you today?
Student: Hi, I want to know about the B.Tech Computer Science admission.
AI: CUSAT offers B.Tech in Computer Science & Engineering through the CAT. The program is 4 years. Eligibility requires a pass in 10+2 with Physics, Chemistry, and Mathematics. Admission is rank-based via CAT. Shall I capture your details for the admission team?
Student: Yes, please do. Also, what is the fee?
AI: The annual tuition fee for B.Tech at CUSAT is approximately Rs 25,000 for government seats. An admission officer will call you within 24 hours with precise details.
Student: Sure, thank you.
AI: Thank you, Arjun. We look forward to assisting you with your CUSAT admission.',
NOW() - INTERVAL '1 day' + INTERVAL '10 hours', NOW() - INTERVAL '1 day'),

('call-002', 'Anjali Menon', '+91 87654 32109', '3:18', 'COMPLETED',
'AI: Welcome to Cochin University of Science and Technology Admissions. How may I assist you?
Student: I am interested in the MCA program. What are the eligibility requirements?
AI: For MCA at CUSAT, you need a Bachelors degree with Mathematics as a subject. Admission is through the CUSAT CAT. The program duration is 3 years.
Student: What about placements?
AI: CUSAT has a strong placement cell. MCA graduates have been placed at TCS, Infosys, Wipro, and Cognizant. The university is located in the Kochi tech corridor.
Student: Great. How do I apply?
AI: You can apply online through the official CUSAT admissions portal during the CAT registration window.',
NOW() - INTERVAL '1 day' + INTERVAL '11 hours', NOW() - INTERVAL '1 day'),

('call-003', 'Rahul Krishna', '+91 76543 21098', '0:00', 'MISSED',
'Call was not answered.',
NOW() - INTERVAL '1 day' + INTERVAL '14 hours', NOW() - INTERVAL '1 day'),

('call-004', 'Athira Suresh', '+91 65432 10987', '2:55', 'COMPLETED',
'AI: Welcome to CUSAT Admissions. How may I help you?
Student: Are there any scholarships available for M.Tech?
AI: Yes. CUSAT students are eligible for various scholarships including Kerala government merit-cum-means scholarships, SC/ST central government scholarships, and GATE-based fellowships for research scholars.
Student: I belong to the OBC category.
AI: OBC students are eligible for the Post-Matric Scholarship from the State Backward Classes Development Corporation. I will note your interest.
Student: Please do. Thank you.
AI: Your query has been recorded. An advisor will contact you shortly.',
NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

('call-005', 'Nikhil Raj', '+91 54321 09876', '5:10', 'COMPLETED',
'AI: Welcome to CUSAT Admissions. How may I assist you?
Student: Tell me about hostel facilities at CUSAT.
AI: CUSAT provides separate hostel facilities for male and female students on the main campus with 24-hour internet, dining hall, common rooms, sports facilities, and medical care.
Student: Is it safe for girls?
AI: Yes. The ladies hostel has 24-hour security, biometric entry, CCTV surveillance, and a resident warden.
Student: What is the hostel fee approximately?
AI: Approximately Rs 2,000 to Rs 4,000 per month inclusive of meals. Shall I arrange a callback from the hostel office?',
NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),

('call-006', 'Devika Pillai', '+91 43210 98765', '1:42', 'VOICEMAIL',
'Voicemail left with callback information and CUSAT admissions portal details.',
NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Seed chat sessions
INSERT INTO chat_sessions (id, student_name, course_interest, agent_id, created_at, updated_at) VALUES
('chat-001', 'Arun Vijayan', 'B.Tech Computer Science', NULL, NOW() - INTERVAL '1 day', NOW()),
('chat-002', 'Sreelakshmi T', 'MCA', NULL, NOW() - INTERVAL '1 day', NOW()),
('chat-003', 'Vishnu Kumar', 'MBA', NULL, NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed chat messages for session 1
INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES
('msg-001', 'chat-001', 'USER', 'What courses are available at CUSAT?', NOW() - INTERVAL '1 day' + INTERVAL '1 minute'),
('msg-002', 'chat-001', 'ASSISTANT', 'CUSAT offers a wide range of programs across multiple departments:

**Engineering & Technology**
- B.Tech (CSE, ECE, ME, Civil, Chemical, Polymer)
- M.Tech (AI, VLSI, Marine Technology, Environmental Engineering)

**Science**
- Integrated M.Sc (5 years)
- M.Sc (Physics, Chemistry, Maths, Computer Science, Photonics)

**Management**
- MBA (Full-time, 2 years) and BBA (3 years)

**Computer Applications**
- MCA (3 years)

Which program would you like to explore further?', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
('msg-003', 'chat-001', 'USER', 'What is the eligibility for B.Tech CSE?', NOW() - INTERVAL '1 day' + INTERVAL '3 minutes'),
('msg-004', 'chat-001', 'ASSISTANT', 'For B.Tech Computer Science & Engineering at CUSAT:

**Academic Eligibility**
- 10+2 with Physics, Chemistry, and Mathematics
- Minimum 50% aggregate in PCM (45% for reserved categories)

**Entrance Requirement**
- CUSAT CAT (Common Admission Test) is mandatory

**Admission Process**
- Register for CUSAT CAT online
- Appear for the entrance exam
- Rank-based allotment through centralised counselling

Would you like details about the CAT exam pattern?', NOW() - INTERVAL '1 day' + INTERVAL '4 minutes'),
('msg-005', 'chat-001', 'USER', 'What about scholarships?', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
('msg-006', 'chat-001', 'ASSISTANT', 'CUSAT students have access to several scholarship programs:

**Merit-Based**
- University merit scholarships for top rankers
- Departmental awards for academic excellence

**Government Scholarships**
- Kerala State Merit Scholarship
- Post-Matric Scholarship (SC/ST/OBC)
- Central Sector Scholarship

**Special Scholarships**
- GATE Fellowship for M.Tech students (Rs 12,400/month)
- Physically Challenged student scholarships
- Sports quota scholarships

Shall I connect you with our scholarship guidance team?', NOW() - INTERVAL '1 day' + INTERVAL '6 minutes')
ON CONFLICT (id) DO NOTHING;

-- Seed chat messages for session 2
INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES
('msg-007', 'chat-002', 'USER', 'What is the fee for MCA at CUSAT?', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'),
('msg-008', 'chat-002', 'ASSISTANT', 'The MCA program at CUSAT:

- **Duration:** 3 years (6 semesters)
- **Approx. Annual Fee:** Rs 20,000 to Rs 35,000 (government aided seats)
- **Self-financing seats:** Higher fees apply

Fees are subject to revision each academic year. Would you like information about scholarships?', NOW() - INTERVAL '1 day' + INTERVAL '31 minutes'),
('msg-009', 'chat-002', 'USER', 'What are the placement opportunities?', NOW() - INTERVAL '1 day' + INTERVAL '32 minutes'),
('msg-010', 'chat-002', 'ASSISTANT', 'CUSAT MCA graduates are well-placed in the IT industry:

**Recent Placement Highlights**
- Companies: TCS, Infosys, Wipro, Cognizant, UST Global, IBS Software
- CUSAT Kochi location provides direct access to Infopark and SmartCity tech clusters

**Sectors**
- IT Services & Product Development
- BFSI Technology
- Government IT Projects
- Startups and SMEs', NOW() - INTERVAL '1 day' + INTERVAL '33 minutes')
ON CONFLICT (id) DO NOTHING;

-- Seed chat messages for session 3
INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES
('msg-011', 'chat-003', 'USER', 'What is the MBA admission process at CUSAT?', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
('msg-012', 'chat-003', 'ASSISTANT', 'MBA admissions at CUSAT typically follow this process:

1. Appear for CAT / MAT / CMAT / KMAT
2. Apply through the CUSAT MBA admission portal
3. Shortlisted candidates are called for Group Discussion and Personal Interview
4. Merit list published based on entrance score + GD/PI performance

The MBA program at CUSAT School of Management Studies is 2 years (4 semesters). Would you like eligibility details?', NOW() - INTERVAL '2 days' + INTERVAL '1 hour 1 minute')
ON CONFLICT (id) DO NOTHING;

-- Seed documents
INSERT INTO documents (id, name, size, mime_type, file_path, status, uploaded_at, updated_at) VALUES
('doc-001', 'CUSAT_Prospectus_2025.pdf', 6082355, 'application/pdf', 'uploads/cusat-prospectus-2025.pdf', 'PROCESSED', NOW() - INTERVAL '10 days', NOW()),
('doc-002', 'CUSAT_Fee_Structure.pdf', 1468006, 'application/pdf', 'uploads/cusat-fee-structure.pdf', 'PROCESSED', NOW() - INTERVAL '10 days', NOW()),
('doc-003', 'CUSAT_Admission_Brochure.pdf', 3355443, 'application/pdf', 'uploads/cusat-admission-brochure.pdf', 'PROCESSED', NOW() - INTERVAL '9 days', NOW()),
('doc-004', 'CUSAT_Hostel_Guide.pdf', 2202009, 'application/pdf', 'uploads/cusat-hostel-guide.pdf', 'PROCESSED', NOW() - INTERVAL '8 days', NOW()),
('doc-005', 'CUSAT_Scholarship_Handbook.pdf', 1992294, 'application/pdf', 'uploads/cusat-scholarship-handbook.pdf', 'PROCESSED', NOW() - INTERVAL '7 days', NOW()),
('doc-006', 'CUSAT_Course_Catalog.pdf', 4823449, 'application/pdf', 'uploads/cusat-course-catalog.pdf', 'PROCESSING', NOW() - INTERVAL '1 day', NOW()),
('doc-007', 'CUSAT_Placement_Report_2024.pdf', 3251404, 'application/pdf', 'uploads/cusat-placement-report-2024.pdf', 'QUEUED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
