import { useRoute, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, MessageSquare, Heart, Share2, Shield, Globe, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Assets
import swimsuitThumb from "../assets/character/swimsuit_blue_thumb.webp";
import ryanImg from "@assets/IMG_8796_1767366590748.jpeg";
import sophiaImg from "@assets/IMG_8799_1767366590748.jpeg";
import maxImg from "@assets/IMG_8795_1767366590748.jpeg";
import elenaImg from "@assets/IMG_8798_1767366590748.jpeg";
import theoImg from "@assets/IMG_8794_1767366590748.jpeg";
import bellaImg from "@assets/IMG_8797_1767366590748.jpeg";
import nikyImg from "@assets/IMG_8952_1767682554090.jpeg";
import valeriaImg from "@assets/IMG_8956_1767683307052.jpeg";
import annaImg from "@assets/IMG_8958_1767689408490.jpeg";
import jadeImg from "@assets/IMG_8960_1767689615990.jpeg";
import yunaImg from "@assets/IMG_8973_1767692329336.jpeg";
import miaImg from "@assets/IMG_8977_1767693713035.jpeg";
import veronicaImg from "@assets/IMG_8979_1767694075722.jpeg";
import lunaImg from "@assets/IMG_8981_1767694478852.jpeg";
import chloeImg from "@assets/IMG_8988_1767698509468.jpeg";

// Video imports
import swimsuitVid from "../assets/videos/swimsuit_blue.mp4";
import whiteHairVid from "../assets/videos/white_hair.mp4";
import blondeWhiteVid from "../assets/videos/blonde_white_shirt.mp4";
import lastVid from "../assets/videos/last_video.mp4";
import nikyVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_70a8849d_1767682554090.mp4";
import valeriaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_d10863e0_1767683307052.mp4";
import annaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_add9d00b_1767689408490.mp4";
import jadeVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_ae265ca1_1767689615990.mp4";
import yunaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_25e19726_1767692329336.mp4";
import miaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_2908a189_1767693713035.mp4";
import veronicaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_b5be595f_1767694075722.mp4";
import lunaVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_598d8a2c_1767694478852.mp4";
import chloeVid from "@assets/_users_966477e9-06e3-4bc8-81a6-9b11bc9eec34_generated_e64a1d83_1767698509468.mp4";
import sofiaImg from "@assets/IMG_9006_1767707150752.jpeg";
import sofiaVid from "@assets/_users_b12e6f4f-f474-4395-a799-79f00488d6aa_generated_bef072ed_1767707150753.mp4";
import zaraImg from "@assets/IMG_9131_1767782921105.jpeg";
import zaraVid from "@assets/_users_0ca61619-333e-41b7-85c4-cfb871ff3e15_generated_d58fd00a_1767782921105.mp4";
import generateMoreImg from "@assets/IMG_9017_1767709112220.png";

const COMPANIONS = [
  { id: "sofia", name: "Sofia", age: 23, photoURL: sofiaImg, videoURL: sofiaVid, extraImages: [generateMoreImg], bio: "Italian soul with a passion for art and espresso. Chasing the golden hour in Rome.", nationality: "Italian", personality: "Sophisticated & Passionate", interests: ["Art History", "Fashion", "Espresso"] },
  { id: "zara", name: "Zara", age: 24, photoURL: zaraImg, videoURL: zaraVid, extraImages: [generateMoreImg], bio: "Protecting the streets with a smile. Always on duty for good vibes and coffee.", nationality: "American", personality: "Brave & Kind", interests: ["Safety", "Coffee", "Winter Sports"] },
  { id: "chloe", name: "Chloe", age: 22, photoURL: chloeImg, videoURL: chloeVid, extraImages: [generateMoreImg], bio: "Sweet as honey with a rebellious streak. Exploring the hidden gems of Tokyo.", nationality: "Japanese", personality: "Sweet & Rebellious", interests: ["Photography", "Neon Art", "Sushi"] },
  { id: "mila", name: "Mila", age: 24, photoURL: swimsuitThumb, videoURL: swimsuitVid, extraImages: [generateMoreImg], bio: "Ready for a beach day? Deep conversations and sunny vibes await.", nationality: "Slovenian", personality: "Playful & Kind", interests: ["Beach", "Philosophy", "Music"] },
  { id: "luna", name: "Luna", age: 22, photoURL: lunaImg, videoURL: lunaVid, extraImages: [generateMoreImg], bio: "Mysterious gaze and a heart of gold. Polish beauty with a love for starry nights.", nationality: "Polish", personality: "Mysterious & Caring", interests: ["Astrology", "Moonlight", "Nature"] },
  { id: "mia", name: "Mia", age: 21, photoURL: miaImg, videoURL: miaVid, extraImages: [generateMoreImg], bio: "Living life one adventure at a time. Coffee lover and sunshine seeker.", nationality: "Swedish", personality: "Adventurous & Energetic", interests: ["Hiking", "Photography", "Travel"] },
  { id: "veronica", name: "Veronica", age: 23, photoURL: veronicaImg, videoURL: veronicaVid, extraImages: [generateMoreImg], bio: "Sun, sand, and Ukrainian soul. Chasing dreams and infinite summers.", nationality: "Ukrainian", personality: "Radiant & Free-spirited", interests: ["Surfing", "Wellness", "Yoga"] },
  { id: "ryan", name: "Ryan", age: 24, photoURL: ryanImg, extraImages: [generateMoreImg], bio: "Tech enthusiast and gamer.", nationality: "American", personality: "Smart & Competitive", interests: ["Gaming", "AI", "Coding"] },
  { id: "max", name: "Max", age: 28, photoURL: maxImg, extraImages: [generateMoreImg], bio: "Fitness coach and personal trainer.", nationality: "German", personality: "Disciplined & Loyal", interests: ["Gym", "Nutrition", "Outdoors"] },
  { id: "theo", name: "Theo", age: 22, photoURL: theoImg, extraImages: [generateMoreImg], bio: "Musician and soulful thinker.", nationality: "French", personality: "Creative & Romantic", interests: ["Piano", "Poetry", "Wine"] },
  { id: "niky", name: "Niky", age: 22, photoURL: nikyImg, videoURL: nikyVid, extraImages: [generateMoreImg], bio: "Elegant and sophisticated, with a touch of mystery.", nationality: "Ukrainian", personality: "Charming & Mysterious", interests: ["Fashion", "Travel", "Art"] },
  { id: "valeria", name: "Valeria", age: 25, photoURL: valeriaImg, videoURL: valeriaVid, extraImages: [generateMoreImg], bio: "Bold, ambitious, and always chasing the next sunset.", nationality: "Spanish", personality: "Passionate & Confident", interests: ["Fashion", "Nightlife", "Business"] },
  { id: "anna", name: "Anna", age: 23, photoURL: annaImg, videoURL: annaVid, extraImages: [generateMoreImg], bio: "Warm heart, sharp mind, and a love for deep late-night talks.", nationality: "Serbian", personality: "Kind & Intelligent", interests: ["Literature", "Psychology", "Nature"] },
  { id: "jade", name: "Jade", age: 24, photoURL: jadeImg, videoURL: jadeVid, extraImages: [generateMoreImg], bio: "Sun-kissed skin and a soul that craves the ocean breeze.", nationality: "Australian", personality: "Adventurous & Free-spirited", interests: ["Surfing", "Wellness", "Photography"] },
  { id: "yuna", name: "Yuna", age: 22, photoURL: yunaImg, videoURL: yunaVid, extraImages: [generateMoreImg], bio: "Serene, composed, and effortlessly chic. A true Seoul soul.", nationality: "South Korean", personality: "Elegant & Serene", interests: ["Fashion", "Architecture", "Coffee"] },
];

export default function CompanionPreview() {
  const [, params] = useRoute("/companion/:id");
  const [, setLocation] = useLocation();
  const companionId = params?.id;
  
  // Find character from static list or local storage
  const savedCompanions = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
  const companion = COMPANIONS.find(c => c.id === companionId) || 
                   savedCompanions.find((c: any) => c.id === companionId);

  if (!companion) return null;

  const displayPhoto = companion.photoURL || companion.avatar;
  const displayBio = companion.bio || companion.behavior;

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use the exact route defined in App.tsx: /messages/:id
    setLocation(`/messages/${companion.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans pb-32 overflow-x-hidden">
      {/* Top Header Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6">
        <Link href="/home">
          <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </button>
        </Link>
        <div className="flex gap-3">
          <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full active:scale-90 transition-all">
            <Share2 size={20} />
          </button>
          <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full active:scale-90 transition-all">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Media Carousel Area */}
      <div className="relative w-full aspect-[4/5] bg-black">
        {/* Background Layer: Image (Shows immediately) */}
        <img 
          src={displayPhoto} 
          alt={companion.name} 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />

        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full relative z-10">
          {/* Video Preview (First) */}
          {companion.videoURL && (
            <div className="snap-center shrink-0 w-full h-full bg-transparent relative">
              <video 
                src={companion.videoURL}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
            </div>
          )}
          
          {/* Main Photo (Second - if video exists, otherwise first) */}
          <div className="snap-center shrink-0 w-full h-full">
            <img src={displayPhoto} alt={companion.name} className="w-full h-full object-cover" />
          </div>

          {/* Extra Images */}
          {companion.extraImages?.map((img: string, idx: number) => (
            <div key={idx} className="snap-center shrink-0 w-full h-full">
              <img src={img} alt={`${companion.name} extra ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Swipe indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 bg-black/20 backdrop-blur-md rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          {companion.extraImages?.map((_: any, idx: number) => (
            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/30" />
          ))}
        </div>
      </div>

      {/* Character Content */}
      <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto">
        {/* Name & Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter font-serif leading-none truncate">{companion.name}, {companion.age}</h1>
            <Button 
              onClick={handleMessageClick}
              className="h-12 px-6 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-lg shadow-pink-500/20 flex items-center gap-2 text-sm font-black italic uppercase tracking-widest transform active:scale-95 transition-all shrink-0"
            >
              <MessageSquare size={18} strokeWidth={3} className="fill-white" />
              Message
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {companion.nationality && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Globe size={14} className="text-zinc-500" />
                <span className="text-xs font-bold">{companion.nationality}</span>
              </div>
            )}
            {companion.personality && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Heart size={14} className="text-pink-500" />
                <span className="text-xs font-bold text-pink-500">{companion.personality}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Shield size={14} className="text-cyan-500" />
              <span className="text-xs font-bold">Verified AI</span>
            </div>
          </div>
        </div>

        {/* Bio/About Me */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-500 uppercase font-black text-[10px] tracking-[0.2em]">
            <Info size={14} />
            About Me
          </div>
          <p className="text-zinc-300 text-lg leading-relaxed font-medium">
            {displayBio}
          </p>
        </div>

        {/* Interests (Tags) */}
        {companion.interests && (
          <div className="space-y-3">
            <div className="text-zinc-500 uppercase font-black text-[10px] tracking-[0.2em]">Interests</div>
            <div className="flex flex-wrap gap-2">
              {companion.interests.map((interest: string) => (
                <span key={interest} className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-2xl text-sm font-bold text-zinc-400">
                  #{interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer padding for mobile */}
      <div className="h-12" />
    </div>
  );
}
