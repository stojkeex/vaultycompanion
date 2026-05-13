import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  coinId: string;
  coinSymbol: string;
  amount: number;
  priceAtTransaction: number;
  totalValue: number;
  date: string;
}

export interface Holding {
  coinId: string;
  amount: number;
  averageBuyPrice: number;
}

interface DemoStore {
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
}

const INITIAL_BALANCE = 10000;

export function useDemoStore() {
  const { user, userData } = useAuth();
  // Initialize with default state. We will load user-specific data in useEffect.
  // This prevents data leakage between users.
  const [store, setStore] = useState<DemoStore>({
    balance: INITIAL_BALANCE,
    holdings: [],
    transactions: []
  });

  // Sync from Firebase/LocalStorage when user logs in
  useEffect(() => {
    if (!user || !userData) {
      // Reset to default if no user (logout)
      setStore({
        balance: INITIAL_BALANCE,
        holdings: [],
        transactions: []
      });
      return;
    }

    const loadData = async () => {
      // 1. Try to load from user-specific localStorage first for immediate display
      const localKey = `vaulty_demo_store_${user.uid}_v2`;
      const saved = localStorage.getItem(localKey);
      
      let currentStore: DemoStore;

      if (saved) {
        try {
          currentStore = JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing local demo data", e);
          currentStore = { balance: INITIAL_BALANCE, holdings: [], transactions: [] };
        }
      } else {
        currentStore = { balance: INITIAL_BALANCE, holdings: [], transactions: [] };
      }

      // Check for Premium Bonus synchronization
      const plan = (userData.premiumPlan || userData.subscription || "FREE").toUpperCase();
      const lastSyncedPlan = localStorage.getItem(`vaulty_last_synced_plan_${user.uid}`);

      if (plan !== "FREE" && plan !== lastSyncedPlan) {
        const bonuses: Record<string, number> = {
          'PRO': 20000,
          'MAX': 70000,
          'TEAM': 50000
        };

        if (bonuses[plan]) {
          currentStore.balance += bonuses[plan];
          localStorage.setItem(`vaulty_last_synced_plan_${user.uid}`, plan);
        }
      }

      setStore(currentStore);

      // 2. Load from Firebase
      try {
        const docRef = doc(db, "users", user.uid, "features", "demo_trading_v2");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as DemoStore;
          
          // Force reset if balance is suspiciously high (legacy 1M balance)
          if (remoteData.balance > 100000 && !saved) {
            const initialStore = {
              balance: INITIAL_BALANCE,
              holdings: [],
              transactions: []
            };
            await setDoc(docRef, initialStore);
            setStore(initialStore);
            localStorage.setItem(localKey, JSON.stringify(initialStore));
          } else if (!saved) {
            setStore(remoteData);
            localStorage.setItem(localKey, JSON.stringify(remoteData));
          }
        } else if (!saved) {
          await setDoc(docRef, currentStore);
        }
      } catch (error) {
        console.error("Error loading demo trading data:", error);
      }
    };

    loadData();
  }, [user, userData]); // Run when user or userData changes

  // Sync to Firebase and LocalStorage on every change
  useEffect(() => {
    if (!user) return;

    const localKey = `vaulty_demo_store_${user.uid}_v2`;
    
    // Always save to user-specific local storage
    localStorage.setItem(localKey, JSON.stringify(store));

    // Save to Firebase
    const saveToFirebase = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "features", "demo_trading_v2");
        await setDoc(docRef, store);
      } catch (error) {
        console.error("Error saving demo trading data:", error);
      }
    };

    // Debounce the save to avoid too many writes
    const timeoutId = setTimeout(saveToFirebase, 1000);
    return () => clearTimeout(timeoutId);
  }, [store, user]);

  const buyCoin = (coinId: string, coinSymbol: string, amount: number, price: number) => {
    const totalCost = amount * price;
    if (totalCost > store.balance) {
      throw new Error("Insufficient funds");
    }

    setStore(prev => {
      const existingHolding = prev.holdings.find(h => h.coinId === coinId);
      let newHoldings = [...prev.holdings];

      if (existingHolding) {
        // Update average buy price
        const totalValue = (existingHolding.amount * existingHolding.averageBuyPrice) + totalCost;
        const totalAmount = existingHolding.amount + amount;
        const newAverage = totalValue / totalAmount;
        
        newHoldings = newHoldings.map(h => 
          h.coinId === coinId 
            ? { ...h, amount: totalAmount, averageBuyPrice: newAverage }
            : h
        );
      } else {
        newHoldings.push({ coinId, amount, averageBuyPrice: price });
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'buy',
        coinId,
        coinSymbol,
        amount,
        priceAtTransaction: price,
        totalValue: totalCost,
        date: new Date().toISOString()
      };

      return {
        balance: prev.balance - totalCost,
        holdings: newHoldings,
        transactions: [transaction, ...prev.transactions]
      };
    });
  };

  const sellCoin = (coinId: string, coinSymbol: string, amount: number, price: number) => {
    const holding = store.holdings.find(h => h.coinId === coinId);
    if (!holding || holding.amount < amount) {
      throw new Error("Insufficient holdings");
    }

    setStore(prev => {
      const totalValue = amount * price;
      let newHoldings = prev.holdings.map(h => 
        h.coinId === coinId 
          ? { ...h, amount: h.amount - amount }
          : h
      ).filter(h => h.amount > 0.00000001);

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'sell',
        coinId,
        coinSymbol,
        amount,
        priceAtTransaction: price,
        totalValue: totalValue,
        date: new Date().toISOString()
      };

      return {
        balance: prev.balance + totalValue,
        holdings: newHoldings,
        transactions: [transaction, ...prev.transactions]
      };
    });
  };

  return {
    balance: store.balance,
    holdings: store.holdings,
    transactions: store.transactions,
    buyCoin,
    sellCoin,
    resetAccount: () => setStore({ balance: INITIAL_BALANCE, holdings: [], transactions: [] })
  };
}
