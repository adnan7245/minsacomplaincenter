import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Clock,
  FileText,
  Printer,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Calendar,
  User,
  Phone,
} from 'lucide-react';
import { SubmittedComplaintRecord, StoreSettings } from '../types';
import { getWhatsAppLink } from '../services/complaintService';

interface SuccessViewProps {
  record: SubmittedComplaintRecord;
  settings?: StoreSettings;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ record, settings, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(record.complaintNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const storeName = settings?.pageName || 'Minsa Fashion Store';
  const whatsappNum = settings?.phoneNumber || settings?.whatsappNumber || '03018463706';
  const whatsappUrl = getWhatsAppLink(record.complaintNumber, storeName, settings?.whatsappNumber);

  return (
    <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#eee3d8] shadow-xl shadow-[#ece0d1]/30 max-w-3xl mx-auto text-[#4a423d] animate-fade-in">
      {/* Success Badge & Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <h2 className="text-3xl font-serif font-bold text-[#6d4c41] tracking-tight">
            Thank You!
          </h2>
          <p className="text-lg font-medium text-emerald-800 mt-1">
            Your complaint has been successfully submitted to {storeName}.
          </p>
        </div>
      </div>

      {/* Complaint Number Highlight Box */}
      <div className="bg-[#f4ece4] p-6 rounded-2xl border border-[#eee3d8] text-center space-y-3 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-widest text-[#a67c52]">
          Official Reference Code
        </span>

        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#6d4c41] tracking-wider">
            Complaint Number: {record.complaintNumber}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white border border-[#e5dcd3] text-[#6d4c41] hover:bg-[#eee3d8] transition-colors shadow-2xs flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Copy Complaint Number"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs font-medium text-[#8d7b6d] flex items-center justify-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Please save your Complaint Number for future reference.</span>
        </p>
      </div>

      {/* Support Timeline & Resolution Notice */}
      <div className="bg-[#faf9f8] border border-[#e5dcd3] rounded-xl p-5 space-y-3 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#eee3d8] text-[#6d4c41] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#6d4c41]">Next Steps & Expected Timeline</h4>
            <p className="text-sm text-[#4a423d] leading-relaxed">
              Our customer support team at {storeName} has received your complaint. We will review your case and your issue will be resolved within 24 to 48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Call to Action Button */}
      <div className="text-center space-y-3 pt-2">
        <p className="text-xs font-medium text-[#8d7b6d]">Need instant assistance or have additional information?</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base py-4 px-8 rounded-xl shadow-lg shadow-emerald-900/10 transition-all duration-200 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span>Contact Us on WhatsApp ({whatsappNum})</span>
        </a>
        <p className="text-xs text-[#8d7b6d]">
          Clicking opens WhatsApp with your Complaint Number pre-filled ({record.complaintNumber}).
        </p>
      </div>

      {/* Submitted Details Receipt Summary */}
      <div className="border-t border-[#eee3d8] pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-[#6d4c41] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#a67c52]" />
            <span>Complaint Summary Details</span>
          </h3>
          <span className="text-xs text-[#8d7b6d]">{record.formattedDate}</span>
        </div>

        <div className="bg-[#faf9f8] rounded-xl p-4 sm:p-6 border border-[#e5dcd3] text-xs sm:text-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[#a67c52] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8d7b6d] block text-xs">Tracking Number</span>
                <span className="font-semibold text-[#4a423d]">{record.trackingNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#a67c52] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8d7b6d] block text-xs">Order Date</span>
                <span className="font-semibold text-[#4a423d]">{record.orderDate}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-[#a67c52] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8d7b6d] block text-xs">Customer Name</span>
                <span className="font-semibold text-[#4a423d]">{record.customerName}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-[#a67c52] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8d7b6d] block text-xs">Contact Number</span>
                <span className="font-semibold text-[#4a423d]">{record.contactNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="w-4 h-4 text-[#a67c52] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#8d7b6d] block text-xs">Complete Address & City</span>
                <span className="font-semibold text-[#4a423d]">
                  {record.address}, {record.city}
                </span>
              </div>
            </div>
          </div>

          {/* Product Pictures Comparison */}
          <div className="pt-3 border-t border-[#e5dcd3]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a67c52] block mb-2">Uploaded Evidence Images:</span>
            <div className="grid grid-cols-2 gap-4">
              {record.orderedProductImageDataUrl && (
                <div className="space-y-1">
                  <span className="text-xs text-[#8d7b6d] block">Ordered Product</span>
                  <div className="h-28 sm:h-36 rounded-lg overflow-hidden border border-[#e5dcd3] bg-white">
                    <img
                      src={record.orderedProductImageDataUrl}
                      alt="Ordered Product"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              {record.receivedProductImageDataUrl && (
                <div className="space-y-1">
                  <span className="text-xs text-[#8d7b6d] block">Received Product</span>
                  <div className="h-28 sm:h-36 rounded-lg overflow-hidden border border-[#e5dcd3] bg-white">
                    <img
                      src={record.receivedProductImageDataUrl}
                      alt="Received Product"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issue Description */}
          <div className="pt-3 border-t border-[#e5dcd3]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a67c52] block mb-1">Issue Description:</span>
            <p className="text-xs sm:text-sm text-[#4a423d] whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#e5dcd3]">
              {record.complaintDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Print & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#eee3d8]">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e5dcd3] text-[#4a423d] hover:bg-[#f4ece4] transition-colors text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#a67c52]" />
          <span>Print / Save Summary</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#f4ece4] text-[#6d4c41] hover:bg-[#eee3d8] border border-[#eee3d8] transition-colors text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#a67c52]" />
          <span>Submit Another Complaint</span>
        </button>
      </div>
    </div>
  );
};
