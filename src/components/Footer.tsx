import React from 'react';
import { MapPin, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-[#4a3228] text-[#e5dcd3] py-8 px-4 border-t border-[#6d4c41] text-xs">
      <div className="max-w-4xl mx-auto space-y-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#5d4037] pb-4">
          <div className="text-left">
            <h3 className="text-base font-serif font-bold text-white">Minsa Fashion Store</h3>
            <p className="text-[#c7b299] text-xs">Online Ladies Suiting • Premium Pakistani Collections</p>
          </div>

          <div className="flex items-center gap-4 text-[#e5dcd3] flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#a67c52]" />
              <span>Faisalabad, Pakistan</span>
            </span>
            <span>•</span>
            <a href="tel:03018463706" className="flex items-center gap-1 text-white hover:text-[#a67c52] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#a67c52]" />
              <span>03018463706</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[#a89989] text-[11px]">
          <p>© {new Date().getFullYear()} Minsa Fashion Store. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-[#c7b299]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Customer Care Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
