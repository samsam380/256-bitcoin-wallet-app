import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface Transaction {
  id: string;
  type: "sent" | "received";
  amount: number; // in BTC
  address: string;
  date: string; // ISO string
  status: "confirmed" | "pending";
  fee?: number;
}

export interface WalletState {
  isInitialized: boolean;
  seedPhrase: string[];
  address: string;
  balance: number; // in BTC
  transactions: Transaction[];
  currency: string; // fiat currency code
  network: "mainnet" | "testnet";
  btcPrice: number; // current BTC price in fiat
  priceChange24h: number; // percentage
  isLoading: boolean;
}

type WalletAction =
  | { type: "SET_WALLET"; payload: { seedPhrase: string[]; address: string } }
  | { type: "SET_BALANCE"; payload: number }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_PRICE"; payload: { btcPrice: number; priceChange24h: number } }
  | { type: "SET_CURRENCY"; payload: string }
  | { type: "SET_NETWORK"; payload: "mainnet" | "testnet" }
  | { type: "RESTORE_STATE"; payload: Partial<WalletState> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET_WALLET" };

const initialState: WalletState = {
  isInitialized: false,
  seedPhrase: [],
  address: "",
  balance: 0,
  transactions: [],
  currency: "USD",
  network: "mainnet",
  btcPrice: 0,
  priceChange24h: 0,
  isLoading: true,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "SET_WALLET":
      return {
        ...state,
        isInitialized: true,
        seedPhrase: action.payload.seedPhrase,
        address: action.payload.address,
      };
    case "SET_BALANCE":
      return { ...state, balance: action.payload };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "SET_PRICE":
      return {
        ...state,
        btcPrice: action.payload.btcPrice,
        priceChange24h: action.payload.priceChange24h,
      };
    case "SET_CURRENCY":
      return { ...state, currency: action.payload };
    case "SET_NETWORK":
      return { ...state, network: action.payload };
    case "RESTORE_STATE":
      return { ...state, ...action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET_WALLET":
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface WalletContextType {
  state: WalletState;
  createWallet: (seedPhrase: string[], address: string) => Promise<void>;
  importWallet: (seedPhrase: string[]) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  updatePrice: (price: number, change: number) => void;
  setCurrency: (currency: string) => Promise<void>;
  setNetwork: (network: "mainnet" | "testnet") => Promise<void>;
  resetWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = "bitcoin_wallet_state";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: "RESTORE_STATE", payload: { ...parsed, isInitialized: true } });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Failed to load wallet state:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const persistState = async (newState: Partial<WalletState>) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, ...newState };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to persist wallet state:", error);
    }
  };

  const createWallet = useCallback(async (seedPhrase: string[], address: string) => {
    dispatch({ type: "SET_WALLET", payload: { seedPhrase, address } });
    await persistState({ seedPhrase, address, balance: 0, transactions: [], currency: "USD", network: "mainnet" });
  }, []);

  const importWallet = useCallback(async (seedPhrase: string[]) => {
    // Generate address from seed (simplified)
    const address = generateAddressFromSeed(seedPhrase);
    dispatch({ type: "SET_WALLET", payload: { seedPhrase, address } });
    await persistState({ seedPhrase, address, balance: 0, transactions: [], currency: "USD", network: "mainnet" });
  }, []);

  const addTransaction = useCallback(async (tx: Transaction) => {
    dispatch({ type: "ADD_TRANSACTION", payload: tx });
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const transactions = [tx, ...(current.transactions || [])];
    const newBalance = (current.balance || 0) + (tx.type === "received" ? tx.amount : -tx.amount - (tx.fee || 0));
    await persistState({ transactions, balance: newBalance });
    dispatch({ type: "SET_BALANCE", payload: newBalance });
  }, []);

  const updatePrice = useCallback((price: number, change: number) => {
    dispatch({ type: "SET_PRICE", payload: { btcPrice: price, priceChange24h: change } });
  }, []);

  const setCurrency = useCallback(async (currency: string) => {
    dispatch({ type: "SET_CURRENCY", payload: currency });
    await persistState({ currency });
  }, []);

  const setNetwork = useCallback(async (network: "mainnet" | "testnet") => {
    dispatch({ type: "SET_NETWORK", payload: network });
    await persistState({ network });
  }, []);

  const resetWallet = useCallback(async () => {
    dispatch({ type: "RESET_WALLET" });
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        state,
        createWallet,
        importWallet,
        addTransaction,
        updatePrice,
        setCurrency,
        setNetwork,
        resetWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

// Helper to generate a deterministic BTC-like address from seed phrase
function generateAddressFromSeed(seedPhrase: string[]): string {
  const seed = seedPhrase.join(" ");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `bc1q${hex}${hex.slice(0, 4)}${hex.slice(2, 10)}${hex.slice(1, 9)}`;
}
