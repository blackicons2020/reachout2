import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Apple, Chrome, Loader2, AlertCircle, Building2, Users, Shield, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '../layout/Logo';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupMode, setSignupMode] = useState<'create' | 'join'>(inviteCode ? 'join' : 'create');
  const [joinCode, setJoinCode] = useState(inviteCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_configs', 'global'), (doc) => {
      if (doc.exists()) {
        setSystemConfig(doc.data());
      }
    });
    return () => unsub();
  }, []);

  // If invite code changes in URL, update state
  useEffect(() => {
    if (inviteCode && type === 'signup') {
      setSignupMode('join');
      setJoinCode(inviteCode);
    }
  }, [inviteCode, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const isSuperAdminEmail = email.toLowerCase() === 'superadmin@outreach.com';

      if (type === 'signup') {
        if (systemConfig?.registrationsEnabled === false && !isSuperAdminEmail) {
          throw new Error('New registrations are currently autonomously disabled by the system administrator.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let orgId: string | null = null;
        let setupCompleted = false;
        let role = isSuperAdminEmail ? 'superadmin' : 'owner';

        if (isSuperAdminEmail) {
          setupCompleted = true;
          orgId = 'saas_platform_admin'; // Special org ID for SuperAdmin
        } else if (signupMode === 'join') {
          if (!joinCode) throw new Error('Join code is required');
          const orgDoc = await getDoc(doc(db, 'organizations', joinCode));
          if (!orgDoc.exists()) {
            throw new Error('Invalid join code. Please check with your administrator.');
          }
          orgId = joinCode;
          setupCompleted = true;
          role = 'viewer';
        }
        
        // Create initial profile
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          displayName: isSuperAdminEmail ? 'ReachOut Owner' : email.split('@')[0],
          orgId: orgId,
          role: role,
          createdAt: Date.now(),
          setupCompleted: setupCompleted,
          isSuperAdmin: isSuperAdminEmail
        });

        // Autonomous logging
        await addDoc(collection(db, 'system_logs'), {
          message: isSuperAdminEmail ? 'SuperAdmin registered' : `New user registered: ${email}`,
          type: 'auth',
          userEmail: email,
          timestamp: Date.now()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message || 'An error occurred during authentication';
      
      if (err.code === "auth/invalid-credential") {
        message = "Invalid email or password. If you haven't created an account yet, please sign up first. Also ensure 'Email/Password' is enabled in your Firebase Console.";
      } else if (err.code === "auth/operation-not-allowed") {
        message = 'This sign-in method is disabled in the Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'The login popup was blocked. Please try opening the app in a new tab or use the Shared App URL.';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if profile exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create initial empty profile
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          orgId: null,
          role: 'owner',
          createdAt: Date.now(),
          setupCompleted: false
        });
      }

    } catch (err: any) {
      console.error('Google login error:', err);
      let message = err.message || 'Google login failed';
      
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Google Login is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'The login popup was blocked. Please try opening the app in a new tab or use the Shared App URL.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Login popup was closed before completion.';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo className="w-8 h-8 mx-auto shadow-xl shadow-blue-200 dark:shadow-none mb-6" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {type === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {type === 'login' 
              ? 'Enter your credentials to access your workspace' 
              : 'Join thousands of organizations using ReachOut'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'signup' && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                {inviteCode ? (
                  <div className="text-center py-2 space-y-1">
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">You're Invited!</p>
                    <div className="flex items-center justify-center gap-2 text-gray-900 dark:text-white font-bold">
                      <LinkIcon className="w-4 h-4 text-blue-500" />
                      <span>Joining Organization</span>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{inviteCode}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-center mb-2">Registration Type</p>
                    <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSignupMode('create')}
                        className={cn(
                          "flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                          signupMode === 'create' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        )}
                      >
                        <Building2 className="w-4 h-4" />
                        New Organization
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupMode('join')}
                        className={cn(
                          "flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                          signupMode === 'join' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        )}
                      >
                        <Users className="w-4 h-4" />
                        Joining Existing
                      </button>
                    </div>

                    {signupMode === 'join' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          Enter Join Code (Organization ID)
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. org_87921931766"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm dark:text-white dark:placeholder:text-slate-500"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <p className="text-[10px] text-blue-500/70 dark:text-blue-400/50 font-medium px-1">
                          Paste the code provided by your administrator.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Password</label>
                {/* {type === 'login' && (
                  <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</button>
                )} */}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{type === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* 
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative px-4 bg-white text-sm text-gray-500">Or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <Chrome className="w-5 h-5" />
                <span>Google</span>
              </button>
              <button 
                type="button"
                className="flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <Apple className="w-5 h-5" />
                <span>Apple</span>
              </button>
            </div>
          </div>
          */}
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link 
            to={type === 'login' ? '/signup' : '/login'} 
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {type === 'login' ? 'Sign up' : 'Log in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
