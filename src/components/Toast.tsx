import { useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
};

export default function Toast({ message, onDismiss, duration = 3200 }: Props) {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onDismiss, duration);
    return () => clearTimeout(timeout);
  }, [message, duration, onDismiss]);

  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      className="absolute left-5 right-5 z-10 rounded-2xl bg-[#292323] px-4 py-3 shadow-lg"
      style={{ bottom: Math.max(insets.bottom, 16) + 12 }}
    >
      <Text className="text-sm font-semibold leading-5 text-white">
        {message}
      </Text>
    </View>
  );
}
