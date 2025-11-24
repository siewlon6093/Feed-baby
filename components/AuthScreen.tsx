
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { authService } from '../services/authService';
import { ArrowRight, Lock, Mail, User as UserIcon, Loader2, Footprints } from 'lucide-react';
import { Logo } from './Logo';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        user = await authService.signup(name, email, password);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
      const guestUser: User = {
          id: 'guest_user',
          name: 'Guest Parent',
          email: 'guest@local',
          createdAt: Date.now(),
          isGuest: true
      };
      onSuccess(guestUser);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#FDFBF7] font-['Quicksand']">
      
      {/* Ambient Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
            x: [0, -50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 -left-20 w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[100px]"
        />
        <motion.div 
           animate={{ 
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-[80px]"
        />
      </div>

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px] mx-6"
      >
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] rounded-[40px] p-8 sm:p-12">
          
          {/* Header Section */}
          <div className="text-center mb-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-white rounded-[24px] mb-6 shadow-lg shadow-indigo-100/50 flex items-center justify-center border border-indigo-50"
            >
              <Logo className="w-12 h-12" color="text-indigo-500" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-slate-800 mb-2"
            >
              {isLogin ? 'Welcome back' : 'Begin Journey'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 font-medium"
            >
              {isLogin ? 'Your baby\'s milestones, safe & sound.' : 'Create a secure space for your family.'}
            </motion.p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      className="w-full pl-14 pr-6 h-16 bg-slate-50/80 border border-slate-200/60 rounded-3xl focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full pl-14 pr-6 h-16 bg-slate-50/80 border border-slate-200/60 rounded-3xl focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full pl-14 pr-6 h-16 bg-slate-50/80 border border-slate-200/60 rounded-3xl focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50">
                  Forgot password?
                </button>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-rose-500 text-sm text-center font-bold bg-rose-50 py-3 rounded-2xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-3xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={20} className="opacity-80" />
                  </>
              )}
            </motion.button>
          </form>

          <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGuestLogin}
            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
          >
             <Footprints size={16} className="opacity-50" />
             Continue as Guest
          </motion.button>

          {/* Footer Switch */}
          <div className="mt-6 text-center">
             <p className="text-sm text-slate-500 font-medium">
                {isLogin ? "New to Nurture?" : "Been here before?"}
                <button 
                  onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                  }}
                  className="ml-2 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {isLogin ? "Create Account" : "Sign In"}
                </button>
             </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
