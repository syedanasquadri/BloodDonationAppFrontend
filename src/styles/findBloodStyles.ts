import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#737373",
    marginBottom: 30,
  },

  groups: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  group: {
    width: "47%",
    padding: 22,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    alignItems: "center",
  },

  groupText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b91c1c",
  },

  back: {
    marginTop: 30,
    alignItems: "center",
  },

  backText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
});