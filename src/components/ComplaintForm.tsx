import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  User,
  Phone,
  MapPin,
  Building2,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { ComplaintFormData, FormValidationErrors, ProductImageState } from '../types';
import { validatePhone } from '../services/complaintService';
import { ImageUploader } from './ImageUploader';

interface ComplaintFormProps {
  onSubmit: (formData: ComplaintFormData) => Promise<void>;
  isSubmitting: boolean;
}

const initialImageState: ProductImageState = {
  file: null,
  dataUrl: null,
  fileName: null,
  fileSize: null,
  error: null,
};

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<ComplaintFormData>({
    trackingNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    customerName: '',
    contactNumber: '',
    address: '',
    city: '',
    orderedProductImage: initialImageState,
    receivedProductImage: initialImageState,
    complaintDescription: '',
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};

    // 1. Tracking Number
    if (!formData.trackingNumber.trim()) {
      newErrors.trackingNumber = 'Tracking number is required.';
    }

    // 2. Order Date
    if (!formData.orderDate) {
      newErrors.orderDate = 'Order date is required.';
    }

    // 3. Customer Name
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer full name is required.';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Please enter your complete name.';
    }

    // 4. Contact Number
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required.';
    } else if (!validatePhone(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid Pakistani phone number (e.g. 03XXXXXXXXX).';
    }

    // 5. Complete Address
    if (!formData.address.trim()) {
      newErrors.address = 'Complete delivery address is required.';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter your complete address in detail.';
    }

    // 6. City
    if (!formData.city.trim()) {
      newErrors.city = 'City name is required.';
    }

    // 7. Upload Ordered Product Picture
    if (!formData.orderedProductImage.dataUrl) {
      newErrors.orderedProductImage = 'Please upload a picture of the product you ordered.';
    }

    // 8. Upload Received Product Picture
    if (!formData.receivedProductImage.dataUrl) {
      newErrors.receivedProductImage = 'Please upload a picture of the product you actually received.';
    }

    // 9. Complaint / Issue
    if (!formData.complaintDescription.trim()) {
      newErrors.complaintDescription = 'Please describe the complaint or issue with your order.';
    } else if (formData.complaintDescription.trim().length < 15) {
      newErrors.complaintDescription = 'Please provide a more detailed explanation of the issue (at least 15 characters).';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setGeneralError('Please review and fill in all required fields highlighted in red.');
      // Scroll to top of form or first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`container-${firstErrorKey}`) || document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    setGeneralError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (err: any) {
        console.error('Form submission error:', err);
        const errMsg = err?.message || 'An error occurred while submitting your complaint. Please check your connection and try again.';
        setGeneralError(errMsg);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleChange = (
    field: keyof ComplaintFormData,
    value: string | ProductImageState
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user updates field
    if (errors[field as keyof FormValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7 bg-white p-6 sm:p-10 rounded-2xl border border-[#eee3d8] shadow-xl shadow-[#ece0d1]/30">
      {/* Form Section Header */}
      <div className="border-b border-[#eee3d8] pb-4">
        <h2 className="text-xl font-serif font-bold text-[#6d4c41] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#a67c52]" />
          <span>Order & Complaint Information</span>
        </h2>
        <p className="text-xs text-[#8d7b6d] mt-1">
          All required fields marked with an asterisk (<span className="text-rose-600">*</span>) must be completed.
        </p>
      </div>

      {/* General Alert for missing fields */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to Submit Form</p>
            <p className="text-xs text-rose-700 mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      {/* FIELD 1: Tracking Number */}
      <div className="space-y-1.5" id="container-trackingNumber">
        <label htmlFor="trackingNumber" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          1. Tracking Number <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a67c52]">
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="trackingNumber"
            value={formData.trackingNumber}
            onChange={(e) => handleChange('trackingNumber', e.target.value)}
            placeholder="Enter your tracking number"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              errors.trackingNumber
                ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
                : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
            }`}
          />
        </div>
        {errors.trackingNumber && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.trackingNumber}</p>
        )}
      </div>

      {/* FIELD 2: Order Date */}
      <div className="space-y-1.5" id="container-orderDate">
        <label htmlFor="orderDate" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          2. Order Date <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a67c52]">
            <Calendar className="w-4 h-4" />
          </div>
          <input
            type="date"
            id="orderDate"
            max={new Date().toISOString().split('T')[0]}
            value={formData.orderDate}
            onChange={(e) => handleChange('orderDate', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              errors.orderDate
                ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
                : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
            }`}
          />
        </div>
        {errors.orderDate && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.orderDate}</p>
        )}
      </div>

      {/* FIELD 3: Customer Name */}
      <div className="space-y-1.5" id="container-customerName">
        <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          3. Customer Name <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a67c52]">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              errors.customerName
                ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
                : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
            }`}
          />
        </div>
        {errors.customerName && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.customerName}</p>
        )}
      </div>

      {/* FIELD 4: Contact Number */}
      <div className="space-y-1.5" id="container-contactNumber">
        <label htmlFor="contactNumber" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          4. Contact Number <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a67c52]">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            id="contactNumber"
            value={formData.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            placeholder="03XXXXXXXXX"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              errors.contactNumber
                ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
                : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
            }`}
          />
        </div>
        <p className="text-[11px] text-[#8d7b6d] pl-1">Pakistani mobile format: 03XXXXXXXXX (11 digits)</p>
        {errors.contactNumber && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.contactNumber}</p>
        )}
      </div>

      {/* FIELD 5: Complete Address */}
      <div className="space-y-1.5" id="container-address">
        <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          5. Complete Address <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-[#a67c52]">
            <MapPin className="w-4 h-4" />
          </div>
          <textarea
            id="address"
            rows={3}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter your complete delivery address"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              errors.address
                ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
                : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
            }`}
          />
        </div>
        {errors.address && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.address}</p>
        )}
      </div>

      {/* FIELD 6: City */}
      <div className="space-y-1.5" id="container-city">
        <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          6. City <span className="text-rose-600">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a67c52]">
            <Building2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter your city"
            className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all focus:outline-none ${
              errors.city
                ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
                : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
            }`}
          />
        </div>
        {errors.city && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.city}</p>
        )}
      </div>

      {/* FIELD 7: Upload Ordered Product Picture */}
      <div className="pt-2 border-t border-[#eee3d8]">
        <ImageUploader
          id="orderedProductImage"
          label="7. Upload Picture of the Product You Ordered"
          helpText="Please upload a clear picture of the product/design you originally ordered."
          value={formData.orderedProductImage}
          onChange={(img) => handleChange('orderedProductImage', img)}
          error={errors.orderedProductImage}
        />
      </div>

      {/* FIELD 8: Upload Received Product Picture */}
      <div className="pt-2 border-t border-[#eee3d8]">
        <ImageUploader
          id="receivedProductImage"
          label="8. Upload Picture of the Product You Received"
          helpText="Please upload a clear picture of the product you actually received."
          value={formData.receivedProductImage}
          onChange={(img) => handleChange('receivedProductImage', img)}
          error={errors.receivedProductImage}
        />
      </div>

      {/* FIELD 9: Complaint / Issue */}
      <div className="space-y-1.5 pt-2 border-t border-[#eee3d8]" id="container-complaintDescription">
        <label htmlFor="complaintDescription" className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          9. What is the Issue with Your Order? <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="complaintDescription"
          rows={5}
          value={formData.complaintDescription}
          onChange={(e) => handleChange('complaintDescription', e.target.value)}
          placeholder="Please explain your complaint or the issue you faced with your order in detail."
          className={`w-full p-4 rounded-lg border text-sm transition-all focus:outline-none ${
            errors.complaintDescription
              ? 'border-rose-400 bg-rose-50/40 focus:ring-1 focus:ring-rose-500'
              : 'border-[#e5dcd3] bg-[#fcfcfc] text-[#4a423d] focus:border-[#a67c52] focus:bg-white focus:ring-1 focus:ring-[#a67c52]'
          }`}
        />
        <div className="flex justify-between items-center text-xs text-[#8d7b6d] px-1">
          <span>Be as specific as possible (e.g. wrong color, defect, size mismatch, missing item)</span>
          <span>{formData.complaintDescription.length} chars</span>
        </div>
        {errors.complaintDescription && (
          <p className="text-xs text-rose-600 font-medium pl-1">{errors.complaintDescription}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-[#eee3d8]">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-bold text-base text-white shadow-lg shadow-[#6d4c41]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isSubmitting
              ? 'bg-[#8d6e63] cursor-not-allowed'
              : 'bg-[#6d4c41] hover:bg-[#5d4037] active:scale-[0.99]'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Your Complaint...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Complaint</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#8d7b6d] mt-3 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your complaint will be directly routed to our Faisalabad support team.</span>
        </p>
      </div>
    </form>
  );
};
