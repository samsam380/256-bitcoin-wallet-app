import { useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useWallet, Transaction } from "@/lib/wallet-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function HomeScreen() {
  const { state, updatePrice } = useWallet();
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to onboarding if wallet not initialized
  useEffect(() => {
    if (!state.isLoading && !state.isInitialized) {
      router.replace("/onboarding" as any);
    }
  }, [state.isLoading, state.isInitialized]);

  // Fetch BTC price on mount and refresh
  useEffect(() => {
    fetchPrice();
  }, [state.currency]);

  const fetchPrice = async () => {
    try {
      const currencyLower = state.currency.toLowerCase();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencyLower}&include_24hr_change=true`
      );
      const data = await response.json();
      if (data.bitcoin) {
        const price = data.bitcoin[currencyLower] || 0;
        const change = data.bitcoin[`${currencyLower}_24h_change`] || 0;
        updatePrice(price, change);
      }
    } catch (error) {
      console.error("Failed to fetch BTC price:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrice();
    setRefreshing(false);
  };

  const fiatBalance = state.balance * state.btcPrice;
  const pricePositive = state.priceChange24h >= 0;

  if (state.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted text-lg">Loading...</Text>
      </ScreenContainer>
    );
  }

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="flex-row items-center py-3 border-b border-border">
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${item.type === "received" ? "bg-success/20" : "bg-error/20"}`}>
        <Text className={`text-lg ${item.type === "received" ? "text-success" : "text-error"}`}>
          {item.type === "received" ? "↓" : "↑"}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-medium text-sm">
          {item.type === "received" ? "Received" : "Sent"}
        </Text>
        <Text className="text-muted text-xs" numberOfLines={1}>
          {item.address.slice(0, 12)}...{item.address.slice(-6)}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-semibold text-sm ${item.type === "received" ? "text-success" : "text-error"}`}>
          {item.type === "received" ? "+" : "-"}{item.amount.toFixed(8)} BTC
        </Text>
        <Text className="text-muted text-xs">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View className="gap-6">
      {/* Balance Card */}
      <View className="bg-surface rounded-3xl p-6 border border-border">
        <Text className="text-muted text-sm mb-1">Total Balance</Text>
        <Text className="text-foreground text-4xl font-bold">
          {state.balance.toFixed(8)}
        </Text>
        <Text className="text-muted text-lg">BTC</Text>

        <View className="flex-row items-center mt-3 gap-2">
          <Text className="text-foreground text-xl font-semibold">
            {getCurrencySymbol(state.currency)}{fiatBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${pricePositive ? "bg-success/20" : "bg-error/20"}`}>
            <Text className={`text-xs font-medium ${pricePositive ? "text-success" : "text-error"}`}>
              {pricePositive ? "+" : ""}{state.priceChange24h.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* BTC Price */}
        <View className="mt-4 pt-4 border-t border-border">
          <Text className="text-muted text-xs">BTC Price</Text>
          <Text className="text-foreground text-base font-medium">
            {getCurrencySymbol(state.currency)}{state.btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary py-4 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
          onPress={() => router.push("/send" as any)}
        >
          <Text className="text-white text-lg">↑</Text>
          <Text className="text-white font-semibold text-base">Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-surface border border-border py-4 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
          onPress={() => router.push("/receive" as any)}
        >
          <Text className="text-foreground text-lg">↓</Text>
          <Text className="text-foreground font-semibold text-base">Receive</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions Header */}
      <Text className="text-foreground text-lg font-semibold">
        Recent Transactions
      </Text>
    </View>
  );

  const ListEmpty = () => (
    <View className="items-center py-12">
      <Text className="text-muted text-4xl mb-3">📋</Text>
      <Text className="text-muted text-base">No transactions yet</Text>
      <Text className="text-muted text-sm mt-1">
        Send or receive Bitcoin to get started
      </Text>
    </View>
  );

  return (
    <ScreenContainer className="px-4">
      <FlatList
        data={state.transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </ScreenContainer>
  );
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
