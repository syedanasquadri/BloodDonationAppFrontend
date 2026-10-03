import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  disabled = false
}: ButtonProps) {
  return (
    <Pressable
      className={`h-[52px] items-center justify-center rounded-xl bg-primary ${disabled ? "bg-muted" : "bg-primary"}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-base font-bold text-white">
        {title}
      </Text>
    </Pressable>
  );
}