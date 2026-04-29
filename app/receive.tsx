import { useState } from "react";
import { Text, View, TouchableOpacity, Share, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useWallet } from "@/lib/wallet-context";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

export default function ReceiveScreen() {
  const { state } = useWallet();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(state.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: state.address,
        title: "My Bitcoin Address",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
      <View className="flex-1 pt-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="active:opacity-60">
            <Text className="text-primary text-base font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Receive Bitcoin</Text>
          <View className="w-12" />
        </View>

        {/* QR Code */}
        <View className="items-center gap-6">
          <View className="bg-white p-6 rounded-3xl shadow-sm">
            <QRCode
              value={`bitcoin:${state.address}`}
              size={200}
              backgroundColor="white"
              color="#000000"
            />
          </View>

          {/* Address */}
          <View className="bg-surface rounded-2xl p-4 border border-border w-full">
            <Text className="text-muted text-xs mb-1 text-center">Your Bitcoin Address</Text>
            <Text className="text-foreground text-sm font-mono text-center" selectable>
              {state.address}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 bg-primary py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleCopy}
            >
              <Text className="text-white font-semibold">
                {copied ? "Copied!" : "Copy Address"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-surface border border-border py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleShare}
            >
              <Text className="text-foreground font-semibold">Share</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-surface rounded-xl p-4 border border-border w-full">
            <Text className="text-muted text-xs text-center">
              Only send Bitcoin (BTC) to this address. Sending any other cryptocurrency may result in permanent loss.
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
