import { useState } from "react";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";

export default function ScannerScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    // Parse bitcoin: URI or plain address
    let address = data;
    if (data.startsWith("bitcoin:")) {
      address = data.replace("bitcoin:", "").split("?")[0];
    }

    // Go back to send screen with the address
    router.back();
    // In a real app, we'd pass the address back via params or context
  };

  if (!permission) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center">
        <Text className="text-muted">Loading camera...</Text>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-foreground text-lg font-semibold text-center">
            Camera Permission Required
          </Text>
          <Text className="text-muted text-sm text-center">
            We need access to your camera to scan QR codes.
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
            onPress={requestPermission}
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 active:opacity-60"
            onPress={() => router.back()}
          >
            <Text className="text-muted font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View className="flex-1 items-center justify-center">
          {/* Top bar */}
          <View className="absolute top-16 left-6 right-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-black/50 px-4 py-2 rounded-full active:opacity-60"
            >
              <Text className="text-white font-medium">← Back</Text>
            </TouchableOpacity>
            <Text className="text-white font-semibold text-base">Scan QR Code</Text>
            <View className="w-16" />
          </View>

          {/* Scanner frame */}
          <View className="w-64 h-64 border-2 border-white/60 rounded-3xl" />

          {/* Instructions */}
          <Text className="text-white/80 text-sm mt-6 text-center px-8">
            Point your camera at a Bitcoin QR code
          </Text>

          {scanned && (
            <TouchableOpacity
              className="mt-4 bg-primary px-6 py-3 rounded-xl active:opacity-80"
              onPress={() => setScanned(false)}
            >
              <Text className="text-white font-semibold">Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}
