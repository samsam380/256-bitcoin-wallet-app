import { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useWallet, Transaction } from "@/lib/wallet-context";

type FeeLevel = "low" | "medium" | "high";

const FEE_RATES: Record<FeeLevel, number> = {
  low: 0.000005,
  medium: 0.00001,
  high: 0.00002,
};

export default function SendScreen() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [feeLevel, setFeeLevel] = useState<FeeLevel>("medium");
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { state, addTransaction } = useWallet();

  const fee = FEE_RATES[feeLevel];
  const amountNum = parseFloat(amount) || 0;
  const total = amountNum + fee;
  const canSend = address.length > 10 && amountNum > 0 && total <= state.balance;

  const handleReview = () => {
    if (!canSend) {
      const msg = total > state.balance
        ? "Insufficient balance for this transaction."
        : "Please enter a valid address and amount.";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Invalid Transaction", msg);
      }
      return;
    }
    setShowConfirm(true);
  };

  const handleSend = async () => {
    setSending(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const tx: Transaction = {
      id: Date.now().toString(),
      type: "sent",
      amount: amountNum,
      address: address,
      date: new Date().toISOString(),
      status: "confirmed",
      fee: fee,
    };

    await addTransaction(tx);
    setSending(false);

    if (Platform.OS === "web") {
      alert("Transaction sent successfully!");
    } else {
      Alert.alert("Success", "Transaction sent successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
      return;
    }
    router.back();
  };

  if (showConfirm) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
        <View className="flex-1 pt-12">
          <Text className="text-2xl font-bold text-foreground text-center mb-8">
            Confirm Transaction
          </Text>

          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <View className="flex-row justify-between">
              <Text className="text-muted text-sm">To</Text>
              <Text className="text-foreground text-sm font-medium" numberOfLines={1} style={{ maxWidth: 200 }}>
                {address.slice(0, 12)}...{address.slice(-8)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted text-sm">Amount</Text>
              <Text className="text-foreground text-sm font-semibold">{amountNum.toFixed(8)} BTC</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted text-sm">Network Fee</Text>
              <Text className="text-foreground text-sm">{fee.toFixed(8)} BTC</Text>
            </View>
            <View className="border-t border-border pt-3 flex-row justify-between">
              <Text className="text-foreground text-base font-semibold">Total</Text>
              <Text className="text-foreground text-base font-bold">{total.toFixed(8)} BTC</Text>
            </View>
          </View>

          <View className="gap-3 mt-8">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${sending ? "bg-muted" : "bg-primary"} active:opacity-80`}
              onPress={handleSend}
              disabled={sending}
            >
              <Text className="text-white font-semibold text-lg">
                {sending ? "Sending..." : "Confirm & Send"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 items-center active:opacity-80"
              onPress={() => setShowConfirm(false)}
              disabled={sending}
            >
              <Text className="text-muted font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="flex-1 pt-8 gap-6">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()} className="active:opacity-60">
                <Text className="text-primary text-base font-medium">← Back</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground">Send Bitcoin</Text>
              <View className="w-12" />
            </View>

            {/* Recipient Address */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">Recipient Address</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl p-4 text-foreground text-base"
                placeholder="bc1q... or 3... or 1..."
                placeholderTextColor="#8B949E"
                value={address}
                onChangeText={setAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                className="self-start active:opacity-60"
                onPress={() => router.push("/scanner" as any)}
              >
                <Text className="text-primary text-sm font-medium">📷 Scan QR Code</Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">Amount (BTC)</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl p-4 text-foreground text-base"
                placeholder="0.00000000"
                placeholderTextColor="#8B949E"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
              <Text className="text-muted text-xs">
                Available: {state.balance.toFixed(8)} BTC
              </Text>
            </View>

            {/* Fee Selection */}
            <View className="gap-2">
              <Text className="text-foreground text-sm font-medium">Network Fee</Text>
              <View className="flex-row gap-2">
                {(["low", "medium", "high"] as FeeLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    className={`flex-1 py-3 rounded-xl items-center border ${
                      feeLevel === level
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                    onPress={() => setFeeLevel(level)}
                  >
                    <Text className={`text-xs font-medium capitalize ${feeLevel === level ? "text-primary" : "text-foreground"}`}>
                      {level}
                    </Text>
                    <Text className={`text-xs mt-0.5 ${feeLevel === level ? "text-primary" : "text-muted"}`}>
                      {(FEE_RATES[level] * 100000000).toFixed(0)} sat
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center mt-4 ${canSend ? "bg-primary" : "bg-muted opacity-50"} active:opacity-80`}
              onPress={handleReview}
              disabled={!canSend}
            >
              <Text className="text-white font-semibold text-lg">Review Transaction</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
