import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import BloodGroupButton from "../components/BloodGroupButton";
import Button from "../components/Button";
import { colors } from "../styles/colors";
import { spacing } from "../styles/spacing";
import { typography } from "../styles/typography";

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
];

export default function FindBlood() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleFindDonors = () => {
    if (!selectedGroup) return;

    router.push({
      pathname: "/donors",
      params: {
        bloodGroup: selectedGroup,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={typography.heading}>
        Find Blood
      </Text>

      <Text style={styles.subtitle}>
        Select the blood group you need
      </Text>

      <View style={styles.grid}>
        {bloodGroups.map((group) => (
          <BloodGroupButton
            key={group}
            group={group}
            selected={selectedGroup === group}
            onPress={() => setSelectedGroup(group)}
          />
        ))}
      </View>

      <Button
        title="Find Donors"
        onPress={handleFindDonors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    backgroundColor: colors.background,
  },

  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.muted,
    fontSize: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
});