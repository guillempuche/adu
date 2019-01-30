import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

// Namespaces for translations
import commonES from './locales/es/common.json';
import commonCA from './locales/ca/common.json';
import chatAppBarES from './locales/es/chatAppBar.json';
import chatAppBarCA from './locales/ca/chatAppBar.json';

i18n.use(XHR)
    .use(LanguageDetector)
    .use(reactI18nextModule) // If not using I18nextProvider on 'index.js'
    .init({
        // Fallback depending on user language
        fallbackLng: {
            ca: ['es'],
            es: ['en'],
            default: ['es']
        },
        resources: {
            es: {
                common: commonES,
                chatAppBar: chatAppBarES
            },
            ca: {
                common: commonCA,
                chatAppBar: chatAppBarCA
            }
        }
    });

export default i18n;
