import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";

interface TabItem {
  id: number;
  href: string;
  label: string;
  color: string;
  icon: (active: boolean) => React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: 0,
    href: "/home",
    label: "Home",
    color: "#FF3B30",
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-white" : "text-white/40"}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="9" strokeOpacity={active ? 0.4 : 0.2} />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="#FF3B30" strokeLinecap="round" />
        <path d="M12 6a6 6 0 0 1 6 6" stroke="#4CD964" strokeLinecap="round" />
        <path d="M12 9a3 3 0 0 1 3 3" stroke="#007AFF" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 1,
    href: "/discover",
    label: "Search",
    color: "#A4FF00",
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </svg>
    ),
  },
  {
    id: 2,
    href: "/create-companion",
    label: "Create",
    color: "#A4FF00",
    icon: (active) => (
      <div
        className={`p-1.5 rounded-full transition-all duration-300 ${
          active ? "bg-[#A4FF00] scale-110 shadow-[0_0_15px_rgba(164,255,0,0.5)]" : "bg-[#1C1C1E]"
        }`}
      >
        <svg
          className={`w-4 h-4 ${active ? "text-black" : "text-white/40"}`}
          viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M20.5 19l-4.39-2.1c-.57-.27-1.11-.63-1.61-1.04l-2.5-2.05c-.32-.27-.5-.67-.5-1.1V9c0-.55.45-1 1-1h.5c.55 0 1 .45 1 1v2h1V9c0-1.1-.9-2-2-2h-1c-1.1 0-2 .9-2 2v3.5c0 .35.1.69.28.98l2.42 3.91c.21.34.52.61.88.79L19.5 21l1-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM7 14l-1-1-3 3 1.5 1.5L7 15v-1z" />
        </svg>
      </div>
    ),
  },
  {
    id: 3,
    href: "/messages",
    label: "Chat",
    color: "#A4FF00",
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    href: "/premium",
    label: "Premium",
    color: "#A4FF00",
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  const [showSettings, setShowSettings] = useState(false);
  const [hideLabels, setHideLabels] = useState(false);
  const [scrollVisible, setScrollVisible] = useState(true);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const initialTouchX = useRef(0);
  const initialTouchY = useRef(0);
  const currentLeftRef = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);

  // Unread messages
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const chatUnreads: Record<string, number> = {};
      const inner = snap.docs.map((chatDoc) => {
        const mq = query(collection(db, "chats", chatDoc.id, "messages"), where("read", "==", false));
        return onSnapshot(mq, (ms) => {
          chatUnreads[chatDoc.id] = ms.docs.filter((d) => d.data().senderId !== user.uid).length;
          setUnreadCount(Object.values(chatUnreads).reduce((s, c) => s + c, 0));
        });
      });
      return () => inner.forEach((u) => u());
    });
    return () => unsub();
  }, [user]);

  // Sync active index from location
  useEffect(() => {
    let idx = 0;
    if (location === "/home") idx = 0;
    else if (location.startsWith("/discover")) idx = 1;
    else if (location.startsWith("/create-companion")) idx = 2;
    else if (location.startsWith("/messages")) idx = 3;
    else if (location.startsWith("/premium")) idx = 4;
    else return; // unknown route, don't move bubble
    setActiveIndex(idx);
  }, [location]);

  const getStep = useCallback(() => {
    if (!containerRef.current) return 0;
    return (containerRef.current.offsetWidth - 12) / 5;
  }, []);

  const snapToIndex = useCallback(
    (index: number, doNavigate = false) => {
      const step = getStep();
      const target = 6 + index * step;
      setLeft(target);
      currentLeftRef.current = target;
      setActiveIndex(index);
      setScaleX(0.9);
      setScaleY(1.1);
      setTimeout(() => { setScaleX(1); setScaleY(1); }, 200);
      if (doNavigate) navigate(TABS[index].href);
    },
    [getStep, navigate]
  );

  // Initial position
  useEffect(() => {
    const timer = setTimeout(() => {
      let idx = 0;
      if (location === "/home") idx = 0;
      else if (location.startsWith("/discover")) idx = 1;
      else if (location.startsWith("/create-companion")) idx = 2;
      else if (location.startsWith("/messages")) idx = 3;
      else if (location.startsWith("/premium")) idx = 4;
      snapToIndex(idx);
    }, 100);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setScrollVisible(false);
      } else {
        setScrollVisible(true);
      }
      lastScrollY.current = currentScrollY;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setScrollVisible(true), 800);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    initialTouchX.current = x;
    initialTouchY.current = y;

    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
      setShowSettings(true);
      setIsLongPressing(false);
      setIsDragging(false);
    }, 3000);

    setTimeout(() => {
      if (longPressTimer.current) setIsLongPressing(true);
    }, 1000);
  };

  const handleStartInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (showSettings) return;
    setIsDragging(true);
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) startXRef.current = x - currentLeftRef.current;
    startLongPress(e);
  };

  const onMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const y = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const dist = Math.sqrt(
        Math.pow(x - initialTouchX.current, 2) + Math.pow(y - initialTouchY.current, 2)
      );
      if (dist > 15 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        setIsLongPressing(false);
      }

      if (!isDragging || !containerRef.current) return;
      const step = getStep();
      const max = containerRef.current.offsetWidth - step - 6;
      let nextLeft = x - startXRef.current;

      if (nextLeft < 6) {
        nextLeft = 6;
        setScaleX(0.85);
      } else if (nextLeft > max) {
        nextLeft = max;
        setScaleX(0.85);
      } else {
        setScaleX(1.1);
        setScaleY(0.9);
      }

      setLeft(nextLeft);
      currentLeftRef.current = nextLeft;
      const idx = Math.max(0, Math.min(4, Math.round((nextLeft - 6) / step)));
      if (idx !== activeIndex) setActiveIndex(idx);
    },
    [isDragging, getStep, activeIndex]
  );

  const onEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
    if (!isDragging) return;
    setIsDragging(false);
    setScaleX(1);
    setScaleY(1);
    const step = getStep();
    const idx = Math.max(0, Math.min(4, Math.round((currentLeftRef.current - 6) / step)));
    snapToIndex(idx, true);
  }, [isDragging, getStep, snapToIndex]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, onMove, onEnd]);

  // Show on main nav pages only
  const mainPages = ["/home", "/discover", "/create-companion", "/messages", "/premium"];
  if (!mainPages.some(p => location === p || location.startsWith(p + "?"))) return null;

  return (
    <>
      {/* Settings overlay (long-press 3s) */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-[400px] bg-[#1C1C1E] border border-white/10 rounded-[38px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 active:bg-white/20 rounded-full text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setHideLabels(!hideLabels)}
                className="w-full flex items-center justify-between p-5 bg-white/5 active:bg-white/10 rounded-3xl transition-all border border-white/5"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-lg">Hide labels</span>
                  <span className="text-sm text-zinc-500">Icons only for a minimal look</span>
                </div>
                <div className={`w-14 h-8 rounded-full transition-all duration-300 relative ${hideLabels ? "bg-[#A4FF00]" : "bg-zinc-700"}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${hideLabels ? "left-7" : "left-1"}`} />
                </div>
              </button>
            </div>

            <div className="mt-10 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                Designed in California
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div
        className={`md:hidden fixed left-0 right-0 flex justify-center px-4 z-50 pointer-events-none select-none transition-all duration-700 ${
          scrollVisible ? "bottom-10 opacity-100 translate-y-0" : "bottom-0 opacity-0 translate-y-24"
        }`}
      >
        <div
          ref={containerRef}
          onMouseDown={handleStartInteraction}
          onTouchStart={handleStartInteraction}
          style={{ height: hideLabels ? "68px" : "84px" }}
          className={`relative flex items-center w-full max-w-[420px] bg-black rounded-[42px] p-1.5 shadow-[0_25px_50px_rgba(0,0,0,0.9)] pointer-events-auto border border-white/5 transition-all duration-500 ${
            isLongPressing ? "animate-pulse ring-2 ring-white/10" : ""
          }`}
        >
          {/* Sliding dark bubble */}
          <div
            style={{
              left: `${left}px`,
              width: containerRef.current ? getStep() : 0,
              transform: `scale(${scaleX}, ${scaleY}) ${isLongPressing ? "scale(0.95)" : ""}`,
              transition: isDragging
                ? "none"
                : "left 0.7s cubic-bezier(0.2, 1, 0.2, 1), transform 0.4s ease-out",
            }}
            className="absolute top-1.5 bottom-1.5 rounded-[36px] bg-[#1C1C1E] z-10 pointer-events-none"
          >
            <div className="absolute inset-0 rounded-[36px] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]" />
            {isLongPressing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-white/20 rounded-full animate-ping" />
              </div>
            )}
          </div>

          {/* Tabs */}
          {TABS.map((tab, i) => (
            <div
              key={tab.id}
              onClick={() => !isDragging && !showSettings && snapToIndex(i, true)}
              className="relative z-20 flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-transform duration-200 active:scale-90"
            >
              <div
                className={`transition-all duration-500 ${
                  activeIndex === i ? "scale-110 -translate-y-0.5" : "scale-100 opacity-100"
                }`}
              >
                <div className="relative">
                  {tab.icon(activeIndex === i)}
                  {/* Unread badge */}
                  {tab.href === "/messages" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 shadow-md">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {!hideLabels && (
                <span
                  className={`mt-1.5 text-[11px] tracking-tight transition-all duration-500 font-semibold text-white ${
                    activeIndex === i ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {tab.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ios-shake {
          0%   { transform: translate(0,0); }
          25%  { transform: translate(1px, 1px); }
          50%  { transform: translate(-1px, -1px); }
          75%  { transform: translate(1px, -1px); }
          100% { transform: translate(0,0); }
        }
        .ios-shake { animation: ios-shake 0.1s infinite; }
      `}</style>
    </>
  );
}
