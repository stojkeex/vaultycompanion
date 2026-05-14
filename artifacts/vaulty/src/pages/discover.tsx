import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Search, X, Zap, SlidersHorizontal, Venus, MarsStroke, PlaySquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

import swimsuitThumb from "../assets/character/swimsuit_blue_thumb.webp";
import ryanImg from "@assets/IMG_8796_1767366590748.jpeg";
import maxImg from "@assets/IMG_8795_1767366590748.jpeg";
import theoImg from "@assets/IMG_8794_1767366590748.jpeg";
import nikyImg from "@assets/IMG_8952_1767682554090.jpeg";
import valeriaImg from "@assets/IMG_8956_1767683307052.jpeg";
import annaImg from "@assets/IMG_8958_1767689408490.jpeg";
import jadeImg from "@assets/IMG_8960_1767689615990.jpeg";
import yunaImg from "@assets/IMG_8973_1767692329336.jpeg";
import miaImg from "@assets/IMG_8977_1767693713035.jpeg";
import veronicaImg from "@assets/IMG_8979_1767694075722.jpeg";
import lunaImg from "@assets/IMG_8981_1767694478852.jpeg";
import chloeImg from "@assets/IMG_8988_1767698509468.jpeg";
import sofiaImg from "@assets/IMG_9006_1767707150752.jpeg";
import zaraImg from "@assets/IMG_9131_1767782921105.jpeg";

const BASE_COMPANIONS = [
  { id: "mila", name: "Mila", age: 24, photoURL: swimsuitThumb, bio: "Ready for a beach day? Deep conversations and sunny vibes await.", gender: "woman", isNew: true },
  { id: "zara", name: "Zara", age: 24, photoURL: zaraImg, bio: "Protecting the streets with a smile. Always on duty for good vibes and coffee.", gender: "woman", isNew: true },
  { id: "luna", name: "Luna", age: 22, photoURL: lunaImg, bio: "Mysterious gaze and a heart of gold. Polish beauty with a love for starry nights.", gender: "woman", isNew: true },
  { id: "mia", name: "Mia", age: 21, photoURL: miaImg, bio: "Living life one adventure at a time. Coffee lover and sunshine seeker.", gender: "woman", isNew: true },
  { id: "sofia", name: "Sofia", age: 23, photoURL: sofiaImg, bio: "Italian soul with a passion for art and espresso. Chasing the golden hour in Rome.", gender: "woman", isNew: true },
  { id: "chloe", name: "Chloe", age: 22, photoURL: chloeImg, bio: "Sweet as honey with a rebellious streak. Exploring the hidden gems of Tokyo.", gender: "woman", isNew: true },
  { id: "veronica", name: "Veronica", age: 23, photoURL: veronicaImg, bio: "Sun, sand, and Ukrainian soul. Chasing dreams and infinite summers.", gender: "woman", isNew: true },
  { id: "niky", name: "Niky", age: 22, photoURL: nikyImg, bio: "Elegant and sophisticated, with a touch of mystery.", gender: "woman", isNew: true },
  { id: "valeria", name: "Valeria", age: 25, photoURL: valeriaImg, bio: "Bold, ambitious, and always chasing the next sunset.", gender: "woman", isNew: true },
  { id: "anna", name: "Anna", age: 23, photoURL: annaImg, bio: "Warm heart, sharp mind, and a love for deep late-night talks.", gender: "woman", isNew: true },
  { id: "jade", name: "Jade", age: 24, photoURL: jadeImg, bio: "Sun-kissed skin and a soul that craves the ocean breeze.", gender: "woman", isNew: true },
  { id: "yuna", name: "Yuna", age: 22, photoURL: yunaImg, bio: "Serene, composed, and effortlessly chic. A true Seoul soul.", gender: "woman", isNew: true },
  { id: "ryan", name: "Ryan", age: 24, photoURL: ryanImg, bio: "Tech enthusiast and gamer.", gender: "man", isNew: true },
  { id: "max", name: "Max", age: 28, photoURL: maxImg, bio: "Fitness coach and personal trainer.", gender: "man", isNew: false },
  { id: "theo", name: "Theo", age: 22, photoURL: theoImg, bio: "Musician and soulful thinker.", gender: "man", isNew: false },
];

const FILTERS = [
  { id: "all", label: "All", icon: SlidersHorizontal },
  { id: "woman", label: "Girls", icon: Venus },
  { id: "man", label: "Guys", icon: MarsStroke },
  { id: "anime", label: "Anime", icon: PlaySquare },
];

export default function Discover() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [customCompanions, setCustomCompanions] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "companions"), (snap) => {
      setCustomCompanions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const allCompanions = [...BASE_COMPANIONS, ...customCompanions];

  const filtered = allCompanions.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.bio && c.bio.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      activeFilter === "all" ||
      (activeFilter === "anime" ? c.gender === "anime" : c.gender === activeFilter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden pb-32 md:pl-[280px] md:pb-8">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 md:left-[280px]">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-4 space-y-4">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Discover</h1>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              autoFocus
              placeholder="Search companions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder-zinc-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all",
                    active
                      ? "bg-white text-black"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10"
                  )}
                >
                  <Icon size={13} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {search && (
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </p>
        )}

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-7 h-7 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-bold">No companions found</p>
            <p className="text-zinc-600 text-sm">Try a different name or filter</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <Link href={`/companion/${item.id}`}>
                    <div className="relative aspect-[3/4.5] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 group cursor-pointer">
                      <img
                        src={item.photoURL}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                        {item.isNew && (
                          <div className="bg-pink-500/90 backdrop-blur-md text-[10px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                            <Zap size={10} className="fill-white" />
                            New
                          </div>
                        )}
                      </div>

                      {/* Info overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-lg font-black tracking-tight">{item.name}</h3>
                          {item.age && <span className="text-zinc-400 text-sm font-bold">{item.age}</span>}
                        </div>
                        <p className="text-[11px] text-zinc-300 font-medium line-clamp-2 leading-tight opacity-90 mt-0.5">
                          {item.bio}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
