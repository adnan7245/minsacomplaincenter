import React from 'react';
import { MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, isAdminAuthenticated }) => {
  return (
    <footer className="mt-12 bg-[#4a3228] text-[#e5dcd3] py-8 px-4 border-t border-[#6d4c41] text-xs">
      <div className="max-w-4xl mx-auto space-y-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#5d4037] pb-4">
          <div className="text-left">
            <h3 className="text-base font-serif font-bold text-white">
              {settings.pageName || 'Minsa Fashion Store'}
            </h3>
            <p className="text-[#c7b299] text-xs">
              {settings.tagline || 'Online Ladies Suiting • Premium Pakistani Collections'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-[#e5dcd3] flex-wrap justify-center">
            {settings.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#a67c52]" />
                <span>{settings.address}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[#a89989] text-[11px]">
          <p>© {new Date().getFullYear()} {settings.pageName || 'Minsa Fashion Store'}. All Rights Reserved.</p>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#c7b299]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dedicated Customer Care Portal</span>
            </div>

            {isAdminAuthenticated && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[#d7ccc8] hover:text-white underline flex items-center gap-1 transition-colors"
              >
                <UserCheck className="w-3 h-3 text-[#a67c52]" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
