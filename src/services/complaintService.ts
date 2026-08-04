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
 * Fetches all complaints from Supabase database or LocalStorage cache
 */
export async function getAllComplaints(): Promise<SubmittedComplaintRecord[]> {
  const supabase = getSupabase();
  let supabaseRecords: SubmittedComplaintRecord[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('Complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        supabaseRecords = data.map((item: any) => {
          const dt = item.created_at ? new Date(item.created_at) : new Date();
          return {
            id: String(item.id || item.complaint_number),
            complaintNumber: item.complaint_number || '',
            trackingNumber: item.tracking_number || '',
            orderDate: item.order_date || '',
            customerName: item.customer_name || '',
            contactNumber: item.contact_number || '',
            address: item.address || '',
            city: item.city || '',
            orderedProductImageDataUrl: item.ordered_product_image_url || '',
            receivedProductImageDataUrl: item.received_product_image_url || '',
            complaintDescription: item.complaint_description || '',
            submissionTimestamp: item.created_at || dt.toISOString(),
            formattedDate: dt.toLocaleDateString('en-PK', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: (item.status as 'Pending' | 'Under Review' | 'Resolved') || 'Pending',
          };
        });
      }
    } catch (err) {
      console.warn('Error reading complaints from Supabase:', err);
    }
  }

  // Load local cache fallback
  let localRecords: SubmittedComplaintRecord[] = [];
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      localRecords = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('LocalStorage load error:', e);
  }

  // Merge unique by complaintNumber or id so no records are lost
  const recordMap = new Map<string, SubmittedComplaintRecord>();

  // Add supabase records first
  supabaseRecords.forEach((rec) => {
    const key = (rec.complaintNumber || rec.id).trim().toLowerCase();
    if (key) recordMap.set(key, rec);
  });

  // Add local records if not present in map
  localRecords.forEach((rec) => {
    const key = (rec.complaintNumber || rec.id).trim().toLowerCase();
    if (key && !recordMap.has(key)) {
      recordMap.set(key, rec);
    }
  });

  const mergedRecords = Array.from(recordMap.values()).sort((a, b) => {
    return (
      new Date(b.submissionTimestamp || 0).getTime() -
      new Date(a.submissionTimestamp || 0).getTime()
    );
  });

  // Save merged to local storage cache
  if (mergedRecords.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedRecords));
    } catch (e) {}
  }

  return mergedRecords;
}

/**
 * Updates complaint status in Supabase & LocalStorage
 */
export async function updateComplaintStatus(
  id: string,
  newStatus: 'Pending' | 'Under Review' | 'Resolved'
): Promise<boolean> {
  const supabase = getSupabase();

  // 1. Update in Supabase
  if (supabase) {
    try {
      // Try by id first
      let { error } = await supabase
        .from('Complaints')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        // Fallback by complaint_number
        await supabase
          .from('Complaints')
          .update({ status: newStatus })
          .eq('complaint_number', id);
      }
    } catch (err) {
      console.warn('Error updating status in Supabase:', err);
    }
  }

  // 2. Update in LocalStorage
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const records: SubmittedComplaintRecord[] = JSON.parse(cached);
      const updated = records.map((rec) =>
        rec.id === id || rec.complaintNumber === id ? { ...rec, status: newStatus } : rec
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage status update error:', e);
  }

  return true;
}

/**
 * Deletes a complaint record
 */
export async function deleteComplaint(id: string): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      let { error } = await supabase.from('Complaints').delete().eq('id', id);
      if (error) {
        await supabase.from('Complaints').delete().eq('complaint_number', id);
      }
    } catch (err) {
      console.warn('Error deleting from Supabase:', err);
    }
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const records: SubmittedComplaintRecord[] = JSON.parse(cached);
      const filtered = records.filter((rec) => rec.id !== id && rec.complaintNumber !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }

  return true;
}

/**
 * Generates the WhatsApp pre-filled contact URL.
 */
export function getWhatsAppLink(
  complaintNumber: string,
  customStoreName: string = 'Minsa Fashion Store',
  customWhatsAppNum: string = WHATSAPP_INTL_NUMBER
): string {
  const message = `Assalam o Alaikum, I have submitted a complaint to ${customStoreName}. My Complaint Number is ${complaintNumber}.`;
  let targetPhone = customWhatsAppNum.replace(/[^\d]/g, '');
  if (targetPhone.startsWith('03')) {
    targetPhone = '92' + targetPhone.substring(1);
  }
  return `https://wa.me/${targetPhone || WHATSAPP_INTL_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct WhatsApp reply link from Admin to Customer
 */
export function getCustomerWhatsAppReplyLink(
  customerPhone: string,
  complaintNumber: string,
  customerName: string,
  status: string,
  storeName: string
): string {
  let phone = customerPhone.replace(/[^\d]/g, '');
  if (phone.startsWith('03')) {
    phone = '92' + phone.substring(1);
  } else if (phone.startsWith('3') && phone.length === 10) {
    phone = '92' + phone;
  }

  const message = `Assalam o Alaikum ${customerName},\nThis is regarding your complaint #${complaintNumber} at ${storeName}.\nStatus: ${status}.\n\nHow can we assist you further?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Validates Pakistani phone numbers (e.g. 03XXXXXXXXX or +923XXXXXXXXX)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^((\+92|92|0)?3\d{9})$/.test(cleaned);
}
