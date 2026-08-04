import React, { useState, useEffect } from 'react';
import {
  Settings,
  ListFilter,
  Search,
  RefreshCw,
  Store,
  Phone,
  MapPin,
  Save,
  Check,
  Eye,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowLeft,
  Filter,
  Globe,
  Palette,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SubmittedComplaintRecord, StoreSettings } from '../../types';
import {
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint
} from '../../services/complaintService';
import { getStoreSettings, saveStoreSettings } from '../../services/settingsService';
import { ComplaintDetailModal } from './ComplaintDetailModal';

interface AdminPanelProps {
  onClose: () => void;
  onSettingsUpdated: (newSettings: StoreSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onSettingsUpdated }) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'settings'>('complaints');
  const [complaints, setComplaints] = useState<SubmittedComplaintRecord[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    pageName: 'Minsa Fashion Store',
    phoneNumber: '03018463706',
    whatsappNumber: '923018463706',
    address: 'Faisalabad, Pakistan',
    city: 'Faisalabad',
    tagline: 'Online Ladies Suiting • Premium Pakistani Collections',
    welcomeMessageUrdu: 'ہم اپنے صارفین کی شکایات کو اہمیت دیتے ہیں۔ اگر آپ کو اپنے آرڈر میں کسی قسم کا مسئلہ یا شکایت ہے تو نیچے دیا گیا فارم مکمل کریں۔ ہماری ٹیم آپ کی شکایت کا جائزہ لے کر جلد از جلد آپ سے رابطہ کرے گی۔',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search & Filter state for Complaints
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Under Review' | 'Resolved'>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<SubmittedComplaintRecord | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedSettings, fetchedComplaints] = await Promise.all([
        getStoreSettings(),
        getAllComplaints(),
      ]);
      setSettings(fetchedSettings);
      setSettingsForm(fetchedSettings);
      setComplaints(fetchedComplaints);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccess(false);

    try {
      const updated = await saveStoreSettings(settingsForm);
      setSettings(updated);
      onSettingsUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('سیٹنگز محفوظ کرنے میں مسئلہ پیش آیا!');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);
  const [statusSaveNotification, setStatusSaveNotification] = useState<string | null>(null);

  // Status Update Handler
  const handleStatusChange = async (
    id: string,
    newStatus: 'Pending' | 'Under Review' | 'Resolved',
    complaintNumber?: string
  ) => {
    setIsUpdatingStatusId(id);
    await updateComplaintStatus(id, newStatus, complaintNumber);

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id || c.complaintNumber === id || (complaintNumber && c.complaintNumber === complaintNumber)
          ? { ...c, status: newStatus }
          : c
      )
    );

    if (
      selectedComplaint &&
      (selectedComplaint.id === id ||
        selectedComplaint.complaintNumber === id ||
        (complaintNumber && selectedComplaint.complaintNumber === complaintNumber))
    ) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    setIsUpdatingStatusId(null);
    setStatusSaveNotification(
      `✓ Status for complaint #${complaintNumber || id} saved successfully as "${newStatus}"!`
    );
    setTimeout(() => setStatusSaveNotification(null), 3500);
  };

  // Delete Complaint Handler
  const handleDeleteComplaint = async (id: string, complaintNumber: string) => {
    if (window.confirm(`کیا آپ واقعی شکایت #${complaintNumber} ڈیلیٹ کرنا چاہتے ہیں؟`)) {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id && c.complaintNumber !== id));
      if (selectedComplaint && (selectedComplaint.id === id || selectedComplaint.complaintNumber === id)) {
        setSelectedComplaint(null);
      }
    }
  };

  // Filtered complaints calculation
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactNumber.includes(searchTerm) ||
      c.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const reviewCount = complaints.filter((c) => c.status === 'Under Review').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="bg-white rounded-2xl border border-[#eee3d8] shadow-xl overflow-hidden mb-12">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#6d4c41] text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8d6e63] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#5d4037] rounded-xl border border-[#8d6e63]">
              <Store className="w-6 h-6 text-[#d7ccc8]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                Admin Panel (ایڈمن پینل)
              </h2>
              <p className="text-xs text-[#d7ccc8]">
                {settings.pageName} • Management System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5d4037] hover:bg-[#4e342e] text-xs font-semibold rounded-xl border border-[#8d6e63] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#d7ccc8]" />
            <span>Back to Store View</span>
          </button>
        </div>

        {/* Menu Tabs Navigation */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-white text-[#6d4c41] shadow-md'
                : 'bg-[#5d4037]/60 text-[#e5dcd3] hover:bg-[#5d4037]'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Complain List (شکایات کی فہرست)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === 'complaints'
                  ? 'bg-[#f4ece4] text-[#6d4c41]'
                  : 'bg-[#4e342e] text-white'
              }`}
            >
              {complaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-[#6d4c41] shadow-md'
                : 'bg-[#5d4037]/60 text-[#e5dcd3] hover:bg-[#5d4037]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Setting (سیٹنگ)</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-6 bg-[#fdfaf8] min-h-[500px]">
        {activeTab === 'complaints' ? (
          /* TAB 1: COMPLAIN LIST */
          <div className="space-y-6">
            {/* Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#eee3d8] shadow-2xs">
                <p className="text-[11px] font-medium text-[#8d7b6d]">Total Complaints</p>
                <p className="text-xl font-bold text-[#4a423d] mt-1">{complaints.length}</p>
              </div>

              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 shadow-2xs">
                <p className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  Pending
                </p>
                <p className="text-xl font-bold text-rose-900 mt-1">{pendingCount}</p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 shadow-2xs">
                <p className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Under Review
                </p>
                <p className="text-xl font-bold text-amber-900 mt-1">{reviewCount}</p>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                <p className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Resolved
                </p>
                <p className="text-xl font-bold text-emerald-900 mt-1">{resolvedCount}</p>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-[#eee3d8] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#8d7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Complaint #, Name, Phone..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] outline-hidden bg-[#fdfaf8]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start sm:justify-end">
                <span className="text-xs font-semibold text-[#8d7b6d] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filter:
                </span>
                {(['All', 'Pending', 'Under Review', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#6d4c41] text-white shadow-2xs'
                        : 'bg-[#f4ece4] text-[#6d4c41] hover:bg-[#eee3d8]'
                    }`}
                  >
                    {st}
                  </button>
                ))}

                <button
                  onClick={loadData}
                  className="p-2 bg-white hover:bg-[#f4ece4] border border-[#d7ccc8] text-[#6d4c41] rounded-lg transition-colors ml-auto md:ml-2"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Status Saved Floating Notification Banner */}
            {statusSaveNotification && (
              <div className="bg-emerald-700 text-white p-3 rounded-xl shadow-lg border border-emerald-500 flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{statusSaveNotification}</span>
                </div>
                <button
                  onClick={() => setStatusSaveNotification(null)}
                  className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Complaints List Table / Cards */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#8d7b6d]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#a67c52]" />
                Loading complaints...
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-[#eee3d8] text-center space-y-2">
                <ShieldAlert className="w-10 h-10 text-[#a67c52] mx-auto opacity-40" />
                <h3 className="text-sm font-bold text-[#4a423d]">کوئی شکایت نہیں ملی</h3>
                <p className="text-xs text-[#8d7b6d]">
                  {searchTerm || statusFilter !== 'All'
                    ? 'آپ کے فلٹر کے مطابق کوئی ریکارڈ موجود نہیں۔'
                    : 'فی الحال کسی صارف نے کوئی شکایت درج نہیں کروائی۔'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-[#eee3d8] p-4 shadow-2xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eee3d8] pb-3 mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-[#f4ece4] text-[#6d4c41] px-2.5 py-1 rounded-lg border border-[#eee3d8]">
                          #{c.complaintNumber}
                        </span>
                        <span className="text-xs text-[#8d7b6d] font-medium">{c.formattedDate}</span>
                        <span className="text-xs bg-[#fdfaf8] text-[#4a423d] px-2 py-0.5 rounded border border-[#eee3d8] font-mono">
                          Tracking: {c.trackingNumber}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#8d7b6d]">Status:</span>
                        <div className="relative flex items-center">
                          <select
                            value={c.status}
                            disabled={isUpdatingStatusId === c.id}
                            onChange={(e) =>
                              handleStatusChange(
                                c.id,
                                e.target.value as 'Pending' | 'Under Review' | 'Resolved',
                                c.complaintNumber
                              )
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-hidden cursor-pointer transition-colors ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : c.status === 'Under Review'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <option value="Pending">Pending (زیرِ التوا)</option>
                            <option value="Under Review">Under Review (جائزہ لیا جا رہا ہے)</option>
                            <option value="Resolved">Resolved (حل ہو چکا ہے)</option>
                          </select>
                          {isUpdatingStatusId === c.id && (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin ml-1.5 text-[#6d4c41]" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[#8d7b6d] font-medium">Customer:</span>
                        <p className="font-bold text-[#4a423d] text-sm mt-0.5">{c.customerName}</p>
                        <p className="text-[#6d4c41] font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#a67c52]" />
                          {c.contactNumber}
                        </p>
                      </div>

                      <div>
                        <span className="text-[#8d7b6d] font-medium">City & Address:</span>
                        <p className="font-semibold text-[#4a423d] mt-0.5">{c.city}</p>
                        <p className="text-[#8d7b6d] truncate max-w-xs">{c.address}</p>
                      </div>

                      <div>
                        <span className="text-[#8d7b6d] font-medium">Complaint Details:</span>
                        <p className="text-[#4a423d] line-clamp-2 italic mt-0.5">
                          "{c.complaintDescription}"
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-4 pt-3 border-t border-[#eee3d8] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {c.orderedProductImageDataUrl && (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Ordered Pic attached
                          </span>
                        )}
                        {c.receivedProductImageDataUrl && (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Received Pic attached
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-1.5 bg-[#f4ece4] hover:bg-[#eee3d8] text-[#6d4c41] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-[#d7ccc8]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleDeleteComplaint(c.id, c.complaintNumber)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: SETTING */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#eee3d8] shadow-sm">
              <div className="border-b border-[#eee3d8] pb-4 mb-6">
                <h3 className="text-lg font-serif font-bold text-[#6d4c41] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#a67c52]" />
                  Website Settings (پلیٹ فارم کی ترتیبات)
                </h3>
                <p className="text-xs text-[#8d7b6d] mt-1">
                  یہاں سے آپ اپنی ویب سائٹ کا نام، پتہ، اور پیغام تبدیل کر سکتے ہیں۔
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Website Name / Page Title */}
                <div>
                  <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                    Website / Page Name (صفحے کا نام):
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#8d7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={settingsForm.pageName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, pageName: e.target.value })}
                      placeholder="Minsa Fashion Store"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden bg-[#fdfaf8]"
                      required
                    />
                  </div>
                </div>

                {/* Address & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                      Store Address / Location (پتہ):
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#8d7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, address: e.target.value })
                        }
                        placeholder="Faisalabad, Pakistan"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden bg-[#fdfaf8]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                      City (شہر):
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#8d7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={settingsForm.city}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, city: e.target.value })
                        }
                        placeholder="Faisalabad"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden bg-[#fdfaf8]"
                      />
                    </div>
                  </div>
                </div>

                {/* Urdu Welcome Message */}
                <div>
                  <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                    Urdu Welcome Message (اردو پیغام):
                  </label>
                  <textarea
                    dir="rtl"
                    rows={3}
                    value={settingsForm.welcomeMessageUrdu}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, welcomeMessageUrdu: e.target.value })
                    }
                    className="w-full p-3 text-sm rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden bg-[#fdfaf8] leading-relaxed font-sans"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', 'Segoe UI', Tahoma, sans-serif" }}
                  />
                </div>

                {/* Theme & Page Colors Section */}
                <div className="pt-4 border-t border-[#eee3d8]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#6d4c41] flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-[#a67c52]" />
                        <span>Theme & Colors (پیج اور ٹیکسٹ کا رنگ)</span>
                      </h4>
                      <p className="text-[11px] text-[#8d7b6d]">
                        صفحے کا پس منظر (Background) اور ٹیکسٹ کا رنگ اپنی مرضی کے مطابق تبدیل کریں
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          bgColor: '#fdfaf8',
                          textColor: '#4a423d',
                          headerBgColor: '#6d4c41',
                          cardBgColor: '#ffffff',
                        })
                      }
                      className="text-xs text-[#8d7b6d] hover:text-[#6d4c41] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f4ece4] hover:bg-[#eee3d8] transition-colors border border-[#d7ccc8] cursor-pointer"
                      title="Reset colors to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Preset Themes */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-[#6d4c41] mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Quick Color Presets (تیز رفتار تھیمز):</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#fdfaf8',
                            textColor: '#4a423d',
                            headerBgColor: '#6d4c41',
                            cardBgColor: '#ffffff',
                          })
                        }
                        className="p-2 rounded-xl border border-[#d7ccc8] bg-[#fdfaf8] text-left hover:border-[#6d4c41] transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#fdfaf8] border border-[#d7ccc8]" />
                          <span className="w-3 h-3 rounded-full bg-[#6d4c41]" />
                          <span className="w-3 h-3 rounded-full bg-[#4a423d]" />
                        </div>
                        <p className="text-xs font-semibold text-[#6d4c41] group-hover:underline">🍫 Minsa Classic</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#ffffff',
                            textColor: '#1f2937',
                            headerBgColor: '#111827',
                            cardBgColor: '#f9fafb',
                          })
                        }
                        className="p-2 rounded-xl border border-gray-200 bg-white text-left hover:border-gray-900 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                          <span className="w-3 h-3 rounded-full bg-gray-900" />
                          <span className="w-3 h-3 rounded-full bg-gray-700" />
                        </div>
                        <p className="text-xs font-semibold text-gray-800 group-hover:underline">⚪ Clean White</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#fff5f5',
                            textColor: '#4a2c2c',
                            headerBgColor: '#8c333a',
                            cardBgColor: '#ffffff',
                          })
                        }
                        className="p-2 rounded-xl border border-rose-200 bg-[#fff5f5] text-left hover:border-rose-400 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#fff5f5] border border-rose-300" />
                          <span className="w-3 h-3 rounded-full bg-[#8c333a]" />
                          <span className="w-3 h-3 rounded-full bg-[#4a2c2c]" />
                        </div>
                        <p className="text-xs font-semibold text-rose-900 group-hover:underline">🌹 Elegant Rose</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#f0fdf4',
                            textColor: '#14532d',
                            headerBgColor: '#166534',
                            cardBgColor: '#ffffff',
                          })
                        }
                        className="p-2 rounded-xl border border-emerald-200 bg-[#f0fdf4] text-left hover:border-emerald-400 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#f0fdf4] border border-emerald-300" />
                          <span className="w-3 h-3 rounded-full bg-[#166534]" />
                          <span className="w-3 h-3 rounded-full bg-[#14532d]" />
                        </div>
                        <p className="text-xs font-semibold text-emerald-900 group-hover:underline">🌿 Soft Mint</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#18181b',
                            textColor: '#e4e4e7',
                            headerBgColor: '#27272a',
                            cardBgColor: '#27272a',
                          })
                        }
                        className="p-2 rounded-xl border border-zinc-700 bg-zinc-900 text-left hover:border-zinc-500 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700" />
                          <span className="w-3 h-3 rounded-full bg-zinc-700" />
                          <span className="w-3 h-3 rounded-full bg-zinc-200" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-100 group-hover:underline">🌙 Dark Mode</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#faf5ff',
                            textColor: '#3b0764',
                            headerBgColor: '#581c87',
                            cardBgColor: '#ffffff',
                          })
                        }
                        className="p-2 rounded-xl border border-purple-200 bg-[#faf5ff] text-left hover:border-purple-400 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#faf5ff] border border-purple-300" />
                          <span className="w-3 h-3 rounded-full bg-[#581c87]" />
                          <span className="w-3 h-3 rounded-full bg-[#3b0764]" />
                        </div>
                        <p className="text-xs font-semibold text-purple-900 group-hover:underline">🟣 Royal Velvet</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#f0f9ff',
                            textColor: '#0c4a6e',
                            headerBgColor: '#0369a1',
                            cardBgColor: '#ffffff',
                          })
                        }
                        className="p-2 rounded-xl border border-sky-200 bg-[#f0f9ff] text-left hover:border-sky-400 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#f0f9ff] border border-sky-300" />
                          <span className="w-3 h-3 rounded-full bg-[#0369a1]" />
                          <span className="w-3 h-3 rounded-full bg-[#0c4a6e]" />
                        </div>
                        <p className="text-xs font-semibold text-sky-900 group-hover:underline">🌊 Ocean Blue</p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm({
                            ...settingsForm,
                            bgColor: '#fffbe1',
                            textColor: '#451a03',
                            headerBgColor: '#78350f',
                            cardBgColor: '#ffffff',
                          })
                        }
                        className="p-2 rounded-xl border border-amber-200 bg-[#fffbe1] text-left hover:border-amber-400 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-3 h-3 rounded-full bg-[#fffbe1] border border-amber-300" />
                          <span className="w-3 h-3 rounded-full bg-[#78350f]" />
                          <span className="w-3 h-3 rounded-full bg-[#451a03]" />
                        </div>
                        <p className="text-xs font-semibold text-amber-900 group-hover:underline">☀️ Golden Sunset</p>
                      </button>
                    </div>
                  </div>

                  {/* Individual Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#fdfaf8] p-3.5 rounded-xl border border-[#eee3d8]">
                    {/* Page Background Color */}
                    <div>
                      <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                        Page Background (پیج بیک گراؤنڈ کلر):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.bgColor || '#fdfaf8'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, bgColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-[#d7ccc8] cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={settingsForm.bgColor || '#fdfaf8'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, bgColor: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[#d7ccc8] bg-white text-[#4a423d]"
                          placeholder="#fdfaf8"
                        />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                        Text Color (لکھائی / ٹیکسٹ کا رنگ):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.textColor || '#4a423d'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, textColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-[#d7ccc8] cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={settingsForm.textColor || '#4a423d'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, textColor: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[#d7ccc8] bg-white text-[#4a423d]"
                          placeholder="#4a423d"
                        />
                      </div>
                    </div>

                    {/* Header / Accent Color */}
                    <div>
                      <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                        Header / Main Accent Color (ہیڈر اور ٹائٹل کا رنگ):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.headerBgColor || '#6d4c41'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, headerBgColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-[#d7ccc8] cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={settingsForm.headerBgColor || '#6d4c41'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, headerBgColor: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[#d7ccc8] bg-white text-[#4a423d]"
                          placeholder="#6d4c41"
                        />
                      </div>
                    </div>

                    {/* Card Background Color */}
                    <div>
                      <label className="block text-xs font-bold text-[#6d4c41] mb-1">
                        Form / Card Background (فارم ڈبے کا بیک گراؤنڈ):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.cardBgColor || '#ffffff'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, cardBgColor: e.target.value })
                          }
                          className="w-9 h-9 rounded-lg border border-[#d7ccc8] cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={settingsForm.cardBgColor || '#ffffff'}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, cardBgColor: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[#d7ccc8] bg-white text-[#4a423d]"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Mini Preview Box */}
                  <div
                    className="mt-3 p-3 rounded-xl border border-[#eee3d8] transition-colors"
                    style={{ backgroundColor: settingsForm.bgColor || '#fdfaf8' }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: settingsForm.headerBgColor || '#6d4c41' }}
                    >
                      Live Color Preview (لائیو تھیم کا نمونہ):
                    </p>
                    <div
                      className="p-3 rounded-lg shadow-xs border border-black/10 transition-colors"
                      style={{
                        backgroundColor: settingsForm.cardBgColor || '#ffffff',
                        color: settingsForm.textColor || '#4a423d',
                      }}
                    >
                      <h5
                        className="font-serif font-bold text-sm"
                        style={{ color: settingsForm.headerBgColor || '#6d4c41' }}
                      >
                        {settingsForm.pageName || 'Minsa Fashion Store'}
                      </h5>
                      <p className="text-xs mt-1">
                        یہ آپ کے منتخب کردہ بیک گراؤنڈ اور ٹیکسٹ کے رنگ کی لائیو مثال ہے۔
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Feedback Toast */}
                {saveSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>سیٹنگز کامیابی کے ساتھ محفوظ ہو گئی ہیں! (Settings saved successfully)</span>
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3 px-4 bg-[#6d4c41] hover:bg-[#5d4037] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {isSavingSettings ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Settings (سیٹنگز محفوظ کریں)</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Detail Popup Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          settings={settings}
          onClose={() => setSelectedComplaint(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}
    </div>
  );
};
