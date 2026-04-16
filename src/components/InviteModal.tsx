import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onInvite: (email: string, role: "viewer" | "editor") => Promise<void>;
};

export default function InviteModal({ visible, onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setEmail("");
    setRole("viewer");
    setError(null);
    onClose();
  }

  async function handleInvite() {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter an email address");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onInvite(trimmed, role);
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Invite someone
          </Text>
          <Text className="text-sm text-gray-400 mb-6">
            They need an account in the app to be invited.
          </Text>

          {/* Email input */}
          <Text className="text-sm font-medium text-gray-600 mb-1">
            Email address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="friend@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
            autoFocus
          />

          {/* Role selector */}
          <Text className="text-sm font-medium text-gray-600 mb-2">Role</Text>
          <View className="flex-row gap-3 mb-6">
            {(["viewer", "editor"] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                className={`flex-1 rounded-xl py-3 items-center border ${
                  role === r
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold capitalize ${
                    role === r ? "text-white" : "text-gray-600"
                  }`}
                >
                  {r}
                </Text>
                <Text
                  className={`text-xs mt-0.5 ${
                    role === r ? "text-indigo-200" : "text-gray-400"
                  }`}
                >
                  {r === "viewer" ? "Can view only" : "Can edit items"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text className="text-red-500 text-sm mb-4">{error}</Text>}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 border border-gray-200 rounded-xl py-4 items-center"
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInvite}
              disabled={loading}
              className="flex-1 bg-indigo-600 rounded-xl py-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Send invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
