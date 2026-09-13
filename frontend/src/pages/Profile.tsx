import { useState, useRef, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Camera, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Moon,
  Save,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { apiClient } from "../api/client";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <p className="text-sm font-semibold text-[var(--brand-text-muted)]">Please log in to view your profile.</p>
        <Link to="/login" className="mt-4 px-6 py-2.5 rounded-full bg-[var(--brand-primary)] text-white font-bold text-xs">
          Go to Login
        </Link>
      </div>
    );
  }

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

      setMessage("Profile details saved successfully to database! ✨");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[var(--brand-bg)] text-[var(--brand-text)] font-sans py-8 px-4 sm:px-6 overflow-x-hidden transition-colors duration-200">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--brand-primary)]/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[var(--brand-secondary)]/10 blur-[100px] pointer-events-none" />

      <main className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Top Header Navigation Bar */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-xs font-semibold text-[var(--brand-text)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)] transition cursor-pointer"
            >
              {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Profile Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[2.5rem] border-2 border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 sm:p-10 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3 border-b border-[var(--brand-border)] pb-6 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-text)] flex items-center gap-2">
                My Account Profile <Sparkles size={18} className="text-[var(--brand-secondary)] animate-pulse" />
              </h1>
              <p className="text-xs text-[var(--brand-text-muted)] mt-0.5">
                Update your personal information, profile photo, and password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Photo Selection Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)]">
              <div className="relative group flex-shrink-0">
                <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[var(--brand-primary)]/30 shadow-xl flex items-center justify-center bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-4xl font-black">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{fullName ? fullName.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload picture from PC"
                  className="absolute bottom-0 right-0 p-3 rounded-full bg-[var(--brand-primary)] text-white shadow-lg hover:scale-110 transition cursor-pointer"
                >
                  <Camera size={18} />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <h3 className="text-sm font-bold text-[var(--brand-text)]">Profile Photo</h3>
                <p className="text-xs text-[var(--brand-text-muted)]">
                  Upload a photo from your PC to customize your account avatar.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] font-bold text-xs hover:bg-[var(--brand-primary)] hover:text-white transition cursor-pointer"
                  >
                    Upload Photo from PC
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="px-3 py-2 rounded-xl border border-[var(--brand-border)] text-[var(--brand-text-muted)] font-semibold text-xs hover:text-[var(--brand-error)] transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info Grid */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold text-[var(--brand-text-muted)] uppercase tracking-wider">Personal Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3.5 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] font-semibold transition"
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
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3.5 pl-12 pr-4 outline-none bg-[var(--brand-surface-elevated)]/60 text-[var(--brand-text-muted)] cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Account Status Bar */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--brand-surface-elevated)] border border-[var(--brand-border)]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs uppercase">
                    {user.role ? user.role.charAt(0) : "P"}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--brand-text-muted)] block">Assigned Account Role</span>
                    <span className="text-xs font-extrabold text-[var(--brand-primary)] uppercase tracking-wider">{user.role || "patient"}</span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-success)] bg-[var(--brand-success)]/10 px-3.5 py-1.5 rounded-full border border-[var(--brand-success)]/20">
                  <ShieldCheck size={16} /> Verified
                </span>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-6 border-t border-[var(--brand-border)] space-y-4">
              <h2 className="text-xs font-bold text-[var(--brand-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={14} className="text-[var(--brand-primary)]" /> Update Password (Optional)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Current Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (8+ chars)"
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-10 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] hover:text-[var(--brand-primary)] transition p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="block text-[10px] font-bold text-[var(--brand-text-muted)] uppercase mb-1.5 ml-1">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-text-muted)] pointer-events-none" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-2xl border-2 border-[var(--brand-border)] py-3 pl-12 pr-4 outline-none focus:border-[var(--brand-primary)] bg-[var(--brand-surface-elevated)] text-[var(--brand-text)] transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error & Success Notification Banners */}
            {error && (
              <div className="p-4 rounded-2xl bg-[var(--brand-error)]/10 border border-[var(--brand-error)]/30 text-xs font-semibold text-[var(--brand-error)]">
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div className="p-4 rounded-2xl bg-[var(--brand-success)]/10 border border-[var(--brand-success)]/30 text-xs font-bold text-[var(--brand-success)] flex items-center gap-2">
                <Check size={18} />
                <span>{message}</span>
              </div>
            )}

            {/* Action Bar Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--brand-border)]">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-2xl border border-[var(--brand-border)] text-[var(--brand-text-muted)] font-bold text-xs hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text)] transition cursor-pointer"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-2xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs shadow-lg transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
}
