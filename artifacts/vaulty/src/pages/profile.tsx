import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, Link } from "wouter";
import { 
  Settings, Edit2, ShieldCheck, Instagram, 
  DollarSign, Star, Image as ImageIcon, MessageSquare,
  ChevronRight, Heart, CheckCircle2, LayoutGrid, Ghost
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      });

      // Fetch actual characters from Firestore
      const setupCharacterListener = async () => {
        const { collection, query, where, onSnapshot: onSnapshotColl } = await import("firebase/firestore");
        const q = query(collection(db, "companions"), where("creatorId", "==", user.uid));
        return onSnapshotColl(q, (snap) => {
          const chars = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCharacters(chars);
        });
      };
      
      let charUnsub: any;
      setupCharacterListener().then(un => charUnsub = un);
      
      // Load simulated subscriptions from localStorage
      const mockCelebrities = [
        { id: "drake", displayName: "Drake", username: "champagnepapi", photoURL: "https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "mrbeast", displayName: "MrBeast", username: "mrbeast", photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "kimkardashian", displayName: "Kim Kardashian", username: "kimkardashian", photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "cristiano", displayName: "Cristiano Ronaldo", username: "cristiano", photoURL: "https://images.unsplash.com/photo-1544161515-4af6b1d8656f?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "taylorswift", displayName: "Taylor Swift", username: "taylorswift", photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "elonmusk", displayName: "Elon Musk", username: "elonmusk", photoURL: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "zendaya", displayName: "Zendaya", username: "zendaya", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "theweeknd", displayName: "The Weeknd", username: "theweeknd", photoURL: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "rihanna", displayName: "Rihanna", username: "badgalriri", photoURL: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&auto=format&fit=crop&q=60", isVerified: true },
        { id: "lebron", displayName: "LeBron James", username: "kingjames", photoURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=60", isVerified: true }
      ];
      
      const subIds = JSON.parse(localStorage.getItem('vaulty_subscriptions') || '[]');
      const filtered = mockCelebrities.filter(c => subIds.includes(c.id));
      setMySubscriptions(filtered);
      
      return () => {
        unsub();
        if (charUnsub) charUnsub();
      };
    }
  }, [user]);

  if (!user || !userData) return null;

  const isCelebrity = userData.role === "celebrity";

  return (
    <div className="min-h-screen pb-32 font-sans bg-[#050505] text-white">
      {/* Header Actions */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center relative z-20">
        <h1 className="text-xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 bg-clip-text text-transparent [-webkit-background-clip:text]">
          My Profile
        </h1>
        <div className="flex gap-2">
          <Link href="/edit-profile">
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
              <Edit2 size={18} />
            </button>
          </Link>
          <Link href="/settings">
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
              <Settings size={18} />
            </button>
          </Link>
        </div>
      </div>

      <div className="px-6 pt-4 relative z-10 space-y-8">
        {/* Profile Header Card */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">{userData.displayName}</h2>
            {userData.isVerified && (
              <div className="flex justify-center mt-1">
                <div className="bg-white rounded-full p-1">
                  <CheckCircle2 size={16} className="text-black" fill="currentColor" />
                </div>
              </div>
            )}
            <p className="text-white/40 font-bold text-xs tracking-[0.2em] uppercase">@{userData.username}</p>
          </div>
          
          <p className="text-white/60 font-medium italic leading-relaxed mt-4 px-8 text-sm">
            "{userData.bio || "No bio set yet. Share your story with your fans!"}"
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-12 py-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black italic tracking-tighter">
              {userData.followersCount || 0}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">Followers</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black italic tracking-tighter">{characters.length}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">Characters</span>
          </div>
        </div>

        {/* Characters Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <LayoutGrid size={18} className="text-white/40" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">My Creations</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {characters.length > 0 ? (
              characters.map((char) => (
                <Link key={char.id} href={`/messages/${char.id}`}>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 bg-white/5"
                  >
                    <img 
                      src={char.avatar || char.avatarUrl} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={char.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <p className="text-sm font-black uppercase tracking-tight">{char.name}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{char.role || char.category}</p>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 py-12 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-3">
                <Ghost className="text-white/10" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No creations yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Celebrity Monetization Info */}
        {isCelebrity && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Earnings Setup</h3>
            <div className="bg-card rounded-3xl border border-border overflow-hidden">
              <div className="p-6 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent rounded-2xl"><DollarSign size={20} className="text-green-500" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly</p>
                    <p className="font-black uppercase italic tracking-tighter text-xl">${userData.monthlyPrice}</p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent rounded-2xl"><Star size={20} className="text-yellow-500" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lifetime</p>
                    <p className="font-black uppercase italic tracking-tighter text-xl">${userData.lifetimePrice}</p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {userData.socialLink && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Connected</h3>
            <a href={userData.socialLink} target="_blank" rel="noreferrer">
              <div className="flex items-center gap-4 p-6 bg-card rounded-3xl border border-border hover:border-primary/20 transition-all">
                <Instagram className="text-pink-500" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Social Profile</p>
                  <p className="font-black uppercase italic tracking-tighter text-lg truncate">{userData.socialLink}</p>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </div>
            </a>
          </div>
        )}

        {/* My Subscriptions */}
        {!isCelebrity && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-2">My Subscriptions</h3>
            <div className="flex flex-wrap gap-4 px-2">
              {mySubscriptions.length > 0 ? mySubscriptions.map((sub) => (
                <Link key={sub.id} href={`/user/${sub.id}`}>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/30 transition-all p-1">
                      <img 
                        src={sub.photoURL} 
                        className="w-full h-full object-cover rounded-full" 
                        alt={sub.displayName} 
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[80px]">{sub.displayName}</span>
                        <CheckCircle2 size={10} className="text-blue-500 fill-blue-500/10 shrink-0" />
                      </div>
                      <span className="text-[8px] font-bold uppercase text-green-500 tracking-tighter">
                        ACTIVE
                      </span>
                    </div>
                  </motion.div>
                </Link>
              )) : (
                <div className="w-full py-12 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center space-y-3">
                  <ShieldCheck className="text-muted-foreground" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No active subscriptions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullScreen(false)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={userData.photoURL || "https://github.com/shadcn.png"}
              className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl"
              alt="Profile"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
