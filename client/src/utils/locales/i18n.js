/**
 * Translation of the whole app.
 *
 * IMPORTANT: to translate the time of MomentJS, look at the `index.js`.
 */
import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

// Namespaces for translations
import routesTitlesES from './es/routesTitles.json';
import commonES from './es/common.json';
import commonCA from './ca/common.json';
import barES from './es/bar.json';
import barCA from './ca/bar.json';
import loginES from './es/login.json';
import settingsES from './es/settings.json';
import settingsUsersTableES from './es/settingsUsersTable.json';
import chatListES from './es/chatList.json';
import chatClientES from './es/chatClient.json';
import chatInputES from './es/chatInput.json';

i18n.use(XHR)
    // Detect user language.
    .use(LanguageDetector)
    // Pass the i18n instance to the react-i18next components.
    .use(reactI18nextModule) // Needed if we don't use `I18nextProvider` on `index.js`.
    .init({
        // Fallback depending on user language.
        // The fallback language (it has to be an objec, not an array) effects
        // `messageUtils.js` logic on `getTimetokenToMoment`, `ChatAttach` & `bot.js`.
        fallbackLng: {
            // ca: ['es'],
            // es: ['en', 'es-ES'],
            es: ['es-ES'],
            default: ['es']
        },
        resources: {
            es: {
                routesTitles: routesTitlesES,
                common: commonES,
                bar: barES,
                login: loginES,
                settings: settingsES,
                settingsUsersTable: settingsUsersTableES,
                // This bundle is used also on non-React code `messageUtils.js`.
                chatList: chatListES,
                // This bundle is used also on non-React code (`bot.js`).
                chatClient: chatClientES,
                chatInput: chatInputES
            },
            ca: {
                common: commonCA,
                bar: barCA
            }
        }
    });

export default i18n;
