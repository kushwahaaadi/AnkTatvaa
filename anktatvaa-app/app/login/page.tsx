'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured 
} from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/components/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('◈ Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isFirebaseConfigured() && auth) {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Set localStorage session
      localStorage.setItem('ank_user', JSON.stringify({
        name: email.split('@')[0],
        email: email,
        dob: '18/10/1998',
        loggedIn: true
      }));
      showToast('Welcome back, Seeker');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || '◈ Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      showToast('Authenticated successfully');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || '◈ Google authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-[#161411]/95 border border-[#B08A57]/30 rounded-md p-8 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center border border-[#B08A57]/40 rounded-full bg-[#0D0D0C]">
            <span className="text-[#B08A57] text-lg">✦</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#F7F3EB]">
            Seeker Sanctuary Login
          </h1>
          <p className="font-mono text-xs text-[#898276] mt-1">
            Access your archived readings & cloud storage
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="••••••••"
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
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1B1915]" />
          </div>
          <span className="relative bg-[#161411] px-3 font-mono text-[10px] text-[#5C5549] uppercase tracking-widest">
            or continue with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-[#0D0D0C] hover:bg-[#1B1915] border border-[#B08A57]/30 text-[#E8E0D2] font-mono text-xs tracking-wider uppercase rounded-sm transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-[#B08A57]">◈</span>
          <span>Google Identity</span>
        </button>

        <div className="mt-8 text-center text-xs font-mono text-[#898276]">
          New seeker?{' '}
          <Link href="/signup" className="text-[#B08A57] hover:underline">
            Initiate Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
