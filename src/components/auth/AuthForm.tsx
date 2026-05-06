import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Building2, Users, Shield, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '../layout/Logo';
=======
import { Mail, Lock, ArrowRight, Apple, Chrome, Loader2, AlertCircle, Building2, Users, Shield, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '../layout/Logo';
import api from '@/lib/api';
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366

interface AuthFormProps {
  type: 'login' | 'signup';
}
export function AuthForm({ type }: AuthFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('invite');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [signupMode, setSignupMode] = useState<'create' | 'join'>(inviteCode ? 'join' : 'create');
  const [joinCode, setJoinCode] = useState(inviteCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
=======
  const [systemConfig, setSystemConfig] = useState<any>({ registrationsEnabled: true });

  useEffect(() => {
    // If invite code changes in URL, update state
    if (inviteCode && type === 'signup') {
      setSignupMode('join');
      setJoinCode(inviteCode);
    }
  }, [inviteCode, type]);
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
<<<<<<< HEAD
      const endpoint = type === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body = type === 'signup' 
        ? { email, password, name, orgName: signupMode === 'create' ? orgName : undefined, joinCode: signupMode === 'join' ? joinCode : undefined }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
=======
      if (type === 'signup') {
        const response = await api.post('/auth/register', {
          email,
          password,
          displayName: email.split('@')[0],
          inviteCode: signupMode === 'join' ? joinCode : undefined
        });
        
        localStorage.setItem('token', response.data.token);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      } else {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366
      }

      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect
      navigate('/');
    } catch (err: any) {
      console.error('Auth error:', err);
<<<<<<< HEAD
      setError(err.message || 'An error occurred during authentication');
=======
      setError(err.response?.data?.message || 'Authentication failed');
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                {signupMode === 'create' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Organization Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="My Company Ltd"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
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
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
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
