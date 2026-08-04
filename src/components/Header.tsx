import React from 'react';
import { MapPin, ShoppingBag, ShieldCheck, HeartHandshake, UserCheck, Search } from 'lucide-react';
import { StoreSettings } from '../types';

import logoImg from '../assets/images/minsa_store_logo_1785425219725.jpg';
import bannerImg from '../assets/images/minsa_fashion_banner_1785425201580.jpg';

interface HeaderProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
  onOpenCheckStatus: () => void;
  isAdminOpen?: boolean;
  isAdminAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenAdmin,
  onOpenCheckStatus,
  isAdminOpen,
  isAdminAuthenticated,
}) => {
  return (
    <header className="relative bg-white border-b border-[#eee3d8] shadow-xs overflow-hidden">
      {/* Decorative top ribbon with store contact info */}
      <div
        className="text-[#fdfaf8] py-2.5 px-4 text-xs font-medium transition-colors duration-200"
        style={{ backgroundColor: settings.headerBgColor || '#6d4c41' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#a67c52]" />
              <span>{settings.tagline || 'Online Ladies Suiting'}</span>
            </span>
            <span className="hidden sm:inline text-[#a67c52]">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#a67c52]" />
              <span>{settings.address || 'Faisalabad, Pakistan'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenCheckStatus}
              className="flex items-center gap-1.5 bg-[#8d6e63] hover:bg-[#6d4c41] px-3 py-1 rounded-full text-white text-xs font-semibold transition-colors border border-[#a1887f] cursor-pointer shadow-2xs"
            >
              <Search className="w-3 h-3 text-[#fdfaf8]" />
              <span>Check Status (سٹیٹس چیک کریں)</span>
            </button>

            {/* Show admin button ONLY if authenticated or admin mode is active */}
            {(isAdminOpen || isAdminAuthenticated) && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border bg-amber-500 text-white border-amber-400 shadow-xs"
                title="Admin Panel"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admin Active</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header Area */}
      <div className="relative bg-[#fdfaf8]/80">
        {/* Background ambient banner overlay */}
        <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
          <img
            src={bannerImg}
            alt="Store Banner"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfaf8]/60 via-[#fdfaf8]/90 to-[#fdfaf8]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-10 text-center">
          {/* Brand Logo & Name */}
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#a67c52] via-[#8d7b6d] to-[#6d4c41] shadow-md">
              <img
                src={logoImg}
                alt="Store Logo"
                className="w-full h-full object-cover rounded-full bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-1"
            style={{ color: settings.headerBgColor || '#6d4c41' }}
          >
            {settings.pageName || 'Minsa Fashion Store'}
          </h1>

          <div className="mt-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4ece4] border border-[#eee3d8] text-[#a67c52] text-xs sm:text-sm font-semibold uppercase tracking-[0.18em]">
            <HeartHandshake className="w-4 h-4 text-[#8d7b6d]" />
            <span>Customer Complaint Center</span>
          </div>

          {/* Urdu Customer Welcome Message */}
          <div className="mt-6 max-w-2xl mx-auto p-5 rounded-2xl bg-white border border-[#eee3d8] shadow-sm relative">
            <div className="absolute top-3 left-4 text-[#a67c52]/30 text-2xl font-serif leading-none select-none">❖</div>
            <div className="absolute bottom-3 right-4 text-[#a67c52]/30 text-2xl font-serif leading-none select-none">❖</div>

            <p
              dir="rtl"
              className="text-base sm:text-lg text-[#4a423d] italic font-normal leading-relaxed text-center tracking-normal font-sans"
              style={{ fontFamily: "'Noto Nastaliq Urdu', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
            >
              "{settings.welcomeMessageUrdu || 'ہم اپنے صارفین کی شکایات کو اہمیت دیتے ہیں۔ اگر آپ کو اپنے آرڈر میں کسی قسم کا مسئلہ یا شکایت ہے تو نیچے دیا گیا فارم مکمل کریں۔ ہماری ٹیم آپ کی شکایت کا جائزہ لے کر جلد از جلد آپ سے رابطہ کرے گی۔'}"
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#8d7b6d]">
            <button
              onClick={onOpenCheckStatus}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#6d4c41] hover:bg-[#5d4037] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-[#8d6e63]"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>🔍 Check Complaint Status (اپنی شکایت کا سٹیٹس معلوم کریں)</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-[#8d7b6d]">
              <ShieldCheck className="w-4 h-4 text-[#a67c52]" />
              <span>Fast Customer Care Support</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
