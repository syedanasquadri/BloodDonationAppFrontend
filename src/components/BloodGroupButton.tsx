import { Pressable, Text } from "react-native";

type Props = {
  group: string;
  selected: boolean;
  onPress: () => void;
};

export default function BloodGroupButton({
  group,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      className={`w-[47%] items-center rounded-[14px] border p-[22px] ${
        selected
          ? "border-primary bg-primary"
          : "border-border bg-white"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-xl font-bold ${
          selected ? "text-white" : "text-primary"
        }`}
      >
        {group}
      </Text>
    </Pressable>
  );
}