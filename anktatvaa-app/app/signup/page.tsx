'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured 
} from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { useToast } from '@/components/ToastProvider';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDob = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.slice(0, 8);
    let f = '';
    if (clean.length > 0) f += clean.slice(0, 2);
    if (clean.length > 2) f += '/' + clean.slice(2, 4);
    if (clean.length > 4) f += '/' + clean.slice(4, 8);
    return f;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!name || !email || !password || !dob) {
      setErrorMsg('◈ Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isFirebaseConfigured() && auth) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
      }

      // Save user profile locally
      localStorage.setItem('ank_user', JSON.stringify({
        name,
        email,
        dob,
        loggedIn: true
      }));

      showToast('Profile created successfully');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || '◈ Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth) {
        const res = await signInWithPopup(auth, googleProvider);
        localStorage.setItem('ank_user', JSON.stringify({
          name: res.user.displayName || 'Seeker',
          email: res.user.email,
          avatarUrl: res.user.photoURL,
          loggedIn: true
        }));
      } else {
        localStorage.setItem('ank_user', JSON.stringify({
          name: 'Google Seeker',
          email: 'seeker@google.com',
          dob: '01/01/1995',
          loggedIn: true
        }));
      }
      showToast('Profile created with Google');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || '◈ Google signup error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#161411]/95 border border-[#B08A57]/30 rounded-md p-8 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center border border-[#B08A57]/40 rounded-full bg-[#0D0D0C]">
            <span className="text-[#B08A57] text-lg font-serif">ॐ</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#F7F3EB]">
            Initiate Seeker Profile
          </h1>
          <p className="font-mono text-xs text-[#898276] mt-1">
            Store readings, charts, and telemetry in your cloud vault
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Aditya Kushwaha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1">
              Date of Birth (DD/MM/YYYY)
            </label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={dob}
              onChange={(e) => setDob(formatDob(e.target.value))}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm font-mono text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="seeker@anktatvaa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#898276] mb-1">
              Secret Password
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D0D0C] border border-[#B08A57]/30 rounded-sm px-4 py-2.5 text-sm text-[#F7F3EB] placeholder-[#5C5549] focus:outline-none focus:border-[#B08A57]"
            />
          </div>

          {errorMsg && (
            <p className="font-mono text-xs text-[#d97706] tracking-wider">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#B08A57] hover:bg-[#c49e6a] text-[#0D0D0C] font-mono text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors cursor-pointer"
          >
            {loading ? 'Creating Profile...' : 'Register Profile →'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1B1915]" />
          </div>
          <span className="relative bg-[#161411] px-3 font-mono text-[10px] text-[#5C5549] uppercase tracking-widest">
            or register with
          </span>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-2.5 bg-[#0D0D0C] hover:bg-[#1B1915] border border-[#B08A57]/30 text-[#E8E0D2] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-[#B08A57]">◈</span>
          <span>Google Identity</span>
        </button>

        <div className="mt-8 text-center text-xs font-mono text-[#898276]">
          Already registered?{' '}
          <Link href="/login" className="text-[#B08A57] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
