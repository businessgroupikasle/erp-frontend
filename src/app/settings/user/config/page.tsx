"use client";

import { useState, useEffect } from "react";
import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Globe, Check, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export default function UserPreferencesPage() {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("erp_language");
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("erp_language", lang);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 500);
  };

  return (
    <UserAccountLayout>
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">System Preferences</h2>
           <p className="text-[12px] font-medium text-[#999]">Personalize your ERP workspace environment.</p>
        </div>

        <div className="space-y-10 max-w-4xl">
           {/* Theme Section */}
           <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                 </div>
                 <div>
                    <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Interface Theme</h3>
                    <p className="text-[11px] font-medium text-[#999]">Choose between a light or dark workspace.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 {[
                    { id: 'light', label: 'Light Mode', icon: Sun, color: 'text-orange-500', bg: 'bg-white' },
                    { id: 'dark', label: 'Dark Mode', icon: Moon, color: 'text-indigo-400', bg: 'bg-slate-900' }
                 ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => { if (theme !== mode.id) toggleTheme(); }}
                      className={clsx(
                        "relative p-6 rounded-[24px] border-2 transition-all text-left group overflow-hidden",
                        theme === mode.id 
                          ? "border-[#7C3AED] bg-[#FDFCFD] dark:bg-slate-900 shadow-lg shadow-purple-500/5" 
                          : "border-[#F0EAF0] dark:border-slate-800 hover:border-[#7C3AED]/30"
                      )}
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", theme === mode.id ? "bg-purple-100 dark:bg-purple-900/30 text-[#7C3AED]" : "bg-slate-50 dark:bg-slate-800 text-slate-400")}>
                             <mode.icon size={20} />
                          </div>
                          {theme === mode.id && <div className="w-5 h-5 bg-[#7C3AED] rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                       </div>
                       <p className={clsx("text-[14px] font-black", theme === mode.id ? "text-[#1A1A1A] dark:text-white" : "text-[#666] dark:text-slate-400")}>{mode.label}</p>
                       
                       {/* Mini Preview UI */}
                       <div className={clsx("mt-4 h-16 rounded-xl border border-[#F0EAF0] dark:border-slate-800 p-3 space-y-2", mode.bg)}>
                          <div className="w-1/2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                       </div>
                    </button>
                 ))}
              </div>
           </section>

           <div className="h-px bg-[#F0EAF0] dark:bg-slate-800" />

           {/* Language Section */}
           <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                    <Globe size={20} />
                 </div>
                 <div>
                    <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Display Language</h3>
                    <p className="text-[11px] font-medium text-[#999]">Choose your preferred language for the interface.</p>
                 </div>
              </div>

              <div className="max-w-md relative group">
                 <select 
                   value={language}
                   onChange={(e) => handleLanguageChange(e.target.value)}
                   className="w-full px-6 py-4.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-[20px] text-[15px] font-bold text-[#1A1A1A] dark:text-white appearance-none outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-[#7C3AED] transition-all"
                 >
                    <option value="en">English (US)</option>
                    <option value="hi">Hindi (India)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                 </select>
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                    {isSaving ? <div className="w-4 h-4 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" /> : <ChevronDown size={18} className="text-[#999]" />}
                 </div>
              </div>
              
              {showSaved && (
                <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                   <Check size={14} /> Language preference updated!
                </p>
              )}
           </section>

           {/* Tip Section */}
           <div className="pt-6">
              <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-[24px] border border-purple-100 dark:border-purple-900/30 flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-purple-600 shadow-sm shrink-0 font-bold text-[14px]">💡</div>
                 <p className="text-[12px] font-bold text-purple-700 dark:text-purple-300 leading-relaxed">
                    Some pages may require a quick refresh to fully apply the language changes across all reports and dynamic data.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}
