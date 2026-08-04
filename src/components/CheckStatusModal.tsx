import React, { useState } from 'react';
import { Search, X, CheckCircle2, Clock, AlertCircle, Phone, MessageSquare, ExternalLink, RefreshCw, FileText } from 'lucide-react';
import { SubmittedComplaintRecord, StoreSettings } from '../types';
import { getAllComplaints, getWhatsAppLink } from '../services/complaintService';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({ isOpen, onClose, settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchingComplaints, setMatchingComplaints] = useState<SubmittedComplaintRecord[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const all = await getAllComplaints();
      const cleanQuery = query.toLowerCase().replace(/[\s\-\+]/g, '');

      const results = all.filter((rec) => {
        const cleanCompNum = rec.complaintNumber.toLowerCase().replace(/[\s\-\+]/g, '');
        const cleanContact = rec.contactNumber.toLowerCase().replace(/[\s\-\+]/g, '');
        const cleanTrack = rec.trackingNumber.toLowerCase().replace(/[\s\-\+]/g, '');

        return (
          cleanCompNum.includes(cleanQuery) ||
          cleanContact.includes(cleanQuery) ||
          (cleanTrack && cleanTrack.includes(cleanQuery))
        );
      });

      setMatchingComplaints(results);
    } catch (err) {
      console.error('Error searching complaints:', err);
      setMatchingComplaints([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolved (حل ہو چکا ہے)</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Under Review (جائزہ لیا جا رہا ہے)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending (زیرِ التواء)</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#eee3d8] relative my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8d7b6d] hover:text-[#6d4c41] p-1.5 rounded-full hover:bg-[#f4ece4] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-[#f4ece4] text-[#6d4c41] rounded-2xl flex items-center justify-center mx-auto mb-2.5 border border-[#eee3d8]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#6d4c41]">
            Check Complaint Status (شکایت کا سٹیٹس)
          </h3>
          <p className="text-xs text-[#8d7b6d] mt-1">
            اپنا شکایت نمبر (Complaint No) یا فون نمبر درج کر کے سٹیٹس معلوم کریں
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8d7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. MF-2026-123456 or 03001234567"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden bg-[#fdfaf8] text-[#4a423d]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-[#6d4c41] hover:bg-[#5d4037] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {!hasSearched && (
            <div className="text-center py-8 text-[#8d7b6d] bg-[#fdfaf8] rounded-xl border border-dashed border-[#eee3d8]">
              <FileText className="w-8 h-8 text-[#a67c52] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-medium">
                اوپر دیے گئے خانے میں اپنا شکایت نمبر درج کر کے "Search" بٹن دبائیں
              </p>
            </div>
          )}

          {hasSearched && matchingComplaints.length === 0 && !isSearching && (
            <div className="text-center py-8 bg-rose-50 rounded-xl border border-rose-200 p-4">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-rose-800 mb-1">کوئی شکایت نہیں ملی</h4>
              <p className="text-xs text-rose-600">
                آپ کے درج کردہ نمبر ({searchQuery}) سے کوئی بھی آن لائن شکایت ریکارڈ نہیں ملی۔ براہِ کرم نمبر دوبارہ چیک کریں۔
              </p>
            </div>
          )}

          {matchingComplaints.map((comp) => {
            const waLink = getWhatsAppLink(
              comp.complaintNumber,
              settings.pageName,
              settings.whatsappNumber || settings.phoneNumber
            );

            return (
              <div
                key={comp.id}
                className="bg-[#fdfaf8] rounded-2xl p-4 border border-[#eee3d8] shadow-sm space-y-3"
              >
                {/* Header with Complaint No & Status */}
                <div className="flex items-start justify-between gap-2 flex-wrap pb-2 border-b border-[#eee3d8]">
                  <div>
                    <span className="text-[10px] font-bold text-[#8d7b6d] uppercase tracking-wider block">
                      Complaint Number
                    </span>
                    <span className="text-base font-mono font-bold text-[#6d4c41]">
                      {comp.complaintNumber}
                    </span>
                  </div>
                  <div>{getStatusBadge(comp.status)}</div>
                </div>

                {/* Complaint Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#8d7b6d] block">Customer Name:</span>
                    <span className="font-semibold text-[#4a423d]">{comp.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#8d7b6d] block">Contact Phone:</span>
                    <span className="font-semibold text-[#4a423d]">{comp.contactNumber}</span>
                  </div>
                  {comp.trackingNumber && (
                    <div>
                      <span className="text-[#8d7b6d] block">Tracking No:</span>
                      <span className="font-semibold text-[#4a423d]">{comp.trackingNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#8d7b6d] block">Submission Date:</span>
                    <span className="font-semibold text-[#4a423d]">{comp.formattedDate}</span>
                  </div>
                </div>

                {/* Complaint Description */}
                <div className="bg-white p-3 rounded-xl border border-[#eee3d8] text-xs">
                  <span className="text-[11px] font-bold text-[#6d4c41] block mb-0.5">
                    Complaint Details (تفصیل):
                  </span>
                  <p className="text-[#4a423d] whitespace-pre-wrap">{comp.complaintDescription}</p>
                </div>

                {/* Images Preview if available */}
                {(comp.orderedProductImageDataUrl || comp.receivedProductImageDataUrl) && (
                  <div className="flex gap-2 pt-1">
                    {comp.orderedProductImageDataUrl && (
                      <div className="flex-1">
                        <span className="text-[10px] text-[#8d7b6d] block mb-1">Ordered Suit:</span>
                        <img
                          src={comp.orderedProductImageDataUrl}
                          alt="Ordered"
                          className="w-full h-20 object-cover rounded-lg border border-[#eee3d8]"
                        />
                      </div>
                    )}
                    {comp.receivedProductImageDataUrl && (
                      <div className="flex-1">
                        <span className="text-[10px] text-[#8d7b6d] block mb-1">Received Suit:</span>
                        <img
                          src={comp.receivedProductImageDataUrl}
                          alt="Received"
                          className="w-full h-20 object-cover rounded-lg border border-[#eee3d8]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Status Message Explanation */}
                <div className="p-2.5 rounded-xl text-xs bg-[#f4ece4] text-[#6d4c41] border border-[#d7ccc8]">
                  {comp.status === 'Pending' && (
                    <p dir="rtl" className="font-sans">
                      ⏳ آپ کی شکایت موصول ہو چکی ہے اور ہماری ٹیم جلد ہی اس پر کارروائی کا آغاز کرے گی۔
                    </p>
                  )}
                  {comp.status === 'Under Review' && (
                    <p dir="rtl" className="font-sans">
                      🔍 آپ کی شکایت کا جائزہ لیا جا رہا ہے۔ ہماری ٹیم جلد آپ سے واٹس ایپ یا فون پر رابطہ کرے گی۔
                    </p>
                  )}
                  {comp.status === 'Resolved' && (
                    <p dir="rtl" className="font-sans">
                      ✅ مبارک ہو! آپ کی شکایت کا مسئلہ حل کر دیا گیا ہے۔ اگر مزید مدد درکار ہو تو رابطہ کریں۔
                    </p>
                  )}
                </div>

                {/* WhatsApp Help Button */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-200" />
                  <span>WhatsApp Support Contact (اس شکایت کے لیے واٹس ایپ پر بات کریں)</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
