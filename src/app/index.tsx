import { View, Text } from "react-native";
import { router } from "expo-router";

import Button from "../components/Button";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        padding: spacing.lg,
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={typography.heading}>
        🩸 BloodConnect
      </Text>

      <Text
        style={[
          typography.title,
          { marginTop: spacing.xl },
        ]}
      >
        Every drop connects a life.
      </Text>

      <Text
        style={[
          typography.body,
          {
            marginTop: spacing.md,
            marginBottom: spacing.xl,
          },
        ]}
      >
        Find blood donors near you quickly and safely.
      </Text>

      <Button
        title="Get Started"
        onPress={() => router.push("/find-blood")}
      />
    </View>
  );
}