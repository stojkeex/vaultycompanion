import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Home, Search, MessageSquare, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";

interface TabItem {
  id: number;
  href: string;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: 0,
    href: "/home",
    label: "Home",
    icon: (active) => (
      <Home
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        strokeWidth={2.2}
      />
    ),
  },
  {
    id: 1,
    href: "/discover",
    label: "Search",
    icon: (active) => (
      <Search
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        strokeWidth={2.2}
      />
    ),
  },
  {
    id: 2,
    href: "/create-companion",
    label: "Create",
    icon: (active) => (
      <div
        className={`p-1.5 rounded-full transition-all duration-300 ${
          active
            ? "bg-[#A4FF00] shadow-[0_0_20px_rgba(164,255,0,0.4)]"
            : "bg-white/10"
        }`}
      >
        <svg
          className={`w-4 h-4 ${active ? "text-black" : "text-white/40"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    ),
  },
  {
    id: 3,
    href: "/messages",
    label: "Chat",
    icon: (active) => (
      <MessageSquare
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        strokeWidth={2.2}
      />
    ),
  },
  {
    id: 4,
    href: "/premium",
    label: "Premium",
    icon: (active) => (
      <Zap
        className={`w-6 h-6 transition-colors duration-300 ${active ? "text-[#A4FF00]" : "text-white/40"}`}
        strokeWidth={2.2}
      />
    ),
  },
];

export function BottomNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine active index from current route
  const getActiveIndex = useCallback(() => {
    if (location === "/home") return 0;
    if (location.startsWith("/discover")) return 1;
    if (location.startsWith("/create-companion")) return 2;
    if (location.startsWith("/messages")) return 3;
    if (location.startsWith("/premium")) return 4;
    return -1;
  }, [location]);

  const [activeIndex, setActiveIndex] = useState(() => getActiveIndex());
  const [bubbleLeft, setBubbleLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [stretch, setStretch] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ startX: 0 });

  // Sync activeIndex when route changes
  useEffect(() => {
    const idx = getActiveIndex();
    if (idx >= 0) setActiveIndex(idx);
  }, [location, getActiveIndex]);

  // Unread messages
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const chatUnreads: Record<string, number> = {};
      const innerUnsubs = snap.docs.map((chatDoc) => {
        const mq = query(collection(db, "chats", chatDoc.id, "messages"), where("read", "==", false));
        return onSnapshot(mq, (ms) => {
          chatUnreads[chatDoc.id] = ms.docs.filter((d) => d.data().senderId !== user.uid).length;
          setUnreadCount(Object.values(chatUnreads).reduce((s, c) => s + c, 0));
        });
      });
      return () => innerUnsubs.forEach((u) => u());
    });
    return () => unsub();
  }, [user]);

  const getLayoutInfo = useCallback(() => {
    if (!containerRef.current) return { width: 0, step: 0 };
    const containerWidth = containerRef.current.offsetWidth;
    const step = (containerWidth - 10) / 5;
    return { width: containerWidth, step };
  }, []);

  const updatePosition = useCallback(
    (index: number) => {
      const { step } = getLayoutInfo();
      setBubbleLeft(5 + index * step);
    },
    [getLayoutInfo]
  );

  useEffect(() => {
    updatePosition(activeIndex >= 0 ? activeIndex : 0);
    const handleResize = () => updatePosition(activeIndex >= 0 ? activeIndex : 0);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, updatePosition]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const bubbleRect = bubbleRef.current?.getBoundingClientRect();
    if (bubbleRect) dragInfo.current.startX = clientX - bubbleRect.left;
  };

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const containerRect = containerRef.current.getBoundingClientRect();
      const { step, width } = getLayoutInfo();

      let newLeft = clientX - containerRect.left - dragInfo.current.startX;
      newLeft = Math.max(5, Math.min(width - step - 5, newLeft));

      const delta = newLeft - bubbleLeft;
      setStretch(Math.min(Math.abs(delta) * 0.1, 0.18));
      setBubbleLeft(newLeft);

      const midPoint = newLeft + step / 2;
      const idx = Math.max(0, Math.min(4, Math.floor(((midPoint - 5) / (width - 10)) * 5)));
      if (idx !== activeIndex) setActiveIndex(idx);
    },
    [isDragging, bubbleLeft, getLayoutInfo, activeIndex]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setStretch(0);

    const { step } = getLayoutInfo();
    const closestIdx = Math.max(0, Math.min(4, Math.round((bubbleLeft - 5) / step)));
    setActiveIndex(closestIdx);
    setBubbleLeft(5 + closestIdx * step);
    navigate(TABS[closestIdx].href);
  }, [isDragging, bubbleLeft, getLayoutInfo, navigate]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const shouldHide =
    location === "/login" || location === "/register" || location === "/" ||
    location === "/ai" || location.startsWith("/companion/") ||
    location.startsWith("/messages/") || location === "/tos" ||
    location.startsWith("/demo-trading/") || location.startsWith("/chat/private/") ||
    location.startsWith("/course/") || location.startsWith("/coin/") ||
    location.startsWith("/wallet") || location.startsWith("/user/") ||
    location === "/create-post" || location === "/create-listing";

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none z-50">
      <div
        ref={containerRef}
        className="relative flex items-center w-full max-w-[500px] h-[72px] p-1.5 bg-zinc-900/60 border border-white/10 rounded-[40px] backdrop-blur-3xl saturate-150 pointer-events-auto select-none overflow-hidden isolate"
      >
        {/* Draggable glass bubble */}
        <div
          ref={bubbleRef}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{
            left: `${bubbleLeft}px`,
            width: containerRef.current
              ? (containerRef.current.offsetWidth - 10) / 5
              : 0,
            transform: `scale(${1 + stretch}, ${1 - stretch / 2.5})`,
            transition: isDragging
              ? "none"
              : "left 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 10,
          }}
          className="absolute top-1.5 bottom-1.5 rounded-[34px] cursor-grab active:cursor-grabbing border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -top-[50%] left-0 right-0 h-full bg-white/5 blur-xl rounded-full pointer-events-none" />
        </div>

        {/* Tab items */}
        {TABS.map((tab, i) => (
          <div
            key={tab.id}
            onClick={() => {
              if (!isDragging) {
                setActiveIndex(i);
                navigate(tab.href);
              }
            }}
            className="relative z-20 flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
          >
            <div
              style={{
                transform: activeIndex === i ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className="flex flex-col items-center"
            >
              <div className="mb-1 h-7 flex items-center justify-center relative">
                {tab.icon(activeIndex === i)}
                {/* Unread badge on Chat */}
                {tab.href === "/messages" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 shadow-md z-30">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight transition-colors duration-500 ${
                  activeIndex === i
                    ? "text-[#A4FF00] font-bold"
                    : "text-white/40 font-medium"
                }`}
              >
                {tab.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
