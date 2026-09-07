import { View, Text, StyleSheet } from "react-native";

export default function MyProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Syed Anas Quadri</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },

  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 32,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: "#737373",
    lineHeight: 24,
    marginBottom: 32,
  },

  button: {
    height: 52,
    backgroundColor: "#b91c1c",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});