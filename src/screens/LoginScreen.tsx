import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthActions } from '../hooks/useAuthActions';
import Icon from '../components/Icon';

export default function LoginScreen() {
  const { loading, error, handleSignIn } = useAuthActions();

  return (
    <View className="flex-1 items-center justify-center bg-paper px-6">
      <View className="w-20 h-20 rounded-full bg-brand-green items-center justify-center mb-6">
        <Icon name="shopping" size={36} color="#2E3527" family="material" />
      </View>

      <Text className="text-2xl font-bold text-ink mb-2">Shopping List</Text>
      <Text className="text-ink-soft mb-10 text-center">
        Sign in to manage your lists
      </Text>

      {error && (
        <Text className="text-danger mb-4 text-sm text-center">{error}</Text>
      )}

      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        className="flex-row items-center bg-surface border border-line rounded-2xl px-6 py-4 w-3/4 justify-center shadow-sm"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#4F7942" />
        ) : (
          <>
            <Icon name="chrome" size={20} color="#119272" />
            <Text className="text-ink font-semibold text-base ml-3">
              Sign in with Google
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
