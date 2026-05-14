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
    >
      {/*
        Outer dark glass pill — overflow visible so the active
        circle can poke ~8 px above and below the 64 px bar.
      */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 8px",
          height: 64,
          borderRadius: 999,
          overflow: "visible",
          background: "rgba(22,22,26,0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {items.map((item) => {
          let isActive = false;
          if (item.href === "/home")     isActive = location === "/home";
          else if (item.href === "/messages") isActive = location.startsWith("/messages");
          else                           isActive = location.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                style={{ cursor: "pointer" }}
              >
                <AnimatePresence mode="wait">
                  {isActive ? (
                    /* ─────────────────────────────────────────────
                       ACTIVE — circle taller than the pill (80 px)
                       so it extends ±8 px beyond the 64 px bar.
                    ───────────────────────────────────────────── */
                    <motion.div
                      key="active"
                      layoutId="nav-bubble"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        /* Iridescent ring — dark oil-slick colours, green glow at top */
                        padding: 4,
                        background:
                          "conic-gradient(from 270deg, #55ff0a 0deg, #22aa30 40deg, #003320 80deg, #001510 120deg, #000008 160deg, #08000a 200deg, #180000 230deg, #050000 260deg, #001210 290deg, #00380a 330deg, #55ff0a 360deg)",
                        boxShadow:
                          "0 0 22px rgba(85,255,10,0.35), 0 6px 24px rgba(0,0,0,0.6)",
                      }}
                    >
                      {/* Inner glass circle — dark frosted */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          background: "rgba(28,30,28,0.92)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                        }}
                      >
                        {/* Lime green icon circle */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background:
                              "radial-gradient(circle at 35% 30%, #d4ff55, #88dd00)",
                            boxShadow:
                              "0 2px 10px rgba(136,221,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <item.icon
                            style={{
                              width: 18,
                              height: 18,
                              color: "#0d1800",
                              strokeWidth: 2.4,
                            }}
                          />
                        </div>

                        {/* Label */}
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            color: "#aaff22",
                            lineHeight: 1,
                            textShadow: "0 0 8px rgba(170,255,34,0.7)",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    /* ─────────────────────────────────────────────
                       INACTIVE — glass capsule, fits inside 64 px bar
                    ───────────────────────────────────────────── */
                    <motion.div
                      key="inactive"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        width: 68,
                        height: 56,
                        borderRadius: 28,
                        /* Glass capsule */
                        background: "rgba(50,52,56,0.60)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        position: "relative",
                      }}
                    >
                      <item.icon
                        style={{
                          width: 20,
                          height: 20,
                          color: "rgba(255,255,255,0.82)",
                          strokeWidth: 1.9,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.75)",
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
