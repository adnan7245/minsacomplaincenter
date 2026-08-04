export interface ProductImageState {
  file: File | null;
  dataUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  error?: string | null;
}

export interface ComplaintFormData {
  trackingNumber: string;
  orderDate: string;
  customerName: string;
  contactNumber: string;
  address: string;
  city: string;
  orderedProductImage: ProductImageState;
  receivedProductImage: ProductImageState;
  complaintDescription: string;
}

export interface FormValidationErrors {
  trackingNumber?: string;
  orderDate?: string;
  customerName?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  orderedProductImage?: string;
  receivedProductImage?: string;
  complaintDescription?: string;
}

export interface SubmittedComplaintRecord {
  id: string;
  complaintNumber: string;
  trackingNumber: string;
  orderDate: string;
  customerName: string;
  contactNumber: string;
  address: string;
  city: string;
  orderedProductImageDataUrl: string;
  receivedProductImageDataUrl: string;
  complaintDescription: string;
  submissionTimestamp: string;
  formattedDate: string;
  status: 'Pending' | 'Under Review' | 'Resolved';
}

export interface StoreSettings {
  pageName: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  city: string;
  welcomeMessageUrdu: string;
  tagline?: string;
  bgColor?: string;
  textColor?: string;
  headerBgColor?: string;
  cardBgColor?: string;
}
