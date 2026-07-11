import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'

export const defaultNS = 'translation'

export const resources = {
  fr: { translation: fr },
  en: { translation: en },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'en',
  defaultNS,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n
export { useTranslation } from 'react-i18next'
export type { TFunction } from 'i18next'
