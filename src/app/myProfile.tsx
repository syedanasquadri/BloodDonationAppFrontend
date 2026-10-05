import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";

// Mock user profile data
const MOCK_PROFILE = {
  name: "Syed Anas Quadri",
  phone: "+91 98765 43210",
  city: "Hyderabad",
  state: "Telangana",
  bloodGroup: "O+",
  donorStatus: "Available to Donate",
  avatarInitials: "SQ",
};

export default function MyProfile() {
  const [donorAvailable, setDonorAvailable] = useState(true);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleEditProfile = () => {
    showAlert("Edit Profile", "Profile editing feature will be connected soon.");
  };

  const handleMyRequests = () => {
    showAlert("My Requests", "Your donation requests history will appear here.");
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        showAlert("Logged Out", "You have been logged out.");
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => showAlert("Logged Out", "You have been logged out."),
        },
      ]);
    }
  };

  const toggleDonorStatus = () => {
    setDonorAvailable((prev) => !prev);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pt-12 pb-16">
        {/* Top Header */}
      <View className="mb-6 flex-row items-center justify-between">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-white active:bg-gray-100"
          onPress={() => router.back()}
        >
          <Text className="text-lg font-bold text-text">←</Text>
        </Pressable>

        <Text className="text-xl font-bold text-text">Profile</Text>

        {/* Empty placeholder to balance header */}
        <View className="h-10 w-10" />
      </View>

      {/* Avatar & Header Section */}
      <View className="items-center">
        {/* Avatar Placeholder */}
        <View className="relative">
          <View className="h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
            <Text className="text-3xl font-extrabold text-primary">
              {MOCK_PROFILE.avatarInitials}
            </Text>
          </View>
          {/* Blood Group Mini Badge */}
          <View className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-primary px-2 py-0.5 shadow-sm">
            <Text className="text-xs font-bold text-white">
              {MOCK_PROFILE.bloodGroup}
            </Text>
          </View>
        </View>

        {/* User Name */}
        <Text className="mt-4 text-2xl font-bold text-text">
          {MOCK_PROFILE.name}
        </Text>

        {/* Phone number */}
        <Text className="mt-1 text-sm text-muted">
          {MOCK_PROFILE.phone}
        </Text>

        {/* Donor Status Pill */}
        <Pressable
          className={`mt-3 flex-row items-center rounded-full px-3.5 py-1.5 border active:opacity-80 ${
            donorAvailable
              ? "border-success/30 bg-success/10"
              : "border-muted/30 bg-muted/10"
          }`}
          onPress={toggleDonorStatus}
        >
          <View
            className={`mr-2 h-2.5 w-2.5 rounded-full ${
              donorAvailable ? "bg-success" : "bg-muted"
            }`}
          />
          <Text
            className={`text-xs font-semibold ${
              donorAvailable ? "text-success" : "text-muted"
            }`}
          >
            {donorAvailable ? "Available to Donate" : "Currently Unavailable"}
          </Text>
        </Pressable>
      </View>

      {/* Quick Overview Cards */}
      <View className="mt-6 flex-row gap-3">
        {/* Blood Group Card */}
        <View className="flex-1 rounded-2xl border border-border bg-white p-4">
          <Text className="text-xs font-medium text-muted">Blood Group</Text>
          <Text className="mt-1 text-2xl font-bold text-primary">
            {MOCK_PROFILE.bloodGroup}
          </Text>
          <Text className="mt-1 text-xs text-muted">Universal Donor</Text>
        </View>

        {/* Donor Status Card */}
        <View className="flex-1 rounded-2xl border border-border bg-white p-4">
          <Text className="text-xs font-medium text-muted">Donor Status</Text>
          <Text
            className={`mt-1 text-lg font-bold ${
              donorAvailable ? "text-success" : "text-muted"
            }`}
          >
            {donorAvailable ? "Active" : "Inactive"}
          </Text>
          <Text className="mt-1 text-xs text-muted">
            Tap badge to toggle
          </Text>
        </View>
      </View>

      {/* Profile Details Card */}
      <View className="mt-6 rounded-2xl border border-border bg-white p-5">
        <Text className="mb-4 text-base font-bold text-text">
          Personal Information
        </Text>

        {/* Name Row */}
        <View className="py-2.5">
          <Text className="text-xs text-muted">Full Name</Text>
          <Text className="mt-0.5 text-base font-semibold text-text">
            {MOCK_PROFILE.name}
          </Text>
        </View>

        <View className="h-[1px] bg-border/60" />

        {/* Phone Row */}
        <View className="py-2.5">
          <Text className="text-xs text-muted">Phone Number</Text>
          <Text className="mt-0.5 text-base font-semibold text-text">
            {MOCK_PROFILE.phone}
          </Text>
        </View>

        <View className="h-[1px] bg-border/60" />

        {/* City Row */}
        <View className="py-2.5">
          <Text className="text-xs text-muted">City</Text>
          <Text className="mt-0.5 text-base font-semibold text-text">
            {MOCK_PROFILE.city}
          </Text>
        </View>

        <View className="h-[1px] bg-border/60" />

        {/* State Row */}
        <View className="py-2.5">
          <Text className="text-xs text-muted">State</Text>
          <Text className="mt-0.5 text-base font-semibold text-text">
            {MOCK_PROFILE.state}
          </Text>
        </View>

        <View className="h-[1px] bg-border/60" />

        {/* Blood Group Row */}
        <View className="py-2.5">
          <Text className="text-xs text-muted">Blood Group</Text>
          <Text className="mt-0.5 text-base font-semibold text-primary">
            {MOCK_PROFILE.bloodGroup}
          </Text>
        </View>

        <View className="h-[1px] bg-border/60" />

        {/* Status Row */}
        <View className="py-2.5">
          <Text className="text-xs text-muted">Donor Availability</Text>
          <Text
            className={`mt-0.5 text-base font-semibold ${
              donorAvailable ? "text-success" : "text-muted"
            }`}
          >
            {donorAvailable ? MOCK_PROFILE.donorStatus : "Unavailable"}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="mt-6 gap-3">
        {/* Edit Profile Button */}
        <Pressable
          className="h-[52px] items-center justify-center rounded-xl bg-primary active:opacity-90"
          onPress={handleEditProfile}
        >
          <Text className="text-base font-bold text-white">Edit Profile</Text>
        </Pressable>

        {/* My Requests Button */}
        <Pressable
          className="h-[52px] items-center justify-center rounded-xl border border-border bg-white active:bg-gray-100"
          onPress={handleMyRequests}
        >
          <Text className="text-base font-bold text-text">My Requests</Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable
          className="h-[52px] items-center justify-center rounded-xl border border-error/30 bg-error/5 active:bg-error/10"
          onPress={handleLogout}
        >
          <Text className="text-base font-bold text-error">Logout</Text>
        </Pressable>
      </View>
      </View>
    </ScrollView>
  );
}