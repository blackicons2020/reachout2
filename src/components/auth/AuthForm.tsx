import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Building2, Users, Shield, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '../layout/Logo';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [signupMode, setSignupMode] = useState<'create' | 'join'>(inviteCode ? 'join' : 'create');
  const [joinCode, setJoinCode] = useState(inviteCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = type === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body = type === 'signup' 
        ? { 
            email, 
            password, 
            name: name || email.split('@')[0], 
            orgName: signupMode === 'create' ? (orgName || 'My Organization') : undefined, 
            joinCode: signupMode === 'join' ? joinCode : undefined 
          }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));

      // Redirect
      navigate('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] p-4">
      <div className="w-full max-w-[340px] space-y-4">
        <div className="text-center">
          <Logo className="w-7 h-7 mx-auto mb-3 text-gray-500 dark:text-gray-400" size={28} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {type === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {type === 'login' 
              ? 'Enter your credentials to access your workspace' 
              : 'Join thousands of organizations using ReachOut'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'signup' && (
              <div className="space-y-6">
                {/* Registration Type Selection */}
                <div className="p-3 bg-slate-900/40 dark:bg-slate-950/50 rounded-xl border border-white/5 dark:border-white/5">
                  <label className="block text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] text-center mb-3">
                    Registration Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/30 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setSignupMode('create')}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md transition-all text-[10px] font-bold uppercase tracking-wider",
                        signupMode === 'create'
                          ? "bg-slate-800 text-blue-400 shadow-md border border-white/10"
                          : "text-slate-500 hover:bg-white/5"
                      )}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>New Org</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupMode('join')}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md transition-all text-[10px] font-bold uppercase tracking-wider",
                        signupMode === 'join'
                          ? "bg-slate-800 text-blue-400 shadow-md border border-white/10"
                          : "text-slate-500 hover:bg-white/5"
                      )}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Join Org</span>
                    </button>
                  </div>
                </div>

                {signupMode === 'join' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invite Code</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text"
                        required
                        placeholder="ORG-123-ABC"
                        className="w-full pl-12 pr-4 py-4 bg-blue-50/50 dark:bg-slate-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 dark:bg-slate-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-blue-50/50 dark:bg-slate-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 text-sm"
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
