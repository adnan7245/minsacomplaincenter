import React, { useState } from 'react';
import { X, Phone, MapPin, Calendar, Hash, FileText, CheckCircle2, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { SubmittedComplaintRecord, StoreSettings } from '../../types';

interface ComplaintDetailModalProps {
  complaint: SubmittedComplaintRecord | null;
  settings: StoreSettings;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'Pending' | 'Under Review' | 'Resolved') => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  settings,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#eee3d8] relative max-h-[90vh] overflow-y-auto my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#eee3d8] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#f4ece4] text-[#6d4c41] font-mono text-sm font-bold rounded-lg border border-[#eee3d8]">
                {complaint.complaintNumber}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : complaint.status === 'Under Review'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {complaint.status}
              </span>
            </div>
            <p className="text-xs text-[#8d7b6d] mt-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Submitted on {complaint.formattedDate}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#8d7b6d] hover:text-[#4a423d] p-1.5 rounded-full hover:bg-[#f4ece4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Status Update Bar */}
        <div className="bg-[#fdfaf8] p-4 rounded-xl border border-[#eee3d8] mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-semibold text-[#6d4c41]">
            Update Complaint Status (حالت تبدیل کریں):
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onUpdateStatus(complaint.id, 'Pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                complaint.status === 'Pending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              Pending
            </button>
            <button
              onClick={() => onUpdateStatus(complaint.id, 'Under Review')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                complaint.status === 'Under Review'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
              Under Review
            </button>
            <button
              onClick={() => onUpdateStatus(complaint.id, 'Resolved')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                complaint.status === 'Resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
              Resolved
            </button>
          </div>
        </div>

        {/* Customer & Order Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Details */}
          <div className="bg-white p-4 rounded-xl border border-[#eee3d8] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a67c52] border-b border-[#eee3d8] pb-1.5">
              Customer Details (صارف کی تفصیلات)
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#8d7b6d]">Name:</span>{' '}
                <strong className="text-[#4a423d] text-sm">{complaint.customerName}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8d7b6d]">Phone:</span>{' '}
                <a
                  href={`tel:${complaint.contactNumber}`}
                  className="font-semibold text-[#6d4c41] underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-[#a67c52]" />
                  {complaint.contactNumber}
                </a>
              </div>
              <div>
                <span className="text-[#8d7b6d]">City:</span>{' '}
                <span className="font-medium text-[#4a423d]">{complaint.city}</span>
              </div>
              <div>
                <span className="text-[#8d7b6d]">Full Address:</span>{' '}
                <span className="text-[#4a423d] block mt-0.5 bg-[#fdfaf8] p-2 rounded-lg border border-[#eee3d8]">
                  {complaint.address}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white p-4 rounded-xl border border-[#eee3d8] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a67c52] border-b border-[#eee3d8] pb-1.5">
              Order Details (آرڈر کی تفصیلات)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#8d7b6d]">Tracking Number:</span>{' '}
                <span className="font-mono font-bold text-[#6d4c41] bg-[#f4ece4] px-2 py-0.5 rounded border border-[#eee3d8]">
                  {complaint.trackingNumber}
                </span>
              </div>
              <div>
                <span className="text-[#8d7b6d]">Order Date:</span>{' '}
                <span className="font-medium text-[#4a423d]">{complaint.orderDate}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[#8d7b6d] text-xs font-semibold block mb-1">
                Complaint Description (شکایت کی تفصیل):
              </span>
              <div className="bg-[#fdfaf8] p-3 rounded-xl border border-[#eee3d8] text-xs text-[#4a423d] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                {complaint.complaintDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Product Images Side-by-Side */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#a67c52] mb-3 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#8d7b6d]" />
            <span>Product Photos (تصاویر)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ordered Product Image */}
            <div className="bg-[#fdfaf8] p-3 rounded-xl border border-[#eee3d8] text-center">
              <span className="text-xs font-bold text-[#6d4c41] block mb-2">
                1. Ordered Product (جو سوٹ آرڈر کیا)
              </span>
              {complaint.orderedProductImageDataUrl ? (
                <div
                  onClick={() => setSelectedImage(complaint.orderedProductImageDataUrl)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#d7ccc8] aspect-4/3 bg-white flex items-center justify-center"
                >
                  <img
                    src={complaint.orderedProductImageDataUrl}
                    alt="Ordered Product"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <ImageIcon className="w-4 h-4" />
                    Click to Zoom
                  </div>
                </div>
              ) : (
                <div className="h-32 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Received Product Image */}
            <div className="bg-[#fdfaf8] p-3 rounded-xl border border-[#eee3d8] text-center">
              <span className="text-xs font-bold text-[#6d4c41] block mb-2">
                2. Received Product (جو موصول ہوا)
              </span>
              {complaint.receivedProductImageDataUrl ? (
                <div
                  onClick={() => setSelectedImage(complaint.receivedProductImageDataUrl)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#d7ccc8] aspect-4/3 bg-white flex items-center justify-center"
                >
                  <img
                    src={complaint.receivedProductImageDataUrl}
                    alt="Received Product"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <ImageIcon className="w-4 h-4" />
                    Click to Zoom
                  </div>
                </div>
              ) : (
                <div className="h-32 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Zoom Modal Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Zoomed View"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
