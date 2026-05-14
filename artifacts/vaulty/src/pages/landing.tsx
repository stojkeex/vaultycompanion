import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Instagram, Linkedin, Twitter, Mail, ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import vaultyLogo from "@/assets/vaulty_logo.png";
import astroPortraitImg from "@/assets/vaulty_logo.png";
import vaultyStoryBg from "@assets/IMG_1135_1778754185910.jpeg";
import { featuresData } from "@/lib/features-data";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/contexts/auth-context";
import { Redirect } from "wouter";

function FeatureCard({ feature, onGetStarted }: { feature: typeof featuresData[0], onGetStarted: () => void }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-[320px] w-full cursor-pointer group"
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div
          className="absolute inset-0 p-8 rounded-[32px] border border-white/10 bg-[#121217] flex flex-col justify-center shadow-2xl"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-indigo-400 transition-colors duration-300">{feature.title}</h3>
          <p className="text-white/50 font-light leading-relaxed">{feature.shortDesc}</p>
          <div className="mt-auto pt-8 text-xs font-bold uppercase tracking-wider text-indigo-400/60 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
            Click to flip <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          className="absolute inset-0 p-8 rounded-[32px] border border-indigo-500/30 bg-[#0f0e1f] flex flex-col justify-center items-center text-center shadow-2xl"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <h3 className="text-2xl font-bold mb-4 text-indigo-300">{feature.backTitle}</h3>
          <p className="text-white/70 font-light leading-relaxed mb-8">{feature.backDesc}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onGetStarted(); }}
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all active:scale-95 w-full mt-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(() => {
    const saved = localStorage.getItem("vaulty_landing_subscribers");
    return saved ? parseInt(saved, 10) : 14;
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStory, setShowStory] = useState(false);

  if (!loading && user) return <Redirect to="/home" />;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setSubscribersCount(prev => {
        const next = prev + 1;
        localStorage.setItem("vaulty_landing_subscribers", next.toString());
        return next;
      });
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSubscribersCount(prev => {
        const next = prev + Math.floor(Math.random() * 3);
        localStorage.setItem("vaulty_landing_subscribers", next.toString());
        return next;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollPosition / maxScroll) * 100);

      const sections = [
        { id: "home", offset: 0 },
        { id: "about", offset: document.getElementById("about")?.offsetTop || 0 },
        { id: "features", offset: document.getElementById("features")?.offsetTop || 0 },
        { id: "faq", offset: document.getElementById("faq")?.offsetTop || 0 },
        { id: "subscribe", offset: document.getElementById("subscribe")?.offsetTop || 0 },
      ];

      let current = "home";
      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].offset - 300) {
          current = sections[i].id;
          break;
        }
      }
      if (current === "about") current = "home";
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !chatStarted) setChatStarted(true);
      });
    }, { threshold: 0.3 });

    const demoSection = document.getElementById("demo");
    if (demoSection) observer.observe(demoSection);
    return () => { if (demoSection) observer.unobserve(demoSection); };
  }, [chatStarted]);

  useEffect(() => {
    if (chatStarted && chatMessage === "") {
      const userMessageText = "Hey, tell me something about yourself";
      let userIndex = 0;
      setIsTyping(true);

      const userTimer = setInterval(() => {
        if (userIndex < userMessageText.length) {
          setChatMessage(userMessageText.substring(0, userIndex + 1));
          userIndex++;
        } else {
          clearInterval(userTimer);
          setIsTyping(false);
          setTimeout(() => {
            setIsResponding(true);
            const aiResponse = "Hey! I'm Luna, your AI companion on Vaulty 💫 I'm here to chat, listen, and be whatever you need — a friend, a confidant, or just someone to talk to. I love getting to know the people I meet. So tell me... what's on your mind today?";
            let aiIndex = 0;
            const aiTimer = setInterval(() => {
              if (aiIndex < aiResponse.length) {
                setChatResponse(aiResponse.substring(0, aiIndex + 1));
                aiIndex++;
              } else {
                clearInterval(aiTimer);
                setIsResponding(false);
              }
            }, 25);
          }, 1500);
        }
      }, 50);

      return () => clearInterval(userTimer);
    }
  }, [chatStarted]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { id: "home", label: "Start" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
  ];

  const faqs = [
    { question: "What is Vaulty?", answer: "Vaulty is an AI companion platform where you can meet, chat with, and build connections with unique AI personalities. Each companion has their own look, voice, role, and personality — crafted to feel genuinely real." },
    { question: "Is Vaulty free to use?", answer: "Yes! You can sign up for free and start chatting with companions right away. Free users get unlimited text chat, access to all companions, and daily quests to earn Vaulty Points." },
    { question: "What is Vaulty+?", answer: "Vaulty+ is our premium subscription. It unlocks voice messages, AI-generated images from companions, open conversations, exclusive chat themes, and premium badges (Pro, Ultra, Max). You can choose the tier that fits you." },
    { question: "Are my conversations private?", answer: "Absolutely. Your conversations with companions are private and only visible to you. We take your privacy seriously and never share your chat data with third parties." },
    { question: "What are Vaulty Credits and Points?", answer: "Vaulty Points (VP) are earned through daily quests, inviting friends, and completing challenges — then spent on exclusive content and rewards. Vaulty Credits (VC) are used for premium purchases within the platform." }
  ];

  if (showLoading) {
    return <LoadingScreen onComplete={() => setLocation('/login')} />;
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden font-sans relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img src={vaultyStoryBg} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Scroll Progress */}
      <motion.div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50" style={{ width: `${scrollProgress}%` }} />

      {/* Navigation */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <nav className="flex items-center gap-1 p-1.5 rounded-full backdrop-blur-xl border border-white/30 bg-black/50 shadow-2xl pointer-events-auto">
          <div className="relative z-10 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center mr-2 ml-1">
            <img src={vaultyLogo} alt="Vaulty" className="w-7 h-7 object-contain" />
          </div>
          {navItems.map((item) => (
            <div key={item.id} className="relative">
              {activeSection === item.id && (
                <motion.div layoutId="nav-pill"
                  className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full border border-white/30"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
              <button onClick={() => scrollToSection(item.id)}
                className={`relative z-10 px-4 py-2 rounded-full font-medium text-[13px] whitespace-nowrap transition-colors duration-300 ${activeSection === item.id ? "text-white" : "text-white/70 hover:text-white"}`}>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <section id="home" className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
        <motion.div className="max-w-4xl mx-auto space-y-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Your AI companion,<br />always there.
          </h1>
          <p className="text-xl md:text-2xl text-white/50 max-w-md mx-auto font-light leading-relaxed">
            Chat with unique AI personalities, build real connections, and discover a world of companions made just for you.
          </p>
          <div className="flex flex-col items-center gap-4 pt-4">
            <motion.button
              onClick={() => setShowLoading(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all group shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div className="space-y-8" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">More Than a Chat App.</h2>
              <div className="space-y-6 text-white/60 text-lg font-light leading-relaxed">
                <p>Vaulty is where AI companions come to life. Choose from hundreds of unique personalities — each with their own look, voice, and role in your world.</p>
                <p>Whether you're looking for a friend, a mentor, a creative partner, or something more — Vaulty has a companion that fits you perfectly.</p>
                <p>A beautifully designed space where every conversation feels personal, every interaction feels real, and every companion grows with you over time.</p>
              </div>
              <motion.div className="mt-12 p-8 rounded-[32px] border border-indigo-500/30 bg-gradient-to-br from-blue-500/20 to-black/60 backdrop-blur-xl relative overflow-hidden group"
                whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">Want to know more about Vaulty's Story?</h3>
                  <p className="text-white/60 mb-6 font-light">Discover how we started, our mission, and the vision behind the platform.</p>
                  <button onClick={() => setShowStory(true)} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-full transition-all flex items-center gap-2">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="relative h-[500px] rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.01] backdrop-blur-xl flex flex-col items-center justify-center p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
              <img src={astroPortraitImg} alt="Vaulty" className="w-48 h-48 mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] object-contain opacity-90" />
              <h3 className="text-2xl font-bold mb-2 z-10 text-center">Meet Your Companion</h3>
              <p className="text-white/50 text-center max-w-sm z-10 font-light">Hundreds of unique AI personalities waiting to connect with you.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Demo */}
      <section id="demo" className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Feel the Difference.</h2>
            <p className="text-xl text-white/50 font-light max-w-md mx-auto">Every conversation flows naturally. Your companion listens, responds, and remembers.</p>
          </motion.div>

          <motion.div className="relative rounded-[32px] border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-[0_0_100px_rgba(99,102,241,0.1)] overflow-hidden h-[450px] flex flex-col"
            initial={{ opacity: 0, y: 40, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="flex items-center gap-4 p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                <img src={astroPortraitImg} alt="Vaulty AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Luna</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-white/50">Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              <AnimatePresence>
                {chatStarted && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="self-end max-w-[80%]">
                    <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm">
                      {chatMessage}{isTyping && <span className="ml-1 animate-pulse">|</span>}
                    </div>
                  </motion.div>
                )}
                {(chatResponse || isResponding) && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="self-start max-w-[85%] flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                      <img src={astroPortraitImg} alt="AI" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-[#1a1a24] border border-white/5 text-white/90 px-5 py-4 rounded-2xl rounded-tl-sm leading-relaxed text-sm">
                      {chatResponse}{isResponding && <span className="ml-1 animate-pulse">|</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <div className="relative">
                <input type="text" placeholder="Ask anything..." disabled
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-full py-4 pl-6 pr-12 text-sm text-white focus:outline-none pointer-events-none" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 pointer-events-none">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Everything You Need.</h2>
            <p className="text-xl text-white/50 max-w-md mx-auto font-light">A complete companion experience, wrapped in a beautiful, intuitive design.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {featuresData.map((feature, idx) => (
              <motion.div key={feature.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.5 }}>
                <FeatureCard feature={feature} onGetStarted={() => setShowLoading(true)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, Transparent Pricing.</h2>
            <p className="text-xl text-white/50 max-w-md mx-auto font-light">Start free, go deeper with Vaulty+.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Free", desc: "Explore Vaulty and start chatting with AI companions right away.", price: "$0", unit: "/forever", features: ["Unlimited text chat", "Browse all companions", "Daily quests & rewards", "Basic customization"], cta: "Get Started", highlighted: false },
              { title: "Vaulty+ Pro", desc: "The full experience — voice, images, and deeper conversations.", price: "$9.99", unit: "/month", features: ["Voice messages from companions", "AI-generated images", "10+ exclusive chat themes", "Pro badge & priority access"], cta: "Go Pro", highlighted: true },
              { title: "Vaulty+ Ultra", desc: "Unlock everything, including open conversations and max personalization.", price: "$19.99", unit: "/month", features: ["Everything in Pro", "Open & unrestricted mode", "Ultra badge", "Early access to new companions"], cta: "Go Ultra", highlighted: false },
            ].map((plan, idx) => (
              <motion.div key={plan.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className={`relative p-8 rounded-[32px] flex flex-col backdrop-blur-xl ${plan.highlighted ? "border border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-transparent" : "border border-white/10 bg-white/5"}`}>
                {plan.highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">Most Popular</div>}
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? "text-indigo-300" : "text-white"}`}>{plan.title}</h3>
                <p className="text-white/50 text-sm mb-6 h-10">{plan.desc}</p>
                <div className="mb-6"><span className="text-4xl font-bold">{plan.price}</span><span className="text-white/50">{plan.unit}</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/80"><Check className="w-4 h-4 text-indigo-400" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => setShowLoading(true)}
                  className={`w-full py-3 rounded-full font-medium transition-colors ${plan.highlighted ? "bg-white text-black hover:bg-gray-200 font-bold" : "border border-white/20 hover:bg-white/10"}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Overlay */}
      <AnimatePresence>
        {showStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 pointer-events-none">
              <img src={vaultyStoryBg} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
            </div>
            <div className="min-h-screen p-6 md:p-12 pb-32 max-w-4xl mx-auto relative z-10">
              <button onClick={() => setShowStory(false)} className="sticky top-6 right-6 ml-auto w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors mb-12 z-50">
                <X className="w-6 h-6 text-white" />
              </button>
              <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-16">
                <div className="text-center space-y-6">
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Our Story</h2>
                  <p className="text-xl text-white/50 font-light max-w-md mx-auto">The journey of building the ultimate AI companion platform.</p>
                </div>
                <div className="grid gap-12">
                  <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 space-y-6">
                    <h3 className="text-2xl font-bold text-indigo-400">The Beginning</h3>
                    <p className="text-white/70 leading-relaxed text-lg font-light">Vaulty was born from a simple question: what if AI could be more than just a tool? We set out to build companions that feel real — with personalities, voices, and the ability to truly connect with the people they talk to.</p>
                  </div>
                  <div className="p-8 rounded-[32px] border border-white/10 bg-white/5 space-y-6">
                    <h3 className="text-2xl font-bold text-indigo-400">Our Mission</h3>
                    <p className="text-white/70 leading-relaxed text-lg font-light">To create a world where everyone has access to a companion who listens, understands, and is always there. No judgment, no waiting — just genuine connection, available 24/7.</p>
                  </div>
                  <div className="relative border-l border-indigo-500/30 ml-4 md:ml-8 space-y-12 pb-8">
                    {[
                      { date: "Q3 2023", text: "The idea of Vaulty is born — AI companions that truly feel human." },
                      { date: "Q1 2024", text: "Core team assembled. First companions built and tested." },
                      { date: "Q4 2024", text: "Closed Beta with early users. Vaulty+ subscription launched." },
                      { date: "2025", text: "Public launch — join thousands of users already connecting.", highlight: true },
                    ].map((item) => (
                      <div key={item.date} className="relative pl-8 md:pl-12">
                        <div className={`absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full ${item.highlight ? "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"}`} />
                        <h4 className={`text-xl font-bold mb-2 ${item.highlight ? "text-sky-400" : ""}`}>{item.date}</h4>
                        <p className="text-white/60 font-light">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Frequently Asked Questions.</h2>
            <p className="text-xl text-white/50 font-light">Everything you need to know about Vaulty.</p>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="border border-white/10 bg-white/5 backdrop-blur-md rounded-[20px] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none">
                  <span className="text-lg font-medium pr-4">{faq.question}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-white/50 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-6 pb-5 text-white/60 font-light leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section id="subscribe" className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div className="p-12 md:p-16 rounded-[32px] border border-white/10 bg-gradient-to-b from-blue-500/20 to-black backdrop-blur-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Your companion is waiting.</h2>
              <p className="text-xl text-white/60 font-light mb-10 max-w-xl mx-auto">Join the waitlist and be among the first to meet your AI companion when we open the doors.</p>
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative">
                <div className="relative flex items-center">
                  <Mail className="absolute left-5 w-5 h-5 text-white/40" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required
                    className="w-full bg-black/50 border border-white/10 rounded-full py-4 pl-14 pr-32 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-all" />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-full font-medium hover:bg-gray-200 transition-colors">Subscribe</button>
                </div>
              </form>
              <AnimatePresence>
                {isSubscribed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 text-white font-medium">
                    Thanks for subscribing! We'll be in touch soon.
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-8 flex items-center justify-center gap-2 text-white/50 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
                <span className="font-bold text-white">{subscribersCount.toLocaleString()}</span> Subscribers on the waitlist
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 text-center text-white/40 font-light">
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
        </div>
        <p>&copy; {new Date().getFullYear()} Vaulty. All rights reserved.</p>
      </footer>
    </div>
  );
}
