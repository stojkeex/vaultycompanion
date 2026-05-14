import { Link, useLocation } from "wouter";
import { Home, MessageSquare, PlusCircle, Search, Zap } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { isSuperAdmin } from "@/lib/admins";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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
          setUnreadCount(Object.values(chatUnreads).reduce((s, c) => s + c, 0));
        });
      });
      return () => unsubscribes.forEach(u => u());
    });
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
    location === "/login" || location === "/register" || location === "/" ||
    location === "/ai" || location.startsWith("/create-companion") ||
    location.startsWith("/companion/") || location.startsWith("/messages/") ||
    location === "/tos" || location.startsWith("/demo-trading/") ||
    location.startsWith("/chat/private/") || location.startsWith("/course/") ||
    location.startsWith("/coin/") || location.startsWith("/wallet") ||
    location.startsWith("/user/") || location === "/create-post" ||
    location === "/create-listing";

  if (shouldHide) return null;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      {/* Outer wrapper — overflow visible so active bubble pokes above */}
      <div style={{ position: "relative", paddingTop: 28 }}>

        {/* Dark glass pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 10px",
            borderRadius: 60,
            background: "rgba(14,14,16,0.88)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          {items.map((item) => {
            let isActive = false;
            if (item.href === "/home") isActive = location === "/home";
            else if (item.href === "/messages") isActive = location.startsWith("/messages");
            else isActive = location.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  {/* Active: big circle that rises above the pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key="bubble"
                        layoutId="nav-active-bubble"
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          bottom: "calc(100% + 4px)",
                          width: 62,
                          height: 62,
                          borderRadius: "50%",
                          padding: 3,
                          background:
                            "conic-gradient(from 180deg, #b5ff4d, #00e5ff, #c200ff, #ff3366, #ff9500, #b5ff4d)",
                          boxShadow:
                            "0 0 20px rgba(181,255,77,0.4), 0 6px 30px rgba(0,0,0,0.6)",
                          zIndex: 10,
                        }}
                      >
                        {/* Lime green inner circle */}
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(145deg, #ccff44 0%, #96e600 100%)",
                            boxShadow:
                              "inset 0 2px 8px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <item.icon
                            style={{
                              width: 24,
                              height: 24,
                              color: "#0a1200",
                              strokeWidth: 2.2,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Capsule (always rendered — the pill shape for each item) */}
                  <div
                    style={{
                      width: 64,
                      height: 52,
                      borderRadius: 26,
                      background: isActive
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingBottom: 7,
                      gap: 3,
                      position: "relative",
                    }}
                  >
                    {/* Icon — hidden on active (replaced by floating bubble above) */}
                    {!isActive && (
                      <item.icon
                        style={{
                          width: 20,
                          height: 20,
                          color: "rgba(255,255,255,0.55)",
                          strokeWidth: 1.8,
                        }}
                      />
                    )}
                    {isActive && <div style={{ height: 20 }} />}

                    {/* Label */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        lineHeight: 1,
                        color: isActive ? "#b5ff4d" : "rgba(255,255,255,0.5)",
                        textShadow: isActive
                          ? "0 0 10px rgba(181,255,77,0.55)"
                          : "none",
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Unread badge */}
                    {item.href === "/messages" && unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 8,
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 8,
                          fontWeight: 700,
                          borderRadius: 99,
                          minWidth: 16,
                          height: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 3px",
                          zIndex: 20,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        }}
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
      </div>
    </motion.div>
  );
}
