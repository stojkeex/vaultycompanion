import { useState, useRef, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Send, Heart, User, Shield, Info, Globe, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Assets
import miaImg from "@assets/IMG_8977_1767693713035.jpeg";
import miaLiveVideo from "@assets/copy_579E513D-1100-4B58-B037-FF2EFAE69B7B_1767729725909.mov";

export default function LiveStream() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Mock sending message
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={miaLiveVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10">
          <Avatar className="w-10 h-10 border border-white/20">
            <AvatarImage src={miaImg} className="object-cover" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none">Mia</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setLocation("/home")}
          className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white active:scale-90 transition-all"
        >
          <X size={24} />
        </button>
      </div>

      {/* Bottom Interface */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Interaction controls */}
          <div className="flex justify-end gap-3 px-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-white"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button className="p-3 bg-pink-500 rounded-full border border-pink-400 text-white shadow-lg shadow-pink-500/40">
              <Heart size={20} className="fill-white" />
            </button>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                className="bg-black/40 backdrop-blur-xl border-white/10 rounded-2xl h-12 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-pink-500 pr-12"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-400">
                <span className="text-xl">😊</span>
              </div>
            </div>
            <Button 
              type="submit"
              className="w-12 h-12 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all shrink-0 p-0"
            >
              <Send size={20} strokeWidth={2.5} />
            </Button>
          </form>
        </div>
      </div>

      {/* Live Badge Overlay on video */}
      <div className="absolute top-20 left-4 z-10 pointer-events-none">
        <div className="bg-red-600 px-2 py-0.5 rounded flex items-center gap-1.5">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live</span>
          <div className="w-1 h-1 bg-white rounded-full" />
          <span className="text-[10px] font-bold text-white">1.2k</span>
        </div>
      </div>
    </div>
  );
}
