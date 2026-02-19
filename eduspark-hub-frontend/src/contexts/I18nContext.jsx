import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const en = {
    'app.name': 'EduSpark Hub',
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Create account',
    'auth.mobile': 'Mobile number',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgot': 'Forgot password?',
    'nav.dashboard': 'Dashboard',
    'nav.courses': 'Courses',
    'nav.classes': 'Classes',
    'nav.exams': 'Exams',
    'nav.attendance': 'Attendance',
    'nav.payments': 'Payments',
    'nav.notifications': 'Notifications',
    'nav.sms': 'SMS',
    'nav.finance': 'Finance',
    'nav.integrations': 'Integrations',
};
const si = {
    'app.name': 'EduSpark Hub',
    'auth.signIn': 'පිවිසෙන්න',
    'auth.signUp': 'ගිණුමක් සාදන්න',
    'auth.mobile': 'දුරකථන අංකය',
    'auth.email': 'ඊමේල්',
    'auth.password': 'මුරපදය',
    'auth.forgot': 'මුරපදය අමතකද?',
    'nav.dashboard': 'ඩෑෂ්බෝඩ්',
    'nav.courses': 'පාඨමාලා',
    'nav.classes': 'පංති',
    'nav.exams': 'පරීක්ෂණ',
    'nav.attendance': 'පැමිණීම',
    'nav.payments': 'ගෙවීම්',
    'nav.notifications': 'දැනුම්දීම්',
    'nav.sms': 'SMS',
    'nav.finance': 'මුල්‍ය',
    'nav.integrations': 'ඒකාබද්ධතා',
};
const STORAGE_KEY = 'eduflow-lang';
const I18nContext = createContext(null);
export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx)
        throw new Error('useI18n must be used within I18nProvider');
    return ctx;
};
export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        return (raw === 'si' || raw === 'en') ? raw : 'en';
    });
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
    }, [lang]);
    const dict = lang === 'si' ? si : en;
    const value = useMemo(() => ({
        lang,
        setLang,
        t: (key) => dict[key] ?? key,
    }), [dict, lang]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
