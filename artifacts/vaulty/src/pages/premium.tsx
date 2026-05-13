import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { ChevronLeft, Check, Sparkles, Headset, Gift, Lock, Zap, MessageSquare, Mic, Star, X, Camera } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, collection, getDocs, query, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { addMonths } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { usePremiumThanks } from "@/components/premium-thanks-modal";
import { useCurrency } from "@/contexts/currency-context";

// Import badge images
import badgePro from "/assets/badges/badge-pro.png";
import badgeUltra from "/assets/badges/badge-ultra.png";
import badgeMax from "/assets/badges/badge-max.png";

// Initialize Stripe with the LIVE key
const stripePromise = loadStripe("pk_live_51SbQJ9HChlVvIks4OVBZysQhGeehAbwISpcSDuxNYy64nTJu780uJcvR0afAzKUZhpnVkFVHPv7iUPlcIYjEIDLh00GF5Z3JoY");

const CheckoutForm = ({ price, billingCycle, onSuccess, onCancel }: { 
  price: number, 
  billingCycle: string, 
  onSuccess: () => void, 
  onCancel: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { currency } = useCurrency();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/premium?success=true",
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Payment failed");
        setProcessing(false);
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Vaulty+ Plan</span>
            <span className="font-bold">{currency === 'EUR' ? '€' : '$'}{price}/{billingCycle === "monthly" ? "mo" : "yr"}</span>
          </div>
          <div className="text-sm text-gray-400">
            Total to pay today
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <PaymentElement 
              options={{
                layout: "tabs",
                paymentMethodOrder: ["apple_pay", "google_pay", "card"],
              }}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-md border border-red-400/20">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!stripe || processing}
              className="flex-1 bg-white text-black font-bold hover:bg-gray-200"
            >
              {processing ? "Processing..." : `Pay ${currency === 'EUR' ? '€' : '$'}${price}`}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock size={12} />
        <span>Secured by Stripe (Live Mode)</span>
      </div>
    </div>
  );
};

const PaymentWrapper = ({ price, billingCycle, onSuccess, onCancel }: {
  price: number,
  billingCycle: string,
  onSuccess: () => void,
  onCancel: () => void
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: price, tier: "vaulty", billingCycle }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, [price, billingCycle]);

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        price={price} 
        billingCycle={billingCycle}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default function Premium() {
  const { user, userData } = useAuth();
  const [location, setLocation] = useLocation();
  const { showPremiumThanks } = usePremiumThanks();
  const { currency } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedTier, setSelectedTier] = useState<"vaulty">("vaulty");
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  
  const tiers = {
    vaulty: {
      name: "Vaulty+",
      price: { monthly: 13.99, yearly: 139.99 },
      features: [
        { icon: <Camera size={20} />, text: "AI sends you images", check: true },
        { icon: <Star size={20} />, text: "Over 10 colored chat themes", check: true },
        { icon: <MessageSquare size={20} />, text: "18+ conversations (more open)", check: true },
        { icon: <Headset size={20} />, text: "24h admin support", check: true },
        { icon: <Mic size={20} />, text: "Character sends you voice messages", check: true },
        { icon: <Zap size={20} />, text: "Fewer restrictions and more freedom", check: true }
      ],
      points: 5000,
      demoBonus: 50000
    }
  };

  const basePrice = tiers["vaulty"].price[billingCycle];
  let currentPrice = basePrice;
  let displayDiscount = appliedDiscount;
  
  if (appliedDiscount && appliedDiscount.plan) {
    if (appliedDiscount.plan !== "All" && appliedDiscount.plan.toLowerCase() !== "vaulty") {
      displayDiscount = null;
    }
  }
  
  if (displayDiscount && displayDiscount.discount) {
    const discountAmount = (basePrice * displayDiscount.discount) / 100;
    currentPrice = Math.round((basePrice - discountAmount) * 100) / 100;
  }

  const currentPlan = userData?.premiumPlan || userData?.subscription || "free";
  const currentSubscription = currentPlan.toLowerCase();
  const hasVaultyPlus = currentSubscription === "vaulty";

  useEffect(() => {
    const stored = sessionStorage.getItem("appliedDiscount");
    if (stored) {
      try { setAppliedDiscount(JSON.parse(stored)); } catch (e) { setAppliedDiscount(null); }
    }
  }, []);

  const handleSubscribeClick = () => {
    if (!user) return;
    setShowPaymentModal(true);
  };

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    
    const code = promoCode.toUpperCase().trim();
    if (!code) return;

    // Mock promo codes for demonstration
    const validCodes: Record<string, number> = {
      "VAULTY20": 20,
      "SAVE50": 50,
      "PROMO10": 10,
      "FRIEND": 15
    };

    if (validCodes[code]) {
      const discount = validCodes[code];
      setAppliedDiscount({
        code,
        discount,
        plan: "vaulty"
      });
      setPromoSuccess(`Promo code applied! ${discount}% discount.`);
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code. Please try again.");
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    try {
      const points = tiers["vaulty"].points;
      const demoBonus = tiers["vaulty"].demoBonus;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      await updateDoc(doc(db, "users", user.uid), {
        premiumPlan: "VAULTY",
        subscription: "vaulty",
        subscriptionDate: new Date(),
        premiumExpiry: expiryDate,
        vaultyPoints: increment(points),
        demoBalance: increment(demoBonus),
        badges: [...(userData?.badges || []).filter((b: string) => !b.includes("premium")), "premium-vaulty"]
      });
      setShowPaymentModal(false);
      sessionStorage.removeItem("appliedDiscount");
      setAppliedDiscount(null);
      showPremiumThanks("vaulty");
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center overflow-x-hidden">
      {/* Background Image / Ethereal Figure */}
      <div className="absolute top-0 left-0 w-full h-[60vh] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />
      </div>

      {/* Top Controls */}
      <div className="relative z-20 w-full flex justify-between p-6">
        <button 
          onClick={() => setLocation("/")}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative z-20 flex flex-col items-center w-full max-w-md px-6 pt-12 pb-6 text-center flex-1 justify-center">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1 mb-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">Vaulty+</h1>
          <p className="text-sm text-gray-300 font-medium max-w-[280px] mx-auto leading-tight">
            Unlock all premium features
          </p>
        </motion.div>

        {/* Scrollable Features List */}
        <div className="w-full mb-6 px-4">
          <div className="max-h-[220px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {tiers["vaulty"].features.map((feature, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/80 scale-75">{feature.icon}</span>
                  <span className="text-xs font-medium text-white text-left">{feature.text}</span>
                </div>
                <Check size={14} className="text-white shrink-0" />
              </motion.div>
            ))}
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
          `}} />
        </div>

        {/* Pricing Display */}
        <div className="mb-6 text-center">
          <div className="flex flex-col items-center">
            {appliedDiscount ? (
              <>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-gray-500 line-through text-sm">${basePrice}</span>
                  <span className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    -{appliedDiscount.discount}%
                  </span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-white">${currentPrice}</span>
                  <span className="text-[10px] text-gray-400 ml-1">{billingCycle === "monthly" ? "/mo" : "/yr"}</span>
                </div>
              </>
            ) : (
              <div>
                <span className="text-4xl font-bold text-white">${basePrice}</span>
                <span className="text-[10px] text-gray-400 ml-1">{billingCycle === "monthly" ? "/mo" : "/yr"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubscribeClick}
          disabled={hasVaultyPlus}
          className="w-full py-3 rounded-xl bg-white text-black font-extrabold text-sm mb-4 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {hasVaultyPlus ? "Current Plan" : "Subscribe Now"}
        </button>
      </div>

      <div className="relative z-20 w-full max-w-md px-6 pb-6 text-center">
        {/* Promo Code Input moved to bottom */}
        <div className="w-full mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 h-9 text-xs"
              />
              {appliedDiscount && (
                <button 
                  onClick={() => {
                    setAppliedDiscount(null);
                    setPromoSuccess(null);
                  }}
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
          {promoError && <p className="text-red-400 text-[9px] mt-1 text-left ml-1">{promoError}</p>}
          {promoSuccess && <p className="text-green-400 text-[9px] mt-1 text-left ml-1">{promoSuccess}</p>}
        </div>

        {/* Footer Links */}
        <div className="flex gap-3 text-[10px] text-gray-500 font-medium justify-center">
          <button onClick={() => setLocation("/tos")}>Terms</button>
          <span>|</span>
          <button>Privacy</button>
          <span>|</span>
          <button>Restore</button>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Secure Checkout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete your upgrade to Vaulty+
            </DialogDescription>
          </DialogHeader>
          
          <PaymentWrapper
            price={currentPrice} 
            billingCycle={billingCycle}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
