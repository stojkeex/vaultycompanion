import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, Link } from "wouter";
import { Loader2, Mail, Lock, User, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import vaultyWordmark from "@/assets/vaulty-wordmark.png";
import landingBg from "@assets/IMG_1135_1778754185910.jpeg";

export default function Register() {
  const { register } = useAuth();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !retypePassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== retypePassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Check if age verified in localStorage
    const isAgeVerified = localStorage.getItem("vaulty_age_verified");
    if (!isAgeVerified) {
      setShowAgeVerification(true);
      return;
    }

    await proceedWithRegistration();
  };

  const proceedWithRegistration = async () => {
    setLoading(true);
    setError("");
    try {
      await register(email, password, username);
      setLocation("/create-profile");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgeConfirm = (confirmed: boolean) => {
    if (confirmed) {
      localStorage.setItem("vaulty_age_verified", "true");
      setShowAgeVerification(false);
      proceedWithRegistration();
    } else {
      // Redirect out of app or show error
      window.location.href = "https://www.google.com";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <img src={landingBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center">
          <img src={vaultyWordmark} alt="Vaulty" className="h-10 w-auto mx-auto mb-2" />
          <p className="text-zinc-500 text-sm mt-2 font-bold uppercase tracking-widest">Join the network</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Retype Password" 
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

          <button 
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </button>
        </div>

        <p className="text-zinc-500 text-sm text-center">
          Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Sign In</Link>
        </p>
      </div>

      {/* Age Verification Modal */}
      <AnimatePresence>
        {showAgeVerification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-10 text-center space-y-8 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Age Verification</h2>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  Vaulty Connect contains adult content. You must be at least <span className="text-white font-bold">18 years old</span> to enter.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAgeConfirm(false)}
                  className="py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 font-bold uppercase tracking-widest transition-all"
                >
                  No, Exit
                </button>
                <button
                  onClick={() => handleAgeConfirm(true)}
                  className="py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Yes, I'm 18+
                </button>
              </div>

              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                By clicking yes, you agree to our terms of service.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
