import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Button from "./Button";
import { colors } from "../styles/colors";

type Props = {
  name: string;
  bloodGroup: string;
  distance: string;
  onRequest: () => void;
};

export default function DonorCard({
  name,
  bloodGroup,
  distance,
  onRequest,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        {name}
      </Text>

      <Text style={styles.info}>
        {bloodGroup} • {distance} away • Available
      </Text>

      <Button
        title="Request Donation"
        onPress={onRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  name: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },

  info: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 16,
  },
});