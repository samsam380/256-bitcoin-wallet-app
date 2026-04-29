import { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useWallet } from "@/lib/wallet-context";
import * as bip39 from "bip39";

type Step = "welcome" | "create" | "import" | "backup";

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("welcome");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [importText, setImportText] = useState("");
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const router = useRouter();
  const { createWallet, importWallet } = useWallet();

  const handleCreateWallet = () => {
    const mnemonic = bip39.generateMnemonic();
    const words = mnemonic.split(" ");
    setSeedPhrase(words);
    setStep("backup");
  };

  const handleConfirmBackup = async () => {
    const address = generateAddress(seedPhrase);
    await createWallet(seedPhrase, address);
    router.replace("/(tabs)" as any);
  };

  const handleImportWallet = async () => {
    const words = importText.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      if (Platform.OS === "web") {
        alert("Please enter a valid 12 or 24 word seed phrase.");
      } else {
        Alert.alert("Invalid Seed Phrase", "Please enter a valid 12 or 24 word seed phrase.");
      }
      return;
    }
    const address = generateAddress(words);
    await createWallet(words, address);
    router.replace("/(tabs)" as any);
  };

  if (step === "welcome") {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
        <View className="flex-1 justify-center items-center gap-6">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
            <Text className="text-4xl text-white font-bold">₿</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground text-center">
            256 Bitcoin Wallet
          </Text>
          <Text className="text-base text-muted text-center px-8">
            Securely store, send, and receive Bitcoin on your mobile device.
          </Text>

          <View className="w-full gap-3 mt-8">
            <TouchableOpacity
              className="bg-primary py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleCreateWallet}
            >
              <Text className="text-white font-semibold text-lg">Create New Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface border border-border py-4 rounded-2xl items-center active:opacity-80"
              onPress={() => setStep("import")}
            >
              <Text className="text-foreground font-semibold text-lg">Import Existing Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (step === "backup") {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="flex-1 gap-6 pt-12">
            <Text className="text-2xl font-bold text-foreground text-center">
              Your Recovery Phrase
            </Text>
            <Text className="text-sm text-muted text-center px-4">
              Write down these 12 words in order. This is the only way to recover your wallet.
            </Text>

            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row flex-wrap gap-2">
                {seedPhrase.map((word, index) => (
                  <View
                    key={index}
                    className="bg-background rounded-lg px-3 py-2 border border-border"
                  >
                    <Text className="text-foreground text-sm">
                      <Text className="text-muted">{index + 1}. </Text>
                      {word}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-2 self-center"
              onPress={() => setBackupConfirmed(!backupConfirmed)}
            >
              <View className={`w-5 h-5 rounded border ${backupConfirmed ? "bg-primary border-primary" : "border-muted"} items-center justify-center`}>
                {backupConfirmed && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="text-sm text-foreground">
                I have saved my recovery phrase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${backupConfirmed ? "bg-primary" : "bg-muted opacity-50"}`}
              onPress={handleConfirmBackup}
              disabled={!backupConfirmed}
            >
              <Text className="text-white font-semibold text-lg">Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (step === "import") {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="flex-1 gap-6 pt-12">
            <Text className="text-2xl font-bold text-foreground text-center">
              Import Wallet
            </Text>
            <Text className="text-sm text-muted text-center px-4">
              Enter your 12 or 24 word recovery phrase to restore your wallet.
            </Text>

            <TextInput
              className="bg-surface border border-border rounded-2xl p-4 text-foreground text-base min-h-[120px]"
              placeholder="Enter your seed phrase..."
              placeholderTextColor="#8B949E"
              multiline
              value={importText}
              onChangeText={setImportText}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="gap-3">
              <TouchableOpacity
                className="bg-primary py-4 rounded-2xl items-center active:opacity-80"
                onPress={handleImportWallet}
              >
                <Text className="text-white font-semibold text-lg">Import Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 items-center active:opacity-80"
                onPress={() => setStep("welcome")}
              >
                <Text className="text-muted font-medium">Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return null;
}

function generateAddress(seedPhrase: string[]): string {
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
