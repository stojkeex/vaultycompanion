import { useState, useEffect } from "react";
import vaultyWordmark from "@/assets/vaulty-wordmark.png";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import { useLocation, Link } from "wouter";
import { 
  Search, Bell, Heart, User, Home as HomeIcon, MessageSquare, ShoppingBag, Compass, ChevronRight, Settings, Zap, History, X, Plus, Newspaper, Megaphone, Shield, Ban, AlertTriangle, Trash2, MoreVertical, Globe, Menu, Users, PlaySquare, Venus, MarsStroke
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FloatingAdminButton } from "@/components/admin/floating-admin-button";
import { UserModeration } from "@/components/superadmin/UserModeration";

// Assets
import swimsuitThumb from "../assets/character/swimsuit_blue_thumb.webp";
import ryanImg from "@assets/IMG_8796_1767366590748.jpeg";
import spotlightBanner from "@assets/IMG_9019_1767709920427.png";
import sophiaImg from "@assets/IMG_8799_1767366590748.jpeg";
import maxImg from "@assets/IMG_8795_1767366590748.jpeg";
import elenaImg from "@assets/IMG_8798_1767366590748.jpeg";
import theoImg from "@assets/IMG_8794_1767366590748.jpeg";
import bellaImg from "@assets/IMG_8797_1767366590748.jpeg";
import nikyImg from "@assets/IMG_8952_1767682554090.jpeg";
import valeriaImg from "@assets/IMG_8956_1767683307052.jpeg";
import annaImg from "@assets/IMG_8958_1767689408490.jpeg";
import jadeImg from "@assets/IMG_8960_1767689615990.jpeg";
import yunaImg from "@assets/IMG_8973_1767692329336.jpeg";
import miaImg from "@assets/IMG_8977_1767693713035.jpeg";
import veronicaImg from "@assets/IMG_8979_1767694075722.jpeg";
import lunaImg from "@assets/IMG_8981_1767694478852.jpeg";
import chloeImg from "@assets/IMG_8988_1767698509468.jpeg";
import newYearBanner from "../assets/new-year-sale.png";

// Video imports
import swimsuitVid from "../assets/videos/swimsuit_blue.mp4";
import whiteHairVid from "../assets/videos/white_hair.mp4";
import blondeWhiteVid from "../assets/videos/blonde_white_shirt.mp4";
import lastVid from "../assets/videos/last_video.mp4";
import nikyVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_70a8849d_1767682554090.mp4";
import valeriaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_d10863e0_1767683307052.mp4";
import annaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_add9d00b_1767689408490.mp4";
import jadeVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_ae265ca1_1767689615990.mp4";
import yunaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_25e19726_1767692329336.mp4";
import miaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_2908a189_1767693713035.mp4";
import veronicaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_b5be595f_1767694075722.mp4";
import lunaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_598d8a2c_1767694478852.mp4";
import chloeVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_e64a1d83_1767698509468.mp4";
import sofiaImg from "@assets/IMG_9006_1767707150752.jpeg";
import sofiaVid from "@assets/_users_b12e6f4f-f474-4395-a799-79f00488d6aa_generated_bef072ed_1767707150753.mp4";
import zaraImg from "@assets/IMG_9131_1767782921105.jpeg";
import zaraVid from "@assets/_users_0ca61619-333e-41b7-85c4-cfb871ff3e15_generated_d58fd00a_1767782921105.mp4";

const CATEGORIES = [
  { id: "girls", name: "Girls", icon: Venus },
  { id: "anime", name: "Anime", icon: PlaySquare },
  { id: "guys", name: "Guys", icon: MarsStroke },
];

const RECOMMENDED_TEMPLATES = [
  { id: "mila", name: "Mila", age: 24, photoURL: swimsuitThumb, videoURL: swimsuitVid, bio: "Ready for a beach day? Deep conversations and sunny vibes await.", gender: "woman", isNew: true },
  { id: "zara", name: "Zara", age: 24, photoURL: zaraImg, videoURL: zaraVid, bio: "Protecting the streets with a smile. Always on duty for good vibes and coffee.", gender: "woman", isNew: true },
  { id: "luna", name: "Luna", age: 22, photoURL: lunaImg, videoURL: lunaVid, bio: "Mysterious gaze and a heart of gold. Polish beauty with a love for starry nights.", gender: "woman", isNew: true },
  { id: "mia", name: "Mia", age: 21, photoURL: miaImg, videoURL: miaVid, bio: "Living life one adventure at a time. Coffee lover and sunshine seeker.", gender: "woman", isNew: true },
  { id: "sofia", name: "Sofia", age: 23, photoURL: sofiaImg, videoURL: sofiaVid, bio: "Italian soul with a passion for art and espresso. Chasing the golden hour in Rome.", gender: "woman", isNew: true },
  { id: "chloe", name: "Chloe", age: 22, photoURL: chloeImg, videoURL: chloeVid, bio: "Sweet as honey with a rebellious streak. Exploring the hidden gems of Tokyo.", gender: "woman", isNew: true },
  { id: "veronica", name: "Veronica", age: 23, photoURL: veronicaImg, videoURL: veronicaVid, bio: "Sun, sand, and Ukrainian soul. Chasing dreams and infinite summers.", gender: "woman", isNew: true },
  { id: "ryan", name: "Ryan", age: 24, photoURL: ryanImg, bio: "Tech enthusiast and gamer.", gender: "man", isNew: true },
  { id: "max", name: "Max", age: 28, photoURL: maxImg, bio: "Fitness coach and personal trainer.", gender: "man", isNew: false },
  { id: "theo", name: "Theo", age: 22, photoURL: theoImg, bio: "Musician and soulful thinker.", gender: "man", isNew: false },
  { id: "niky", name: "Niky", age: 22, photoURL: nikyImg, videoURL: nikyVid, bio: "Elegant and sophisticated, with a touch of mystery.", gender: "woman", isNew: true },
  { id: "valeria", name: "Valeria", age: 25, photoURL: valeriaImg, videoURL: valeriaVid, bio: "Bold, ambitious, and always chasing the next sunset.", gender: "woman", isNew: true },
  { id: "anna", name: "Anna", age: 23, photoURL: annaImg, videoURL: annaVid, bio: "Warm heart, sharp mind, and a love for deep late-night talks.", gender: "woman", isNew: true },
  { id: "jade", name: "Jade", age: 24, photoURL: jadeImg, videoURL: jadeVid, bio: "Sun-kissed skin and a soul that craves the ocean breeze.", gender: "woman", isNew: true },
  { id: "yuna", name: "Yuna", age: 22, photoURL: yunaImg, videoURL: yunaVid, bio: "Serene, composed, and effortlessly chic. A true Seoul soul.", gender: "woman", isNew: true },
];

export default function Home() {
  const { user, userData, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isNewsPanelOpen, setIsNewsPanelOpen] = useState(false);
  const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [newsForm, setNewsForm] = useState({ title: "", content: "", image: "" });
  const [customCompanions, setCustomCompanions] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleCreateNews = async () => {
    if (!newsForm.title || !newsForm.content) return;
    try {
      const { addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "news"), {
        ...newsForm,
        createdAt: serverTimestamp(),
        authorId: user?.uid,
        authorEmail: user?.email
      });
      setNewsForm({ title: "", content: "", image: "" });
      setIsCreateNewsOpen(false);
      toast.success("News published!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to publish news");
    }
  };

  const isSuper = user?.email === "sezunmaj@gmail.com";

  const handleDeleteNews = async (newsId: string) => {
    if (!isSuper) return;
    if (!confirm("Are you sure you want to delete this news?")) return;
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "news", newsId));
      toast.success("News deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete news");
    }
  };

  // Check if we should override for debugging
  console.log("Current user email:", user?.email);
  console.log("Is superadmin:", isSuper);
  const [allPublished, setAllPublished] = useState<any[]>([]);
  const newsFileInputRef = useState<any>(null); // We'll use a local ref for file upload

  const handleNewsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsForm({ ...newsForm, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  const [activeCategory, setActiveCategory] = useState("girls");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
    setCustomCompanions(saved);
    setLoading(false);
  }, []);

  const getFilteredContent = () => {
    const allContent = [
      ...RECOMMENDED_TEMPLATES,
      ...customCompanions.map(c => ({
        ...c,
        photoURL: c.avatar,
        gender: c.appearance?.gender?.toLowerCase() === "man" ? "man" : "woman",
        bio: c.behavior || "AI Companion"
      }))
    ];

    return allContent.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeCategory === "girls") return matchesSearch && c.gender === "woman";
      if (activeCategory === "guys") return matchesSearch && c.gender === "man";
      // Za anime zaenkrat uporabljamo placeholder ali isNew, ker nimamo isAnime flaga
      if (activeCategory === "anime") return matchesSearch && (c.isAnime || c.id === "sophia"); 
      return matchesSearch;
    });
  };

  const filteredContent = getFilteredContent();

  const [allUsers, setAllUsers] = useState<any[]>([]);
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white/10 overflow-x-hidden pb-32 md:pl-[280px] md:pb-0">
      <FloatingAdminButton onClick={() => setIsAdminPanelOpen(true)} />
      
      {/* Sidebar Trigger - mobile only */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white/5 backdrop-blur-md border border-white/10 border-l-0 rounded-r-2xl p-3 hover:bg-white/10 transition-all active:scale-95 shadow-2xl"
      >
        <ChevronRight className="w-5 h-5 text-white/50" />
      </button>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:left-[280px] bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <img src={vaultyWordmark} alt="Vaulty" className="h-6 w-auto" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-32 md:w-64"
              />
            </div>
            <button 
              onClick={() => setIsNewsPanelOpen(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-zinc-400"
            >
              <Megaphone size={16} />
            </button>
          </div>
        </div>

        {/* Categories Tab Bar (STICKY below header) */}
        <div className="flex items-center justify-center gap-8 border-t border-white/5 bg-black/40 px-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative py-3 px-2 flex items-center gap-2 transition-all",
                  active ? "text-pink-500" : "text-zinc-500 hover:text-white"
                )}
              >
                <Icon size={16} className={cn(active ? "fill-pink-500/20" : "")} />
                <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                {active && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 pt-32">
        {/* Vaulty Spotlight Banner */}
        <div className="py-3 mb-6">
          <Link href="/premium">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full aspect-[21/9] md:aspect-[21/3.5] rounded-xl bg-zinc-900/40 border border-white/10 overflow-hidden relative group cursor-pointer shadow-2xl shadow-pink-500/10"
              data-testid="banner-spotlight"
            >
              <img 
                src={spotlightBanner} 
                alt="Vaulty Spotlight" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
              
              {/* Subtle noise/texture overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filteredContent.map((item) => {
            return (
              <Link key={item.id} href={`/companion/${item.id}`}>
                {/* Preload video in background */}
                {item.videoURL && (
                  <video
                    src={item.videoURL}
                    className="hidden"
                    preload="auto"
                    muted
                  />
                )}
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="relative aspect-[3/4.5] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 group cursor-pointer"
                >
                  {/* Layer 2: Visual Content (Image Only) */}
                  <div className="absolute inset-0 z-10">
                    <img 
                      src={item.photoURL} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Layer 3: Overlays (Badges, Info) */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Status Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {item.isNew && (
                        <div className="bg-pink-500/90 backdrop-blur-md text-[10px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                          <Zap size={10} className="fill-white" />
                          New
                        </div>
                      )}
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-black tracking-tight">{item.name}</h3>
                        <span className="text-zinc-400 text-sm font-bold">{item.age}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-medium line-clamp-2 leading-tight opacity-90">
                        {item.bio}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
          </div>

        {filteredContent.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No companions found</p>
          </div>
        )}
      </main>

      {/* News Panel */}
      <AnimatePresence>
        {isNewsPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsNewsPanelOpen(false)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" 
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              className="fixed inset-0 bg-[#0A0A0A] z-[110] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">News & Updates</h2>
                <div className="flex items-center gap-4">
                  {isSuper && (
                    <Button 
                      onClick={() => setIsCreateNewsOpen(true)}
                      className="bg-white text-black hover:bg-zinc-200 font-bold px-6 rounded-full"
                    >
                      Create News
                    </Button>
                  )}
                  <button onClick={() => setIsNewsPanelOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-zinc-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                {news.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 relative group">
                    {isSuper && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNews(item.id);
                        }}
                        className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all z-50 pointer-events-auto flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Delete News"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full aspect-video object-cover rounded-2xl" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </div>
                  </div>
                ))}
                {news.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No news yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create News Panel */}
      <AnimatePresence>
        {isCreateNewsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsCreateNewsOpen(false)} 
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120]" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] z-[130] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Create News</h2>
                <button onClick={() => setIsCreateNewsOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Title</Label>
                  <Input 
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                    placeholder="News title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Image</Label>
                  <div 
                    onClick={() => document.getElementById('news-image-upload')?.click()}
                    className="w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden group"
                  >
                    {newsForm.image ? (
                      <img src={newsForm.image} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Plus className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors mb-2" />
                        <span className="text-xs font-bold text-zinc-500">Click to upload image</span>
                      </>
                    )}
                  </div>
                  <input 
                    id="news-image-upload"
                    type="file" 
                    onChange={handleNewsImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Content</Label>
                  <textarea 
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                    className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="Write news content..."
                  />
                </div>
                <Button 
                  onClick={handleCreateNews}
                  className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl"
                >
                  Publish News
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - always visible on md+ */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-[280px] bg-[#0A0A0A] border-r border-white/5 z-[40] flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="mb-8">
            <img src={vaultyWordmark} alt="Vaulty" className="h-6 w-auto" />
          </div>
          <Link href="/profile">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white transition-all overflow-hidden">
                {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <User size={24} />}
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">{userData?.username || user?.email?.split('@')[0]}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-pink-500 transition-colors">View Profile</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { icon: HomeIcon, label: "Home", href: "/home" },
            { icon: Compass, label: "Discovery", href: "/home" },
            { icon: PlaySquare, label: "Live", href: "/live" },
            { icon: Zap, label: "Premium", href: "/premium", highlight: true },
            { icon: Newspaper, label: "News", onClick: () => setIsNewsPanelOpen(true) },
            { icon: History, label: "History", href: "/recent-chats" },
            { icon: Settings, label: "Settings", href: "/settings" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else if (item.href) setLocation(item.href);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                item.highlight ? "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20" : "hover:bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              <item.icon size={20} strokeWidth={2.5} className={cn("transition-transform group-hover:scale-110", item.highlight ? "fill-pink-500/20" : "")} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
          <button
            onClick={() => {
              const { auth } = require("@/lib/firebase");
              auth.signOut();
              setLocation("/login");
            }}
            className="w-full flex items-center gap-4 text-zinc-500 hover:text-white transition-all group font-bold text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - drawer (hidden on desktop) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[140] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-[#0A0A0A] border-r border-white/5 z-[150] flex flex-col shadow-2xl md:hidden"
            >
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Menu</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500">
                    <X size={20} />
                  </button>
                </div>
                <Link href="/profile">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white transition-all overflow-hidden">
                      {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <User size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{userData?.username || user?.email?.split('@')[0]}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-pink-500 transition-colors">View Profile</p>
                    </div>
                  </div>
                </Link>
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {[
                  { icon: HomeIcon, label: "Home", href: "/home" },
                  { icon: Compass, label: "Discovery", href: "/home" },
                  { icon: PlaySquare, label: "Live", href: "/live" },
                  { icon: Zap, label: "Premium", href: "/premium", highlight: true },
                  { icon: Newspaper, label: "News", onClick: () => { setSidebarOpen(false); setIsNewsPanelOpen(true); } },
                  { icon: History, label: "History", href: "/recent-chats" },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else if (item.href) setLocation(item.href);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                      item.highlight ? "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20" : "hover:bg-white/5 text-zinc-400 hover:text-white"
                    )}
                  >
                    <item.icon size={20} strokeWidth={2.5} className={cn("transition-transform group-hover:scale-110", item.highlight ? "fill-pink-500/20" : "")} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={() => {
                    const { auth } = require("@/lib/firebase");
                    auth.signOut();
                    setLocation("/login");
                  }}
                  className="w-full flex items-center gap-4 text-zinc-500 hover:text-white transition-all group font-bold text-sm"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
