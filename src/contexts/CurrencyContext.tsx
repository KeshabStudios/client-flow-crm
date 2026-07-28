import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { COUNTRIES, getCurrencySymbol } from "@/lib/currencies";

interface CurrencyContextType {
  currency: string;
  symbol: string;
  setCurrency: (code: string) => void;
  formatValue: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState("USD");

  // Load currency from DB when user is available
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("currency")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data?.currency) {
          setCurrencyState(data.currency);
        }
      } catch {
        // silently fail, keep default
      }
    })();
  }, [user]);

  const symbol = getCurrencySymbol(currency);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
  }, []);

  const formatValue = useCallback(
    (value: number): string => {
      const country = COUNTRIES.find((c) => c.code === currency);
      const currCode = country?.currency || "USD";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currCode,
        notation: "compact",
      }).format(value);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, formatValue }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
