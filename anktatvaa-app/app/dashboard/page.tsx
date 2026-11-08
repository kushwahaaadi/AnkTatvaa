'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  auth, 
  fetchUserReadings, 
  removeReading, 
  uploadSeekerFile, 
  SeekerReading,
  isFirebaseConfigured 
} from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useToast } from '@/components/ToastProvider';

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string; dob: string; avatarUrl?: string }>({
    name: 'Seeker',
    email: 'seeker@anktatvaa.com',
    dob: '18/10/1998',
    avatarUrl: ''
  });
  const [readings, setReadings] = useState<SeekerReading[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedReports, setUploadedReports] = useState<Array<{ name: string; url: string; date: string }>>([]);

  // Auth monitoring & initial load
  useEffect(() => {
    // Check localStorage profile
    try {
      const local = JSON.parse(localStorage.getItem('ank_user') || 'null');
      if (local) {
        setProfile({
          name: local.name || 'Seeker',
          email: local.email || 'seeker@anktatvaa.com',
          dob: local.dob || '18/10/1998',
          avatarUrl: local.avatarUrl || ''
        });
      }
      const localReports = JSON.parse(localStorage.getItem('ank_uploaded_reports') || '[]');
      setUploadedReports(localReports);
    } catch (e) {}

    // Check Firebase Auth
    if (auth) {
      try {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);
            setProfile(prev => ({
              ...prev,
              name: firebaseUser.displayName || prev.name,
              email: firebaseUser.email || prev.email,
              avatarUrl: firebaseUser.photoURL || prev.avatarUrl
            }));
            loadReadings(firebaseUser.uid);
          } else {
            loadReadings();
          }
        });
        return () => unsubscribe();
      } catch (e) {}
    } else {
      loadReadings();
    }
  }, []);

  const loadReadings = async (uid?: string) => {
    setLoadingReadings(true);
    try {
      const data = await fetchUserReadings(uid);
      setReadings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReadings(false);
    }
  };

  const handleDeleteReading = async (id: string) => {
    try {
      await removeReading(id);
      setReadings(prev => prev.filter(r => r.id !== id));
      showToast('Reading removed from your archive');
    } catch (e) {
      showToast('Failed to remove reading');
    }
  };

  const handleClearAll = () => {
    if (!confirm('Are you sure you wish to clear your saved readings archive?')) return;
    try {
      localStorage.removeItem('ank_saved_readings');
      setReadings([]);
      showToast('Archive cleared');
    } catch (e) {}
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('ank_user', JSON.stringify({ ...profile, loggedIn: true }));
      showToast('Profile updated successfully');
    } catch (e) {}
  };

  // Upload Avatar or Chart to Firebase Cloud Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: 'avatars' | 'reports') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    showToast(`Uploading ${file.name} to Firebase Storage...`);

    try {
      const userId = user?.uid || 'guest_seeker';
      const downloadUrl = await uploadSeekerFile(userId, file, folder);

      if (folder === 'avatars') {
        const updated = { ...profile, avatarUrl: downloadUrl };
        setProfile(updated);
        localStorage.setItem('ank_user', JSON.stringify({ ...updated, loggedIn: true }));
        showToast('Avatar saved to Firebase Cloud Storage!');
      } else {
        const newDoc = {
          name: file.name,
          url: downloadUrl,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        const updated = [newDoc, ...uploadedReports];
        setUploadedReports(updated);
        localStorage.setItem('ank_uploaded_reports', JSON.stringify(updated));
        showToast('Document saved to Firebase Cloud Storage!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (auth) await signOut(auth);
      localStorage.removeItem('ank_user');
      showToast('Signed out successfully');
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-6xl mx-auto space-y-12">
      {/* ── PROFILE HEADER ── */}
      <div className="p-6 sm:p-8 bg-[#161411]/90 border border-[#B08A57]/30 rounded-md backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full border-2 border-[#B08A57] bg-[#0D0D0C] overflow-hidden flex items-center justify-center text-xl font-bold font-serif text-[#B08A57] shadow-[0_0_20px_rgba(176,138,87,0.25)]">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.substring(0, 2).toUpperCase()
              )}
            </div>

            {/* Change Avatar Button */}
            <label className="absolute inset-0 bg-[#0D0D0C]/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center cursor-pointer text-[9px] font-mono text-[#B08A57] text-center p-1">
              <span>Upload Avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'avatars')}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08A57]">
                Certified Seeker Profile
              </span>
              <span className="text-xs text-[#5C5549]">·</span>
              <span className="text-[10px] font-mono text-[#898276]">
                {isFirebaseConfigured() ? 'Firebase Cloud Connected' : 'Local Sandbox Mode'}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#F7F3EB]">
              {profile.name}
            </h1>
            <p className="font-mono text-xs text-[#898276] mt-0.5">
              {profile.email} · DOB: {profile.dob}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#1B1915] hover:bg-[#B08A57]/20 border border-[#B08A57]/30 text-[#E8E0D2] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors cursor-pointer"
          >
            Export / Print
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-[#5C5549] hover:border-[#898276] text-[#898276] hover:text-[#F7F3EB] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── FIREBASE STORAGE FILE VAULT ── */}
      <div className="p-6 sm:p-8 bg-[#161411]/80 border border-[#B08A57]/25 rounded-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#B08A57]/20 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#B08A57] flex items-center gap-2">
              <span>◈</span>
              <span>Free Firebase Cloud Storage Vault (5GB Free Tier)</span>
            </span>
            <p className="text-xs text-[#898276] mt-1">
              Store your Vedic birth charts, reading PDF exports, and planetary dossiers safely in the cloud.
            </p>
          </div>

          <label className="px-4 py-2 bg-[#B08A57] hover:bg-[#c49e6a] text-[#0D0D0C] font-mono text-xs font-semibold tracking-wider uppercase rounded-sm transition-colors cursor-pointer flex items-center gap-2">
            <span>+ Upload to Cloud Storage</span>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, 'reports')}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadedReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedReports.map((file, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0D0D0C] border border-[#B08A57]/25 rounded-sm flex items-center justify-between"
              >
                <div className="overflow-hidden pr-2">
                  <span className="font-mono text-xs text-[#F7F3EB] truncate block">
                    {file.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#898276]">
                    Uploaded: {file.date}
                  </span>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] font-mono uppercase text-[#B08A57] hover:text-[#F7F3EB] border border-[#B08A57]/30 rounded-sm"
                >
                  View ↗
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-[#5C5549] italic">
            No cloud files uploaded yet. Click &quot;Upload to Cloud Storage&quot; to archive documents.
          </p>
        )}
      </div>

      {/* ── SAVED READINGS SECTION ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#B08A57]/20">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#F7F3EB]">
              Saved Celestial Readings
            </h2>
            <p className="font-mono text-xs text-[#898276] mt-0.5">
              Archive contains {readings.length} calculations
            </p>
          </div>

          {readings.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-mono uppercase tracking-wider text-[#d97706] hover:text-[#f59e0b] transition-colors cursor-pointer"
            >
              Clear Archive
            </button>
          )}
        </div>

        {loadingReadings ? (
          <div className="p-8 text-center font-mono text-xs text-[#898276]">
            Retrieving saved readings from cloud...
          </div>
        ) : readings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readings.map((r) => (
              <div
                key={r.id}
                className="p-6 bg-[#161411]/90 border border-[#B08A57]/20 hover:border-[#B08A57]/45 rounded-sm flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1B1915]">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#B08A57]">
                      {r.type}
                    </span>
                    <span className="font-mono text-[10px] text-[#5C5549]">
                      {r.date}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#F7F3EB] mb-2">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#898276] leading-relaxed line-clamp-3">
                    {r.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1B1915] flex items-center justify-between">
                  <Link
                    href={r.link}
                    className="font-mono text-xs uppercase tracking-wider text-[#B08A57] hover:text-[#F7F3EB] transition-colors"
                  >
                    View Reading →
                  </Link>
                  <button
                    onClick={() => handleDeleteReading(r.id)}
                    className="text-xs font-mono text-[#5C5549] hover:text-[#d97706] transition-colors px-2 py-1"
                    title="Delete reading"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#161411]/40 border border-[#B08A57]/15 rounded-sm space-y-3">
            <span className="text-2xl text-[#B08A57]">ॐ</span>
            <h3 className="font-serif text-lg font-bold text-[#F7F3EB]">
              Your Celestial Archive is Empty
            </h3>
            <p className="text-xs text-[#898276] max-w-md mx-auto">
              Run any Vedic Numerology, Name Vibration, or Compatibility analysis and click &quot;Save to Seeker Archive&quot; to preserve your calculations.
            </p>
            <Link
              href="/numerology"
              className="inline-block mt-2 px-4 py-2 bg-[#B08A57] text-[#0D0D0C] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm"
            >
              Generate First Reading →
            </Link>
          </div>
        )}
      </div>

      {/* ── PROFILE SETTINGS CARD ── */}
      <div className="p-6 sm:p-8 bg-[#161411]/80 border border-[#B08A57]/20 rounded-md max-w-2xl space-y-6">
        <h3 className="font-serif text-xl font-bold text-[#F7F3EB]">
          Seeker Coordinates Settings
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] focus:outline-none focus:border-[#B08A57]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1.5">
                Date of Birth
              </label>
              <input
                type="text"
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] focus:outline-none focus:border-[#B08A57]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#B08A57] hover:bg-[#c49e6a] text-[#0D0D0C] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            Update Coordinates
          </button>
        </form>
      </div>
    </div>
  );
}
