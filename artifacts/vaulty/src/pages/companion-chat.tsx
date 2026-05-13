import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Mic, MoreVertical, Camera, Bot, X, Share2, ThumbsUp, ThumbsDown, Flag, MessageSquare, History, Palette, Pin, UserCircle, Type, ChevronRight, Volume2, Reply, Heart, Globe, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function CompanionChat() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/messages/:id");
  const [input, setInput] = useState("");
  const [companion, setCompanion] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const id = params?.id;
  const [activeTTS, setActiveTTS] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({ name: "", avatar: "", bio: "" });
  const publishFileInputRef = useRef<HTMLInputElement>(null);
  const { isPremium } = { isPremium: false }; // Mock premium state

  const SYSTEM_IDS = ["mila", "ryan", "sophia", "max", "elena", "theo", "bella"];

  const handlePublish = async () => {
    if (!publishForm.bio || publishForm.bio.length > 100) {
      toast.error("Description must be between 1 and 100 characters");
      return;
    }

    try {
      const companions = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
      const updated = companions.map((c: any) => {
        if (c.id === id) {
          return { 
            ...c, 
            name: publishForm.name, 
            avatar: publishForm.avatar, 
            bio: publishForm.bio, 
            isPublished: true 
          };
        }
        return c;
      });

      // Update Firestore
      const { db } = await import("@/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      const companionRef = doc(db, "companions", id!);
      await updateDoc(companionRef, {
        name: publishForm.name,
        avatar: publishForm.avatar,
        bio: publishForm.bio,
        isPublished: true
      });

      localStorage.setItem("vaulty_companions", JSON.stringify(updated));
      setCompanion(updated.find((c: any) => c.id === id));
      setShowPublishModal(false);
      toast.success("Character published successfully!");
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish to database");
    }
  };

  useEffect(() => {
    if (companion) {
      setPublishForm({
        name: companion.name,
        avatar: companion.avatar,
        bio: companion.bio || ""
      });
    }
  }, [companion]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      toast.info("Playing audio...");
    } else {
      toast.error("Speech synthesis not supported.");
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      toast.error("Speech recognition not supported.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast.error("Speech recognition error.");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];
  const VOICES = [
    { id: "v1", name: "Bella", type: "Soft & Kind", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "v2", name: "Marcus", type: "Deep & Calm", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "v3", name: "Luna", type: "Energetic", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: "v4", name: "Oliver", type: "Friendly", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
  ];
  const THEMES = Array.from({ length: 12 }, (_, i) => ({ 
    id: `t${i+1}`, 
    name: `Theme ${i+1}`, 
    preview: i % 3 === 0 ? "bg-gradient-to-br from-cyan-500 to-blue-600" : i % 3 === 1 ? "bg-gradient-to-br from-purple-500 to-pink-600" : "bg-gradient-to-br from-orange-500 to-red-600"
  }));

  useEffect(() => {
    if (id && user) {
      // User-specific like status
      const userLikedStatus = localStorage.getItem(`vaulty_liked_${id}_${user.uid}`) === 'true';
      setIsLiked(userLikedStatus);
      
      // Global like count (simulated)
      const savedLikes = parseInt(localStorage.getItem(`vaulty_likes_count_${id}`) || "0");
      setLikeCount(savedLikes);
    }
  }, [id, user]);

  const toggleLike = () => {
    if (!user) return;
    
    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);
    
    const newCount = newLikedStatus ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(newCount);
    
    // Save per-user status
    localStorage.setItem(`vaulty_liked_${id}_${user.uid}`, String(newLikedStatus));
    // Save global count
    localStorage.setItem(`vaulty_likes_count_${id}`, String(newCount));
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, reaction: emoji };
      }
      return msg;
    });
    setMessages(updatedMessages);
    localStorage.setItem(`vaulty_msgs_${id}`, JSON.stringify(updatedMessages));
    setShowEmojiPicker(null);
    setActiveTTS(null);
  };
  useEffect(() => {
    if (id) {
      console.log("Fetching companion with ID:", id);
      
      // Define system companions explicitly to match home.tsx and companion-preview.tsx
      const SYSTEM_COMPANIONS = [
        { id: "sofia", name: "Sofia", age: 23, avatar: sofiaImg, bio: "Italian soul with a passion for art and espresso. Chasing the golden hour in Rome." },
        { id: "chloe", name: "Chloe", age: 22, avatar: chloeImg, bio: "Sweet as honey with a rebellious streak. Exploring the hidden gems of Tokyo." },
        { id: "mila", name: "Mila", age: 24, avatar: swimsuitThumb, bio: "Ready for a beach day? Deep conversations and sunny vibes await." },
        { id: "mia", name: "Mia", age: 21, avatar: miaImg, bio: "Living life one adventure at a time. Coffee lover and sunshine seeker." },
        { id: "veronica", name: "Veronica", age: 23, avatar: veronicaImg, bio: "Sun, sand, and Ukrainian soul. Chasing dreams and infinite summers." },
        { id: "luna", name: "Luna", age: 22, avatar: lunaImg, bio: "Mysterious gaze and a heart of gold. Polish beauty with a love for starry nights." },
        { id: "ryan", name: "Ryan", age: 24, avatar: ryanImg, bio: "Tech enthusiast and gamer." },
        { id: "max", name: "Max", age: 28, avatar: maxImg, bio: "Fitness coach and personal trainer." },
        { id: "theo", name: "Theo", age: 22, avatar: theoImg, bio: "Musician and soulful thinker." },
        { id: "niky", name: "Niky", age: 22, avatar: nikyImg, bio: "Elegant and sophisticated, with a touch of mystery." },
        { id: "valeria", name: "Valeria", age: 25, avatar: valeriaImg, bio: "Bold, ambitious, and always chasing the next sunset." },
        { id: "anna", name: "Anna", age: 23, avatar: annaImg, bio: "Warm heart, sharp mind, and a love for deep late-night talks." },
        { id: "jade", name: "Jade", age: 24, avatar: jadeImg, bio: "Sun-kissed skin and a soul that craves the ocean breeze." },
        { id: "yuna", name: "Yuna", age: 22, avatar: yunaImg, bio: "Serene, composed, and effortlessly chic. A true Seoul soul." },
      ];

      const companions = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
      
      // Priority 1: Check system companions
      const systemFound = SYSTEM_COMPANIONS.find(c => c.id === id);
      // Priority 2: Check localStorage
      const localFound = companions.find((c: any) => c.id === id);
      
      const found = systemFound || localFound;
      
      if (found) {
        console.log("Found companion:", found);
        setCompanion(found);
        const storedMessages = JSON.parse(localStorage.getItem(`vaulty_msgs_${id}`) || "[]");
        setMessages(storedMessages);
      } else {
        console.log("Not found in local lists, fetching from Firestore...");
        const fetchFromFirestore = async () => {
          try {
            const { db } = await import("@/lib/firebase");
            const { doc, getDoc } = await import("firebase/firestore");
            const docSnap = await getDoc(doc(db, "companions", id));
            if (docSnap.exists()) {
              const data = docSnap.data();
              const compData = { id: docSnap.id, ...data };
              console.log("Found in Firestore:", compData);
              setCompanion(compData);
              
              // LocalStorage sync
              const existing = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
              if (!existing.find((c: any) => c.id === id)) {
                localStorage.setItem("vaulty_companions", JSON.stringify([...existing, compData]));
              }
            } else {
              console.warn("Companion not found in Firestore either");
              setLocation("/home");
            }
          } catch (e) {
            console.error("Firestore fetch error:", e);
            setLocation("/home");
          }
        };
        fetchFromFirestore();
      }
    }
  }, [id, setLocation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !companion || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    const updatedMsgs = [...messages, userMsg];
    
    if (replyTo) {
      userMsg.replyTo = replyTo;
      setReplyTo(null);
    }

    setMessages(updatedMsgs);
    localStorage.setItem(`vaulty_msgs_${id}`, JSON.stringify(updatedMsgs));
    setInput("");

    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: "Hey! I'm here. How are you doing today?",
        sender: "ai",
        timestamp: new Date().toISOString()
      };
      const finalMsgs = [...updatedMsgs, aiMsg];
      setMessages(finalMsgs);
      localStorage.setItem(`vaulty_msgs_${id}`, JSON.stringify(finalMsgs));
      setIsTyping(false);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success("Image attached!");
    }
  };

  if (!companion) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans relative">
      {/* Info Sidebar Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-[#0F0F0F] border-l border-white/5 z-[70] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="p-6 flex flex-col items-center text-center border-b border-white/5">
                <Avatar className="w-24 h-24 border-4 border-white/5 mb-4 shadow-2xl">
                  <AvatarImage src={companion?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">{companion?.name?.[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">{companion?.name}</h2>
                <div className="mt-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Private Session</span>
                </div>
                
                <div className="flex items-center gap-6 mt-6 w-full justify-center">
                  <button className="text-zinc-500 hover:text-white transition-all">
                    <Share2 size={20} />
                  </button>
                  <button 
                    onClick={toggleLike}
                    className="flex items-center gap-2 transition-all group"
                  >
                    <Heart 
                      size={20} 
                      className={cn(
                        "transition-all duration-300",
                        isLiked ? "text-red-500 fill-red-500 scale-110" : "text-zinc-500 fill-transparent group-hover:scale-110"
                      )} 
                    />
                    <span className={cn(
                      "font-bold text-sm tracking-tight transition-colors",
                      isLiked ? "text-white" : "text-zinc-500"
                    )}>
                      {likeCount}
                    </span>
                  </button>
                  <button className="text-zinc-500 hover:text-red-500 transition-all">
                    <Flag size={20} />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                <button 
                  onClick={() => {
                    if(confirm("Start a new chat?")) {
                      setMessages([]);
                      localStorage.removeItem(`vaulty_msgs_${id}`);
                      setShowMenu(false);
                    }
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                      <MessageSquare size={18} />
                    </div>
                    <span className="font-bold text-sm">New Chat</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </button>

                <div className="space-y-2 pt-4 border-t border-white/5">
                    {companion && (companion.creatorId === user?.uid || companion.creatorUsername === userData?.username) && (
                      <button 
                        onClick={() => {
                          console.log("Opening publish modal for:", companion);
                          setShowPublishModal(true);
                        }}
                        className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 p-4 rounded-2xl flex items-center justify-between group transition-all text-cyan-500 mb-2"
                      >
                        <div className="flex items-center gap-4">
                          <Globe size={18} />
                          <span className="font-bold text-sm">{companion?.isPublished ? "Edit Publication" : "Publish Character"}</span>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                    )}
                    {[
                      { icon: Share2, label: "Share Link", onClick: () => {
                        const code = Math.random().toString(36).substring(7).toUpperCase();
                        navigator.clipboard.writeText(`${window.location.origin}/messages/${id}?code=${code}`);
                        toast.success(`Share link copied! Access code: ${code}`);
                      }},
                      { icon: Mic, label: "Voice", value: companion?.name, onClick: () => setShowVoiceMenu(true) },
                      { icon: History, label: "History" },
                      { icon: Palette, label: "Customize" },
                      { icon: Pin, label: "Pinned" },
                      { icon: UserCircle, label: "Persona" },
                      { icon: Type, label: "Style", value: "Standard", onClick: () => {
                        if (!isPremium) {
                          setLocation("/premium");
                        } else {
                          setShowThemeMenu(true);
                        }
                      }}
                    ].map((item, idx) => (
                      <button 
                        key={idx} 
                        onClick={item.onClick}
                        className="w-full hover:bg-white/5 p-4 rounded-2xl flex items-center justify-between group transition-all text-zinc-400 hover:text-white"
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={18} className="text-zinc-500 group-hover:text-white" />
                          <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.value && <span className="text-xs text-zinc-600 font-bold">{item.value}</span>}
                          <ChevronRight size={14} className="text-zinc-800" />
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <button 
                  onClick={async () => {
                    const isCreator = companion && (
                      (companion.creatorId && companion.creatorId === user?.uid) || 
                      (companion.creatorUsername && companion.creatorUsername === userData?.username)
                    );
                    
                    console.log("Delete attempt debug:", {
                      isCreator,
                      companionCreatorId: companion?.creatorId,
                      userUid: user?.uid,
                      companionCreatorUsername: companion?.creatorUsername,
                      currentUsername: userData?.username
                    });

                    if (isCreator) {
                      const mode = confirm("Do you want to PERMANENTLY delete this character for EVERYONE? Click OK for permanent delete, or Cancel to just remove it from your chat list.");
                      
                      if (mode) {
                        // Permanent delete from Firestore
                        try {
                          const { db } = await import("@/lib/firebase");
                          const { doc, deleteDoc } = await import("firebase/firestore");
                          await deleteDoc(doc(db, "companions", id!));
                          toast.success("Character deleted permanently");
                        } catch (e) {
                          console.error("Firestore delete error:", e);
                          toast.error("Failed to delete from database");
                          return; // Stop if firestore delete failed to prevent local-only delete for creator
                        }
                      } else {
                        toast.success("Removed from your list");
                      }
                    } else {
                      if (!confirm("Remove this chat from your list?")) return;
                      toast.success("Removed from your list");
                    }

                    // Common local cleanup (only if user confirmed or is not creator choosing delete)
                    localStorage.removeItem(`vaulty_msgs_${id}`);
                    const companions = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
                    const updated = companions.filter((c: any) => c.id !== id);
                    localStorage.setItem("vaulty_companions", JSON.stringify(updated));
                    setShowMenu(false);
                    setLocation("/home");
                  }}
                  className="w-full p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-sm transition-all flex items-center justify-center gap-3"
                >
                  <X size={18} />
                  {companion && (companion.creatorId === user?.uid || companion.creatorUsername === userData?.username) ? "Delete Character" : "Remove Chat"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoiceMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] rounded-t-[2.5rem] p-8 z-[90] max-h-[70vh] overflow-y-auto border-t border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Choose Voice</h3>
                <button onClick={() => setShowVoiceMenu(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="grid gap-4">
                {VOICES.map((voice) => (
                  <button 
                    key={voice.id}
                    onClick={() => {
                      const audio = new Audio(voice.previewUrl);
                      audio.play();
                      toast.info(`Previewing ${voice.name}'s voice...`);
                    }}
                    className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all group text-left"
                  >
                    <div>
                      <p className="font-bold text-lg">{voice.name}</p>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{voice.type}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl group-hover:scale-110 transition-transform">
                      <Volume2 size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showThemeMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowThemeMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] rounded-t-[2.5rem] p-8 z-[90] max-h-[70vh] overflow-y-auto border-t border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Select Theme</h3>
                <button onClick={() => setShowThemeMenu(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-3 gap-4 pb-10">
                {THEMES.map((theme) => (
                  <button 
                    key={theme.id}
                    onClick={() => toast.success(`Applied ${theme.name}`)}
                    className="flex flex-col gap-3 group"
                  >
                    <div className={cn("w-full aspect-square rounded-2xl border-2 border-white/5 group-hover:border-white/20 transition-all overflow-hidden p-1 shadow-2xl", theme.preview)}>
                      <div className="w-full h-full bg-black/20 backdrop-blur-sm rounded-xl border border-white/10" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{theme.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPublishModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPublishModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] rounded-t-[2.5rem] p-8 z-[110] max-h-[90vh] overflow-y-auto border-t border-white/5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Publish Character</h3>
                <button onClick={() => setShowPublishModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <input 
                    type="file" 
                    ref={publishFileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPublishForm({...publishForm, avatar: reader.result as string});
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => publishFileInputRef.current?.click()}
                  >
                    <Avatar className="w-32 h-32 border-4 border-white/5 shadow-2xl group-hover:border-cyan-500/50 transition-all">
                      <AvatarImage src={publishForm.avatar} className="object-cover" />
                      <AvatarFallback className="text-3xl font-black bg-zinc-800">{publishForm.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 p-3 bg-cyan-500 rounded-full shadow-lg">
                      <Upload size={16} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Character Name</Label>
                    <Input 
                      value={publishForm.name}
                      onChange={(e) => setPublishForm({...publishForm, name: e.target.value})}
                      className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-1 focus:ring-cyan-500 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</Label>
                      <span className={cn("text-[10px] font-bold mb-1", publishForm.bio.length > 100 ? "text-red-500" : "text-zinc-600")}>
                        {publishForm.bio.length}/100
                      </span>
                    </div>
                    <textarea 
                      value={publishForm.bio}
                      onChange={(e) => setPublishForm({...publishForm, bio: e.target.value.slice(0, 100)})}
                      placeholder="Write a short description..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 h-32 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handlePublish}
                  className="w-full h-16 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-2xl text-lg shadow-xl shadow-cyan-500/10 active:scale-[0.98] transition-all mt-4"
                >
                  {companion?.isPublished ? "UPDATE PUBLICATION" : "PUBLISH NOW"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header - Clean & Professional */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/home")} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-all active:scale-90">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/10 shadow-inner">
              <AvatarImage src={companion.avatar} className="object-cover" />
              <AvatarFallback className="bg-zinc-800 text-xs font-bold">{companion.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-base font-black tracking-tight leading-none">{companion.name}</h2>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowMenu(true)} className="p-2 hover:bg-white/5 rounded-full transition-all text-zinc-400 hover:text-white">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-12"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
              <Avatar className="w-24 h-24 border-2 border-white/10 shadow-2xl relative z-10">
                <AvatarImage src={companion.avatar} className="object-cover" />
                <AvatarFallback className="text-2xl font-black">{companion.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-2xl font-black tracking-tighter mb-2">Start Conversation with {companion.name}</h3>
            <p className="text-zinc-500 text-sm font-medium max-w-[200px] mx-auto leading-relaxed">
              Your digital companion is ready to talk about anything.
            </p>
          </motion.div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="relative max-w-[75%]">
              <AnimatePresence>
                {msg.sender === "ai" && activeTTS === msg.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-1 mb-1 ml-2"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(msg.text);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-cyan-400 transition-all active:scale-90"
                    >
                      <Volume2 size={12} />
                    </button>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">AI Voice</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onClick={() => {
                  if (msg.sender === "ai") {
                    setActiveTTS(activeTTS === msg.id ? null : msg.id);
                  }
                }}
                className={cn(
                  "px-5 py-3.5 rounded-3xl relative text-[15px] leading-relaxed shadow-2xl cursor-pointer transition-transform active:scale-[0.98]",
                  msg.sender === "user"
                    ? "bg-zinc-800 text-white rounded-br-none font-medium border border-white/5" 
                    : "bg-[#1A1A1A] text-white rounded-bl-none border border-white/5"
                )}
              >
                {msg.replyTo && (
                  <div className={cn(
                    "mb-2 p-2 rounded-xl text-xs border-l-4",
                    msg.sender === "user" 
                      ? "bg-white/5 border-white/10 text-white/60" 
                      : "bg-white/5 border-white/20 text-white/60"
                  )}>
                    <p className="font-bold opacity-50 uppercase text-[9px] mb-1">Replying to</p>
                    <p className="italic line-clamp-1">{msg.replyTo.text}</p>
                  </div>
                )}
                {msg.reaction && (
                  <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-white/10 rounded-full px-1.5 py-0.5 text-[10px] shadow-lg z-10">
                    {msg.reaction}
                  </div>
                )}
                <p className="break-words">{msg.text}</p>
              </motion.div>
              
              <AnimatePresence>
                {msg.sender === "ai" && activeTTS === msg.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 mt-2 ml-2"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyTo(msg);
                        setActiveTTS(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                    >
                      <Reply size={12} />
                      Reply
                    </button>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id);
                        }}
                        className={cn(
                          "p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-red-500 transition-all",
                          msg.reaction && "text-red-500 bg-red-500/10"
                        )}
                      >
                        <Heart size={12} fill={msg.reaction ? "currentColor" : "transparent"} className={cn("hover:fill-red-500", msg.reaction && "fill-red-500")} />
                      </button>

                      <AnimatePresence>
                        {showEmojiPicker === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-white/10 rounded-full p-1 flex items-center gap-1 shadow-2xl z-50"
                          >
                            {REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReaction(msg.id, emoji);
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-all active:scale-90 text-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-end gap-3">
            <div className="px-6 py-4 rounded-3xl rounded-bl-none bg-[#1A1A1A] border border-white/5 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input area - Glass Style */}
      <footer className="shrink-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-40 pb-6">
        <AnimatePresence>
          {replyTo && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-3 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between shadow-2xl"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-1 h-8 bg-cyan-500 rounded-full shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black uppercase text-cyan-500 tracking-widest">Replying to {companion.name}</p>
                  <p className="text-xs text-zinc-400 line-clamp-1 italic">{replyTo.text}</p>
                </div>
              </div>
              <button 
                onClick={() => setReplyTo(null)}
                className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-all"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3 w-full max-w-full overflow-hidden">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*" 
          />
          <div className="flex-1 relative flex items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-1.5 transition-all focus-within:border-white/20 focus-within:bg-white/10 shadow-2xl min-w-0">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-zinc-400 hover:text-white transition-all active:scale-90 bg-white/5 rounded-full ml-1 shrink-0"
            >
              <Camera size={18} strokeWidth={2.5} />
            </button>
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-zinc-500 font-medium px-3 h-10 text-sm min-w-0"
            />

            <button 
              onClick={toggleRecording}
              className={cn(
                "p-3 transition-all active:scale-90 mr-1 shrink-0 rounded-full",
                isRecording ? "bg-red-500 text-white animate-pulse" : "text-zinc-400 hover:text-white"
              )}
            >
              <Mic size={18} strokeWidth={2.5} />
            </button>
          </div>

          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 shrink-0",
              input.trim() && !isTyping 
                ? "bg-white text-black shadow-white/10" 
                : "bg-zinc-800 text-zinc-600 grayscale cursor-not-allowed"
            )}
          >
            <Send size={20} strokeWidth={3} className={cn("transition-transform", input.trim() && "translate-x-0.5")} />
          </button>
        </div>
      </footer>
    </div>
  );
}
