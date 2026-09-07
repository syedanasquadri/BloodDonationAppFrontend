import { View, Text, Pressable } from "react-native";
import { styles } from "@/styles/donorsStyles";
import { router } from "expo-router";

export default function Donors() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Donors</Text>

      <Text style={styles.subtitle}>
        Matching donors near you
      </Text>

      <View style={styles.card}>
        <Text style={styles.name}>Rahul S.</Text>
        <Text style={styles.info}>
          O+ • 2.1 km away • Available
        </Text>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>
            Request Donation
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>Ayesha K.</Text>
        <Text style={styles.info}>
          O+ • 3.8 km away • Available
        </Text>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>
            Request Donation
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.back}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </View>
  );
}

