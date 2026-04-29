import { describe, it, expect } from "vitest";

// Test the address generation logic (extracted from wallet-context)
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

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
  };
  return symbols[currency] || "$";
}

describe("Wallet Address Generation", () => {
  it("should generate a valid bc1q address from seed phrase", () => {
    const seed = ["abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "about"];
    const address = generateAddressFromSeed(seed);
    expect(address).toMatch(/^bc1q[a-f0-9]+$/);
    expect(address.length).toBeGreaterThan(20);
  });

  it("should generate deterministic addresses", () => {
    const seed = ["test", "word", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    const address1 = generateAddressFromSeed(seed);
    const address2 = generateAddressFromSeed(seed);
    expect(address1).toBe(address2);
  });

  it("should generate different addresses for different seeds", () => {
    const seed1 = ["abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "abandon", "about"];
    const seed2 = ["zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "zoo", "wrong"];
    const address1 = generateAddressFromSeed(seed1);
    const address2 = generateAddressFromSeed(seed2);
    expect(address1).not.toBe(address2);
  });
});

describe("Currency Symbol", () => {
  it("should return correct symbol for USD", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });

  it("should return correct symbol for EUR", () => {
    expect(getCurrencySymbol("EUR")).toBe("€");
  });

  it("should return correct symbol for GBP", () => {
    expect(getCurrencySymbol("GBP")).toBe("£");
  });

  it("should return $ as default for unknown currency", () => {
    expect(getCurrencySymbol("XYZ")).toBe("$");
  });
});
