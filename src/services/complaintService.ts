import { ComplaintFormData, SubmittedComplaintRecord } from '../types';
import { getSupabase } from '../lib/supabase';

const STORAGE_KEY = 'minsa_fashion_complaints_v1';
export const WHATSAPP_NUMBER = '03018463706';
export const WHATSAPP_INTL_NUMBER = '923018463706';

/**
 * Generates a unique complaint number in format: MF-2026-000001
 */
export function generateComplaintNumber(): string {
  const year = new Date().getFullYear();
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return `MF-${year}-${randomSixDigits}`;
}

/**
 * Helper to upload a file or base64 to Supabase Storage ('complaint-images' bucket).
 * Returns the public URL if successful, or falls back to data URL.
 */
async function uploadImageToSupabase(
  fileData: { file?: File | null; dataUrl: string },
  folder: string,
  complaintNum: string
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return fileData.dataUrl || '';

  try {
    let uploadBody: File | Blob | null = null;
    let extension = 'png';

    if (fileData.file) {
      uploadBody = fileData.file;
      const parts = fileData.file.name.split('.');
      if (parts.length > 1) {
        extension = parts.pop() || 'png';
      }
    } else if (fileData.dataUrl && fileData.dataUrl.startsWith('data:')) {
      // Convert dataUrl to blob
      const res = await fetch(fileData.dataUrl);
      uploadBody = await res.blob();
      const mime = fileData.dataUrl.split(';')[0].split(':')[1];
      if (mime) {
        extension = mime.split('/')[1] || 'png';
      }
    }

    if (!uploadBody) {
      return fileData.dataUrl || '';
    }

    const fileName = `${complaintNum}_${folder}_${Date.now()}.${extension}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(filePath, uploadBody, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage upload error, using dataUrl fallback:', uploadError.message);
      return fileData.dataUrl || '';
    }

    const { data: urlData } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || fileData.dataUrl || '';
  } catch (err) {
    console.warn('Error during image upload:', err);
    return fileData.dataUrl || '';
  }
}

/**
 * Saves a complaint to Supabase database ('Complaints' table) & Supabase storage ('complaint-images').
 */
export async function submitComplaint(
  formData: ComplaintFormData
): Promise<SubmittedComplaintRecord> {
  const complaintNumber = generateComplaintNumber();
  const now = new Date();

  // 1. Upload images to Supabase Storage if configured
  const orderedProductUrl = await uploadImageToSupabase(
    formData.orderedProductImage,
    'ordered',
    complaintNumber
  );

  const receivedProductUrl = await uploadImageToSupabase(
    formData.receivedProductImage,
    'received',
    complaintNumber
  );

  // 2. Prepare database payload for table 'Complaints'
  const dbPayload = {
    complaint_number: complaintNumber,
    tracking_number: formData.trackingNumber.trim(),
    order_date: formData.orderDate,
    customer_name: formData.customerName.trim(),
    contact_number: formData.contactNumber.trim(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    ordered_product_image_url: orderedProductUrl,
    received_product_image_url: receivedProductUrl,
    complaint_description: formData.complaintDescription.trim(),
    status: 'Pending',
    created_at: now.toISOString(),
  };

  const supabase = getSupabase();
  let dbInsertedRecord = null;

  if (supabase) {
    try {
      // Insert record into exact 'Complaints' table (case-sensitive schema public)
      const { data, error: insertError } = await supabase
        .from('Complaints')
        .insert([dbPayload])
        .select()
        .single();

      if (insertError) {
        console.warn('Supabase insert error into Complaints table:', insertError.message);
      } else {
        dbInsertedRecord = data;
      }
    } catch (dbErr) {
      console.warn('Supabase connection exception:', dbErr);
    }
  }

  // Construct final record object for UI state
  const record: SubmittedComplaintRecord = {
    id: dbInsertedRecord?.id ? String(dbInsertedRecord.id) : `comp_${Date.now()}`,
    complaintNumber: dbInsertedRecord?.complaint_number || complaintNumber,
    trackingNumber: formData.trackingNumber.trim(),
    orderDate: formData.orderDate,
    customerName: formData.customerName.trim(),
    contactNumber: formData.contactNumber.trim(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    orderedProductImageDataUrl: orderedProductUrl || formData.orderedProductImage.dataUrl || '',
    receivedProductImageDataUrl: receivedProductUrl || formData.receivedProductImage.dataUrl || '',
    complaintDescription: formData.complaintDescription.trim(),
    submissionTimestamp: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'Pending',
  };

  // Cache locally
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const existingRecords: SubmittedComplaintRecord[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];
    existingRecords.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRecords));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }

  return record;
}

/**
 * Generates the WhatsApp pre-filled contact URL.
 */
export function getWhatsAppLink(complaintNumber: string): string {
  const message = `Assalam o Alaikum, I have submitted a complaint to Minsa Fashion Store. My Complaint Number is ${complaintNumber}.`;
  return `https://wa.me/${WHATSAPP_INTL_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Validates Pakistani phone numbers (e.g. 03XXXXXXXXX or +923XXXXXXXXX)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^((\+92|92|0)?3\d{9})$/.test(cleaned);
}
