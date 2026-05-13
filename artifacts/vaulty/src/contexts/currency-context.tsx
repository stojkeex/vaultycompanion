import React, { createContext, useContext, useState, useEffect } from "react";
import { VaultyIcon } from "@/components/ui/vaulty-icon";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "VC";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amount: number) => React.ReactNode;
  symbol: string;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  format: (amount) => `$${amount.toFixed(2)}`,
  symbol: "$",
  convert: (amount) => amount,
  rate: 1
});

const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  VC: "VC"
};

// Rates relative to USD (1 USD = X Currency)
const exchangeRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 150.25,
  AUD: 1.52,
  CAD: 1.35,
  VC: 100
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("vaulty_currency");
    return (saved as CurrencyCode) || "USD";
  });

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("vaulty_currency", newCurrency);
  };

  const format = (amount: number): React.ReactNode => {
    if (currency === "VC") {
      return (
        <span className="inline-flex items-center gap-1">
          <VaultyIcon size={14} className="inline-block" />
          {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    }

    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
    
    return <span>{formatted}</span>;
  };

  const convert = (amount: number, from: CurrencyCode = "USD", to: CurrencyCode = currency) => {
    if (from === to) return amount;
    // First convert to USD
    const amountInUSD = amount / exchangeRates[from];
    // Then convert to target currency
    return amountInUSD * exchangeRates[to];
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      format, 
      symbol: currencySymbols[currency],
      convert,
      rate: exchangeRates[currency]
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
