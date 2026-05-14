import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";

import homeIcon from "@assets/0A3BEBF9-26FF-48A1-A366-528733C1D820_1778774657947.jpeg";
import searchIcon from "@assets/D016AA95-B692-485A-9C9B-D11838E6F954_1778774657947.jpeg";
import createIcon from "@assets/71F75B47-DC5D-4C31-923C-180E31E48954_1778774657947.jpeg";
import chatIcon from "@assets/7C9486EB-3316-4526-AF84-A4C49D166F83_1778774657947.jpeg";
import premiumIcon from "@assets/F3BFEC33-FBA0-4FB7-8A02-42465D31B188_1778774657947.jpeg";

interface TabItem {
  id: number;
  href: string;
  label: string;
  img: string;
}

const TABS: TabItem[] = [
  { id: 0, href: "/home",             label: "Home",    img: homeIcon    },
  { id: 1, href: "/discover",         label: "Search",  img: searchIcon  },
  { id: 2, href: "/create-companion", label: "Create",  img: createIcon  },
  { id: 3, href: "/messages",         label: "Chat",    img: chatIcon    },
  { id: 4, href: "/premium",          label: "Premium", img: premiumIcon },
];

function NavIcon({ src, active }: { src: string; active: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskMode: "luminance",
        WebkitMaskMode: "luminance",
        background: active
          ? "linear-gradient(135deg, #4477FF 0%, #8833FF 50%, #FF33EE 100%)"
          : "white",
        opacity: active ? 1 : 0.45,
        transition: "background 0.3s ease, opacity 0.3s ease",
      }}
    />
  );
}

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
    else return;
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
          {TABS.map((tab, i) => {
            const isActive = activeIndex === i;
            return (
              <div
                key={tab.id}
                onClick={() => !isDragging && !showSettings && snapToIndex(i, true)}
                className="relative z-20 flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-transform duration-200 active:scale-90"
              >
                <div
                  className={`transition-all duration-500 ${
                    isActive ? "scale-110 -translate-y-0.5" : "scale-100"
                  }`}
                >
                  <div className="relative">
                    <NavIcon src={tab.img} active={isActive} />
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
                      isActive ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    {tab.label}
                  </span>
                )}
              </div>
            );
          })}
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
