import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { ComplaintForm } from './components/ComplaintForm';
import { SuccessView } from './components/SuccessView';
import { Footer } from './components/Footer';
import { ComplaintFormData, SubmittedComplaintRecord } from './types';
import { submitComplaint } from './services/complaintService';

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedComplaintRecord | null>(null);

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

  return (
    <div className="min-h-screen bg-[#fdfaf8] text-[#4a423d] flex flex-col font-sans selection:bg-[#eee3d8] selection:text-[#6d4c41]">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!submittedRecord ? (
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
              <SuccessView record={submittedRecord} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
