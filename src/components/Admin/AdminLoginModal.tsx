import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const validUser = username.trim().toLowerCase() === 'admin' || username.trim() === 'Danijutt7245@';
    const validPass = password === 'Danijutt7245@' || password.trim() === '1234';

    if (validUser && validPass) {
      setError('');
      setPassword('');
      onSuccess();
    } else {
      setError('غلط یوزر نیم یا پاس ورڈ!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#eee3d8] relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8d7b6d] hover:text-[#4a423d] p-1 rounded-full hover:bg-[#f4ece4] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#f4ece4] rounded-full flex items-center justify-center mx-auto mb-3 text-[#6d4c41] border border-[#eee3d8]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#6d4c41]">
            Admin Access Verification
          </h2>
          <p className="text-xs text-[#8d7b6d] mt-1">
            ایڈمن پینل کے لیے یوزر نیم اور پاس ورڈ درج کریں
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-[#6d4c41] mb-1.5">
              Username (یوزر نیم):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8d7b6d]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="admin"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden text-sm bg-[#fdfaf8]"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-[#6d4c41] mb-1.5">
              Password (پاس ورڈ):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8d7b6d]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#d7ccc8] focus:border-[#6d4c41] focus:ring-2 focus:ring-[#6d4c41]/20 outline-hidden text-sm bg-[#fdfaf8]"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8d7b6d] hover:text-[#4a423d]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#6d4c41] hover:bg-[#5d4037] text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
