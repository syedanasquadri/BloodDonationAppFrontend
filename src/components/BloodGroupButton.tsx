import {
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

import { colors } from "../styles/colors";

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
      style={[
        styles.button,
        selected && styles.selected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          selected && styles.selectedText,
        ]}
      >
        {group}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "47%",
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
  },

  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  text: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },

  selectedText: {
    color: colors.white,
  },
});