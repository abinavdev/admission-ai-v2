import { useState } from 'react';
import { Page } from './types';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { VoicePage } from './pages/VoicePage';
import { LeadsPage } from './pages/LeadsPage';
import { CallLogsPage } from './pages/CallLogsPage';
import { ChatHistoryPage } from './pages/ChatHistoryPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIAgentPage } from './pages/AIAgentPage';
import { TeamPage } from './pages/TeamPage';
import { StudentPortalPage } from './pages/StudentPortalPage';

const dashboardPages: Page[] = [
  'dashboard', 'chat', 'voice', 'leads', 'call-logs',
  'chat-history', 'knowledge-base', 'analytics', 'settings', 'ai-agent', 'team',
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const navigate = (page: Page) => setCurrentPage(page);

  if (currentPage === 'landing') return <LandingPage onNavigate={navigate} />;
  if (currentPage === 'login') return <LoginPage onNavigate={navigate} />;
  if (currentPage === 'student-portal') return <StudentPortalPage onNavigate={navigate} />;

  if (dashboardPages.includes(currentPage)) {
    return (
      <DashboardLayout currentPage={currentPage} onNavigate={navigate}>
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'chat' && <ChatPage />}
        {currentPage === 'voice' && <VoicePage />}
        {currentPage === 'leads' && <LeadsPage />}
        {currentPage === 'call-logs' && <CallLogsPage />}
        {currentPage === 'chat-history' && <ChatHistoryPage />}
        {currentPage === 'knowledge-base' && <KnowledgeBasePage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'ai-agent' && <AIAgentPage />}
        {currentPage === 'team' && <TeamPage />}
      </DashboardLayout>
    );
  }

  return <LandingPage onNavigate={navigate} />;
}

export default App;
