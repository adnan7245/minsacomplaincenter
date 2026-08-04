import { StoreSettings } from '../types';
import { getSupabase } from '../lib/supabase';

const SETTINGS_STORAGE_KEY = 'minsa_fashion_store_settings_v1';

export const DEFAULT_SETTINGS: StoreSettings = {
  pageName: 'Minsa Fashion Store',
  phoneNumber: '03018463706',
  whatsappNumber: '923018463706',
  address: 'Faisalabad, Pakistan',
  city: 'Faisalabad',
  tagline: 'Online Ladies Suiting • Premium Pakistani Collections',
  welcomeMessageUrdu: 'ہم اپنے صارفین کی شکایات کو اہمیت دیتے ہیں۔ اگر آپ کو اپنے آرڈر میں کسی قسم کا مسئلہ یا شکایت ہے تو نیچے دیا گیا فارم مکمل کریں۔ ہماری ٹیم آپ کی شکایت کا جائزہ لے کر جلد از جلد آپ سے رابطہ کرے گی۔',
};

/**
 * Normalizes phone number into international WhatsApp format (e.g., 923018463706)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned || DEFAULT_SETTINGS.whatsappNumber;
}

/**
 * Loads store settings from localStorage and Supabase if available
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  let currentSettings = { ...DEFAULT_SETTINGS };

  // 1. Try reading from localStorage first
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      currentSettings = { ...currentSettings, ...parsed };
    }
  } catch (e) {
    console.warn('LocalStorage settings load warning:', e);
  }

  // 2. Try fetching from Supabase 'StoreSettings' table if available
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('StoreSettings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        currentSettings = {
          pageName: data.page_name || currentSettings.pageName,
          phoneNumber: data.phone_number || currentSettings.phoneNumber,
          whatsappNumber: data.whatsapp_number || currentSettings.whatsappNumber,
          address: data.address || currentSettings.address,
          city: data.city || currentSettings.city,
          tagline: data.tagline || currentSettings.tagline,
          welcomeMessageUrdu: data.welcome_message_urdu || currentSettings.welcomeMessageUrdu,
        };
        // Update local cache
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
      }
    } catch (err) {
      console.warn('Supabase settings load warning:', err);
    }
  }

  return currentSettings;
}

/**
 * Saves store settings to localStorage and attempts to sync to Supabase
 */
export async function saveStoreSettings(newSettings: StoreSettings): Promise<StoreSettings> {
  const formattedWhatsApp = normalizeWhatsAppNumber(newSettings.whatsappNumber || newSettings.phoneNumber);
  
  const updated: StoreSettings = {
    ...newSettings,
    whatsappNumber: formattedWhatsApp,
  };

  // Save locally
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage settings save warning:', e);
  }

  // Sync to Supabase if configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload = {
        id: 1, // Singleton row ID
        page_name: updated.pageName,
        phone_number: updated.phoneNumber,
        whatsapp_number: updated.whatsappNumber,
        address: updated.address,
        city: updated.city,
        tagline: updated.tagline,
        welcome_message_urdu: updated.welcomeMessageUrdu,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('StoreSettings').upsert(payload);
    } catch (err) {
      console.warn('Supabase settings save warning:', err);
    }
  }

  return updated;
}
