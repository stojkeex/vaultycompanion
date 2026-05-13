import { Link, useLocation } from "wouter";
import { Home, MessageSquare, User, Compass, ShoppingBag, ShieldCheck, PlusCircle, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { isSuperAdmin } from "@/lib/admins";

import VAULTY_AI_LOGO from "@assets/IMG_8630_1766871988717.png";

export function BottomNav() {
  const [location] = useLocation();
  const { user, userData } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isSuper = user ? isSuperAdmin(user.email) : false;
  const isAuthorized = user && (userData?.isAdmin || isSuper);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Listen to chats the user is part of
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );
    
    const chatsUnsubscribe = onSnapshot(chatsQuery, (chatsSnapshot) => {
      // Create a map to store unread count per chat
      const chatUnreads: Record<string, number> = {};
      
      const unsubscribes = chatsSnapshot.docs.map(chatDoc => {
        const messagesQuery = query(
          collection(db, "chats", chatDoc.id, "messages"),
          where("read", "==", false)
        );
        
        return onSnapshot(messagesQuery, (messagesSnapshot) => {
          const count = messagesSnapshot.docs.filter(
            msgDoc => msgDoc.data().senderId !== user.uid
          ).length;
          
          chatUnreads[chatDoc.id] = count;
          
          // Calculate total sum of all chat unreads
          const total = Object.values(chatUnreads).reduce((sum, c) => sum + c, 0);
          setUnreadCount(total);
        });
      });

      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    }, (error) => {
      console.error("Error in chats listener:", error);
    });

    return () => chatsUnsubscribe();
  }, [user]);

  const items = useMemo(() => [
    { href: "/home", label: "HOME", icon: Home },
    { href: "/discover", label: "DISCOVER", icon: Search },
    { href: "/create-companion", label: "CREATE", icon: PlusCircle },
    { href: "/messages", label: "CHAT", icon: MessageSquare },
    { href: "/premium", label: "PREMIUM", icon: Zap },
  ], []);

  // Check if we should hide the nav
  const shouldHide = location === "/login" || 
                     location === "/register" || 
                     location.startsWith("/demo-trading/") ||
                     location === "/ai" ||
                     location.startsWith("/chat/private/") ||
                     location.startsWith("/create-companion") ||
                     location.startsWith("/companion/") ||
                     location.startsWith("/messages/") ||
                     location.startsWith("/course/") ||
                     location === "/tos" ||
                     location.startsWith("/coin/") ||
                     location.startsWith("/wallet") ||
                     location.startsWith("/user/") ||
                     location === "/create-post" ||
                     location === "/create-listing";

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto pointer-events-none"
      style={{
        opacity: shouldHide ? 0 : 1,
        pointerEvents: shouldHide ? "none" : "auto",
        transition: "opacity 150ms ease-in-out",
        visibility: shouldHide ? "hidden" : "visible"
      }}
    >
      <div
        className="pointer-events-auto relative flex items-center justify-center p-1.5 rounded-full bg-card/80 backdrop-blur-3xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
      >
        {items.map((item) => {
          let isActive = false;
          
          if (item.href === "/home") {
            isActive = location === "/home" || location === "/";
          } else if (item.href === "/messages") {
            isActive = location.startsWith("/messages");
          } else {
            isActive = location.startsWith(item.href);
          }
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative flex flex-col items-center justify-center w-14 h-12 rounded-full cursor-pointer group"
              >
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key="bubble"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 shadow-inner backdrop-blur-md"
                    />
                  )}
                </AnimatePresence>
                
                <motion.div
                  whileTap={{ scale: 1.15, y: -2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                  className={cn("flex flex-col items-center justify-center")}
                >
                  {item.icon && (
                    <item.icon 
                      className={cn(
                        "relative z-10 w-6 h-6", 
                        isActive 
                          ? "text-primary" 
                          : "text-muted-foreground group-hover:text-primary/80"
                      )}
                      style={{
                        transition: "color 150ms ease-in-out, filter 150ms ease-in-out"
                      }}
                    />
                  )}
                </motion.div>

                {item.href === "/messages" && unreadCount > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
