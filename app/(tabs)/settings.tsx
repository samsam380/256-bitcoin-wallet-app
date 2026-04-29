import { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useWallet } from "@/lib/wallet-context";
import { useRouter } from "expo-router";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

export default function SettingsScreen() {
  const { state, setCurrency, setNetwork, resetWallet } = useWallet();
  const [showSeed, setShowSeed] = useState(false);
  const router = useRouter();

  const handleResetWallet = () => {
    const doReset = async () => {
      await resetWallet();
      router.replace("/onboarding" as any);
    };

    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to reset your wallet? This action cannot be undone. Make sure you have backed up your recovery phrase.")) {
        doReset();
      }
    } else {
      Alert.alert(
        "Reset Wallet",
        "Are you sure you want to reset your wallet? This action cannot be undone. Make sure you have backed up your recovery phrase.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: doReset },
        ]
      );
    }
  };

  const handleShowSeed = () => {
    if (Platform.OS === "web") {
      if (confirm("Your recovery phrase will be displayed. Make sure no one is looking at your screen.")) {
        setShowSeed(true);
      }
    } else {
      Alert.alert(
        "Show Recovery Phrase",
        "Your recovery phrase will be displayed. Make sure no one is looking at your screen.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Show", onPress: () => setShowSeed(true) },
        ]
      );
    }
  };

  return (
    <ScreenContainer className="px-4">
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground mb-6">Settings</Text>

        {/* Wallet Info */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-foreground font-semibold text-base mb-3">Wallet</Text>

          <View className="gap-3">
            <View>
              <Text className="text-muted text-xs">Address</Text>
              <Text className="text-foreground text-sm font-mono" numberOfLines={1}>
                {state.address}
              </Text>
            </View>

            <View>
              <Text className="text-muted text-xs">Network</Text>
              <Text className="text-foreground text-sm capitalize">{state.network}</Text>
            </View>
          </View>
        </View>

        {/* Currency Selection */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-foreground font-semibold text-base mb-3">Display Currency</Text>
          <View className="flex-row flex-wrap gap-2">
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                className={`px-4 py-2 rounded-xl border ${
                  state.currency === curr
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border"
                }`}
                onPress={() => setCurrency(curr)}
              >
                <Text className={`text-sm font-medium ${state.currency === curr ? "text-primary" : "text-foreground"}`}>
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Network Selection */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-foreground font-semibold text-base mb-3">Network</Text>
          <View className="flex-row gap-2">
            {(["mainnet", "testnet"] as const).map((net) => (
              <TouchableOpacity
                key={net}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  state.network === net
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border"
                }`}
                onPress={() => setNetwork(net)}
              >
                <Text className={`text-sm font-medium capitalize ${state.network === net ? "text-primary" : "text-foreground"}`}>
                  {net}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recovery Phrase */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-foreground font-semibold text-base mb-3">Recovery Phrase</Text>

          {showSeed ? (
            <View className="gap-2">
              <View className="flex-row flex-wrap gap-2">
                {state.seedPhrase.map((word, index) => (
                  <View key={index} className="bg-background rounded-lg px-3 py-1.5 border border-border">
                    <Text className="text-foreground text-xs">
                      <Text className="text-muted">{index + 1}. </Text>
                      {word}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                className="mt-2 self-start active:opacity-60"
                onPress={() => setShowSeed(false)}
              >
                <Text className="text-primary text-sm font-medium">Hide</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-warning/10 border border-warning/30 rounded-xl py-3 items-center active:opacity-80"
              onPress={handleShowSeed}
            >
              <Text className="text-warning font-medium text-sm">Show Recovery Phrase</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Notice */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-foreground font-semibold text-base mb-2">Security</Text>
          <Text className="text-muted text-xs leading-5">
            Your wallet data is stored locally on this device. Never share your recovery phrase with anyone. If you lose your device, you can restore your wallet using the recovery phrase.
          </Text>
        </View>

        {/* Reset Wallet */}
        <TouchableOpacity
          className="bg-error/10 border border-error/30 rounded-2xl py-4 items-center active:opacity-80"
          onPress={handleResetWallet}
        >
          <Text className="text-error font-semibold">Reset Wallet</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text className="text-muted text-xs text-center mt-6">
          Bitcoin Wallet v1.0.0
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
