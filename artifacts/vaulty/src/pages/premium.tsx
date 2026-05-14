import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { X, Lock, Zap, MessageSquare, Mic, Star, Camera, Headset, Check, Crown } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { usePremiumThanks } from "@/components/premium-thanks-modal";
import { useCurrency } from "@/contexts/currency-context";
import vaultyLogo from "@/assets/vaulty_logo.png";

const stripePromise = loadStripe("pk_live_51SbQJ9HChlVvIks4OVBZysQhGeehAbwISpcSDuxNYy64nTJu780uJcvR0afAzKUZhpnVkFVHPv7iUPlcIYjEIDLh00GF5Z3JoY");

const FEATURES = [
  {
    icon: <Camera size={18} />,
    title: "AI Sends You Images",
    subtitle: "Get stunning images in every conversation.",
  },
  {
    icon: <Star size={18} />,
    title: "Over 10 Colored Chat Themes",
    subtitle: "Personalize your chats your way.",
  },
  {
    icon: <MessageSquare size={18} />,
    title: "18+ Conversations",
    subtitle: "More open. More freedom.",
  },
  {
    icon: <Headset size={18} />,
    title: "24h Admin Support",
    subtitle: "We're here for you, anytime.",
  },
  {
    icon: <Mic size={18} />,
    title: "Character Sends You Voice Messages",
    subtitle: "Hear them come to life.",
  },
  {
    icon: <Zap size={18} />,
    title: "Fewer Restrictions",
    subtitle: "More freedom. More possibilities.",
  },
];

/* ── Stripe checkout form ─────────────────────────────────── */
const CheckoutForm = ({ price, billingCycle, onSuccess, onCancel }: {
  price: number; billingCycle: string; onSuccess: () => void; onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { currency } = useCurrency();
  const sym = currency === "EUR" ? "€" : "$";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    try {
      const { error: err } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + "/premium?success=true" },
        redirect: "if_required",
      });
      if (err) { setError(err.message || "Payment failed"); setProcessing(false); }
      else onSuccess();
    } catch (ex: any) {
      setError(ex.message || "An error occurred");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">Vaulty+ Plan</span>
          <span className="font-bold">{sym}{price}/{billingCycle === "monthly" ? "mo" : "yr"}</span>
        </div>
        <div className="text-sm text-gray-400">Total to pay today</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <PaymentElement options={{ layout: "tabs", paymentMethodOrder: ["apple_pay", "google_pay", "card"] }} />
        </div>
        {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md border border-red-400/20">{error}</div>}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-white/10 hover:bg-white/5">Cancel</Button>
          <Button type="submit" disabled={!stripe || processing} className="flex-1 bg-white text-black font-bold hover:bg-gray-200">
            {processing ? "Processing…" : `Pay ${sym}${price}`}
          </Button>
        </div>
      </form>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock size={12} /><span>Secured by Stripe</span>
      </div>
    </div>
  );
};

const PaymentWrapper = ({ price, billingCycle, onSuccess, onCancel }: {
  price: number; billingCycle: string; onSuccess: () => void; onCancel: () => void;
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: price, tier: "vaulty", billingCycle }),
    })
      .then(r => r.json())
      .then(d => { setClientSecret(d.clientSecret); setLoading(false); })
      .catch(() => setLoading(false));
  }, [price, billingCycle]);

  if (loading || !clientSecret)
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" /></div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm price={price} billingCycle={billingCycle} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

/* ── Main page ────────────────────────────────────────────── */
export default function Premium() {
  const { user, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { showPremiumThanks } = usePremiumThanks();
  const { currency } = useCurrency();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

  const sym = currency === "EUR" ? "€" : "$";
  const basePrice = 13.99;
  let currentPrice = basePrice;
  if (appliedDiscount?.discount) {
    currentPrice = Math.round((basePrice - basePrice * appliedDiscount.discount / 100) * 100) / 100;
  }

  const hasVaultyPlus = (userData?.premiumPlan || userData?.subscription || "free").toLowerCase() === "vaulty";

  useEffect(() => {
    const stored = sessionStorage.getItem("appliedDiscount");
    if (stored) { try { setAppliedDiscount(JSON.parse(stored)); } catch {} }
  }, []);

  const handleApplyPromo = () => {
    setPromoError(null); setPromoSuccess(null);
    const code = promoCode.toUpperCase().trim();
    if (!code) return;
    const valid: Record<string, number> = { VAULTY20: 20, SAVE50: 50, PROMO10: 10, FRIEND: 15 };
    if (valid[code]) {
      setAppliedDiscount({ code, discount: valid[code], plan: "vaulty" });
      setPromoSuccess(`Promo applied! ${valid[code]}% off.`);
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code.");
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    try {
      const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
      await updateDoc(doc(db, "users", user.uid), {
        premiumPlan: "VAULTY", subscription: "vaulty",
        subscriptionDate: new Date(), premiumExpiry: expiry,
        vaultyPoints: increment(5000), demoBalance: increment(50000),
        badges: [...(userData?.badges || []).filter((b: string) => !b.includes("premium")), "premium-vaulty"],
      });
      setShowPaymentModal(false);
      sessionStorage.removeItem("appliedDiscount");
      setAppliedDiscount(null);
      showPremiumThanks("vaulty");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center overflow-x-hidden relative">

      {/* ── Background rays ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* top-right ray */}
        <div style={{
          position: "absolute", top: -200, right: -100,
          width: 600, height: 600, borderRadius: "50%",
          background: "conic-gradient(from 200deg, transparent 60deg, rgba(120,40,255,0.18) 90deg, rgba(200,60,255,0.08) 120deg, transparent 160deg)",
          filter: "blur(40px)",
        }} />
        {/* bottom-left ray */}
        <div style={{
          position: "absolute", bottom: -150, left: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "conic-gradient(from 30deg, transparent 50deg, rgba(100,20,255,0.15) 80deg, rgba(180,40,200,0.08) 110deg, transparent 150deg)",
          filter: "blur(50px)",
        }} />
      </div>

      {/* ── Close button ── */}
      <div className="relative z-20 w-full max-w-md px-5 pt-5">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="relative z-20 w-full max-w-md px-5 flex flex-col items-center">

        {/* ── Logo + title ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mt-4 mb-3"
        >
          <img src={vaultyLogo} alt="Vaulty" className="w-16 h-16 object-contain mb-3" />
          <h1
            className="text-4xl font-black tracking-tight"
            style={{ letterSpacing: "-0.01em" }}
          >
            VAULTY<span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#6ec6ff,#a855f7)" }}>+</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Unlock everything. Experience more.</p>
        </motion.div>

        {/* ── "All Premium Features" pill ── */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-5 flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(12px)",
            color: "#c4b5fd",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          All Premium Features
        </motion.button>

        {/* ── Features card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full rounded-3xl overflow-hidden mb-6"
          style={{
            background: "rgba(16,14,30,0.85)",
            border: "1px solid rgba(120,80,255,0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          {FEATURES.map((f, i) => (
            <div key={i}>
              <div className="flex items-center gap-4 px-5 py-4">
                {/* icon box */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(90,50,200,0.25)",
                    border: "1px solid rgba(120,80,255,0.2)",
                    color: "#a78bfa",
                  }}
                >
                  {f.icon}
                </div>
                {/* text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{f.title}</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{f.subtitle}</p>
                </div>
                {/* check */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: "1.5px solid rgba(120,80,255,0.5)" }}
                >
                  <Check size={12} className="text-purple-400" />
                </div>
              </div>
              {i < FEATURES.length - 1 && (
                <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Pricing ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center mb-5"
        >
          <p className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-1">ONLY</p>
          <div className="flex items-end gap-1">
            {appliedDiscount && (
              <span className="text-gray-500 line-through text-lg mb-1">{sym}{basePrice}</span>
            )}
            <span
              className="text-6xl font-black"
              style={{ backgroundImage: "linear-gradient(135deg,#38bdf8,#818cf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {sym}{currentPrice}
            </span>
            <span className="text-gray-400 text-sm mb-2">/mo</span>
          </div>
          {appliedDiscount && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
              -{appliedDiscount.discount}% off applied
            </span>
          )}
          <p className="text-gray-500 text-xs mt-1">Cancel anytime. No hidden fees.</p>
        </motion.div>

        {/* ── Subscribe button ── */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => !hasVaultyPlus && user && setShowPaymentModal(true)}
          disabled={hasVaultyPlus}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base font-extrabold text-white mb-3 disabled:opacity-60"
          style={{
            background: hasVaultyPlus
              ? "rgba(255,255,255,0.1)"
              : "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #ec4899 100%)",
            boxShadow: hasVaultyPlus ? "none" : "0 8px 30px rgba(129,140,248,0.4)",
          }}
        >
          <Crown size={18} />
          {hasVaultyPlus ? "Current Plan" : "Subscribe Now"}
        </motion.button>

        {/* ── Secure payment ── */}
        <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-5">
          <Lock size={11} />
          <span>Secure payment</span>
        </div>

        {/* ── Promo code ── */}
        <div className="w-full mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Promo Code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-white/20 h-9 text-xs"
              />
              {appliedDiscount && (
                <button
                  onClick={() => { setAppliedDiscount(null); setPromoSuccess(null); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={10} />
                </button>
              )}
            </div>
            <Button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/10 px-3 h-9 font-bold text-xs"
            >
              Apply
            </Button>
          </div>
          {promoError && <p className="text-red-400 text-[10px] mt-1 ml-1">{promoError}</p>}
          {promoSuccess && <p className="text-green-400 text-[10px] mt-1 ml-1">{promoSuccess}</p>}
        </div>

        {/* ── Footer links ── */}
        <div className="flex gap-3 text-[10px] text-gray-600 font-medium justify-center pb-8">
          <button onClick={() => setLocation("/tos")}>Terms</button>
          <span>|</span>
          <button>Privacy</button>
          <span>|</span>
          <button>Restore</button>
        </div>
      </div>

      {/* ── Payment modal ── */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Secure Checkout</DialogTitle>
            <DialogDescription className="text-gray-400">Complete your upgrade to Vaulty+</DialogDescription>
          </DialogHeader>
          <PaymentWrapper
            price={currentPrice}
            billingCycle="monthly"
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
