import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Check, Camera, MessageCircle, User, Sparkles, Heart, Users, GraduationCap, ChevronRight, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NATIONALITIES = [
  "USA", "UK", "Canada", "Slovenia", "Germany", "France", "Italy", "Spain", "Japan", "South Korea", 
  "Australia", "Brazil", "Mexico", "Croatia", "Austria", "Switzerland", "Netherlands", "Sweden", "Norway", "Denmark",
  "Finland", "Poland", "Greece", "Turkey", "Egypt", "India", "China", "Thailand", "Vietnam", "Indonesia"
];

const ROLES = [
  { id: "lover", name: "Lover", icon: Heart, description: "Deeply romantic and affectionate." },
  { id: "friend", name: "Friend", icon: Users, description: "A loyal and supportive companion." },
  { id: "mentor", name: "Mentor", icon: GraduationCap, description: "Wisdom and guidance for your life." },
  { id: "rival", name: "Rival", icon: Sparkles, description: "Pushes you to be your absolute best." }
];

export default function CreateCompanion() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    appearance: {
      gender: "Woman",
      body: "Slim",
      hairColor: "Brown",
      hairStyle: "Waves",
      eyeColor: "Brown"
    },
    name: "",
    age: "",
    nationality: "USA",
    avatar: "",
    role: "friend",
    behavior: "writes like a human",
    facialHair: "Clean"
  });

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const APPEARANCE_OPTIONS = {
    gender: [
      { id: "Man", name: "Man", image: "/src/assets/character/gender_man.jpeg" },
      { id: "Woman", name: "Woman", image: "/src/assets/character/gender_woman.jpeg" }
    ],
    man: {
      body: [
        { id: "Slim", name: "Slim", image: "/src/assets/character/man/body_slim.jpeg" },
        { id: "Athletic", name: "Athletic", image: "/src/assets/character/man/body_athletic.jpeg" },
        { id: "Plus", name: "Plus", image: "/src/assets/character/man/body_plus.jpeg" }
      ],
      hairColor: [
        { id: "Black", name: "Black", image: "/src/assets/character/man/hair_color_black.jpeg" },
        { id: "Brown", name: "Brown", image: "/src/assets/character/man/hair_color_brown.jpeg" },
        { id: "Blonde", name: "Blonde", image: "/src/assets/character/man/hair_color_blonde.jpeg" }
      ],
      hairStyle: [
        { id: "Buzz", name: "Buzz", image: "/src/assets/character/man/hair_style_buzz.jpeg" },
        { id: "Fringe", name: "Fringe", image: "/src/assets/character/man/hair_style_fringe.jpeg" },
        { id: "Waves", name: "Waves", image: "/src/assets/character/man/hair_style_waves.jpeg" },
        { id: "Curls", name: "Curls", image: "/src/assets/character/man/hair_style_curls.jpeg" },
        { id: "Bun", name: "Man Bun", image: "/src/assets/character/man/hair_style_bun.jpeg" },
        { id: "Long", name: "Long", image: "/src/assets/character/man/hair_style_long.jpeg" }
      ],
      facialHair: [
        { id: "Stubble", name: "Stubble", image: "/src/assets/character/man/facial_stubble.jpeg" },
        { id: "Natural", name: "Moustache", image: "/src/assets/character/man/facial_stache_natural.jpeg" },
        { id: "Handlebar", name: "Handlebar", image: "/src/assets/character/man/facial_stache_handlebar.jpeg" },
        { id: "Medium", name: "Medium Beard", image: "/src/assets/character/man/facial_beard_medium.jpeg" },
        { id: "Full", name: "Full Beard", image: "/src/assets/character/man/facial_beard_full.jpeg" },
        { id: "Long", name: "Long Beard", image: "/src/assets/character/man/facial_beard_long.jpeg" }
      ],
      eyeColor: [
        { id: "Brown", name: "Brown", image: "/src/assets/character/man/eye_color_brown.jpeg" },
        { id: "Blue", name: "Blue", image: "/src/assets/character/man/eye_color_blue.jpeg" },
        { id: "Green", name: "Green", image: "/src/assets/character/man/eye_color_green.jpeg" }
      ]
    },
    woman: {
      body: [
        { id: "Slim", name: "Slim", image: "/src/assets/character/body_slim.jpeg" },
        { id: "Athletic", name: "Athletic", image: "/src/assets/character/body_athletic.png" },
        { id: "Plus", name: "Plus", image: "/src/assets/character/body_plus.jpeg" }
      ],
      hairColor: [
        { id: "Black", name: "Black", image: "/src/assets/character/hair_color_black.png" },
        { id: "Brown", name: "Brown", image: "/src/assets/character/hair_style_straight.png" },
        { id: "Blonde", name: "Blonde", image: "/src/assets/character/hair_color_blonde.png" }
      ],
      hairStyle: [
        { id: "Straight", name: "Straight", image: "/src/assets/character/hair_color_brown.jpeg" },
        { id: "Waves", name: "Waves", image: "/src/assets/character/hair_style_waves.jpeg" },
        { id: "Curls", name: "Curls", image: "/src/assets/character/hair_style_curls.jpeg" },
        { id: "Braids", name: "Braids", image: "/src/assets/character/hair_style_braids.jpeg" },
        { id: "Bun", name: "Bun", image: "/src/assets/character/hair_style_bun.jpeg" },
        { id: "Bob", name: "Bob", image: "/src/assets/character/hair_style_bob.jpeg" }
      ],
      eyeColor: [
        { id: "Brown", name: "Brown", image: "/src/assets/character/eye_color_brown.jpeg" },
        { id: "Blue", name: "Blue", image: "/src/assets/character/eye_color_blue.jpeg" },
        { id: "Green", name: "Green", image: "/src/assets/character/eye_color_green.jpeg" }
      ]
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 2 && (!formData.name || !formData.age)) {
      toast.error("Please fill in basic details");
      return;
    }
    if (step === 3 && !formData.avatar) {
      // Mock avatar if none provided for demo - use one of the character images as default
      setFormData(prev => ({ ...prev, avatar: "/src/assets/character/hair_color_brown.jpeg" }));
    }
    setStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    if (step === 0) setLocation("/messages");
    else setStep(prev => prev - 1);
  };

  const handleFinish = () => {
    const baseId = formData.name.toLowerCase().replace(/\s+/g, "");
    const existing = JSON.parse(localStorage.getItem("vaulty_companions") || "[]");
    
    let finalId = baseId;
    let counter = 1;
    while (existing.some((c: any) => c.id === finalId)) {
      finalId = `${baseId}${counter}`;
      counter++;
    }

    const newCompanion = {
      id: finalId,
      ...formData,
      createdAt: new Date().toISOString(),
      type: "companion",
      creatorId: userData?.uid || "guest",
      creatorUsername: userData?.username || "guest",
      isPublished: false,
      likes: 0
    };
    
    localStorage.setItem("vaulty_companions", JSON.stringify([...existing, newCompanion]));
    toast.success("Companion created!");
    setLocation(`/messages/${newCompanion.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full bg-white/5 border-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-black tracking-tight">CREATE COMPANION</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Modern Gradient Progress Bar */}
      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-12">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black">GENDER</h2>
              <p className="text-zinc-500 font-medium">Select the gender of your companion.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {APPEARANCE_OPTIONS.gender.map((opt) => (
                <motion.div
                  key={opt.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({...formData, appearance: {...formData.appearance, gender: opt.id}})}
                  className={cn(
                    "relative aspect-[3/4] rounded-3xl overflow-hidden border-2 transition-all cursor-pointer",
                    formData.appearance.gender === opt.id ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]" : "border-white/5 bg-zinc-900/40"
                  )}
                >
                  <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-lg font-black uppercase tracking-tighter">{opt.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black">APPEARANCE</h2>
              <p className="text-zinc-500 font-medium">Design your companion's physical traits.</p>
            </div>

            <div className="space-y-10 pb-10">
              {/* Body Type */}
              <div className="space-y-4">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Body Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(formData.appearance.gender === "Man" ? APPEARANCE_OPTIONS.man.body : APPEARANCE_OPTIONS.woman.body).map((opt) => (
                    <motion.div
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({...formData, appearance: {...formData.appearance, body: opt.id}})}
                      className={cn(
                        "relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                        formData.appearance.body === opt.id ? "border-cyan-500" : "border-white/5 bg-zinc-900/40"
                      )}
                    >
                      <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase text-center">{opt.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div className="space-y-4">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Hair Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(formData.appearance.gender === "Man" ? APPEARANCE_OPTIONS.man.hairStyle : APPEARANCE_OPTIONS.woman.hairStyle).map((opt) => (
                    <motion.div
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({...formData, appearance: {...formData.appearance, hairStyle: opt.id}})}
                      className={cn(
                        "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                        formData.appearance.hairStyle === opt.id ? "border-cyan-500" : "border-white/5 bg-zinc-900/40"
                      )}
                    >
                      <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase text-center">{opt.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div className="space-y-4">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Hair Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(formData.appearance.gender === "Man" ? APPEARANCE_OPTIONS.man.hairColor : APPEARANCE_OPTIONS.woman.hairColor).map((opt) => (
                    <motion.div
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({...formData, appearance: {...formData.appearance, hairColor: opt.id}})}
                      className={cn(
                        "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                        formData.appearance.hairColor === opt.id ? "border-cyan-500" : "border-white/5 bg-zinc-900/40"
                      )}
                    >
                      <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase text-center">{opt.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

      {/* Facial Hair (Men Only) */}
      {formData.appearance.gender === "Man" && (
        <div className="space-y-4">
          <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Facial Hair</Label>
          <div className="grid grid-cols-3 gap-3">
            {APPEARANCE_OPTIONS.man.facialHair.map((opt) => (
              <motion.div
                key={opt.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({...formData, appearance: {...formData.appearance, facialHair: opt.id}})}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                  formData.appearance.facialHair === opt.id ? "border-cyan-500" : "border-white/5 bg-zinc-900/40"
                )}
              >
                <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase text-center">{opt.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

              {/* Eye Color */}
              <div className="space-y-4">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Eye Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(formData.appearance.gender === "Man" ? APPEARANCE_OPTIONS.man.eyeColor : APPEARANCE_OPTIONS.woman.eyeColor).map((opt) => (
                    <motion.div
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({...formData, appearance: {...formData.appearance, eyeColor: opt.id}})}
                      className={cn(
                        "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                        formData.appearance.eyeColor === opt.id ? "border-cyan-500" : "border-white/5 bg-zinc-900/40"
                      )}
                    >
                      <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase text-center">{opt.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black">IDENTITY</h2>
              <p className="text-zinc-500 font-medium">Define your companion's basic essence.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter name..."
                  className="bg-zinc-900/50 border-white/5 h-16 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 transition-all text-lg font-bold px-6"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Age</Label>
                  <Input 
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="24"
                    className="bg-zinc-900/50 border-white/5 h-16 rounded-2xl text-lg font-bold px-6"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold text-xs uppercase tracking-widest ml-1">Nationality</Label>
                  <Select onValueChange={(v) => setFormData({...formData, nationality: v})} defaultValue={formData.nationality}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/5 h-16 rounded-2xl text-lg font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl max-h-[300px] overflow-y-auto">
                      {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-2 text-left">
              <h2 className="text-3xl font-black">VISUALS</h2>
              <p className="text-zinc-500 font-medium">How should your companion look?</p>
            </div>

            <div className="flex flex-col items-center justify-center pt-8">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-48 h-48 rounded-full bg-zinc-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-cyan-500/50">
                  {formData.avatar ? (
                    <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Camera className="w-12 h-12 text-zinc-700" />
                  )}
                </div>
                <div className="absolute bottom-2 right-2 p-4 bg-cyan-500 rounded-full shadow-lg hover:bg-cyan-400 transition-all active:scale-90">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <p className="mt-6 text-zinc-400 font-medium text-sm">Tap to upload profile picture</p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black">ROLE</h2>
              <p className="text-zinc-500 font-medium">Define the nature of your relationship.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const active = formData.role === role.id;
                return (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    key={role.id}
                    onClick={() => setFormData({...formData, role: role.id})}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-5",
                      active ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "border-white/5 bg-zinc-900/40"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      active ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-500"
                    )}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{role.name}</h3>
                      <p className="text-sm text-zinc-500 font-medium">{role.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black">TRAINING</h2>
              <p className="text-zinc-500 font-medium">Teach your companion how to speak.</p>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black italic">Wanna write like a human?</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  Upload a screenshot of your favorite chat. Our AI will analyze the tone, rhythm, and style to make your companion sound exactly like a real person.
                </p>
              </div>
              
              <Button className="w-full h-14 bg-white text-black font-black rounded-2xl hover:bg-zinc-200">
                UPLOAD SCREENSHOT
              </Button>
              <button 
                onClick={handleNext}
                className="w-full text-zinc-600 text-sm font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors"
              >
                Skip training
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black">PREVIEW</h2>
              <p className="text-zinc-500 font-medium">Review your new digital companion.</p>
            </div>

            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">{formData.role}</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-4xl font-black tracking-tighter">{formData.name}, {formData.age}</h3>
                  <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-black stroke-[3]" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-bold">
                  <span>{formData.nationality}</span>
                  <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                  <span>{formData.behavior}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="fixed bottom-10 left-6 right-6 flex gap-4">
        {step < totalSteps ? (
          <Button 
            onClick={handleNext}
            className="flex-1 h-16 bg-white text-black font-black rounded-2xl text-lg shadow-xl shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            NEXT STEP
            <ChevronRight size={20} />
          </Button>
        ) : (
          <Button 
            onClick={handleFinish}
            className="flex-1 h-16 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-pink-500/20 active:scale-[0.98] transition-all"
          >
            FINISH CREATION
          </Button>
        )}
      </div>
    </div>
  );
}
