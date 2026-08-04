import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { ComplaintForm } from './components/ComplaintForm';
import { SuccessView } from './components/SuccessView';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/Admin/AdminPanel';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { ComplaintFormData, SubmittedComplaintRecord, StoreSettings } from './types';
import { submitComplaint } from './services/complaintService';
import { getStoreSettings, DEFAULT_SETTINGS } from './services/settingsService';

export default function App() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedComplaintRecord | null>(null);

  // Admin panel state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load store settings on boot
  useEffect(() => {
    getStoreSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
    });
  }, []);

  // Listen for URL triggers (e.g., ?admin, #admin, /admin, ?page=admin)
  useEffect(() => {
    const checkAdminUrl = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      const isAdminUrlTrigger =
        search.includes('admin') ||
        hash.includes('admin') ||
        pathname.includes('/admin') ||
        search.includes('login');

      if (isAdminUrlTrigger) {
        if (isAdminAuthenticated) {
          setIsAdminOpen(true);
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    checkAdminUrl();
    window.addEventListener('popstate', checkAdminUrl);
    window.addEventListener('hashchange', checkAdminUrl);
    return () => {
      window.removeEventListener('popstate', checkAdminUrl);
      window.removeEventListener('hashchange', checkAdminUrl);
    };
  }, [isAdminAuthenticated]);

  const handleSubmit = async (formData: ComplaintFormData) => {
    setIsSubmitting(true);
    try {
      const record = await submitComplaint(formData);
      setSubmittedRecord(record);
    } catch (error) {
      console.error('Submission failed:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRecord(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fdfaf8] text-[#4a423d] flex flex-col font-sans selection:bg-[#eee3d8] selection:text-[#6d4c41]">
      {/* Header */}
      <Header
        settings={settings}
        onOpenAdmin={handleOpenAdminTrigger}
        isAdminOpen={isAdminOpen}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {isAdminOpen ? (
            <motion.div
              key="admin-panel-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <AdminPanel
                onClose={() => setIsAdminOpen(false)}
                onSettingsUpdated={(newSet) => setSettings(newSet)}
              />
            </motion.div>
          ) : !submittedRecord ? (
            <motion.div
              key="complaint-form-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <ComplaintForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <SuccessView record={submittedRecord} settings={settings} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Admin Verification Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={handleOpenAdminTrigger}
        isAdminAuthenticated={isAdminAuthenticated}
      />
    </div>
  );
}
