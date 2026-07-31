import { useLanguage } from "@/contexts/LanguageContext";
import translations from "@/locales/translations.json";

export function useTranslation() {
  const { lang } = useLanguage();
  
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[lang as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t, lang };
}
