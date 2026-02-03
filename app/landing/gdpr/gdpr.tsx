import React, { useState, useEffect } from 'react';

interface PrivacySettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

// Interfață pentru proprietățile componentei ToggleRow
interface ToggleRowProps {
  title: string;
  desc: string;
  active: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}

const GDPR: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<'banner' | 'settings'>('banner');
  const [settings, setSettings] = useState<PrivacySettings>({
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('smile_live_gdpr');
    if (!savedConsent) setIsVisible(true);
  }, []);

  const handleAction = (type: 'all' | 'none' | 'custom') => {
    let finalSettings = settings;
    if (type === 'all') {
      finalSettings = { essential: true, analytics: true, marketing: true, personalization: true };
    } else if (type === 'none') {
      finalSettings = { essential: true, analytics: false, marketing: false, personalization: false };
    }
    
    localStorage.setItem('smile_live_gdpr', JSON.stringify({ ...finalSettings, date: new Date().toISOString() }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white dark:bg-[#0F0F0F] rounded-t-3xl sm:rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          {view === 'settings' ? (
            <button onClick={() => setView('banner')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#FFD700] transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
          ) : <div className="w-10"/>}
          <span className="text-xl">😊</span>
          <div className="w-10"/>
        </div>

        <div className="p-8 sm:p-10">
          {view === 'banner' ? (
            <div className="space-y-8">
              <div className="space-y-3 text-center sm:text-left">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight uppercase italic">Your Privacy Choice</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Smile Live values your data. We use cookies for security, analytics, and to show you content that makes you smile. See our <a href="/privacy" className="text-[#FFD700] underline font-bold">Privacy Policy</a>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('all')}
                  className="py-4 bg-[#FFD700] hover:bg-[#FFC400] text-black font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-yellow-500/10"
                >
                  ACCEPT ALL
                </button>
                <button 
                  onClick={() => handleAction('none')}
                  className="py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  REJECT ALL
                </button>
                <button 
                  onClick={() => setView('settings')}
                  className="sm:col-span-2 py-3 text-xs font-bold text-zinc-400 hover:text-[#FFD700] uppercase tracking-widest transition-colors"
                >
                  Customize My Settings
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <ToggleRow 
                  title="Strictly Necessary" 
                  desc="Required for basic app security & login." 
                  active={true} 
                  disabled={true} 
                />
                <ToggleRow 
                  title="Content Personalization" 
                  desc="Used to tailor your video feed." 
                  active={settings.personalization} 
                  onChange={(v: boolean) => setSettings({...settings, personalization: v})} 
                />
                <ToggleRow 
                  title="Analytics & Research" 
                  desc="Helps us fix bugs and improve Smile Live." 
                  active={settings.analytics} 
                  onChange={(v: boolean) => setSettings({...settings, analytics: v})} 
                />
              </div>
              <button 
                onClick={() => handleAction('custom')}
                className="w-full py-4 bg-[#FFD700] text-black font-black rounded-2xl shadow-xl hover:brightness-105 active:scale-95 transition-all"
              >
                SAVE PREFERENCES
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToggleRow: React.FC<ToggleRowProps> = ({ title, desc, active, onChange, disabled = false }) => (
  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
    <div className="flex-1 pr-4">
      <h4 className="text-[13px] font-black uppercase italic text-zinc-900 dark:text-zinc-100">{title}</h4>
      <p className="text-[10px] text-zinc-500 font-medium leading-tight">{desc}</p>
    </div>
    <button 
      type="button"
      disabled={disabled}
      onClick={() => onChange && onChange(!active)}
      className={`relative w-11 h-6 rounded-full transition-all ${disabled ? 'opacity-50 grayscale' : ''} ${active ? 'bg-[#FFD700]' : 'bg-zinc-300 dark:bg-zinc-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default GDPR;
