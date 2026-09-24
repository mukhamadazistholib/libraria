import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getAuthRedirectUrl, PRODUCTION_SITE_URL } from '../../lib/supabase';
import { useLibrary } from '../../context/LibraryContext';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, LogOut, CheckCircle, Key, Globe } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser } = useLibrary();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customAnonKey, setCustomAnonKey] = useState(() => localStorage.getItem('libraria_supabase_anon_key') || '');
  const [redirectUrl, setRedirectUrl] = useState(() => getAuthRedirectUrl());
  const [isLiveConnected, setIsLiveConnected] = useState(isSupabaseConfigured);

  useEffect(() => {
    // Check active session from Supabase if configured
    if (isLiveConnected) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncUserFromSupabase(session.user);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncUserFromSupabase(session.user);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isLiveConnected]);

  const syncUserFromSupabase = (sbUser: any) => {
    const name = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Libraria Reader';
    const handle = sbUser.email?.split('@')[0] || 'reader';
    setCurrentUser({
      id: sbUser.id,
      name,
      handle,
      email: sbUser.email || '',
      role: 'reader',
      avatar: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${handle}`,
      bio: sbUser.user_metadata?.bio || 'Registered reader at Libraria digital library.',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      streakDays: 1,
      booksFinished: 0,
      pagesRead: 0,
      followersCount: 0,
      followingCount: 0,
    });
  };

  const handleSaveCustomKey = () => {
    if (!customAnonKey.trim()) return;
    localStorage.setItem('libraria_supabase_anon_key', customAnonKey.trim());
    setIsLiveConnected(true);
    setSuccessMessage('Supabase Anon Key saved successfully! Live connection active.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSaveRedirectUrl = (url: string) => {
    setRedirectUrl(url);
    localStorage.setItem('libraria_auth_redirect_url', url);
    setSuccessMessage(`Redirect URL set to: ${url}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              handle: email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          syncUserFromSupabase(data.session.user);
          setSuccessMessage('Registration successful! Welcome to Libraria.');
          setTimeout(onClose, 1500);
        } else {
          setSuccessMessage('Account registered! Please check your email for confirmation or sign in.');
          setMode('signin');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          syncUserFromSupabase(data.user);
          setSuccessMessage('Successfully signed in! Happy reading.');
          setTimeout(onClose, 1200);
        }
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Unsupported provider') || msg.includes('provider is not enabled')) {
        setErrorMessage(
          mode === 'signup'
            ? 'Email provider is not enabled in Supabase. Go to Supabase Dashboard -> Authentication -> Providers -> enable Email and check "Allow new users to sign up".'
            : 'Authentication provider is not enabled in Supabase. Check Supabase Dashboard -> Authentication -> Providers.'
        );
      } else {
        setErrorMessage(msg || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const targetUrl = redirectUrl || getAuthRedirectUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetUrl,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Unsupported provider') || msg.includes('provider is not enabled')) {
        setErrorMessage(
          'Google Provider is not enabled in Supabase. Go to Supabase Dashboard -> Authentication -> Providers -> Google, then enter your Google Client ID & Secret.'
        );
      } else {
        setErrorMessage(msg || 'Failed to initiate Google sign in.');
      }
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('libraria_supabase_anon_key');
      setSuccessMessage('You have been signed out.');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#fffdfa] dark:bg-[#18181b] rounded-2xl shadow-2xl border border-[#e4ded5] dark:border-[#27272a] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 pt-6 pb-4 border-b border-[#eeebe5] dark:border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff6719] flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1a1a1a] dark:text-[#f4f4f5] leading-none">
                Reader Authentication
              </h3>
              <p className="text-[11px] text-[#716e68] dark:text-[#a1a1aa] mt-0.5">
                Connected to Supabase Auth Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8c8880] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f0ede6] dark:hover:bg-[#27272a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Status Indikator Supabase */}
          <div className="p-3 rounded-xl bg-[#f5f2eb] dark:bg-[#202024] border border-[#e5e0d8] dark:border-[#2e2e33] text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-semibold text-[#2c2a26] dark:text-[#e4e4e7]">
                  {isLiveConnected ? 'Supabase Auth Connected' : 'Anon Key Required'}
                </span>
              </div>
              <span className="text-[10px] text-[#8a857c] font-mono">
                ref: zdbfxiughuxfttozfyxr
              </span>
            </div>

            {/* URL Redirect Info */}
            <div className="mt-2.5 pt-2 border-t border-[#ded8ce] dark:border-[#2a2a2e] text-[11px] text-[#6b665e] dark:text-[#a1a1aa] space-y-1.5">
              <div className="flex items-center justify-between">
                <span>OAuth Redirect Target:</span>
                <code className="text-[10px] font-mono bg-white dark:bg-black/30 px-1.5 py-0.5 rounded border border-[#ded8ce] dark:border-[#333] text-[#2c2a26] dark:text-[#e4e4e7] truncate max-w-[200px]">
                  {redirectUrl}
                </code>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveRedirectUrl(PRODUCTION_SITE_URL)}
                  className={`text-[10px] px-2 py-0.5 rounded border font-medium transition-colors ${
                    redirectUrl === PRODUCTION_SITE_URL
                      ? 'bg-[#ff6719] text-white border-[#ff6719]'
                      : 'bg-white dark:bg-[#141416] text-[#6b665e] dark:text-[#a1a1aa] border-[#ded8ce] dark:border-[#333] hover:border-[#ff6719]'
                  }`}
                >
                  Production (Vercel)
                </button>
                {typeof window !== 'undefined' && window.location.origin !== PRODUCTION_SITE_URL && (
                  <button
                    type="button"
                    onClick={() => handleSaveRedirectUrl(window.location.origin)}
                    className={`text-[10px] px-2 py-0.5 rounded border font-medium transition-colors ${
                      redirectUrl === window.location.origin
                        ? 'bg-[#ff6719] text-white border-[#ff6719]'
                        : 'bg-white dark:bg-[#141416] text-[#6b665e] dark:text-[#a1a1aa] border-[#ded8ce] dark:border-[#333] hover:border-[#ff6719]'
                    }`}
                  >
                    Current Dev Host
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#8c8880] leading-tight">
                Make sure this exact redirect target is added in <strong>Supabase Dashboard &gt; Authentication &gt; URL Configuration &gt; Redirect URLs</strong>.
              </p>
            </div>

            {!isLiveConnected && (
              <div className="mt-2.5 pt-2.5 border-t border-[#ded8ce] dark:border-[#2a2a2e] space-y-2">
                <p className="text-[11px] text-[#6b665e] dark:text-[#a1a1aa] leading-relaxed">
                  Copy your <strong>anon public key</strong> from the Supabase dashboard (<span className="font-mono text-[10px]">Project Settings -&gt; API</span>) to enable live authentication:
                </p>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Key className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      value={customAnonKey}
                      onChange={(e) => setCustomAnonKey(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-[11px] font-mono bg-white dark:bg-[#141416] border border-[#ded8ce] dark:border-[#333] rounded-md text-[#222] dark:text-[#eee] focus:outline-none focus:border-[#ff6719]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCustomKey}
                    className="px-3 py-1.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-semibold text-[11px] rounded-md hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Akun yang Sedang Aktif */}
          {currentUser && currentUser.email && (
            <div className="p-3 rounded-xl bg-white dark:bg-[#1f1f23] border border-[#e4dfd5] dark:border-[#2b2b30] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#e0dad0]"
                />
                <div>
                  <p className="text-xs font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-[#78746c] dark:text-[#a1a1aa] font-mono">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-1 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Form Tabs: Masuk vs Daftar */}
          <div className="flex border-b border-[#e6e2da] dark:border-[#27272a]">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold transition-all border-b-2 ${
                mode === 'signin'
                  ? 'border-[#ff6719] text-[#ff6719]'
                  : 'border-transparent text-[#7a766e] dark:text-[#a1a1aa] hover:text-[#1a1a1a]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold transition-all border-b-2 ${
                mode === 'signup'
                  ? 'border-[#ff6719] text-[#ff6719]'
                  : 'border-transparent text-[#7a766e] dark:text-[#a1a1aa] hover:text-[#1a1a1a]'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#403e39] dark:text-[#d4d4d8] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mukhamad Azis Tholib"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#141416] border border-[#d6d0c4] dark:border-[#333] rounded-lg text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#ff6719]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#403e39] dark:text-[#d4d4d8] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#141416] border border-[#d6d0c4] dark:border-[#333] rounded-lg text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#ff6719]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#403e39] dark:text-[#d4d4d8] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#141416] border border-[#d6d0c4] dark:border-[#333] rounded-lg text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#ff6719]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#ff6719] hover:bg-[#e85608] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign in to Libraria' : 'Register Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8e4db] dark:border-[#27272a]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#8c8880] tracking-wider">
              <span className="bg-[#fffdfa] dark:bg-[#18181b] px-2">Or</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 px-4 bg-white dark:bg-[#1e1e22] hover:bg-[#f6f4ee] dark:hover:bg-[#27272c] border border-[#d6d0c4] dark:border-[#333] text-[#333] dark:text-[#f4f4f5] text-xs font-medium rounded-lg flex items-center justify-center gap-2.5 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
