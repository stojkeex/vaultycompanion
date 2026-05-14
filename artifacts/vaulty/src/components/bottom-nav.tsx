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
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      {/* Outer glow */}
      <div className="absolute -inset-2 rounded-full blur-2xl bg-black/30 pointer-events-none" />

      {/* Dark glass pill */}
      <div
        className="relative flex items-end gap-1.5 px-3 pt-5 pb-2 rounded-full"
        style={{
          background: "rgba(18,18,20,0.82)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
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
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="relative flex flex-col items-center cursor-pointer"
              >
                {/* Item capsule */}
                <div
                  className="relative flex flex-col items-center justify-end"
                  style={{ width: 64, minHeight: 52 }}
                >
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      /* Active: large circle protruding above the bar */
                      <motion.div
                        key="active"
                        initial={{ scale: 0.6, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.6, opacity: 0, y: 8 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ bottom: 18 }}
                      >
                        {/* Colorful metallic ring (conic gradient) */}
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            padding: 3,
                            background: "conic-gradient(from 0deg, #a8ff3e, #00e0ff, #b400ff, #ff3a6e, #ff9900, #a8ff3e)",
                            boxShadow: "0 0 18px rgba(168,255,62,0.45), 0 4px 24px rgba(0,0,0,0.5)",
                          }}
                        >
                          {/* Inner green circle */}
                          <div
                            className="w-full h-full rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(145deg, #c8ff44, #8ae600)",
                              boxShadow: "inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.2)",
                            }}
                          >
                            <item.icon
                              className="text-black"
                              style={{ width: 26, height: 26, strokeWidth: 2.2 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* Inactive: small icon in a dark capsule */
                      <motion.div
                        key="inactive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-col items-center justify-center rounded-full"
                        style={{
                          width: 60,
                          height: 44,
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          marginBottom: 2,
                        }}
                      >
                        <item.icon
                          className="text-white/70"
                          style={{ width: 20, height: 20, strokeWidth: 1.8 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Spacer so active icon has room above */}
                  {isActive && <div style={{ height: 50 }} />}

                  {/* Label */}
                  <span
                    className="text-[10px] font-semibold tracking-wide mt-0.5 relative z-10"
                    style={{
                      color: isActive ? "#c8ff44" : "rgba(255,255,255,0.55)",
                      textShadow: isActive ? "0 0 10px rgba(168,255,62,0.6)" : "none",
                      lineHeight: 1,
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Unread badge */}
                  {item.href === "/messages" && unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-20"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
