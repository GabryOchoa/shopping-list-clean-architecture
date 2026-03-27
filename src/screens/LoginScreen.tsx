import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { signInWithGoogle } from "../services/auth";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (e: any) {
      setError("Sign-in failed. Please try again.");
      console.error("Google Sign-In Error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-800 mb-2">
        Shopping List
      </Text>
      <Text className="text-gray-500 mb-10">Sign in to manage your lists</Text>

      {error && <Text className="text-red-500 mb-4 text-sm">{error}</Text>}

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={loading}
        className="flex-row items-center bg-white border border-gray-300 rounded-xl px-6 py-4 w-full justify-center shadow-sm"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <Text className="text-gray-700 font-semibold text-base">
            Sign in with Google
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
