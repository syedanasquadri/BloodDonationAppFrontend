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
  },

  subtitle: {
    color: "#737373",
    marginTop: 8,
    marginBottom: 24,
  },

  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  name: {
    fontSize: 19,
    fontWeight: "700",
  },

  info: {
    color: "#737373",
    marginTop: 6,
    marginBottom: 16,
  },

  button: {
    height: 48,
    backgroundColor: "#b91c1c",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  back: {
    alignItems: "center",
    marginTop: 15,
  },

  backText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
});