
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(username, password);

    if (success) {
      // Navigate based on the role of the user found in the mock database
      // We need to fetch the user again or rely on the state update (which might be async, 
      // but since we just called login, we can infer role from the 'success' logic if we had the user object,
      // however, 'currentUser' won't be updated in this render cycle immediately. 
      // NOTE: In a real app, login returns the user or token. 
      // For this mock, we know the user was found.
      
      // Temporary check to redirect correctly immediately
      if (username.includes('admin')) {
        navigate('/admin/reports');
      } else {
        navigate('/citizen/dashboard');
      }
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: "url('https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Group-82.png')"
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Top Logo */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
         <img 
            src="https://dev2.phoenix.com.ph/wp-content/uploads/2025/12/Seal_of_San_Juan_Metro_Manila.png" 
            alt="Seal of San Juan" 
            className="w-24 h-24 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
         />
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-primary-200 transition-colors font-medium z-30 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
      >
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Back to Home</span>
      </button>

      {/* Login Modal */}
      <div className="bg-white w-full max-w-[500px] rounded-[2rem] shadow-2xl overflow-hidden relative z-20 mx-4">
        {/* Decorative elements to mimic the watermark/illustration in the design */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
           <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EF4444" d="M45.7,-76.4C58.9,-69.3,69.1,-56.3,76.5,-42.1C83.9,-27.9,88.5,-12.4,85.6,1.7C82.7,15.8,72.3,28.5,62.3,40.3C52.3,52.1,42.7,62.9,30.8,69.6C18.9,76.3,4.7,78.9,-8.6,77.5C-21.9,76.1,-34.3,70.7,-45.5,62.6C-56.7,54.5,-66.7,43.7,-73.4,30.9C-80.1,18.1,-83.5,3.3,-79.9,-9.8C-76.3,-22.9,-65.7,-34.3,-53.9,-42.3C-42.1,-50.3,-29.1,-54.9,-16.2,-57.6C-3.3,-60.3,9.5,-61.1,22.6,-61.8" transform="translate(100 100)" />
           </svg>
        </div>

        <div className="p-10 md:px-14 md:py-12 relative">
           <h2 className="text-4xl font-bold text-center text-[#dc2626] mb-10 tracking-tight">Log in</h2>
           
           <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2 group">
                 <label className="text-[#1e3a8a] font-bold text-sm ml-1 group-focus-within:text-[#dc2626] transition-colors">Username</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full border-b border-slate-300 px-1 py-2 focus:outline-none focus:border-[#dc2626] transition-colors bg-transparent placeholder:text-slate-300 text-slate-800"
                   placeholder="enter your username"
                 />
              </div>

              <div className="space-y-2 group">
                 <label className="text-[#1e3a8a] font-bold text-sm ml-1 group-focus-within:text-[#dc2626] transition-colors">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full border-b border-slate-300 px-1 py-2 focus:outline-none focus:border-[#dc2626] transition-colors bg-transparent placeholder:text-slate-300 text-slate-800"
                   placeholder="enter your password"
                 />
              </div>

              <div className="flex justify-end pt-1">
                 <button type="button" className="text-xs text-slate-400 hover:text-slate-600 italic">
                   Forgot password?
                 </button>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-[#1e3a8a] text-white rounded-full py-3.5 font-bold text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 transform hover:scale-[1.02] active:scale-95"
                >
                  Log in
                </button>
                <div className="text-center text-xs text-slate-400 mt-2 space-y-1">
                    <p>Try admin: <span className="font-bold text-slate-600">admin / password123</span></p>
                    <p>Try user: <span className="font-bold text-slate-600">juan / password123</span></p>
                    <p>Try user: <span className="font-bold text-slate-600">pedro / password123</span></p>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 mt-8">
                 Not registered yet? <button type="button" className="text-[#dc2626] border-b border-[#dc2626] ml-1 hover:text-red-700 hover:border-red-700 transition-colors font-medium">Register Here</button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
