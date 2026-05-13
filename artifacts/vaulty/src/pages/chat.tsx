import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { ChevronLeft, Image as ImageIcon, Send, Smile, X, MoreVertical, Sparkles, CheckCircle2, MessageSquare, Mic, History, Palette, Pin, UserCircle, Type, Share2, ThumbsUp, ThumbsDown, Flag, ChevronRight } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on package.json
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, serverTimestamp, doc, setDoc, 
  updateDoc, limit, Timestamp
} from "firebase/firestore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Import templates to handle fallback data in sidebar
const milaImg = "";
const ryanImg = "";
const sophiaImg = "";
const maxImg = "";
const elenaImg = "";
const theoImg = "";
const bellaImg = "";

const RECOMMENDED_TEMPLATES = [
  { id: "mila", name: "Mila", photoURL: milaImg, bio: "Expert AI companion for deep conversations and creative brainstorming." },
  { id: "ryan", name: "Ryan", photoURL: ryanImg, bio: "Tech enthusiast and gamer, always ready for a challenge." },
  { id: "sophia", name: "Sophia", photoURL: sophiaImg, bio: "Compassionate listener with a passion for philosophy and art." },
  { id: "max", name: "Max", photoURL: maxImg, bio: "Fitness coach and adventure seeker, here to motivate you." },
  { id: "elena", name: "Elena", photoURL: elenaImg, bio: "World traveler and foodie with stories from every corner of the globe." },
  { id: "theo", name: "Theo", photoURL: theoImg, bio: "Musician and soulful thinker who finds beauty in the small things." },
  { id: "bella", name: "Bella", photoURL: bellaImg, bio: "Fashion icon and lifestyle guru with a sharp wit." },
];

interface Message {
  id: string;
  text: string;
  imageURL?: string;
  senderId: string;
  senderName?: string;
  timestamp: Timestamp;
  read?: boolean;
  type?: "text" | "image" | "system";
  isDeleted?: boolean;
}

export default function Chat() {
  const [, params] = useRoute("/messages/user/:id");
  const targetUserId = params?.id || (window.location.pathname.endsWith('/global') ? "global" : null);
  const isGlobal = window.location.pathname.endsWith('/global');
  
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !targetUserId) return;
    if (isGlobal) {
      setChatId("global");
      setTargetUser({ displayName: "Global Chat", photoURL: "", isGlobal: true });
      return;
    }
    const ids = [user.uid, targetUserId].sort();
    const generatedChatId = `${ids[0]}_${ids[1]}`;
    setChatId(generatedChatId);

    const unsubscribeUser = onSnapshot(doc(db, "users", targetUserId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTargetUser({
          id: snap.id,
          ...data
        });
      } else {
        // Fallback for recommended templates if they don't exist in DB yet
        const template = RECOMMENDED_TEMPLATES.find(t => t.id === targetUserId);
        if (template) {
          setTargetUser({
            id: template.id,
            displayName: template.name,
            photoURL: template.photoURL,
            bio: template.bio,
            isTemplate: true
          });
        }
      }
    });

    return () => unsubscribeUser();
  }, [user, targetUserId, isGlobal]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(msgs);

      if (user && !isGlobal) {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.senderId !== user.uid && !data.read) {
            updateDoc(doc.ref, { read: true });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [chatId, user, isGlobal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (imageURL?: string) => {
    if ((!inputText.trim() && !imageURL) || !user || !chatId) return;
    
    const text = inputText;
    setInputText("");

    try {
      await setDoc(doc(db, "chats", chatId), {
        participants: isGlobal ? ["global"] : [user.uid, targetUserId],
        lastMessage: imageURL ? "📷 Image" : text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSender: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const messageData: any = {
        text: text || "",
        senderId: user.uid,
        senderName: user.displayName || "User",
        timestamp: serverTimestamp(),
        read: false
      };

      if (imageURL) messageData.imageURL = imageURL;

      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        handleSend(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    return format(timestamp.toDate(), "HH:mm");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden font-sans">
        {/* Info Sidebar Overlay */}
        <AnimatePresence>
          {showInfoMenu && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInfoMenu(false)}
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
                    <AvatarImage src={targetUser?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">{targetUser?.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">{targetUser?.displayName}</h2>
                  <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-widest">By @vaulty_official</p>
                  <p className="text-[10px] text-zinc-600 font-black mt-2 uppercase tracking-[0.2em]">12,402 Interactions</p>
                  
                  <div className="flex items-center gap-3 mt-6 w-full">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-all flex items-center justify-center">
                      <Share2 size={18} />
                    </button>
                    <div className="flex-[2] bg-white/5 rounded-2xl border border-white/5 flex items-center overflow-hidden">
                      <button className="flex-1 hover:bg-white/10 p-3 flex items-center justify-center border-r border-white/5">
                        <ThumbsUp size={18} />
                      </button>
                      <button className="flex-1 hover:bg-white/10 p-3 flex items-center justify-center">
                        <ThumbsDown size={18} />
                      </button>
                    </div>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-all flex items-center justify-center text-red-500">
                      <Flag size={18} />
                    </button>
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  <button className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                        <MessageSquare size={18} />
                      </div>
                      <span className="font-bold text-sm">New Chat</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600" />
                  </button>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    {[
                      { icon: Mic, label: "Voice", value: targetUser?.displayName },
                      { icon: History, label: "History" },
                      { icon: Palette, label: "Customize" },
                      { icon: Pin, label: "Pinned" },
                      { icon: UserCircle, label: "Persona" },
                      { icon: Type, label: "Style", value: "Standard" }
                    ].map((item, idx) => (
                      <button key={idx} className="w-full hover:bg-white/5 p-4 rounded-2xl flex items-center justify-between group transition-all text-zinc-400 hover:text-white">
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
                    onClick={() => {
                      if(confirm("Clear this conversation?")) {
                        setMessages([]);
                        setShowInfoMenu(false);
                      }
                    }}
                    className="w-full p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-sm transition-all flex items-center justify-center gap-3"
                  >
                    <X size={18} />
                    Clear Chat
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-6 py-4 bg-black/50 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button onClick={() => setLocation("/messages")} className="p-3 bg-zinc-900 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white/5">
                        <AvatarImage src={targetUser?.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400">{targetUser?.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div 
                      onClick={() => !isGlobal && setLocation(`/user/${targetUserId}`)}
                      className={!isGlobal ? "cursor-pointer group" : ""}
                    >
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-black uppercase italic tracking-tighter text-lg group-hover:text-zinc-300 transition-colors">{targetUser?.displayName || "Loading..."}</h2>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(() => {
                                if (!targetUser?.lastSeen) return <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">offline</span>;
                                const lastSeenDate = targetUser.lastSeen.toDate();
                                const now = new Date();
                                const diffInMs = now.getTime() - lastSeenDate.getTime();
                                
                                if (diffInMs < 120000) return (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live Now</span>
                                  </div>
                                );
                                
                                return <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Seen recently</span>;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative">
                <button onClick={() => setShowInfoMenu(true)} className="p-3 bg-zinc-900 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                    <MoreVertical size={20} />
                </button>
            </div>
        </div>

        {/* Messages Area */}
        <div 
            onClick={() => setActiveMenuId(null)}
            className="flex-1 overflow-y-auto scroll-smooth p-6 space-y-6 overscroll-contain bg-black touch-pan-y"
        >
            {messages.length === 0 && targetUser && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-white/5 mb-6">
                  <Sparkles className="text-zinc-700" size={32} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">New connection</p>
                  <p className="text-sm font-medium italic text-zinc-400">Start your conversation with {targetUser.displayName}</p>
                </div>
              </div>
            )}
            {messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;
                
                return (
                    <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                    >
                        <div className={cn(
                          "max-w-[80%] rounded-[2rem] p-5 relative group shadow-2xl transition-all",
                          isMe 
                            ? "bg-white text-black rounded-tr-lg" 
                            : "bg-zinc-900 text-white rounded-tl-lg border border-white/5"
                        )}>
                            {msg.imageURL && (
                              <img src={msg.imageURL} className="rounded-2xl mb-3 w-full object-cover max-h-80 shadow-lg" />
                            )}
                            {msg.text && (
                              <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                            )}
                            <div className={cn(
                              "flex items-center gap-1.5 mt-2",
                              isMe ? "justify-end" : "justify-start"
                            )}>
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                isMe ? "text-black/50" : "text-zinc-600"
                              )}>
                                {formatMessageTime(msg.timestamp)}
                              </span>
                              {isMe && (
                                <CheckCircle2 size={10} className={cn(msg.read ? "text-blue-500" : "text-black/20")} />
                              )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-black border-t border-white/5 pb-10">
          <div className="max-w-md mx-auto relative flex items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-zinc-900 rounded-2xl border border-white/5 hover:border-white/20 transition-all active:scale-95 shadow-lg"
            >
              <ImageIcon size={20} className="text-zinc-500" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageSelect}
              accept="image/*"
            />
            <div className="flex-1 relative">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="w-full bg-zinc-900/50 border-white/5 h-14 pl-6 pr-14 rounded-[1.5rem] text-sm font-medium placeholder:text-zinc-600 focus:outline-none focus:border-white/10 transition-all shadow-inner"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="absolute right-2 top-2 p-3 bg-white text-black rounded-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-xl"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
