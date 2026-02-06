
import React, { useEffect, useState } from 'react';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'கன்னடம்' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // 1. Initialize Google Translate Script (Hidden)
    if (!document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
      
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languages.map(l => l.code).join(','),
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }

    // 2. Read current language from cookie
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match) {
      setCurrentLang(match[1]);
    } else {
        // Check if full match like /en/en
        const matchFull = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if(!matchFull) setCurrentLang('en');
    }

    // 3. Aggressively hide Google Translate Banner/Styling (BUT DO NOT REMOVE ELEMENTS)
    // Removing elements breaks the translation functionality
    const hideGoogleBranding = () => {
        // Hide the top frame
        const frame = document.querySelector('.goog-te-banner-frame');
        if (frame) {
            frame.style.display = 'none';
            frame.style.visibility = 'hidden';
            frame.style.height = '0';
            frame.style.width = '0';
            frame.style.opacity = '0';
            frame.style.pointerEvents = 'none';
            frame.style.position = 'absolute';
            frame.style.zIndex = '-1000';
        }
        
        // Hide iframes by attributes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.id.includes(':1.container') || iframe.name === 'goog-te-banner-frame') {
                iframe.style.display = 'none';
                iframe.style.visibility = 'hidden';
                iframe.style.height = '0';
                iframe.style.width = '0';
                iframe.style.opacity = '0';
                iframe.style.pointerEvents = 'none';
                iframe.style.position = 'absolute';
                iframe.style.zIndex = '-1000';
            }
        });

        // Reset body top margin which Google adds
        if (document.body.style.top !== '0px') {
            document.body.style.top = '0px';
            document.body.style.marginTop = '0px';
            document.body.style.position = 'static';
        }

        // Hide tooltips (these can be removed as they are just UI)
        const tooltips = document.querySelectorAll('#goog-gt-tt, .goog-tooltip, .goog-te-balloon-frame');
        tooltips.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        });
    };

    // Run immediately and then on intervals to catch late injections
    hideGoogleBranding();
    const intervalId = setInterval(hideGoogleBranding, 500);
    
    // Also use MutationObserver for robust detection
    const observer = new MutationObserver(() => {
        hideGoogleBranding();
    });
    
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
        clearInterval(intervalId);
        observer.disconnect();
    };
  }, []);

  const changeLanguage = (langCode) => {
    // Set Google Translate Cookie
    // Format: googtrans=/source/target
    // We assume source is always 'en' for this app
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`; // Fallback for localhost
    
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Reload to apply translation
    window.location.reload();
  };

  const currentLangLabel = languages.find(l => l.code === currentLang)?.native || 'English';

  return (
    <div className="relative">
      {/* Hidden Google Translate Element - Required for the script to work */}
      <div id="google_translate_element" className="hidden"></div>
      
      {/* Global Styles to Hide Google Topbar */}
      <style>{`
        /* Hide Top Banner (iframe) */
        .goog-te-banner-frame.skiptranslate {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
        }
        
        /* Reset Body Styles enforced by Google */
        body {
            top: 0px !important; 
            position: static !important; 
            margin-top: 0px !important;
        }

        /* Hide Tooltips and Hover Effects */
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight {
            background-color: transparent !important;
            border: none !important; 
            box-shadow: none !important;
        }

        /* Hide "Powered by Google" Branding */
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { height: 0 !important; overflow: hidden !important; }
        .goog-te-spinner-pos { display: none !important; }
        
        /* Hide Widget Elements */
        .goog-te-gadget-icon { display: none !important; }
        .goog-te-gadget-simple { display: none !important; }
        #goog-gt-tt { display: none !important; visibility: hidden !important; }
        
        /* Remove Font Adjustment */
        font { background-color: transparent !important; box-shadow: none !important; }
      `}</style>

      {/* Custom Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                   text-civic-gray-600 dark:text-gray-300 hover:text-civic-blue dark:hover:text-white
                   hover:bg-civic-gray-50 dark:hover:bg-white/5
                   border border-transparent hover:border-civic-gray-200 dark:hover:border-white/10"
      >
        <FiGlobe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLangLabel}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 py-2 z-50 origin-top-right
                        bg-white dark:bg-[#1a1a1a] backdrop-blur-xl
                        border border-civic-gray-200 dark:border-white/10
                        rounded-xl shadow-lg ring-1 ring-black ring-opacity-5
                        animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between
                            transition-colors duration-150
                            ${currentLang === lang.code 
                              ? 'bg-civic-blue/10 text-civic-blue dark:bg-white/10 dark:text-white font-medium' 
                              : 'text-civic-gray-600 dark:text-gray-400 hover:bg-civic-gray-50 dark:hover:bg-white/5 hover:text-civic-blue dark:hover:text-white'
                            }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-xs opacity-50 ml-2 uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
