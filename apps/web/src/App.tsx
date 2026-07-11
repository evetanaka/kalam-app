import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DesktopLayout } from './components/DesktopLayout';
import { PlaceholderPage } from './components/PlaceholderPage';

// Auth pages
import { SplashPage } from './pages/auth/SplashPage';
import { CreateAccountPage } from './pages/auth/CreateAccountPage';
import { ChooseNamePage } from './pages/auth/ChooseNamePage';
import { DepositPage } from './pages/auth/DepositPage';
import { ImportContactsPage } from './pages/auth/ImportContactsPage';
import { WelcomePage } from './pages/auth/WelcomePage';
import { RestoreAccountPage } from './pages/auth/RestoreAccountPage';
import { SocialRecoveryPage } from './pages/auth/SocialRecoveryPage';
import { SyncHistoryPage } from './pages/auth/SyncHistoryPage';

// Conversation pages
import { ChatPage } from './pages/conversations/ChatPage';
import { NewConversationPage } from './pages/conversations/NewConversationPage';

// Placeholder pages for screens not yet ported
const ContactList = () => <PlaceholderPage id="S-35" title="Liste des contacts" />;
const ContactDetail = () => <PlaceholderPage id="S-36" title="Détail contact" />;
const AddContact = () => <PlaceholderPage id="S-38" title="Ajouter un contact" />;
const Profile = () => <PlaceholderPage id="S-42" title="Profil" />;
const MyDeposit = () => <PlaceholderPage id="S-43" title="Mon dépôt" />;
const KalamPlus = () => <PlaceholderPage id="S-44" title="Kalam+" />;
const Devices = () => <PlaceholderPage id="S-46" title="Appareils liés" />;
const Privacy = () => <PlaceholderPage id="S-48" title="Confidentialité" />;
const Settings = () => <PlaceholderPage id="S-50" title="Paramètres" />;

/** Empty state for main panel when no chat is selected */
function EmptyChat() {
  const navigate = useNavigate();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', color: 'var(--soft)',
    }}>
      <span style={{ fontSize: 64, marginBottom: 16 }}>💬</span>
      <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Kalam Desktop</p>
      <p style={{ fontSize: 14, marginBottom: 24 }}>Sélectionnez une conversation pour commencer</p>
      <button
        onClick={() => navigate('/onboarding')}
        style={{
          background: 'none', border: '1px solid var(--hair)',
          borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
          fontSize: 13, color: 'var(--soft)',
        }}
      >
        Voir onboarding →
      </button>
    </div>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Special route for viewing onboarding while authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/auth/create" element={<CreateAccountPage />} />
        <Route path="/auth/name" element={<ChooseNamePage />} />
        <Route path="/auth/deposit" element={<DepositPage />} />
        <Route path="/auth/contacts" element={<ImportContactsPage />} />
        <Route path="/auth/welcome" element={<WelcomePage />} />
        <Route path="/auth/restore" element={<RestoreAccountPage />} />
        <Route path="/auth/recovery" element={<SocialRecoveryPage />} />
        <Route path="/auth/sync" element={<SyncHistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Onboarding preview routes (accessible while authenticated) */}
      <Route path="/onboarding" element={<SplashPage />} />
      <Route path="/auth/create" element={<CreateAccountPage />} />
      <Route path="/auth/name" element={<ChooseNamePage />} />
      <Route path="/auth/deposit" element={<DepositPage />} />
      <Route path="/auth/contacts" element={<ImportContactsPage />} />
      <Route path="/auth/welcome" element={<WelcomePage />} />
      <Route path="/auth/restore" element={<RestoreAccountPage />} />
      <Route path="/auth/recovery" element={<SocialRecoveryPage />} />
      <Route path="/auth/sync" element={<SyncHistoryPage />} />

      {/* Main app with DesktopLayout */}
      <Route path="/" element={<DesktopLayout><EmptyChat /></DesktopLayout>} />
      <Route path="/chat/:id" element={<DesktopLayout><ChatPage /></DesktopLayout>} />
      <Route path="/new" element={<DesktopLayout><NewConversationPage /></DesktopLayout>} />
      <Route path="/contacts" element={<DesktopLayout><ContactList /></DesktopLayout>} />
      <Route path="/contacts/:id" element={<DesktopLayout><ContactDetail /></DesktopLayout>} />
      <Route path="/contacts/add" element={<DesktopLayout><AddContact /></DesktopLayout>} />
      <Route path="/profile" element={<DesktopLayout><Profile /></DesktopLayout>} />
      <Route path="/deposit" element={<DesktopLayout><MyDeposit /></DesktopLayout>} />
      <Route path="/kalam-plus" element={<DesktopLayout><KalamPlus /></DesktopLayout>} />
      <Route path="/devices" element={<DesktopLayout><Devices /></DesktopLayout>} />
      <Route path="/privacy" element={<DesktopLayout><Privacy /></DesktopLayout>} />
      <Route path="/settings" element={<DesktopLayout><Settings /></DesktopLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
