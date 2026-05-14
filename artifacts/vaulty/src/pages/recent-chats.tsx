import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, where } from "firebase/firestore";
import { ChevronLeft, Edit, Search, Plus, MessageSquare, Sparkles } from "lucide-react";
import messagesWordmark from "../assets/messages-wordmark.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface ChatPreview {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTimestamp: any;
  lastMessageSender: string;
  otherUser?: any;
  unreadCount?: number;
}

export default function RecentChats() {
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0);
  const [showTab, setShowTab] = useState<"chats" | "requests">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [companions, setCompanions] = useState<any[]>([]);

  useEffect(() => {
    const loadCompanions = () => {
      const stored = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
      setCompanions(stored);
    };
    
    loadCompanions();
    window.addEventListener("storage", loadCompanions);
    window.addEventListener("focus", loadCompanions);
    
    return () => {
      window.removeEventListener("storage", loadCompanions);
      window.removeEventListener("focus", loadCompanions);
    };
  }, []);

  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const matchesQuery = query(
      collection(db, "interactions"),
      where("userId", "==", user.uid),
      where("status", "==", "match")
    );

    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      const ids = new Set(snapshot.docs.map(d => d.data().targetId));
      setMatchedUserIds(ids);
    });

    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const userChats = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.participants && data.participants.includes(user.uid);
        });

        const chatData = await Promise.all(
          userChats.map(async (chatDoc) => {
            const data = chatDoc.data();
            const otherUserId = data.participants.find((uid: string) => uid !== user.uid);
            
            let otherUser = null;
            if (otherUserId && otherUserId !== "global") {
              try {
                const userDoc = await getDoc(doc(db, "users", otherUserId));
                if (userDoc.exists()) {
                  otherUser = userDoc.data();
                }
              } catch (err) {
                console.error("Error fetching user:", err);
              }
            } else if (data.participants.includes("global")) {
              otherUser = { displayName: "Global Chat", photoURL: "", isGlobal: true };
            }

            let unreadCount = 0;
            return {
              id: chatDoc.id,
              ...data,
              otherUser,
              unreadCount
            } as ChatPreview;
          })
        );

        setChats(chatData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing chats:", err);
        setLoading(false);
      }
    });

    const requestsQuery = query(
      collection(db, "messageRequests"),
      orderBy("timestamp", "desc")
    );

    const requestsUnsub = onSnapshot(requestsQuery, (snapshot) => {
      const count = snapshot.docs.filter(doc => doc.data().recipientId === user.uid).length;
      setRequestCount(count);
    });

    return () => {
      unsubscribe();
      requestsUnsub();
      unsubMatches();
    };
  }, [user, authLoading, matchedUserIds.size]);

  const filteredChats = chats.filter(chat => {
    const isMatched = chat.otherUser?.isGlobal || matchedUserIds.has(chat.participants.find((p: string) => p !== user?.uid) || "");
    const matchesSearch = chat.otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    return isMatched && matchesSearch;
  });

  const filteredCompanions = companions.filter(comp => 
    comp.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 bg-background/50 backdrop-blur-xl sticky top-0 z-50 border-b border-border">
        <img src={messagesWordmark} alt="Messages" className="h-20 w-auto -ml-3" />
        <button className="p-3 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all">
          <Edit size={20} />
        </button>
      </div>


      {/* Search Bar */}
      <div className="px-6 py-6">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors z-10" />
          <Input 
            placeholder="Search for messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/50 border-border pl-14 h-16 rounded-[2rem] focus-visible:ring-primary/10 text-sm font-medium placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32">
        <div className="space-y-4">
            {/* AI Companions */}
            {filteredCompanions.map(comp => (
              <motion.div 
                key={comp.id} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation(`/messages/${comp.id}`)}
                className="flex items-center gap-4 p-4 rounded-[2.5rem] bg-card/30 border border-border hover:border-primary/10 transition-all cursor-pointer"
              >
                <Avatar className="w-14 h-14 border-2 border-border">
                  <AvatarImage src={`/${comp.avatar}`} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground">{comp.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black uppercase italic tracking-tighter text-lg">{comp.name}</h3>
                    <Sparkles size={12} className="text-yellow-500" />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">AI Companion active</p>
                </div>
              </motion.div>
            ))}

            {filteredChats.map((chat) => {
              if (!chat.otherUser && !chat.participants.includes("global")) return null;
              
              const isMe = chat.lastMessageSender === user?.uid;
              const lastSeenDate = chat.otherUser?.lastSeen?.toDate();
              const isOnline = lastSeenDate && (new Date().getTime() - lastSeenDate.getTime()) < 45000;
              
              return (
                <motion.div 
                  key={chat.id} 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => 
                    setLocation(
                      chat.otherUser?.isGlobal 
                        ? `/messages/global` 
                        : `/messages/user/${chat.participants.find((p: string) => p !== user?.uid)}`
                    )
                  }
                  className="flex items-center gap-4 p-4 rounded-[2.5rem] bg-card/30 border border-border hover:border-primary/10 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-border">
                      <AvatarImage src={chat.otherUser?.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-muted text-muted-foreground">{chat.otherUser?.displayName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-[3px] border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="font-black uppercase italic tracking-tighter text-lg">{chat.otherUser?.displayName || "Unknown"}</h3>
                        {chat.otherUser?.badges?.includes("verified") && (
                          <svg className="w-5 h-5 flex-shrink-0 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="bg-foreground text-background text-[10px] font-black rounded-full px-2 py-0.5 flex items-center justify-center flex-shrink-0 shadow-xl">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium truncate ${chat.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {filteredChats.length === 0 && filteredCompanions.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-border">
                <MessageSquare className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No conversations found</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
