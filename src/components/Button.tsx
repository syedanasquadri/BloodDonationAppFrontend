import {
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

import { colors } from "../styles/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export default function Button({
  title,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});