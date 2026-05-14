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
        return onSnapshot(messagesQuery, (snap) => {
          chatUnreads[chatDoc.id] = snap.docs.filter(d => d.data().senderId !== user.uid).length;
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
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      style={{ paddingTop: 20 }}
    >
      {/* Dark glass pill — overflow visible so active bubble pokes above */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
          padding: "0 10px 8px 10px",
          borderRadius: 999,
          overflow: "visible",
          background: "rgba(13,13,15,0.90)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
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
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                style={{ cursor: "pointer" }}
              >
                {isActive ? (
                  /* ── ACTIVE ITEM: circle that rises slightly above the pill ── */
                  <motion.div
                    layoutId="nav-active"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 68,
                      marginTop: -14,
                    }}
                  >
                    {/* Colorful ring */}
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        padding: 3,
                        background:
                          "conic-gradient(from 0deg, #aaff3a, #00eeff, #cc00ff, #ff2255, #ff9900, #aaff3a)",
                        boxShadow:
                          "0 0 16px rgba(170,255,58,0.5), 0 4px 20px rgba(0,0,0,0.6)",
                      }}
                    >
                      {/* Lime green inner circle */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(145deg, #ccff44 0%, #90e000 100%)",
                          boxShadow:
                            "inset 0 2px 8px rgba(255,255,255,0.45), inset 0 -2px 5px rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <item.icon
                          style={{ width: 23, height: 23, color: "#0d1a00", strokeWidth: 2.3 }}
                        />
                      </div>
                    </div>

                    {/* Label */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        color: "#aaff3a",
                        marginTop: 5,
                        textShadow: "0 0 10px rgba(170,255,58,0.6)",
                        lineHeight: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                ) : (
                  /* ── INACTIVE ITEM: dark capsule with icon + label ── */
                  <div
                    style={{
                      width: 64,
                      height: 56,
                      borderRadius: 28,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      position: "relative",
                      marginTop: 8,
                    }}
                  >
                    <item.icon
                      style={{
                        width: 20,
                        height: 20,
                        color: "rgba(255,255,255,0.55)",
                        strokeWidth: 1.8,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.02em",
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
                          boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
