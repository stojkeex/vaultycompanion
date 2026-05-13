import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { User, Star, ArrowRight, Loader2, CheckCircle2, ShieldCheck, DollarSign, Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function CreateProfile() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Select Role, 2: Role Details
  const [role, setRole] = useState<"fan" | "celebrity" | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile Fields
  const [displayName, setDisplayName] = useState(userData?.displayName || "");
  
  // Celebrity Fields
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [lifetimePrice, setLifetimePrice] = useState("");
  const [verificationProof, setVerificationProof] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: "fan" | "celebrity") => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleCompleteProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      
      if (role === "fan") {
        await updateDoc(userRef, {
          role: "fan",
          displayName,
          profileCompleted: true,
          updatedAt: serverTimestamp()
        });
        setLocation("/home");
      } else {
        await updateDoc(userRef, {
          role: "celebrity",
          displayName,
          monthlyPrice: parseFloat(monthlyPrice),
          lifetimePrice: parseFloat(lifetimePrice),
          verificationProof: verificationProof || "https://images.unsplash.com/photo-1554224155-169641357599?w=800",
          isVerified: false,
          status: "pending_verification",
          profileCompleted: true,
          updatedAt: serverTimestamp()
        });
        setLocation("/verification-pending");
      }
    } catch (error) {
      console.error("Error completing profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">Choose Your Path</h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">How will you use Vaulty?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handleRoleSelect("fan")}
                  className="group relative p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all text-left overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">I'm a Fan</h3>
                      <p className="text-zinc-500 text-sm mt-1 leading-snug">Connect with your favorite stars and access exclusive content.</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </button>

                <button 
                  onClick={() => handleRoleSelect("celebrity")}
                  className="group relative p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all text-left overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors text-blue-500">
                      <Star className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">I'm a Star</h3>
                      <p className="text-zinc-500 text-sm mt-1 leading-snug">Monetize your content and build deeper connections with fans.</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">
                  {role === "fan" ? <User size={12} /> : <Star size={12} />}
                  {role === "fan" ? "Fan Profile" : "Star Verification"}
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">
                  {role === "fan" ? "Setup Profile" : "Verify Status"}
                </h1>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Rowan Atkinson"
                      className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>

                  {role === "celebrity" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Monthly ($)</label>
                          <input 
                            type="number" 
                            value={monthlyPrice}
                            onChange={(e) => setMonthlyPrice(e.target.value)}
                            placeholder="499"
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Lifetime ($)</label>
                          <input 
                            type="number" 
                            value={lifetimePrice}
                            onChange={(e) => setLifetimePrice(e.target.value)}
                            placeholder="49999"
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-zinc-900/50 border border-dashed border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="text-blue-500" size={20} />
                          <p className="text-xs font-bold uppercase tracking-wider">Verification Proof</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                          Upload an ID scan or a screenshot of your social media (e.g. Instagram with 1M+ followers) to prove your identity.
                        </p>
                        <button 
                          onClick={() => setVerificationProof("https://images.unsplash.com/photo-1554224155-169641357599?w=800")}
                          className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                          <ImageIcon size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload Proof</span>
                        </button>
                        {verificationProof && (
                          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl justify-center border border-green-500/20">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Proof Attached</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={handleCompleteProfile}
                  disabled={loading || !displayName || (role === 'celebrity' && (!monthlyPrice || !verificationProof))}
                  className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      {role === 'fan' ? 'Join Vaulty' : 'Submit for Verification'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button 
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
