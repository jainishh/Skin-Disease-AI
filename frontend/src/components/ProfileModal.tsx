import { useState, useRef, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Camera, Lock, Eye, EyeOff, X, Check, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Update Profile (Name & Avatar Picture)
      const res = await apiClient.patch("/auth/profile", {
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
      });

      updateUser({
        full_name: res.data.full_name,
        avatar_url: res.data.avatar_url,
      });

      // 2. Change Password if filled
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError("New passwords do not match.");
          setSubmitting(false);
          return;
        }
        if (!currentPassword) {
          setError("Please enter your current password to set a new password.");
          setSubmitting(false);
          return;
        }
        await apiClient.post("/auth/change-password", {
          current_password: currentPassword,
          new_password: newPassword,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setMessage("Profile & account settings saved successfully! ✨");
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-3xl border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-2xl font-body text-[var(--brand-text)] max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--brand-text)] flex items-center gap-1.5">
                  My Profile <Sparkles size={15} className="text-[var(--brand-secondary)]" />
                </h2>
                <p className="text-xs text-[var(--brand-text-muted)]">Manage your personal info & profile photo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[var(--brand-text-muted)] hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text)] transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Avatar Photo Section */}
            <div className="flex flex-col items-center justify-center space-y-3 pb-2">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[var(--brand-primary)]/30 shadow-lg flex items-center justify-center bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-3xl font-extrabold">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture from PC"
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[var(--brand-primary)] text-white shadow-md hover:scale-110 transition cursor-pointer"
                >
                  <Camera size={16} />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline cursor-pointer"
                >
                  Change Profile Photo
                </button>
                <p className="text-[10px] text-[var(--brand-text-muted)] mt-0.5">JPG, PNG, GIF or WEBP up to 5MB</p>
              </div>
            </div>

            {/* Full Name & Role */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none bg-[var(--brand-surface-elevated)]/60 text-[var(--brand-text-muted)] cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[var(--brand-text-muted)] block">Account Role</span>
                  <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">{user.role || "patient"}</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-success)] bg-[var(--brand-success)]/10 px-3 py-1 rounded-full border border-[var(--brand-success)]/20">
                  <ShieldCheck size={14} /> Verified User
                </span>
              </div>
            </div>

            {/* Password Update Section */}
            <div className="pt-2 border-t border-[var(--brand-border)] space-y-3">
              <h3 className="text-xs font-bold text-[var(--brand-text)] flex items-center gap-1.5">
                <Lock size={14} className="text-[var(--brand-primary)]" /> Update Password (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Current Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={15} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full rounded-xl border-2 border-[var(--brand-border)] py-2.5 pl-11 pr-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={15} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (8+ chars)"
                      className="w-full rounded-xl border-2 border-[var(--brand-border)] py-2.5 pl-11 pr-8 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] hover:text-[var(--brand-primary)] transition p-1"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="block text-[9px] font-bold text-[var(--brand-text-muted)] uppercase mb-1 ml-1">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={15} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border-2 border-[var(--brand-border)] py-2.5 pl-11 pr-3 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alerts */}
            {error && (
              <p className="text-xs font-semibold text-[var(--brand-error)] bg-[var(--brand-error)]/10 p-3 rounded-xl border border-[var(--brand-error)]/20">
                ⚠️ {error}
              </p>
            )}

            {message && (
              <p className="text-xs font-semibold text-[var(--brand-success)] bg-[var(--brand-success)]/10 p-3 rounded-xl border border-[var(--brand-success)]/20 flex items-center gap-1.5">
                <Check size={16} /> {message}
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--brand-border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[var(--brand-border)] text-[var(--brand-text-muted)] font-bold hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text)] transition cursor-pointer"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Profile</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
