import { Link, useLocation } from "wouter";
import { Home, MessageSquare, PlusCircle, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { isSuperAdmin } from "@/lib/admins";

export function BottomNav() {
  const [location] = useLocation();
  const { user, userData } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isSuper = user ? isSuperAdmin(user.email) : false;

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const chatsUnsubscribe = onSnapshot(chatsQuery, (chatsSnapshot) => {
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
          const total = Object.values(chatUnreads).reduce((sum, c) => sum + c, 0);
          setUnreadCount(total);
        });
      });

      return () => unsubscribes.forEach(unsub => unsub());
    }, (error) => console.error("Error in chats listener:", error));

    return () => chatsUnsubscribe();
  }, [user]);

  const items = useMemo(() => [
    { href: "/home",             label: "Home",    icon: Home },
    { href: "/discover",         label: "Search",  icon: Search },
    { href: "/create-companion", label: "Create",  icon: PlusCircle },
    { href: "/messages",         label: "Chat",    icon: MessageSquare },
    { href: "/premium",          label: "Premium", icon: Zap },
  ], []);

  const shouldHide =
    location === "/login" ||
    location === "/register" ||
    location === "/" ||
    location === "/ai" ||
    location.startsWith("/create-companion") ||
    location.startsWith("/companion/") ||
    location.startsWith("/messages/") ||
    location === "/tos" ||
    location.startsWith("/demo-trading/") ||
    location.startsWith("/chat/private/") ||
    location.startsWith("/course/") ||
    location.startsWith("/coin/") ||
    location.startsWith("/wallet") ||
    location.startsWith("/user/") ||
    location === "/create-post" ||
    location === "/create-listing";

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full blur-xl bg-white/5 scale-110 pointer-events-none" />

      {/* Glass pill container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex items-center gap-1 px-3 py-2.5 rounded-full
          bg-white/8 backdrop-blur-2xl
          border border-white/20
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.2)]"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        {items.map((item) => {
          let isActive = false;
          if (item.href === "/home") {
            isActive = location === "/home";
          } else if (item.href === "/messages") {
            isActive = location.startsWith("/messages");
          } else {
            isActive = location.startsWith(item.href);
          }

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="relative flex items-center justify-center w-14 h-11 rounded-full cursor-pointer"
              >
                {/* Active bubble */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="active-bubble"
                      layoutId="nav-bubble"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.15), 0 0 12px rgba(255,255,255,0.08)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <item.icon
                  className={cn(
                    "relative z-10 transition-all duration-200",
                    isActive
                      ? "w-5 h-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                      : "w-5 h-5 text-white/45 hover:text-white/70"
                  )}
                />

                {/* Unread badge */}
                {item.href === "/messages" && unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-20"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
