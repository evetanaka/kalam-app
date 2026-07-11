import { Routes, Route, Navigate } from 'react-router-dom'
import { DesktopLayout } from './components/DesktopLayout'
import { PlaceholderPage } from './components/PlaceholderPage'

// Auth pages
const Splash = () => <PlaceholderPage id="S-01" title="Splash" />
const CreateAccount = () => <PlaceholderPage id="S-02" title="Création de compte" />
const ChooseName = () => <PlaceholderPage id="S-03" title="Choix du nom .kalam" />
const Deposit = () => <PlaceholderPage id="S-04" title="Dépôt de garantie" />
const ImportContacts = () => <PlaceholderPage id="S-05" title="Import de contacts" />
const Welcome = () => <PlaceholderPage id="S-06" title="Bienvenue" />
const RestoreAccount = () => <PlaceholderPage id="S-07" title="Restauration compte" />
const SocialRecovery = () => <PlaceholderPage id="S-08" title="Récupération sociale" />
const SyncHistory = () => <PlaceholderPage id="S-09" title="Sync historique" />

// Main pages (rendered inside DesktopLayout)
const ConversationList = () => <PlaceholderPage id="S-14" title="Liste des conversations" />
const Chat = () => <PlaceholderPage id="S-16" title="Chat 1:1" />
const GroupChat = () => <PlaceholderPage id="S-17" title="Chat groupe" />
const ConversationInfo = () => <PlaceholderPage id="S-18" title="Infos conversation" />
const NewConversation = () => <PlaceholderPage id="S-19" title="Nouvelle conversation" />
const ContactList = () => <PlaceholderPage id="S-35" title="Liste des contacts" />
const ContactDetail = () => <PlaceholderPage id="S-36" title="Détail contact" />
const AddContact = () => <PlaceholderPage id="S-38" title="Ajouter un contact" />
const Profile = () => <PlaceholderPage id="S-42" title="Profil" />
const DepositPage = () => <PlaceholderPage id="S-43" title="Mon dépôt" />
const KalamPlus = () => <PlaceholderPage id="S-44" title="Kalam+" />
const Devices = () => <PlaceholderPage id="S-46" title="Appareils liés" />
const Privacy = () => <PlaceholderPage id="S-48" title="Confidentialité" />
const Settings = () => <PlaceholderPage id="S-50" title="Paramètres" />

export function App() {
  // TODO: check auth state from @kalam/stores
  const isAuthenticated = false

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth/create" element={<CreateAccount />} />
        <Route path="/auth/name" element={<ChooseName />} />
        <Route path="/auth/deposit" element={<Deposit />} />
        <Route path="/auth/contacts" element={<ImportContacts />} />
        <Route path="/auth/welcome" element={<Welcome />} />
        <Route path="/auth/restore" element={<RestoreAccount />} />
        <Route path="/auth/recovery" element={<SocialRecovery />} />
        <Route path="/auth/sync" element={<SyncHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <DesktopLayout>
      <Routes>
        <Route path="/" element={<ConversationList />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/group/:id" element={<GroupChat />} />
        <Route path="/conversation/:id/info" element={<ConversationInfo />} />
        <Route path="/new" element={<NewConversation />} />
        <Route path="/contacts" element={<ContactList />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
        <Route path="/contacts/add" element={<AddContact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/kalam-plus" element={<KalamPlus />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DesktopLayout>
  )
}
